import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { randomBytes } from 'crypto'
import pool from '@/lib/db'
import bcrypt from 'bcryptjs'
import { signToken } from '@/lib/sessionToken'

// In-memory rate limiting (lazy, no DB or Redis required)
const globalForRateLimit = global as unknown as {
  loginAttempts: Map<string, { count: number; lockedUntil: number | null }>
}
const loginAttempts = globalForRateLimit.loginAttempts || new Map()
if (process.env.NODE_ENV !== 'production') globalForRateLimit.loginAttempts = loginAttempts

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const attempt = loginAttempts.get(ip) || { count: 0, lockedUntil: null }

    if (attempt.lockedUntil && attempt.lockedUntil > Date.now()) {
      return NextResponse.json({ message: 'Too many attempts. Please try again in 15 minutes.' }, { status: 429 })
    }

    const body = await request.json()
    const { email, password } = body ?? {}

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 })
    }

    // Look up user from the real database
    const [rows]: any = await pool.query(
      'SELECT id, name, email, role, password, avatar FROM users WHERE email = ? LIMIT 1',
      [email]
    )

    if (!rows || rows.length === 0) {
      recordFailedLogin(ip, attempt)
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 })
    }

    const user = rows[0]

    // Verify bcrypt-hashed password
    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      recordFailedLogin(ip, attempt)
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 })
    }

    // Successful login - clear rate limit for this IP
    loginAttempts.delete(ip)

    // Generate a cryptographically random raw token (64 hex chars)
    const rawToken = randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 1 day
    const expiresAtMysql = expiresAt.toISOString().slice(0, 19).replace('T', ' ')

    // Clean up all expired sessions in the database to prevent storage bloat
    await pool.query('DELETE FROM admin_sessions WHERE expires_at <= NOW()')

    // Store raw token in DB (used for logout invalidation & session tracking)
    await pool.query(
      'INSERT INTO admin_sessions (token, user_id, expires_at) VALUES (?, ?, ?)',
      [rawToken, user.id, expiresAtMysql]
    )

    // Sign the token: cookie value = "rawToken|role.hmacSignature"
    const userRole = user.role || 'admin'
    const signedCookieValue = await signToken(rawToken, userRole)

    // Set the HMAC-signed session cookie
    const cookieStore = await cookies()
    cookieStore.set('admin_session', signedCookieValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 24 * 60 * 60,
    })

    return NextResponse.json({
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      role: user.role || 'admin',
      avatar: user.avatar || null,
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

function recordFailedLogin(ip: string, attempt: { count: number; lockedUntil: number | null }) {
  attempt.count += 1
  if (attempt.count >= 5) {
    attempt.lockedUntil = Date.now() + 15 * 60 * 1000 // 15 mins lockout
  }
  loginAttempts.set(ip, attempt)
}

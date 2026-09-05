import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { randomBytes } from 'crypto'
import { sendPasswordResetEmail } from '@/lib/mailer'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body ?? {}

    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 })
    }

    // Check if user exists
    const [userRows]: any = await pool.query('SELECT id, name FROM users WHERE email = ? LIMIT 1', [email])
    if (!userRows || userRows.length === 0) {
      // Return success anyway to prevent email enumeration attacks
      return NextResponse.json({ message: 'If an account with that email exists, a reset link has been sent.' })
    }

    // Generate token
    const rawToken = randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now
    const expiresAtMysql = expiresAt.toISOString().slice(0, 19).replace('T', ' ')

    // Insert or update the password_resets table
    await pool.query(
      `INSERT INTO password_resets (email, token, expires_at) 
       VALUES (?, ?, ?) 
       ON DUPLICATE KEY UPDATE token = VALUES(token), expires_at = VALUES(expires_at), created_at = CURRENT_TIMESTAMP`,
      [email, rawToken, expiresAtMysql]
    )

    // Build the reset link
    const protocol = request.headers.get('x-forwarded-proto') || 'http'
    const host = request.headers.get('host') || 'localhost:3000'
    const baseUrl = `${protocol}://${host}`
    const resetLink = `${baseUrl}/auth/create-password?token=${rawToken}&email=${encodeURIComponent(email)}`

    // Send email
    try {
      await sendPasswordResetEmail({ email, resetLink })
    } catch (mailError) {
      console.error('Failed to send reset email:', mailError)
      return NextResponse.json({ message: 'Failed to send reset email. Please ensure SMTP is configured.' }, { status: 500 })
    }

    return NextResponse.json({ message: 'If an account with that email exists, a reset link has been sent.' })

  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { randomBytes } from 'crypto'
import bcrypt from 'bcryptjs'
import pool from '@/lib/db'
import { getSessionUser } from '@/lib/session'
import { verifyToken, signToken } from '@/lib/sessionToken'

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser()
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json({
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      avatar: user.avatar || null,
    })
  } catch (error) {
    console.error('Failed to fetch profile:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getSessionUser()
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, email, currentPassword, newPassword, avatar } = body ?? {}

    if (!name || !email) {
      return NextResponse.json({ message: 'Name and email are required' }, { status: 400 })
    }

    const isChangingSensitiveData = (email !== user.email) || (newPassword && newPassword.trim().length > 0)

    // Fetch password hash
    const [pwdRows]: any = await pool.query('SELECT password FROM users WHERE id = ? LIMIT 1', [user.id])
    if (!pwdRows || pwdRows.length === 0) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }
    const userPasswordHash = pwdRows[0].password

    let updatedPasswordHash = userPasswordHash

    if (isChangingSensitiveData) {
      if (!currentPassword) {
        return NextResponse.json({ message: 'Current password is required to change email or password' }, { status: 400 })
      }
      const isPasswordValid = await bcrypt.compare(currentPassword, userPasswordHash)
      if (!isPasswordValid) {
        return NextResponse.json({ message: 'Incorrect current password' }, { status: 403 })
      }
    }

    // Check if they also want to change the password
    if (newPassword && newPassword.trim().length > 0) {
      if (newPassword.length < 6) {
        return NextResponse.json({ message: 'New password must be at least 6 characters' }, { status: 400 })
      }
      updatedPasswordHash = await bcrypt.hash(newPassword, 10)
    }

    // Check if new email is already taken by another user
    if (email !== user.email) {
      const [existingUsers]: any = await pool.query(
        'SELECT id FROM users WHERE email = ? AND id != ? LIMIT 1',
        [email, user.id]
      )
      if (existingUsers && existingUsers.length > 0) {
        return NextResponse.json({ message: 'Email is already in use' }, { status: 409 })
      }
    }

    // Update the database
    await pool.query(
      'UPDATE users SET name = ?, email = ?, password = ?, avatar = ? WHERE id = ?',
      [name, email, updatedPasswordHash, avatar || null, user.id]
    )

    // M-3: If the password was changed, invalidate ALL other sessions for this user.
    // This ensures a compromised session is killed the moment the victim changes their password.
    const passwordWasChanged = newPassword && newPassword.trim().length > 0
    if (passwordWasChanged) {
      const cookieStore = await cookies()
      const currentCookieValue = cookieStore.get('admin_session')?.value

      // Get the current raw token so we can preserve THIS session
      let currentRawToken: string | null = null
      if (currentCookieValue) {
        const tokenData = await verifyToken(currentCookieValue)
        currentRawToken = tokenData?.rawToken ?? null
      }

      // Delete all OTHER sessions for this user (preserving the current one)
      if (currentRawToken) {
        await pool.query(
          'DELETE FROM admin_sessions WHERE user_id = ? AND token != ?',
          [user.id, currentRawToken]
        )
        // Rotate the current session to a fresh token (invalidates any copies of the old cookie)
        const newRawToken = randomBytes(32).toString('hex')
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
        const expiresAtMysql = expiresAt.toISOString().slice(0, 19).replace('T', ' ')
        await pool.query(
          'UPDATE admin_sessions SET token = ?, expires_at = ? WHERE token = ?',
          [newRawToken, expiresAtMysql, currentRawToken]
        )
        // Issue the new signed cookie to the client
        const newSignedCookie = await signToken(newRawToken, user.role)
        cookieStore.set('admin_session', newSignedCookie, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          path: '/',
          maxAge: 24 * 60 * 60,
        })
      } else {
        // No valid current session found — kill all sessions for safety
        await pool.query('DELETE FROM admin_sessions WHERE user_id = ?', [user.id])
      }
    }

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id.toString(),
        name,
        email,
      }
    })
  } catch (error) {
    console.error('Failed to update profile:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

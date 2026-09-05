import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, token, newPassword } = body ?? {}

    if (!email || !token || !newPassword) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ message: 'Password must be at least 6 characters' }, { status: 400 })
    }

    // Verify token
    const [resetRows]: any = await pool.query(
      'SELECT email FROM password_resets WHERE email = ? AND token = ? AND expires_at > NOW() LIMIT 1',
      [email, token]
    )

    if (!resetRows || resetRows.length === 0) {
      return NextResponse.json({ message: 'Invalid or expired reset token. Please request a new one.' }, { status: 400 })
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update the user's password
    const [updateResult]: any = await pool.query(
      'UPDATE users SET password = ? WHERE email = ?',
      [hashedPassword, email]
    )

    if (updateResult.affectedRows === 0) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    // Delete the token so it cannot be used again
    await pool.query('DELETE FROM password_resets WHERE email = ?', [email])

    return NextResponse.json({ message: 'Password has been successfully reset' })

  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

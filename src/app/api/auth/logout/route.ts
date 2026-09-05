import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import pool from '@/lib/db'
import { verifyToken } from '@/lib/sessionToken'

export async function POST() {
  try {
    const cookieStore = await cookies()
    const cookieValue = cookieStore.get('admin_session')?.value

    if (cookieValue) {
      // Parse the signed cookie to get the raw token, then delete from DB
      const tokenData = await verifyToken(cookieValue)
      if (tokenData) {
        await pool.query('DELETE FROM admin_sessions WHERE token = ?', [tokenData.rawToken])
      }
    }

    // Always clear the cookie
    cookieStore.delete('admin_session')
    return NextResponse.json({ message: 'Logged out successfully' })
  } catch (error) {
    console.error('Logout error:', error)
    // Even on error, clear the cookie
    const cookieStore = await cookies()
    cookieStore.delete('admin_session')
    return NextResponse.json({ message: 'Logged out' })
  }
}

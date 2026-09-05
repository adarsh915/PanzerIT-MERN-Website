import pool from '@/lib/db'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/sessionToken'

export type SessionUser = {
  id: number
  name: string
  email: string
  role: string
  avatar?: string
}

/**
 * Verifies the admin_session cookie and returns the user from the database.
 * - First verifies the HMAC signature (rejects forged cookies instantly)
 * - Then looks up the raw token in the DB to confirm it hasn't been logged out
 * Returns the user if valid, or null if unauthenticated/expired.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies()
    const cookieValue = cookieStore.get('admin_session')?.value
    if (!cookieValue) return null

    // Verify HMAC signature first
    const tokenData = await verifyToken(cookieValue)
    if (!tokenData) return null
    const { rawToken } = tokenData

    // Confirm token exists in DB and is not expired (catches logged-out sessions)
    const [rows]: any = await pool.query(
      `SELECT u.id, u.name, u.email, u.role, u.avatar
       FROM admin_sessions s
       JOIN users u ON u.id = s.user_id
       WHERE s.token = ? AND s.expires_at > NOW()
       LIMIT 1`,
      [rawToken]
    )

    if (!rows || rows.length === 0) return null
    return rows[0] as SessionUser
  } catch {
    return null
  }
}

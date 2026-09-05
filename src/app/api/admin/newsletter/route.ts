import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { getSessionUser } from '@/lib/session'

async function checkAuth() {
  const sessionUser = await getSessionUser()
  if (!sessionUser) {
    throw new Error('Unauthorized')
  }
}

export async function GET(request: NextRequest) {
  try {
    await checkAuth()
    const [rows] = await pool.query(
      'SELECT id, email, subscribed_at FROM newsletter_subscribers ORDER BY subscribed_at DESC'
    )
    return NextResponse.json(rows)
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error fetching newsletter subscribers:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await checkAuth()
    const { searchParams } = new URL(request.url)
    const rawId = searchParams.get('id')

    // Validate: must be a positive integer to prevent unexpected DB behavior
    const id = rawId ? parseInt(rawId, 10) : NaN
    if (!rawId || isNaN(id) || id <= 0 || String(id) !== rawId.trim()) {
      return NextResponse.json({ message: 'A valid numeric ID is required' }, { status: 400 })
    }

    await pool.query('DELETE FROM newsletter_subscribers WHERE id = ?', [id])
    return NextResponse.json({ message: 'Subscriber deleted successfully' })
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error deleting newsletter subscriber:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

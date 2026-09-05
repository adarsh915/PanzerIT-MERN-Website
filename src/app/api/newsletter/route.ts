import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { createRateLimiter } from '@/lib/rateLimit'

// Max 10 subscription attempts per IP per minute
const limiter = createRateLimiter('newsletter', { windowMs: 60_000, max: 10 })

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const { limited, retryAfterSecs } = limiter.check(ip)
  if (limited) {
    return NextResponse.json(
      { message: `Too many requests. Please wait ${retryAfterSecs}s before trying again.` },
      { status: 429, headers: { 'Retry-After': String(retryAfterSecs) } }
    )
  }

  try {
    const body = await request.json()
    const { email } = body ?? {}

    // RFC-5322 compliant email regex
    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
    if (!email || typeof email !== 'string' || email.length > 254 || !EMAIL_RE.test(email.trim())) {
      return NextResponse.json({ message: 'Invalid email address' }, { status: 400 })
    }

    // Insert email into database, ignore if it already exists
    await pool.query(
      `INSERT IGNORE INTO newsletter_subscribers (email) VALUES (?)`,
      [email]
    )

    return NextResponse.json({ message: 'Successfully subscribed to the newsletter!' }, { status: 200 })

  } catch (error) {
    console.error('Newsletter subscription error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

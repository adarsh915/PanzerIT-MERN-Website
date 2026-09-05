import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import crypto from 'crypto'
import { createRateLimiter } from '@/lib/rateLimit'

// Max 5 contact submissions per IP per minute
const limiter = createRateLimiter('contact', { windowMs: 60_000, max: 5 })

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const { limited, retryAfterSecs } = limiter.check(ip)
  if (limited) {
    return NextResponse.json(
      { message: `Too many submissions. Please wait ${retryAfterSecs}s before trying again.` },
      { status: 429, headers: { 'Retry-After': String(retryAfterSecs) } }
    )
  }

  try {
    const data = await request.json()
    
    const { 
      name, 
      email, 
      company, 
      city, 
      phone, 
      subject, 
      service, // service dropdown from Home/Resources/Solution pages
      msg, // frontend form uses "msg" for message
      page_source,
      recaptchaToken
    } = data

    if (!name || !email) {
      return NextResponse.json({ message: 'Name and email are required' }, { status: 400 })
    }

    // Input length guards
    if (typeof name !== 'string' || name.trim().length > 200) {
      return NextResponse.json({ message: 'Name must be 200 characters or fewer' }, { status: 400 })
    }
    if (company && (typeof company !== 'string' || company.length > 200)) {
      return NextResponse.json({ message: 'Company name is too long' }, { status: 400 })
    }
    if (city && (typeof city !== 'string' || city.length > 100)) {
      return NextResponse.json({ message: 'City name is too long' }, { status: 400 })
    }
    if (phone && (typeof phone !== 'string' || phone.length > 20)) {
      return NextResponse.json({ message: 'Phone number is too long' }, { status: 400 })
    }
    if (subject && (typeof subject !== 'string' || subject.length > 255)) {
      return NextResponse.json({ message: 'Subject is too long' }, { status: 400 })
    }
    if (service && (typeof service !== 'string' || service.length > 255)) {
      return NextResponse.json({ message: 'Service name is too long' }, { status: 400 })
    }
    if (msg && (typeof msg !== 'string' || msg.length > 5000)) {
      return NextResponse.json({ message: 'Message must be 5000 characters or fewer' }, { status: 400 })
    }
    if (page_source && (typeof page_source !== 'string' || page_source.length > 500)) {
      return NextResponse.json({ message: 'Invalid page source length' }, { status: 400 })
    }

    // RFC-5322 compliant email validation
    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
    if (typeof email !== 'string' || email.length > 254 || !EMAIL_RE.test(email.trim())) {
      return NextResponse.json({ message: 'Invalid email address' }, { status: 400 })
    }

    // Verify reCAPTCHA — enforced securely in production
    const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY
    const isProduction = process.env.NODE_ENV === 'production'

    if (!recaptchaSecret && isProduction) {
      console.error('CRITICAL: RECAPTCHA_SECRET_KEY is missing in production environment.')
      return NextResponse.json({ message: 'Server configuration error.' }, { status: 500 })
    }

    if (recaptchaSecret) {
      if (!recaptchaToken) {
        return NextResponse.json({ message: 'Please complete the reCAPTCHA verification.' }, { status: 400 })
      }
      const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaSecret}&response=${recaptchaToken}`
      const recaptchaRes = await fetch(verifyUrl, { method: 'POST' })
      const recaptchaJson = await recaptchaRes.json()
      if (!recaptchaJson.success) {
        return NextResponse.json({ message: 'reCAPTCHA verification failed. Please try again.' }, { status: 400 })
      }
    }

    const id = crypto.randomUUID()
    
    // Insert into database
    await pool.query(
      `INSERT INTO leads 
       (id, name, email, company, city, phone, subject, message, page_source, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, 
        name, 
        email, 
        company || null, 
        city || null, 
        phone || null, 
        subject || service || null,  // Contact page uses 'subject', others use 'service' dropdown
        msg || null, 
        page_source || null, 
        'New' // Default status
      ]
    )

    return NextResponse.json({ message: 'Contact submitted successfully', success: true })
  } catch (error) {
    console.error('Contact submission error:', error)
    return NextResponse.json({ message: 'Internal server error', success: false }, { status: 500 })
  }
}

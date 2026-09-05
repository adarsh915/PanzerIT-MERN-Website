'use server'

import pool from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { writeFile, unlink, mkdir } from 'fs/promises'
import path from 'path'
import { FooterSettingsSchema } from './footerValidation'
import { getSessionUser } from '@/lib/session'

async function checkAuth() {
  const sessionUser = await getSessionUser()
  if (!sessionUser) {
    throw new Error('Unauthorized')
  }
}

export type FooterSettings = {
  logo_url: string
  brand_name: string
  tagline: string
  description: string
  copyright_text: string
  email: string
  phone: string
  location: string
}

const DEFAULTS: FooterSettings = {
  logo_url: '',
  brand_name: 'Panzer IT',
  tagline: 'MAKE IT SECURE',
  description:
    'Panzer IT helps organizations protect data across endpoints, servers, cloud, storage and networks with advanced security, backup and recovery solutions.',
  copyright_text: 'Copyright © Panzer IT — Make IT Secure. All Rights Reserved.',
  email: 'Sales@PanzerIT.com',
  phone: '+91 90046 55099',
  location: 'Delhi (NCR) | Mumbai | All India Network',
}

export const readFooterSettings = async (): Promise<FooterSettings> => {
  const [rows] = await pool.query('SELECT * FROM footer_settings WHERE id = 1 LIMIT 1')
  const row = (rows as any[])[0]
  if (!row) return DEFAULTS
  return {
    logo_url: row.logo_url ?? '',
    brand_name: row.brand_name ?? DEFAULTS.brand_name,
    tagline: row.tagline ?? DEFAULTS.tagline,
    description: row.description ?? DEFAULTS.description,
    copyright_text: row.copyright_text ?? DEFAULTS.copyright_text,
    email: row.email ?? DEFAULTS.email,
    phone: row.phone ?? DEFAULTS.phone,
    location: row.location ?? DEFAULTS.location,
  }
}

export const updateFooterSettings = async (
  data: Partial<FooterSettings>
): Promise<{ success: boolean; error?: string }> => {
  try {
    await checkAuth()
    const parsed = FooterSettingsSchema.safeParse(data)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues?.[0]?.message ?? 'Validation failed' }
    }

    const { logo_url, brand_name, tagline, description, copyright_text, email, phone, location } =
      parsed.data

    await pool.query(
      `UPDATE footer_settings SET
         logo_url = ?, brand_name = ?, tagline = ?, description = ?,
         copyright_text = ?, email = ?, phone = ?, location = ?,
         updated_at = NOW()
       WHERE id = 1`,
      [logo_url, brand_name, tagline, description, copyright_text, email, phone, location]
    )

    revalidatePath('/', 'layout')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

// ── Logo upload ───────────────────────────────────────────────────────────────

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'footer')
const UPLOAD_URL_BASE = '/uploads/footer'

export const uploadFooterLogo = async (
  formData: FormData
): Promise<{ success: boolean; url?: string; error?: string }> => {
  try {
    await checkAuth()
    const file = formData.get('logo') as File | null
    if (!file || file.size === 0) return { success: false, error: 'No file provided' }

    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml']
    if (!allowedTypes.includes(file.type)) {
      return { success: false, error: 'Invalid file type. Use PNG, JPG, WEBP, GIF or SVG.' }
    }
    if (file.size > 2 * 1024 * 1024) {
      return { success: false, error: 'File too large. Maximum 2 MB.' }
    }

    // Ensure directory exists
    await mkdir(UPLOAD_DIR, { recursive: true })

    // Delete old logo if it was a local upload
    const [rows] = await pool.query('SELECT logo_url FROM footer_settings WHERE id = 1 LIMIT 1')
    const oldUrl: string = (rows as any[])[0]?.logo_url ?? ''
    if (oldUrl.startsWith(UPLOAD_URL_BASE)) {
      const oldPath = path.join(process.cwd(), 'public', oldUrl)
      await unlink(oldPath).catch(() => {})
    }

    // Save new file
    const ext = file.name.split('.').pop()?.toLowerCase() || 'png'
    const filename = `logo-${Date.now()}.${ext}`
    const filepath = path.join(UPLOAD_DIR, filename)
    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(filepath, buffer)

    const url = `${UPLOAD_URL_BASE}/${filename}`

    await pool.query('UPDATE footer_settings SET logo_url = ?, updated_at = NOW() WHERE id = 1', [url])

    revalidatePath('/', 'layout')
    return { success: true, url }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

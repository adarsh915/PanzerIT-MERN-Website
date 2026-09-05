'use server'

import { readSetting, writeSetting } from '../settingsStore'
import { revalidatePath } from 'next/cache'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { stripBase64 } from '@/lib/sanitize'
import { getSessionUser } from '@/lib/session'

async function checkAuth() {
  const sessionUser = await getSessionUser()
  if (!sessionUser) {
    throw new Error('Unauthorized')
  }
}

export type PageSeoData = {
  metaTitle: string
  metaDescription: string
  metaKeywords: string
  ogImage: string
}

const DEFAULT_SEO: PageSeoData = {
  metaTitle: '',
  metaDescription: '',
  metaKeywords: '',
  ogImage: '',
}

export const getSeoData = async (pageKey: string): Promise<PageSeoData> => {
  return await readSetting<PageSeoData>(pageKey, DEFAULT_SEO)
}

export const updateSeoData = async (pageKey: string, data: PageSeoData): Promise<{ success: boolean; error?: string }> => {
  try {
    await checkAuth()
    if (data.ogImage) {
      data.ogImage = stripBase64(data.ogImage)
    }
    await writeSetting(pageKey, data)
    revalidatePath('/', 'layout')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'seo')
const UPLOAD_URL_BASE = '/uploads/seo'

export const uploadSeoImage = async (
  formData: FormData
): Promise<{ success: boolean; url?: string; error?: string }> => {
  try {
    await checkAuth()
    const file = formData.get('image') as File | null
    if (!file || file.size === 0) return { success: false, error: 'No file provided' }

    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml']
    if (!allowedTypes.includes(file.type)) {
      return { success: false, error: 'Invalid file type. Use PNG, JPG, WEBP, GIF or SVG.' }
    }
    if (file.size > 5 * 1024 * 1024) {
      return { success: false, error: 'File too large. Maximum 5 MB.' }
    }
    await mkdir(UPLOAD_DIR, { recursive: true })
    const ext = file.name.split('.').pop()?.toLowerCase() || 'png'
    const filename = `seo-og-${Date.now()}.${ext}`
    const filepath = path.join(UPLOAD_DIR, filename)
    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(filepath, buffer)

    const url = `${UPLOAD_URL_BASE}/${filename}`
    return { success: true, url }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

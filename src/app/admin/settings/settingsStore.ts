'use server'

import pool from '@/lib/db'
import { getSessionUser } from '@/lib/session'

async function checkAuth() {
  const sessionUser = await getSessionUser()
  if (!sessionUser) {
    throw new Error('Unauthorized')
  }
}

export const readSetting = async <T>(key: string, defaultValue: T): Promise<T> => {
  const [rows] = await pool.query('SELECT value FROM site_settings WHERE `key` = ?', [key])
  const row = (rows as any[])[0]
  if (!row) return defaultValue

  try {
    const parsed = JSON.parse(row.value)
    if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
      return { ...defaultValue, ...parsed } as T
    }
    return parsed as T
  } catch {
    return defaultValue
  }
}

export const writeSetting = async <T>(key: string, value: T): Promise<void> => {
  await checkAuth()
  const jsonValue = JSON.stringify(value)
  const updatedAt = new Date().toISOString().slice(0, 19).replace('T', ' ')
  
  await pool.query(
    'INSERT INTO site_settings (`key`, value, updated_at) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE value = ?, updated_at = ?',
    [key, jsonValue, updatedAt, jsonValue, updatedAt]
  )

  // Clear cache for the whole app so settings changes are instantly visible
  try {
    const { revalidatePath } = await import('next/cache')
    revalidatePath('/', 'layout')
  } catch (e) {
    console.error('Failed to revalidate cache after writing setting:', e)
  }
}

import { cookies } from 'next/headers'

export const setThemePreview = async (colors: Record<string, string>): Promise<void> => {
  const cookieStore = await cookies();
  cookieStore.set('theme_preview_colors', JSON.stringify(colors), {
    path: '/',
    maxAge: 3600, // 1 hour preview
    sameSite: 'lax',
  })
}

export const clearThemePreview = async (): Promise<void> => {
  const cookieStore = await cookies();
  cookieStore.delete('theme_preview_colors')
}

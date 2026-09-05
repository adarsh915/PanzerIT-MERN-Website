'use server'

import pool from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { SocialLinkSchema } from './footerValidation'
import { getSessionUser } from '@/lib/session'

async function checkAuth() {
  const sessionUser = await getSessionUser()
  if (!sessionUser) {
    throw new Error('Unauthorized')
  }
}

export type SocialLink = {
  id: string
  platform: string
  url: string
  icon: string
  sort_order: number
}

export const readSocialLinks = async (): Promise<SocialLink[]> => {
  const [rows] = await pool.query(
    'SELECT * FROM footer_social_links ORDER BY sort_order ASC, created_at ASC'
  )
  return (rows as any[]).map((r) => ({
    id: r.id,
    platform: r.platform,
    url: r.url,
    icon: r.icon || '',
    sort_order: r.sort_order,
  }))
}

export const createSocialLink = async (
  data: { platform: string; url: string; icon: string }
): Promise<{ success: boolean; link?: SocialLink; error?: string }> => {
  await checkAuth()
  const parsed = SocialLinkSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues?.[0]?.message }
  }

  const id = `sl${Date.now()}${Math.floor(Math.random() * 1000)}`
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ')

  const [maxRow] = await pool.query(
    'SELECT COALESCE(MAX(sort_order), 0) AS m FROM footer_social_links'
  )
  const nextOrder = ((maxRow as any[])[0]?.m ?? 0) + 1

  await pool.query(
    'INSERT INTO footer_social_links (id, platform, url, icon, sort_order, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    [id, parsed.data.platform, parsed.data.url, parsed.data.icon, nextOrder, now]
  )

  revalidatePath('/', 'layout')
  return {
    success: true,
    link: { id, platform: parsed.data.platform, url: parsed.data.url, icon: parsed.data.icon, sort_order: nextOrder },
  }
}

export const updateSocialLink = async (
  id: string,
  data: { platform: string; url: string; icon: string }
): Promise<{ success: boolean; error?: string }> => {
  await checkAuth()
  const parsed = SocialLinkSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues?.[0]?.message }
  }

  await pool.query(
    'UPDATE footer_social_links SET platform = ?, url = ?, icon = ? WHERE id = ?',
    [parsed.data.platform, parsed.data.url, parsed.data.icon, id]
  )

  revalidatePath('/', 'layout')
  return { success: true }
}

export const deleteSocialLink = async (id: string): Promise<void> => {
  await checkAuth()
  await pool.query('DELETE FROM footer_social_links WHERE id = ?', [id])
  revalidatePath('/', 'layout')
}

export const reorderSocialLinks = async (orderedIds: string[]): Promise<void> => {
  await checkAuth()
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    for (let i = 0; i < orderedIds.length; i++) {
      await connection.query(
        'UPDATE footer_social_links SET sort_order = ? WHERE id = ?',
        [i + 1, orderedIds[i]]
      )
    }
    await connection.commit()
  } catch (e) {
    await connection.rollback()
    throw e
  } finally {
    connection.release()
  }
  revalidatePath('/', 'layout')
}

'use server'

import pool from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { getSessionUser } from '@/lib/session'

async function checkAuth() {
  const sessionUser = await getSessionUser()
  if (!sessionUser) {
    throw new Error('Unauthorized')
  }
}

// ── Types ─────────────────────────────────────────────────────────────────────

export type LinkType = 'custom' | 'blog' | 'solution' | 'brand'

export type FooterLink = {
  id: string
  columnId: string
  label: string
  url: string           // resolved URL (for frontend display)
  order: number
  link_type: LinkType
  ref_id: string | null
  custom_url: string | null
  brokenLink?: boolean  // true if ref_id content was deleted
}

export type FooterColumn = {
  id: string
  title: string
  order: number
  links: FooterLink[]
}

export type SearchResult = {
  id: string
  title: string
  slug: string
}

// ── URL resolver map ──────────────────────────────────────────────────────────

// WHITELIST — table names never come from user input directly
const LINK_TYPE_MAP: Record<
  Exclude<LinkType, 'custom'>,
  { table: string; urlPrefix: string }
> = {
  blog:     { table: 'blog_posts', urlPrefix: '/blog' },
  solution: { table: 'solutions',  urlPrefix: '/solution' },
  brand:    { table: 'brands',     urlPrefix: '/brand' },
}

async function resolveHref(link: {
  link_type: LinkType
  ref_id: string | null
  custom_url: string | null
  url: string
}): Promise<{ href: string; broken: boolean }> {
  if (link.link_type === 'custom') {
    return { href: link.custom_url || link.url || '#', broken: false }
  }
  const config = LINK_TYPE_MAP[link.link_type as Exclude<LinkType, 'custom'>]
  if (!config || !link.ref_id) return { href: '#', broken: true }

  const [rows] = await pool.query(
    `SELECT slug FROM \`${config.table}\` WHERE id = ? LIMIT 1`,
    [link.ref_id]
  )
  const row = (rows as any[])[0]
  if (!row) return { href: '#', broken: true }
  return { href: `${config.urlPrefix}/${row.slug}`, broken: false }
}

// ── READ ──────────────────────────────────────────────────────────────────────

export const readFooterColumns = async (): Promise<FooterColumn[]> => {
  const [colRows] = await pool.query(
    'SELECT * FROM footer_columns ORDER BY sort_order ASC, created_at ASC'
  )
  const columns = colRows as any[]
  if (columns.length === 0) return []

  const columnIds = columns.map((c) => c.id)
  const [linkRows] = await pool.query(
    'SELECT * FROM footer_links WHERE column_id IN (?) ORDER BY sort_order ASC, created_at ASC',
    [columnIds]
  )
  const rawLinks = linkRows as any[]

  // Resolve hrefs for all links
  const resolvedLinks = await Promise.all(
    rawLinks.map(async (l) => {
      const { href, broken } = await resolveHref({
        link_type: l.link_type || 'custom',
        ref_id: l.ref_id ?? null,
        custom_url: l.custom_url ?? null,
        url: l.url || '',
      })
      return {
        id: l.id,
        columnId: l.column_id,
        label: l.label,
        url: href,
        order: l.sort_order,
        link_type: (l.link_type || 'custom') as LinkType,
        ref_id: l.ref_id ?? null,
        custom_url: l.custom_url ?? null,
        brokenLink: broken,
      } satisfies FooterLink
    })
  )

  return columns.map((col) => ({
    id: col.id,
    title: col.title,
    order: col.sort_order,
    links: resolvedLinks.filter((l) => l.columnId === col.id),
  }))
}

// ── COLUMNS ───────────────────────────────────────────────────────────────────

export const createFooterColumn = async (title: string): Promise<FooterColumn> => {
  await checkAuth()
  const id = `fc${Date.now()}`
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ')
  const [maxRow] = await pool.query(
    'SELECT COALESCE(MAX(sort_order),0) AS m FROM footer_columns'
  )
  const nextOrder = ((maxRow as any[])[0]?.m ?? 0) + 1
  await pool.query(
    'INSERT INTO footer_columns (id, title, sort_order, created_at) VALUES (?, ?, ?, ?)',
    [id, title.trim(), nextOrder, now]
  )
  revalidatePath('/', 'layout')
  return { id, title: title.trim(), order: nextOrder, links: [] }
}

export const updateFooterColumn = async (
  id: string,
  title: string,
  order: number
): Promise<void> => {
  await checkAuth()
  await pool.query(
    'UPDATE footer_columns SET title = ?, sort_order = ? WHERE id = ?',
    [title.trim(), order, id]
  )
  revalidatePath('/', 'layout')
}

export const deleteFooterColumn = async (id: string): Promise<void> => {
  await checkAuth()
  await pool.query('DELETE FROM footer_columns WHERE id = ?', [id])
  revalidatePath('/', 'layout')
}

// ── LINKS ─────────────────────────────────────────────────────────────────────

export const createFooterLink = async (
  columnId: string,
  label: string,
  url: string,
  link_type: LinkType = 'custom',
  ref_id?: string,
  custom_url?: string
): Promise<FooterLink> => {
  await checkAuth()
  const id = `fl${Date.now()}${Math.floor(Math.random() * 1000)}`
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ')
  const [maxRow] = await pool.query(
    'SELECT COALESCE(MAX(sort_order),0) AS m FROM footer_links WHERE column_id = ?',
    [columnId]
  )
  const nextOrder = ((maxRow as any[])[0]?.m ?? 0) + 1
  const effectiveUrl = link_type === 'custom' ? (custom_url || url) : url
  const effectiveCustomUrl = link_type === 'custom' ? (custom_url || url) : null
  const effectiveRefId = link_type !== 'custom' ? (ref_id ?? null) : null

  await pool.query(
    `INSERT INTO footer_links
       (id, column_id, label, url, link_type, ref_id, custom_url, sort_order, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, columnId, label.trim(), effectiveUrl, link_type, effectiveRefId, effectiveCustomUrl, nextOrder, now]
  )
  revalidatePath('/', 'layout')
  return {
    id, columnId, label: label.trim(), url: effectiveUrl,
    order: nextOrder, link_type, ref_id: effectiveRefId, custom_url: effectiveCustomUrl,
  }
}

export const updateFooterLink = async (
  id: string,
  label: string,
  url: string,
  order: number,
  link_type: LinkType = 'custom',
  ref_id?: string,
  custom_url?: string
): Promise<void> => {
  await checkAuth()
  const effectiveUrl = link_type === 'custom' ? (custom_url || url) : url
  const effectiveCustomUrl = link_type === 'custom' ? (custom_url || url) : null
  const effectiveRefId = link_type !== 'custom' ? (ref_id ?? null) : null

  await pool.query(
    `UPDATE footer_links
       SET label = ?, url = ?, link_type = ?, ref_id = ?, custom_url = ?, sort_order = ?
     WHERE id = ?`,
    [label.trim(), effectiveUrl, link_type, effectiveRefId, effectiveCustomUrl, order, id]
  )
  revalidatePath('/', 'layout')
}

export const deleteFooterLink = async (id: string): Promise<void> => {
  await checkAuth()
  await pool.query('DELETE FROM footer_links WHERE id = ?', [id])
  revalidatePath('/', 'layout')
}

// ── LINK PICKER SEARCH ────────────────────────────────────────────────────────

export const searchLinkableContent = async (
  type: Exclude<LinkType, 'custom'>,
  query: string
): Promise<SearchResult[]> => {
  const config = LINK_TYPE_MAP[type]
  if (!config) return []

  const safe = query.trim().slice(0, 100)
  const [rows] = await pool.query(
    `SELECT id, title, slug FROM \`${config.table}\` WHERE title LIKE ? LIMIT 10`,
    [`%${safe}%`]
  )
  return (rows as any[]).map((r) => ({
    id: String(r.id),
    title: r.title,
    slug: r.slug,
  }))
}

'use server'

import pool from '@/lib/db'
import type { LeadStatus, WebsiteLead } from './leadTypes'

export type { LeadStatus, WebsiteLead }

// Legacy function for backward compatibility
export const readLeads = async (): Promise<WebsiteLead[]> => {
  const result = await readLeadsPaginated(1, 1000)
  return result.leads
}

// New paginated function
export const readLeadsPaginated = async (page: number = 1, limit: number = 10): Promise<{ leads: WebsiteLead[], total: number }> => {
  const offset = (page - 1) * limit
  
  // Get total count
  const [countRows] = await pool.query('SELECT COUNT(*) as total FROM leads')
  const total = (countRows as any[])[0]?.total || 0
  
  // Get paginated results
  const [rows] = await pool.query(
    'SELECT * FROM leads ORDER BY created_at DESC LIMIT ? OFFSET ?',
    [limit, offset]
  )
  
  const leads = (rows as any[]).map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    company: row.company ?? '',
    city: row.city ?? '',
    phone: row.phone ?? '',
    subject: row.subject ?? '',
    message: row.message ?? '',
    status: row.status ?? 'New',
    pageSource: row.page_source ?? '',
    read: Boolean(row.is_read),
    readAt: row.read_at instanceof Date ? row.read_at.toISOString() : (row.read_at || ''),
    submittedAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
  }))
  
  return { leads, total }
}

export const updateLeadStatus = async (id: string, status: LeadStatus): Promise<void> => {
  await pool.query('UPDATE leads SET status = ? WHERE id = ?', [status, id])
}

export const markLeadRead = async (id: string): Promise<void> => {
  const readAt = new Date().toISOString().slice(0, 19).replace('T', ' ')
  await pool.query('UPDATE leads SET is_read = 1, read_at = ? WHERE id = ? AND is_read = 0', [readAt, id])
}

export const deleteLead = async (id: string): Promise<void> => {
  await pool.query('DELETE FROM leads WHERE id = ?', [id])
}

export const getUnreadLeads = async (limit: number = 5): Promise<WebsiteLead[]> => {
  const [rows] = await pool.query(
    'SELECT * FROM leads WHERE is_read = 0 ORDER BY created_at DESC LIMIT ?',
    [limit]
  )
  
  return (rows as any[]).map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    company: row.company ?? '',
    city: row.city ?? '',
    phone: row.phone ?? '',
    subject: row.subject ?? '',
    message: row.message ?? '',
    status: row.status ?? 'New',
    pageSource: row.page_source ?? '',
    read: Boolean(row.is_read),
    readAt: row.read_at instanceof Date ? row.read_at.toISOString() : (row.read_at || ''),
    submittedAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
  }))
}

export const getUnreadCount = async (): Promise<number> => {
  const [rows] = await pool.query('SELECT COUNT(*) as unreadCount FROM leads WHERE is_read = 0')
  return (rows as any[])[0]?.unreadCount || 0
}

export const markAllLeadsRead = async (): Promise<void> => {
  const readAt = new Date().toISOString().slice(0, 19).replace('T', ' ')
  await pool.query('UPDATE leads SET is_read = 1, read_at = ? WHERE is_read = 0', [readAt])
}

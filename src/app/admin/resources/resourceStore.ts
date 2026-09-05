'use server'

import pool from '@/lib/db'
import { toSlug } from '../solutions/solutionHelpers'
import { sanitizeDeep, stripBase64 } from '@/lib/sanitize'
import { getSessionUser } from '@/lib/session'

async function checkAuth() {
  const sessionUser = await getSessionUser()
  if (!sessionUser) {
    throw new Error('Unauthorized')
  }
  if (sessionUser.role !== 'admin' && sessionUser.role !== 'manager') {
    throw new Error('Forbidden: Only admins and managers can manage resources')
  }
}
import type {
  ResourceCategory,
  ResourceCategoryFormData,
  ResourceItem,
  ResourceFormData,
} from './resourceTypes'

export type { ResourceCategory, ResourceCategoryFormData, ResourceItem, ResourceFormData }

// ========================
// RESOURCES
// ========================

export const readResourcesPaginated = async (page: number = 1, limit: number = 10): Promise<{ items: ResourceItem[], total: number }> => {
  const offset = (page - 1) * limit
  
  const [countRows] = await pool.query('SELECT COUNT(*) as total FROM resources')
  const total = (countRows as any[])[0]?.total || 0
  
  const [rows] = await pool.query(
    'SELECT * FROM resources ORDER BY sort_order ASC, created_at DESC LIMIT ? OFFSET ?',
    [limit, offset]
  )

  const items = (rows as any[]).map(row => ({
    id: row.id,
    title: row.title,
    slug: row.slug,
    description: row.description || '',
    fileUrl: row.file_url,
    fileType: row.file_type || '',
    image: row.image || '',
    imageTitle: row.image_title || '',
    imageCaption: row.image_caption || '',
    imageDescription: row.image_description || '',
    category: row.category || '',
    status: row.status,
    order: row.sort_order,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    downloadCount: row.download_count || 0,
  }))
  
  return { items: items.map(sanitizeDeep), total }
}

export const readAllResources = async (): Promise<ResourceItem[]> => {
  const [rows] = await pool.query('SELECT * FROM resources ORDER BY sort_order ASC, created_at DESC')
  return (rows as any[]).map(row => sanitizeDeep({
    id: row.id,
    title: row.title,
    slug: row.slug,
    description: row.description || '',
    fileUrl: row.file_url,
    fileType: row.file_type || '',
    image: row.image || '',
    imageTitle: row.image_title || '',
    imageCaption: row.image_caption || '',
    imageDescription: row.image_description || '',
    category: row.category || '',
    status: row.status,
    order: row.sort_order,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    downloadCount: row.download_count || 0,
  }))
}

export const readActiveFrontendResources = async (): Promise<Partial<ResourceItem>[]> => {
  const [rows] = await pool.query(
    `SELECT id, title, description, image, file_url as fileUrl, category 
     FROM resources 
     WHERE status = 'active' 
     ORDER BY sort_order ASC, created_at DESC`
  )
  return (rows as any[]).map(row => sanitizeDeep({
    id: row.id,
    title: row.title,
    description: row.description || '',
    image: row.image || '',
    fileUrl: row.fileUrl,
    category: row.category || '',
  }))
}

export const createResource = async (data: ResourceFormData): Promise<ResourceItem | { success: false, message: string }> => {
  await checkAuth()
  const connection = await pool.getConnection()
  try {
    const slug = toSlug(data.slug || data.title)
    
    const [existing] = await connection.query('SELECT id FROM resources WHERE slug = ? OR title = ?', [slug, data.title])
    if ((existing as any[]).length > 0) {
      return { success: false, message: `A resource with this title or slug already exists.` }
    }

    const id = `res${Date.now()}`
    const createdAt = new Date().toISOString().slice(0, 19).replace('T', ' ')

    await connection.query(
      `INSERT INTO resources (id, title, slug, description, file_url, file_type, image, image_title, image_caption, image_description, category, status, sort_order, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.title,
        slug,
        data.description || '',
        data.fileUrl,
        data.fileType || '',
        data.image ? stripBase64(data.image) : '',
        data.imageTitle || '',
        data.imageCaption || '',
        data.imageDescription || '',
        data.category || '',
        data.status || 'active',
        data.order || 0,
        createdAt
      ]
    )

    return { ...data, id, slug, createdAt } as ResourceItem
  } finally {
    connection.release()
  }
}

export const updateResource = async (id: string, data: ResourceFormData): Promise<ResourceItem | { success: false, message: string }> => {
  await checkAuth()
  const connection = await pool.getConnection()
  try {
    const slug = toSlug(data.slug || data.title)

    const [existing] = await connection.query('SELECT id FROM resources WHERE (slug = ? OR title = ?) AND id != ?', [slug, data.title, id])
    if ((existing as any[]).length > 0) {
      return { success: false, message: `A resource with this title or slug already exists.` }
    }

    await connection.query(
      `UPDATE resources SET title = ?, slug = ?, description = ?, file_url = ?, file_type = ?, image = ?, image_title = ?, image_caption = ?, image_description = ?, category = ?, status = ?, sort_order = ? WHERE id = ?`,
      [
        data.title,
        slug,
        data.description || '',
        data.fileUrl,
        data.fileType || '',
        data.image ? stripBase64(data.image) : '',
        data.imageTitle || '',
        data.imageCaption || '',
        data.imageDescription || '',
        data.category || '',
        data.status || 'active',
        data.order || 0,
        id
      ]
    )

    return { ...data, id, slug } as ResourceItem
  } finally {
    connection.release()
  }
}

export const deleteResource = async (id: string): Promise<void> => {
  await checkAuth()
  await pool.query('DELETE FROM resources WHERE id = ?', [id])
}

export const findResource = async (id: string): Promise<ResourceItem | undefined> => {
  const [rows] = await pool.query('SELECT * FROM resources WHERE id = ? LIMIT 1', [id])
  const row = (rows as any[])[0]
  if (!row) return undefined

  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    description: row.description || '',
    fileUrl: row.file_url,
    fileType: row.file_type || '',
    image: row.image || '',
    imageTitle: row.image_title || '',
    imageCaption: row.image_caption || '',
    imageDescription: row.image_description || '',
    category: row.category || '',
    status: row.status,
    order: row.sort_order,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    downloadCount: row.download_count || 0,
  }
}

export const incrementResourceDownloadCount = async (id: string): Promise<void> => {
  await pool.query('UPDATE resources SET download_count = download_count + 1 WHERE id = ?', [id])
}

export const logResourceDownload = async (resourceId: string, ip: string, city: string, region: string, country: string): Promise<void> => {
  await pool.query(
    `INSERT INTO resource_downloads_log (resource_id, ip_address, city, region, country) VALUES (?, ?, ?, ?, ?)`,
    [resourceId, ip, city, region, country]
  )
}

export const readResourceDownloadLogs = async (): Promise<any[]> => {
  const [rows] = await pool.query(`
    SELECT l.*, r.title as resource_title
    FROM resource_downloads_log l
    LEFT JOIN resources r ON l.resource_id = r.id
    ORDER BY l.created_at DESC
  `)
  return (rows as any[]).map(row => ({
    id: row.id,
    resourceId: row.resource_id,
    resourceTitle: row.resource_title,
    ipAddress: row.ip_address,
    city: row.city,
    region: row.region,
    country: row.country,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at
  }))
}

// ========================
// CATEGORIES
// ========================

export const readResourceCategories = async (): Promise<ResourceCategory[]> => {
  const [rows] = await pool.query('SELECT * FROM resource_categories ORDER BY created_at DESC')
  return (rows as any[]).map(row => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    parentId: row.parent_id,
    status: row.status,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
  }))
}

export const createResourceCategory = async (data: ResourceCategoryFormData): Promise<ResourceCategory | { success: false, message: string }> => {
  await checkAuth()
  const id = `rc${Date.now()}`
  const createdAt = new Date().toISOString().slice(0, 19).replace('T', ' ')
  const slug = toSlug(data.slug || data.name)
  
  const [existing] = await pool.query('SELECT id FROM resource_categories WHERE slug = ? OR name = ?', [slug, data.name])
  if ((existing as any[]).length > 0) {
    return { success: false, message: `A category with this name or slug already exists.` }
  }

  await pool.query(
    'INSERT INTO resource_categories (id, name, slug, parent_id, status, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    [id, data.name, slug, data.parentId || null, data.status || 'active', createdAt]
  )

  return { ...data, id, slug, parentId: data.parentId || null, status: data.status || 'active', createdAt }
}

export const updateResourceCategory = async (id: string, data: ResourceCategoryFormData): Promise<ResourceCategory | { success: false, message: string }> => {
  await checkAuth()
  const slug = toSlug(data.slug || data.name)
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    
    const [existing] = await connection.query('SELECT id FROM resource_categories WHERE (slug = ? OR name = ?) AND id != ?', [slug, data.name, id])
    if ((existing as any[]).length > 0) {
      await connection.rollback()
      return { success: false, message: `A category with this name or slug already exists.` }
    }

    // get previous name
    const [rows] = await connection.query('SELECT name FROM resource_categories WHERE id = ?', [id])
    const oldName = (rows as any[])[0]?.name

    await connection.query(
      'UPDATE resource_categories SET name = ?, slug = ?, parent_id = ?, status = ? WHERE id = ?',
      [data.name.trim(), slug, data.parentId || null, data.status || 'active', id]
    )

    if (oldName && oldName !== data.name.trim()) {
      await connection.query(
        'UPDATE resources SET category = ? WHERE category = ?',
        [data.name.trim(), oldName]
      )
    }

    await connection.commit()
    return { ...data, id, slug, parentId: data.parentId || null, status: data.status || 'active' }
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}

export const deleteResourceCategory = async (id: string): Promise<void | { success: false, message: string }> => {
  await checkAuth()
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    
    const [children] = await connection.query('SELECT COUNT(*) as count FROM resource_categories WHERE parent_id = ?', [id])
    const childrenCount = (children as any[])[0].count
    if (childrenCount > 0) {
      await connection.rollback()
      return { success: false, message: `Cannot delete. This category has ${childrenCount} sub-categor${childrenCount === 1 ? 'y' : 'ies'} under it.` }
    }

    const [rows] = await connection.query('SELECT name FROM resource_categories WHERE id = ?', [id])
    const oldName = (rows as any[])[0]?.name
    if (oldName) {
      const [resources] = await connection.query('SELECT COUNT(*) as count FROM resources WHERE category = ?', [oldName])
      const count = (resources as any[])[0].count
      if (count > 0) {
        await connection.rollback()
        return { success: false, message: `Cannot delete. This category is used in ${count} Resource(s).` }
      }
    }

    await connection.query('DELETE FROM resource_categories WHERE id = ?', [id])

    await connection.commit()
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}

export const findResourceCategory = async (id: string): Promise<ResourceCategory | undefined> => {
  const [rows] = await pool.query('SELECT * FROM resource_categories WHERE id = ? LIMIT 1', [id])
  const row = (rows as any[])[0]
  if (!row) return undefined
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    status: row.status,
    parentId: row.parent_id,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
  }
}

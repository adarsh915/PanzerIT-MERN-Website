'use server'

import pool from '@/lib/db'
import { toSlug } from './blogHelpers'
import { sanitizeDeep, stripBase64 } from '@/lib/sanitize'
import { getSessionUser } from '@/lib/session'

async function checkAuth() {
  const sessionUser = await getSessionUser()
  if (!sessionUser) {
    throw new Error('Unauthorized')
  }
}
import type {
  BlogCategory,
  BlogCategoryFormData,
  BlogPost,
  BlogPostFormData,
  PostStatus,
} from './blogTypes'

// Re-export types so components only need to import from blogStore
export type {
  BlogCategory,
  BlogCategoryFormData,
  BlogPost,
  BlogPostFormData,
  PostStatus,
}


// Legacy function for backward compatibility
export const readPosts = async (): Promise<BlogPost[]> => {
  const result = await readPostsPaginated(1, 1000)
  return result.posts
}

export const readPostsPaginated = async (page: number = 1, limit: number = 10): Promise<{ posts: BlogPost[], total: number }> => {
  const sessionUser = await getSessionUser()
  const offset = (page - 1) * limit
  
  let baseQuery = 'FROM blog_posts'
  let queryParams: any[] = []

  if (sessionUser && sessionUser.role === 'author') {
    baseQuery += ' WHERE user_id = ?'
    queryParams.push(sessionUser.id)
  }

  // Get total count
  const [countRows] = await pool.query(`SELECT COUNT(*) as total ${baseQuery}`, queryParams)
  const total = (countRows as any[])[0]?.total || 0
  
  // Get paginated results
  queryParams.push(limit, offset)
  const [rows] = await pool.query(
    `SELECT * ${baseQuery} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    queryParams
  )
  
  const posts = (rows as any[]).map((row) => sanitizeDeep({
    id: row.id,
    title: row.title,
    slug: row.slug,
    status: row.status,
    featured: Boolean(row.featured),
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    publishedAt: row.published_at instanceof Date ? row.published_at.toISOString() : row.published_at ?? '',
    author: row.author ?? '',
    authorBio: row.author_bio ?? '',
    description: row.description ?? '',
    image: row.image ?? '',
    imageTitle: row.image_title ?? '',
    imageCaption: row.image_caption ?? '',
    imageDescription: row.image_description ?? '',
    imageAlt: row.image_alt ?? '',
    categoryId: row.category_id ?? '',
    tags: row.tags ? JSON.parse(row.tags) : [],
    metaTitle: row.meta_title ?? '',
    metaDescription: row.meta_description ?? '',
    breadcrumbDescription: row.breadcrumb_description ?? '',
    breadcrumbImage: row.breadcrumb_image ?? '',
    breadcrumbImageAlt: row.breadcrumb_image_alt ?? '',
    breadcrumbImageTitle: row.breadcrumb_image_title ?? '',
    breadcrumbImageCaption: row.breadcrumb_image_caption ?? '',
    breadcrumbImageDescription: row.breadcrumb_image_description ?? '',
  }))
  
  return { posts, total }
}

export const readActiveFrontendPosts = async (): Promise<Partial<BlogPost>[]> => {
  const [rows] = await pool.query(
    `SELECT id, title, slug, status, featured, published_at, category_id, image, tags, meta_description, author, author_bio, created_at 
     FROM blog_posts 
     WHERE status = 'published' 
     ORDER BY published_at DESC`
  )
  return (rows as any[]).map(row => sanitizeDeep({
    id: row.id,
    title: row.title,
    slug: row.slug,
    status: row.status,
    featured: Boolean(row.featured),
    publishedAt: row.published_at instanceof Date ? row.published_at.toISOString() : row.published_at ?? '',
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at ?? '',
    categoryId: row.category_id ?? '',
    image: row.image ?? '',
    tags: row.tags ? JSON.parse(row.tags) : [],
    metaDescription: row.meta_description ?? '',
    author: row.author ?? '',
    authorBio: row.author_bio ?? '',
  }))
}

export const searchPosts = async (q: string): Promise<Partial<BlogPost>[]> => {
  const searchTerm = `%${q}%`;
  const [rows] = await pool.query(
    `SELECT id, title, slug, status, image, LEFT(description, 1000) as raw_description 
     FROM blog_posts 
     WHERE status = 'published' AND (title LIKE ? OR description LIKE ?) 
     ORDER BY published_at DESC LIMIT 50`,
    [searchTerm, searchTerm]
  )
  return (rows as any[]).map(row => sanitizeDeep({
    id: row.id,
    title: row.title,
    slug: row.slug,
    status: row.status,
    image: row.image || '',
    description: row.raw_description || '',
  }))
}

export const createPost = async (data: BlogPostFormData): Promise<BlogPost | { success: false, message: string }> => {
  const sessionUser = await getSessionUser()
  if (!sessionUser) throw new Error('Unauthorized')

  const id = `p${Date.now()}`
  const createdAt = new Date().toISOString().slice(0, 19).replace('T', ' ')
  const slug = toSlug(data.slug || data.title)

  const [existing] = await pool.query('SELECT id FROM blog_posts WHERE slug = ? OR title = ?', [slug, data.title || ''])
  if ((existing as any[]).length > 0) {
    return { success: false, message: `A blog post with this title or slug already exists.` }
  }

  const publishedAt = data.status === 'published'
    ? (data.publishedAt || new Date().toISOString()).slice(0, 19).replace('T', ' ')
    : null

  await pool.query(
    `INSERT INTO blog_posts (id, title, slug, status, featured, author, author_bio, description, image, image_title, image_caption, image_description, image_alt, category_id, tags, meta_title, meta_description, meta_keywords, published_at, breadcrumb_description, breadcrumb_image, breadcrumb_image_alt, breadcrumb_image_title, breadcrumb_image_caption, breadcrumb_image_description, created_at, user_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      data.title || '',
      slug,
      data.status || 'draft',
      data.featured ? 1 : 0,
      data.author || sessionUser.name,
      data.authorBio || '',
      data.description || '',
      data.image ? stripBase64(data.image) : '',
      data.imageTitle || '',
      data.imageCaption || '',
      data.imageDescription || '',
      data.imageAlt || '',
      data.categoryId || '',
      JSON.stringify(data.tags || []),
      data.metaTitle || '',
      data.metaDescription || '',
      data.metaKeywords || '',
      publishedAt,
      data.breadcrumbDescription || '',
      data.breadcrumbImage ? stripBase64(data.breadcrumbImage) : '',
      data.breadcrumbImageAlt || '',
      data.breadcrumbImageTitle || '',
      data.breadcrumbImageCaption || '',
      data.breadcrumbImageDescription || '',
      createdAt,
      sessionUser.id
    ]
  )

  return {
    ...data,
    id,
    slug,
    createdAt,
    publishedAt: publishedAt ?? '',
  }
}

export const updatePost = async (id: string, data: BlogPostFormData): Promise<BlogPost | undefined | { success: false, message: string }> => {
  const sessionUser = await getSessionUser()
  if (!sessionUser) throw new Error('Unauthorized')

  if (sessionUser.role === 'author') {
    const [authCheck] = await pool.query('SELECT user_id FROM blog_posts WHERE id = ?', [id])
    if ((authCheck as any[])[0]?.user_id !== sessionUser.id) {
      return { success: false, message: 'You are not authorized to edit this post.' }
    }
  }

  const slug = toSlug(data.slug || data.title)

  const [existing] = await pool.query('SELECT id FROM blog_posts WHERE (slug = ? OR title = ?) AND id != ?', [slug, data.title || '', id])
  if ((existing as any[]).length > 0) {
    return { success: false, message: `A blog post with this title or slug already exists.` }
  }

  const publishedAt = data.status === 'published'
    ? (data.publishedAt || new Date().toISOString()).slice(0, 19).replace('T', ' ')
    : null

  await pool.query(
    `UPDATE blog_posts SET title = ?, slug = ?, status = ?, featured = ?, author = ?, author_bio = ?, description = ?, image = ?, image_title = ?, image_caption = ?, image_description = ?, image_alt = ?, category_id = ?, tags = ?, meta_title = ?, meta_description = ?, meta_keywords = ?, published_at = ?, breadcrumb_description = ?, breadcrumb_image = ?, breadcrumb_image_alt = ?, breadcrumb_image_title = ?, breadcrumb_image_caption = ?, breadcrumb_image_description = ? WHERE id = ?`,
    [
      data.title || '',
      slug,
      data.status || 'draft',
      data.featured ? 1 : 0,
      data.author || '',
      data.authorBio || '',
      data.description || '',
      data.image ? stripBase64(data.image) : '',
      data.imageTitle || '',
      data.imageCaption || '',
      data.imageDescription || '',
      data.imageAlt || '',
      data.categoryId || '',
      JSON.stringify(data.tags || []),
      data.metaTitle || '',
      data.metaDescription || '',
      data.metaKeywords || '',
      publishedAt,
      data.breadcrumbDescription || '',
      data.breadcrumbImage ? stripBase64(data.breadcrumbImage) : '',
      data.breadcrumbImageAlt || '',
      data.breadcrumbImageTitle || '',
      data.breadcrumbImageCaption || '',
      data.breadcrumbImageDescription || '',
      id,
    ]
  )

  return {
    ...data,
    id,
    slug,
    createdAt: new Date().toISOString(),
    publishedAt: publishedAt ?? '',
  }
}

export const deletePost = async (id: string): Promise<{ success: false, message: string } | void> => {
  const sessionUser = await getSessionUser()
  if (!sessionUser) throw new Error('Unauthorized')

  if (sessionUser.role === 'author') {
    const [authCheck] = await pool.query('SELECT user_id FROM blog_posts WHERE id = ?', [id])
    if ((authCheck as any[])[0]?.user_id !== sessionUser.id) {
      return { success: false, message: 'You are not authorized to delete this post.' }
    }
  }

  await pool.query('DELETE FROM blog_posts WHERE id = ?', [id])
}

export const findPost = async (id: string): Promise<BlogPost | undefined> => {
  const [rows] = await pool.query('SELECT * FROM blog_posts WHERE id = ? LIMIT 1', [id])
  const row = (rows as any[])[0]
  if (!row) return undefined

  return sanitizeDeep({
    id: row.id,
    title: row.title,
    slug: row.slug,
    status: row.status,
    featured: Boolean(row.featured),
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    publishedAt: row.published_at instanceof Date ? row.published_at.toISOString() : row.published_at ?? '',
    author: row.author ?? '',
    authorBio: row.author_bio ?? '',
    description: row.description ?? '',
    image: row.image ?? '',
    imageTitle: row.image_title ?? '',
    imageCaption: row.image_caption ?? '',
    imageDescription: row.image_description ?? '',
    imageAlt: row.image_alt ?? '',
    categoryId: row.category_id ?? '',
    tags: row.tags ? JSON.parse(row.tags) : [],
    metaTitle: row.meta_title ?? '',
    metaDescription: row.meta_description ?? '',
    metaKeywords: row.meta_keywords ?? '',
    breadcrumbDescription: row.breadcrumb_description ?? '',
    breadcrumbImage: row.breadcrumb_image ?? '',
    breadcrumbImageAlt: row.breadcrumb_image_alt ?? '',
    breadcrumbImageTitle: row.breadcrumb_image_title ?? '',
    breadcrumbImageCaption: row.breadcrumb_image_caption ?? '',
    breadcrumbImageDescription: row.breadcrumb_image_description ?? '',
  })
}


export const findPostBySlug = async (slug: string): Promise<BlogPost | undefined> => {
  // Direct indexed query — avoids loading all posts into memory
  const [rows] = await pool.query(
    `SELECT * FROM blog_posts WHERE slug = ? AND status = 'published' LIMIT 1`,
    [slug]
  )
  const row = (rows as any[])[0]
  if (!row) return undefined

  return sanitizeDeep({
    id: row.id,
    title: row.title,
    slug: row.slug,
    status: row.status,
    featured: Boolean(row.featured),
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    publishedAt: row.published_at instanceof Date ? row.published_at.toISOString() : row.published_at ?? '',
    author: row.author ?? '',
    authorBio: row.author_bio ?? '',
    description: row.description ?? '',
    image: row.image ?? '',
    imageTitle: row.image_title ?? '',
    imageCaption: row.image_caption ?? '',
    imageDescription: row.image_description ?? '',
    imageAlt: row.image_alt ?? '',
    categoryId: row.category_id ?? '',
    tags: row.tags ? JSON.parse(row.tags) : [],
    metaTitle: row.meta_title ?? '',
    metaDescription: row.meta_description ?? '',
    metaKeywords: row.meta_keywords ?? '',
    breadcrumbDescription: row.breadcrumb_description ?? '',
    breadcrumbImage: row.breadcrumb_image ?? '',
    breadcrumbImageAlt: row.breadcrumb_image_alt ?? '',
    breadcrumbImageTitle: row.breadcrumb_image_title ?? '',
    breadcrumbImageCaption: row.breadcrumb_image_caption ?? '',
    breadcrumbImageDescription: row.breadcrumb_image_description ?? '',
  })
}

// ─── Categories ───────────────────────────────────────────────────────────────

export const readCategories = async (): Promise<BlogCategory[]> => {
  const [rows] = await pool.query('SELECT * FROM blog_categories ORDER BY created_at DESC')
  return (rows as any[]).map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    status: row.status,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
  }))
}

export const createCategory = async (data: BlogCategoryFormData): Promise<BlogCategory | { success: false, message: string }> => {
  await checkAuth()
  const id = `bc${Date.now()}`
  const createdAt = new Date().toISOString().slice(0, 19).replace('T', ' ')
  const slug = toSlug(data.slug || data.name)

  const [existing] = await pool.query('SELECT id FROM blog_categories WHERE slug = ? OR name = ?', [slug, data.name || ''])
  if ((existing as any[]).length > 0) {
    return { success: false, message: `A category with this name or slug already exists.` }
  }

  await pool.query(
    'INSERT INTO blog_categories (id, name, slug, status, created_at) VALUES (?, ?, ?, ?, ?)',
    [id, data.name || '', slug, data.status || 'active', createdAt]
  )

  return { ...data, id, slug, createdAt }
}

export const updateCategory = async (id: string, data: BlogCategoryFormData): Promise<BlogCategory | undefined | { success: false, message: string }> => {
  await checkAuth()
  const slug = toSlug(data.slug || data.name)

  const [existing] = await pool.query('SELECT id FROM blog_categories WHERE (slug = ? OR name = ?) AND id != ?', [slug, data.name || '', id])
  if ((existing as any[]).length > 0) {
    return { success: false, message: `A category with this name or slug already exists.` }
  }

  await pool.query(
    'UPDATE blog_categories SET name = ?, slug = ?, status = ? WHERE id = ?',
    [data.name || '', slug, data.status || 'active', id]
  )
  return { ...data, id, slug, createdAt: new Date().toISOString() }
}

export const deleteCategory = async (id: string): Promise<void | { success: false, message: string }> => {
  await checkAuth()
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    
    // Check usage
    const [posts] = await connection.query('SELECT COUNT(*) as count FROM blog_posts WHERE category_id = ?', [id])
    const count = (posts as any[])[0].count
    if (count > 0) {
      await connection.rollback()
      return { success: false, message: `Cannot delete. This category is used in ${count} Blog(s).` }
    }

    await connection.query('DELETE FROM blog_categories WHERE id = ?', [id])
    await connection.commit()
  } catch (err) {
    await connection.rollback()
    throw err
  } finally {
    connection.release()
  }
}

export const findCategory = async (id: string): Promise<BlogCategory | undefined> => {
  // Direct indexed query — avoids loading all categories into memory
  const [rows] = await pool.query('SELECT * FROM blog_categories WHERE id = ? LIMIT 1', [id])
  const row = (rows as any[])[0]
  if (!row) return undefined
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    status: row.status,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
  }
}

export const findCategoryBySlug = async (slug: string): Promise<BlogCategory | undefined> => {
  // Direct indexed query — avoids loading all categories into memory
  const [rows] = await pool.query('SELECT * FROM blog_categories WHERE slug = ? LIMIT 1', [slug])
  const row = (rows as any[])[0]
  if (!row) return undefined
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    status: row.status,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
  }
}

'use server'

import pool from '@/lib/db'

// Dashboard type definitions
export type DashboardStats = {
  publishedPosts: number
  totalPosts: number
  activeSolutions: number
  totalSolutions: number
  featuredBrands: number
  totalBrands: number
  newLeads: number
  totalLeads: number
  totalMedia: number
  totalMediaKb: number
  totalResources: number
  totalDownloads: number
}

export type DashboardLead = {
  id: number
  name: string
  email: string
  status: string
  createdAt: string
}

export type DashboardDownload = {
  id: number
  title: string
  slug: string
  downloadCount: number
}

/**
 * Optimized dashboard statistics query
 * Fetches all counts in a single database query instead of loading full datasets
 */
export async function readDashboardStats(): Promise<DashboardStats> {
  const [rows] = await pool.query(
    `SELECT 
      (SELECT COUNT(*) FROM blog_posts WHERE status = 'published') as publishedPosts,
      (SELECT COUNT(*) FROM blog_posts) as totalPosts,
      (SELECT COUNT(*) FROM solutions WHERE status = 'active') as activeSolutions,
      (SELECT COUNT(*) FROM solutions) as totalSolutions,
      (SELECT COUNT(*) FROM brands WHERE featured = 1) as featuredBrands,
      (SELECT COUNT(*) FROM brands) as totalBrands,
      (SELECT COUNT(*) FROM leads WHERE status = 'new') as newLeads,
      (SELECT COUNT(*) FROM leads) as totalLeads,
      (SELECT COUNT(*) FROM media_items) as totalMedia,
      (SELECT COALESCE(SUM(size_kb), 0) FROM media_items) as totalMediaKb,
      (SELECT COUNT(*) FROM resources) as totalResources,
      (SELECT COALESCE(SUM(download_count), 0) FROM resources) as totalDownloads
    `
  )
  
  const stats = (rows as any[])[0]
  return stats as DashboardStats
}

/**
 * Fetch only recent leads needed for dashboard display
 */
export async function readRecentLeads(limit: number = 5): Promise<DashboardLead[]> {
  const [rows] = await pool.query(
    `SELECT id, name, email, status, created_at as createdAt 
     FROM leads 
     ORDER BY created_at DESC 
     LIMIT ?`,
    [limit]
  )
  
  return (rows as any[]).map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    status: row.status,
    createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt,
  }))
}

/**
 * Fetch only top downloads for dashboard display
 */
export async function readTopDownloads(limit: number = 5): Promise<DashboardDownload[]> {
  const [rows] = await pool.query(
    `SELECT id, title, slug, COALESCE(download_count, 0) as downloadCount
     FROM resources 
     ORDER BY download_count DESC 
     LIMIT ?`,
    [limit]
  )
  
  return (rows as any[]).map((row) => ({
    id: row.id,
    title: row.title,
    slug: row.slug,
    downloadCount: row.downloadCount,
  }))
}

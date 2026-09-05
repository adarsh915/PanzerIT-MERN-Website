'use server'

import pool from '@/lib/db'
import { cache } from 'react'
import { sanitizeDeep } from '@/lib/sanitize'

type HomepageSolution = {
  id: number
  title: string
  slug: string
  subtitle?: string
  description?: string
  image?: string
  imageAlt?: string
  logo?: string
  logoAlt?: string
}

type HomepagePost = {
  id: number
  title: string
  slug: string
  excerpt?: string
  image?: string
  imageAlt?: string
  featuredImage?: string
  publishedAt?: string
  createdAt?: string
  categoryId?: number
  featured?: boolean
}

type HomepageBrand = {
  id: number
  name: string
  slug: string
  logo?: string
  logoAlt?: string
  image?: string
  imageAlt?: string
  status: string
  featured: boolean
}

type HomepageData = {
  solutions: HomepageSolution[]
  posts: HomepagePost[]
  brands: HomepageBrand[]
  homepageSettings: any
}

/**
 * Optimized homepage data query - only fetches what's displayed
 */
async function fetchHomepageData(): Promise<HomepageData> {
  // Only fetch featured solutions (limit 9) - exclude large description field
  const [solutionsRows] = await pool.query(`
    SELECT id, title, slug, subtitle, image, image_alt, logo, logo_alt, LEFT(description, 200) as raw_description
    FROM solutions 
    WHERE status = 'active' AND is_featured = 1
    ORDER BY sort_order ASC
    LIMIT 9
  `)

  // Only fetch featured published posts (limit 3) for homepage
  const [postsRows] = await pool.query(`
    SELECT id, title, slug, image, image_alt, published_at, created_at, featured
    FROM blog_posts 
    WHERE status = 'published' AND featured = 1
    ORDER BY published_at DESC
    LIMIT 3
  `)

  // Only fetch featured brands for homepage products section (limit 6)
  const [brandsRows] = await pool.query(`
    SELECT id, name, slug, logo, logo_alt, image, image_alt, status, featured, homepage_tagline, homepage_sub_tagline
    FROM brands 
    WHERE status = 'active' AND featured = 1
    ORDER BY sort_order ASC
    LIMIT 6
  `)

  // Fetch homepage settings
  const [settingsRows] = await pool.query<any[]>(`
    SELECT value 
    FROM site_settings 
    WHERE \`key\` = 'PANZER_HOMEPAGE_SETTINGS'
  `)

  // Sanitize the entire settings object recursively — this JSON blob can contain
  // nested image fields at any depth, so a top-level check alone isn't enough.
  const homepageSettings = settingsRows[0]?.value
    ? sanitizeDeep(JSON.parse(settingsRows[0].value))
    : null

  const sanitizeImage = (url: string | undefined | null): string | undefined => {
    if (!url) return undefined;
    if (url.startsWith('data:image/') && url.length > 50000) {
      console.warn('Sanitizing massive base64 image URL in homepage to prevent payload explosions');
      return undefined;
    }
    return url;
  }

  return {
    solutions: (solutionsRows as any[]).map(s => ({
      id: s.id,
      title: s.title,
      slug: s.slug,
      subtitle: s.subtitle,
      description: s.raw_description || '', // Load only a tiny 200-char excerpt for the homepage fallback
      image: sanitizeImage(s.image),
      imageAlt: s.image_alt,
      logo: sanitizeImage(s.logo),
      logoAlt: s.logo_alt,
    })),
    posts: (postsRows as any[]).map(p => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      excerpt: '', // Don't load description for homepage
      image: sanitizeImage(p.image),
      imageAlt: p.image_alt,
      featuredImage: sanitizeImage(p.image),
      publishedAt: p.published_at instanceof Date ? p.published_at.toISOString() : p.published_at,
      createdAt: p.created_at instanceof Date ? p.created_at.toISOString() : p.created_at,
      featured: Boolean(p.featured),
    })),
    brands: (brandsRows as any[]).map(b => ({
      id: b.id,
      name: b.name,
      slug: b.slug,
      logo: sanitizeImage(b.logo),
      logoAlt: b.logo_alt,
      image: sanitizeImage(b.image),
      imageAlt: b.image_alt,
      status: b.status,
      featured: Boolean(b.featured),
      homepageTagline: b.homepage_tagline ?? '',
      homepageSubTagline: b.homepage_sub_tagline ?? '',
    })),
    homepageSettings
  }
}

// Cache homepage data for the duration of the request
export const getHomepageData = cache(fetchHomepageData)
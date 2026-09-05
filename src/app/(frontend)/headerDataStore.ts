'use server'

import pool from '@/lib/db'
import { cache } from 'react'

type HeaderSolution = {
  label: string
  logo?: string
  logoAlt: string
  icon: string
  href: string
}

type HeaderBrand = {
  label: string
  logo?: string
  href: string
}

export type HeaderData = {
  solutions: HeaderSolution[]
  brands: HeaderBrand[]
  logoData: { logoUrl: string; logoAlt: string; logoWidth: number }
}

/**
 * Optimized header data query - only fetches minimal fields needed for navigation
 */
async function fetchHeaderData(): Promise<HeaderData> {
  // Single optimized query for header navigation
  const [solutionsRows] = await pool.query(`
    SELECT id, title, slug, logo, logo_alt
    FROM solutions 
    WHERE status = 'active'
    ORDER BY sort_order ASC
    LIMIT 20
  `)

  const [brandsRows] = await pool.query(`
    SELECT id, name, slug, logo
    FROM brands 
    WHERE status = 'active'
    ORDER BY sort_order ASC
    LIMIT 30
  `)

  const [settingsRows] = await pool.query<any[]>(`
    SELECT value 
    FROM site_settings 
    WHERE \`key\` = 'PANZER_HEADER_SETTINGS'
  `)

  const logoData = settingsRows[0]?.value 
    ? JSON.parse(settingsRows[0].value)
    : { logoUrl: '', logoAlt: 'Header Logo', logoWidth: 140 }

  const sanitizeImage = (url: string | undefined | null) => {
    if (!url) return url;
    if (url.startsWith('data:image/') && url.length > 50000) {
      console.warn('Sanitizing massive base64 image URL in header to prevent payload explosions');
      return undefined;
    }
    return url;
  }

  return {
    solutions: (solutionsRows as any[]).map(s => ({
      label: s.title,
      logo: sanitizeImage(s.logo) || undefined,
      logoAlt: s.logo_alt || s.title,
      icon: "fa-shield-check",
      href: `/solution/${s.slug}`
    })),
    brands: (brandsRows as any[]).map(b => ({
      label: b.name,
      logo: sanitizeImage(b.logo) || undefined,
      href: `/brand/${b.slug}`
    })),
    logoData
  }
}

export const getHeaderData = cache(fetchHeaderData)

import { Metadata } from 'next';

/**
 * Adds the "Make 'IT' Secure" tagline to page titles
 * @param title - The base page title (e.g., "About Us")
 * @returns Formatted title with company name and tagline (e.g., "About Us | Panzer IT | Make 'IT' Secure")
 */
export function formatPageTitle(title: string | undefined | null): string {
  if (!title) {
    return "Panzer IT | Make 'IT' Secure";
  }

  return title;
}

/**
 * Creates metadata object with formatted title and tagline
 * @param seoData - SEO data from database
 * @param canonicalPath - Canonical URL path (e.g., '/about')
 * @returns Metadata object with formatted title
 */
export function createPageMetadata(
  seoData: {
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
    ogImage?: string;
  },
  canonicalPath: string
): Metadata {
  return {
    title: formatPageTitle(seoData.metaTitle),
    description: seoData.metaDescription,
    keywords: seoData.metaKeywords,
    openGraph: {
      title: formatPageTitle(seoData.metaTitle),
      description: seoData.metaDescription,
      images: seoData.ogImage ? [{ url: seoData.ogImage }] : undefined,
    },
    alternates: {
      canonical: canonicalPath,
    },
  };
}

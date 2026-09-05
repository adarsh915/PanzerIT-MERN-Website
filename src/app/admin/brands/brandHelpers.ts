import type { BrandCategory, BrandCategoryFormData, BrandFormData, BrandPartner } from './brandTypes'

export const toSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

export const emptyBrand: BrandFormData = {
  name: '',
  slug: '',
  website: '',
  category: '',
  description: '',
  image: '',
  imageTitle: '',
  imageCaption: '',
  imageDescription: '',
  imageAlt: '',
  logo: '',
  logoAlt: '',
  order: 1,
  featured: false,
  status: 'active',
  metaTitle: '',
  metaDescription: '',
  metaKeywords: '',
  capabilitiesTitle: '',
  capabilitiesHeading: '',
  capabilitiesPoints: '',
  breadcrumbDescription: '',
  breadcrumbImage: '',
  breadcrumbImageAlt: '',
  breadcrumbImageTitle: '',
  breadcrumbImageCaption: '',
  breadcrumbImageDescription: '',
  homepageTagline: '',
  homepageSubTagline: '',
  extraCards: [],
}

export const emptyBrandCategory: BrandCategoryFormData = {
  name: '',
  slug: '',
  status: 'active',
}

export const toCategoryFormData = (category: BrandCategory): BrandCategoryFormData => ({
  name: category.name,
  slug: category.slug,
  status: category.status,
})

export const toFormData = (brand: BrandPartner): BrandFormData => ({
  name: brand.name,
  slug: brand.slug,
  website: brand.website,
  category: brand.category,
  description: brand.description,
  image: brand.image ?? brand.logo ?? '',
  imageTitle: brand.imageTitle ?? '',
  imageCaption: brand.imageCaption ?? '',
  imageDescription: brand.imageDescription ?? '',
  imageAlt: brand.imageAlt ?? brand.logoAlt ?? brand.name,
  logo: brand.logo ?? '',
  logoAlt: brand.logoAlt ?? brand.name,
  order: brand.order,
  featured: brand.featured,
  status: brand.status,
  metaTitle: brand.metaTitle ?? '',
  metaDescription: brand.metaDescription ?? '',
  metaKeywords: brand.metaKeywords ?? '',
  capabilitiesTitle: brand.capabilitiesTitle ?? '',
  capabilitiesHeading: brand.capabilitiesHeading ?? '',
  capabilitiesPoints: brand.capabilitiesPoints ?? '',
  breadcrumbDescription: brand.breadcrumbDescription ?? '',
  breadcrumbImage: brand.breadcrumbImage ?? '',
  breadcrumbImageAlt: brand.breadcrumbImageAlt ?? '',
  breadcrumbImageTitle: brand.breadcrumbImageTitle ?? '',
  breadcrumbImageCaption: brand.breadcrumbImageCaption ?? '',
  breadcrumbImageDescription: brand.breadcrumbImageDescription ?? '',
  homepageTagline: brand.homepageTagline ?? '',
  homepageSubTagline: brand.homepageSubTagline ?? '',
  extraCards: brand.extraCards || [],
})

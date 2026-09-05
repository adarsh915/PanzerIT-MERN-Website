export type PostStatus = 'draft' | 'published'

export type BlogPost = {
  id: string
  title: string
  slug: string
  status: PostStatus
  featured?: boolean
  createdAt: string
  publishedAt?: string
  author?: string
  authorBio?: string
  description?: string
  image?: string
  imageTitle?: string
  imageCaption?: string
  imageDescription?: string
  imageAlt?: string
  categoryId?: string
  tags?: string[]
  metaTitle?: string
  metaDescription?: string
  metaKeywords?: string
  breadcrumbDescription?: string
  breadcrumbImage?: string
  breadcrumbImageAlt?: string
  breadcrumbImageTitle?: string
  breadcrumbImageCaption?: string
  breadcrumbImageDescription?: string
}

export type BlogPostFormData = {
  title: string
  slug: string
  status: PostStatus
  featured?: boolean
  author: string
  authorBio: string
  description: string
  image: string
  imageTitle: string
  imageCaption: string
  imageDescription: string
  imageAlt: string
  categoryId: string
  tags: string[]
  metaTitle: string
  metaDescription: string
  metaKeywords: string
  publishedAt?: string
  breadcrumbDescription?: string
  breadcrumbImage?: string
  breadcrumbImageAlt?: string
  breadcrumbImageTitle?: string
  breadcrumbImageCaption?: string
  breadcrumbImageDescription?: string
}

export type BlogCategory = {
  id: string
  name: string
  slug: string
  status: 'active' | 'inactive'
  createdAt: string
}

export type BlogCategoryFormData = {
  name: string
  slug: string
  status: BlogCategory['status']
}

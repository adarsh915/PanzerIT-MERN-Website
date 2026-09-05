export type SolutionStatus = 'active' | 'inactive'

export type SolutionFeatureCard = {
  id: string
  icon: string
  image?: string
  imageTitle?: string
  imageCaption?: string
  imageDescription?: string
  imageAlt?: string
  title: string
  description: string
}

export type SolutionImplementationStep = {
  id: string
  step: string
  title: string
  description: string
}

export type SolutionExtraCard = {
  id: string
  heading: string
  description: string
  points: string[]
  image?: string
  imageTitle?: string
  imageCaption?: string
  imageDescription?: string
  imageAlt?: string
}

export type SolutionService = {
  id: string
  title: string
  subtitle: string
  description: string
  category: string
  image: string
  imageTitle?: string
  imageCaption?: string
  imageDescription?: string
  imageAlt?: string
  logo: string
  logoAlt?: string
  slug: string
  order: number
  status: SolutionStatus
  createdAt: string
  featureCards: SolutionFeatureCard[]
  implementationSteps: SolutionImplementationStep[]
  extraCards?: SolutionExtraCard[]
  metaTitle?: string
  metaDescription?: string
  metaKeywords?: string
  isFeatured?: boolean
  breadcrumbDescription?: string
  breadcrumbImage?: string
  breadcrumbImageAlt?: string
  breadcrumbImageTitle?: string
  breadcrumbImageCaption?: string
  breadcrumbImageDescription?: string
}

export type SolutionFormData = Omit<SolutionService, 'id' | 'createdAt'>

export type SolutionCategory = {
  id: string
  name: string
  slug: string
  status: 'active' | 'inactive'
  createdAt: string
}

export type SolutionCategoryFormData = {
  name: string
  slug: string
  status: SolutionCategory['status']
}

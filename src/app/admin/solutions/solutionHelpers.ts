import type {
  SolutionCategory,
  SolutionCategoryFormData,
  SolutionFeatureCard,
  SolutionFormData,
  SolutionImplementationStep,
  SolutionService,
} from './solutionTypes'

export const toSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

export const createDefaultFeatureCards = (): SolutionFeatureCard[] => [
  {
    id: 'feature-data-protection',
    icon: 'tabler:shield',
    title: 'Data Protection',
    description: 'Prevent leakage across endpoints, users, cloud channels and business workflows.',
  },
  {
    id: 'feature-access-control',
    icon: 'tabler:user-lock',
    title: 'Access Control',
    description: 'Strengthen IAM, PAM, PSM and database access management for critical systems.',
  },
  {
    id: 'feature-recovery-readiness',
    icon: 'tabler:refresh',
    title: 'Recovery Readiness',
    description: 'Keep virtual, physical, cloud and SaaS workloads available with reliable backup planning.',
  },
  {
    id: 'feature-threat-prevention',
    icon: 'tabler:bug-off',
    title: 'Threat Prevention',
    description: 'Reduce malware, ransomware, zero-day and vulnerability exposure with layered protection.',
  },
]

export const createDefaultImplementationSteps = (): SolutionImplementationStep[] => [
  {
    id: 'step-assess',
    step: '01',
    title: 'Assess',
    description: 'Review current tools, risks, data movement, users and compliance expectations.',
  },
  {
    id: 'step-recommend',
    step: '02',
    title: 'Recommend',
    description: 'Select the right security, backup and data protection products for the environment.',
  },
  {
    id: 'step-deploy',
    step: '03',
    title: 'Deploy',
    description: 'Coordinate implementation with practical controls, policy alignment and vendor support.',
  },
  {
    id: 'step-optimize',
    step: '04',
    title: 'Optimize',
    description: 'Improve visibility, recoverability and protection posture as business needs change.',
  },
]

export const emptySolution: SolutionFormData = {
  title: '',
  subtitle: '',
  description: '',
  category: '',
  image: '',
  imageTitle: '',
  imageCaption: '',
  imageDescription: '',
  imageAlt: '',
  logo: '',
  logoAlt: '',
  slug: '',
  order: 1,
  status: 'active',
  featureCards: createDefaultFeatureCards(),
  implementationSteps: createDefaultImplementationSteps(),
  extraCards: [],
  metaTitle: '',
  metaDescription: '',
  metaKeywords: '',
  isFeatured: false,
  breadcrumbDescription: '',
  breadcrumbImage: '',
  breadcrumbImageAlt: '',
  breadcrumbImageTitle: '',
  breadcrumbImageCaption: '',
  breadcrumbImageDescription: '',
}

export const emptySolutionCategory: SolutionCategoryFormData = {
  name: '',
  slug: '',
  status: 'active',
}

export const toCategoryFormData = (category: SolutionCategory): SolutionCategoryFormData => ({
  name: category.name,
  slug: category.slug,
  status: category.status,
})

export const toFormData = (solution: SolutionService): SolutionFormData => ({
  title: solution.title,
  subtitle: solution.subtitle,
  description: solution.description,
  category: solution.category,
  image: solution.image,
  imageTitle: solution.imageTitle ?? '',
  imageCaption: solution.imageCaption ?? '',
  imageDescription: solution.imageDescription ?? '',
  imageAlt: solution.imageAlt ?? solution.title,
  logo: solution.logo ?? '',
  logoAlt: solution.logoAlt ?? solution.title,
  slug: solution.slug,
  order: solution.order,
  status: solution.status,
  featureCards: solution.featureCards ?? createDefaultFeatureCards(),
  implementationSteps: solution.implementationSteps ?? createDefaultImplementationSteps(),
  extraCards: solution.extraCards ?? [],
  metaTitle: solution.metaTitle ?? '',
  metaDescription: solution.metaDescription ?? '',
  metaKeywords: solution.metaKeywords ?? '',
  isFeatured: solution.isFeatured ?? false,
  breadcrumbDescription: solution.breadcrumbDescription ?? '',
  breadcrumbImage: solution.breadcrumbImage ?? '',
  breadcrumbImageAlt: solution.breadcrumbImageAlt ?? '',
  breadcrumbImageTitle: solution.breadcrumbImageTitle ?? '',
  breadcrumbImageCaption: solution.breadcrumbImageCaption ?? '',
  breadcrumbImageDescription: solution.breadcrumbImageDescription ?? '',
})

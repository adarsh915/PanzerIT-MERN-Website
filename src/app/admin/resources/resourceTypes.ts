export type ResourceStatus = 'active' | 'inactive'

export interface ResourceCategory {
  id: string
  name: string
  slug: string
  parentId?: string | null
  status: 'active' | 'inactive'
  createdAt?: string
}

export interface ResourceCategoryFormData {
  name: string
  slug: string
  parentId?: string | null
  status: 'active' | 'inactive'
}

export interface ResourceItem {
  id: string
  title: string
  slug: string
  description?: string
  fileUrl: string
  fileType?: string
  image?: string
  imageTitle?: string
  imageCaption?: string
  imageDescription?: string
  imageAlt?: string
  category?: string
  status: ResourceStatus
  order?: number
  createdAt?: string
  downloadCount?: number
}

export interface ResourceFormData {
  title: string
  slug?: string
  description?: string
  fileUrl: string
  fileType?: string
  image?: string
  imageTitle?: string
  imageCaption?: string
  imageDescription?: string
  imageAlt?: string
  category?: string
  status?: ResourceStatus
  order?: number
}

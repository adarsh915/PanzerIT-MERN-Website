export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Closed' | 'Spam'

export type WebsiteLead = {
  id: string
  name: string
  email: string
  company: string
  city: string
  phone: string
  subject: string      // stores service (dropdown) or subject (contact form)
  message: string
  status: string
  pageSource: string   // the page URL where the form was submitted from
  read: boolean
  readAt?: string
  submittedAt: string
  createdAt: string
}

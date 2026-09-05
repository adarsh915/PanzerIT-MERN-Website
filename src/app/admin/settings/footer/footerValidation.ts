import { z } from 'zod'

export const FooterSettingsSchema = z.object({
  logo_url: z.string().max(500).default(''),
  brand_name: z.string().min(1, 'Brand name is required').max(120),
  tagline: z.string().max(200).default(''),
  description: z.string().max(2000).default(''),
  copyright_text: z.string().max(300).default(''),
  email: z.string().email('Invalid email address'),
  phone: z
    .string()
    .min(7, 'Phone number is required')
    .max(80)
    .regex(/^[\d\s\+\-\(\)]+$/, 'Invalid phone format'),
  location: z.string().max(300).default(''),
})

export type FooterSettingsInput = z.infer<typeof FooterSettingsSchema>

export const SocialLinkSchema = z.object({
  platform: z.string().min(1, 'Platform is required').max(60),
  url: z
    .string()
    .min(1, 'URL is required')
    .max(500)
    .refine(
      (v) => v.startsWith('/') || v.startsWith('http://') || v.startsWith('https://'),
      'Must be a relative path (/) or full URL (https://…)'
    ),
  icon: z.string().max(60).default(''),
})

export type SocialLinkInput = z.infer<typeof SocialLinkSchema>

export const FooterLinkSchema = z
  .object({
    label: z.string().min(1, 'Label is required').max(200),
    link_type: z.enum(['custom', 'blog', 'solution', 'brand']),
    custom_url: z.string().max(500).optional(),
    ref_id: z.string().max(50).optional(),
  })
  .refine(
    (d) => {
      if (d.link_type === 'custom') return !!d.custom_url?.trim()
      return !!d.ref_id?.trim()
    },
    {
      message: 'Provide a URL for custom links or select content for other types',
      path: ['custom_url'],
    }
  )

export type FooterLinkInput = z.infer<typeof FooterLinkSchema>

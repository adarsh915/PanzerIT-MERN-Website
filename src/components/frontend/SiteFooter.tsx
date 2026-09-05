import { readFooterColumns } from '@/app/admin/settings/footer/footerStore'
import { readFooterSettings } from '@/app/admin/settings/footer/footerSettingsStore'
import { readSocialLinks } from '@/app/admin/settings/footer/footerSocialStore'
import { Footer } from './Footer'

const FA_ICON_MAP: Record<string, string> = {
  linkedin: 'linkedin-in',
  x: 'x-twitter',
  facebook: 'facebook-f',
  instagram: 'instagram',
  youtube: 'youtube',
  google: 'google',
}

export async function SiteFooter() {
  const [columns, settings, rawSocialLinks] = await Promise.all([
    readFooterColumns(),
    readFooterSettings(),
    readSocialLinks(),
  ])

  // Map social links to font-awesome icons if they have a known platform mapping,
  // otherwise fallback to whatever custom icon was entered (or 'link')
  const socialLinks = rawSocialLinks.map((s) => ({
    id: s.id,
    label: s.platform,
    icon: FA_ICON_MAP[s.platform] ?? s.icon ?? 'link',
    url: s.url,
  }))

  return (
    <Footer
      columns={columns}
      contact={{
        logo: settings.logo_url || undefined,
        brandName: settings.brand_name,
        tagline: settings.tagline,
        description: settings.description,
        copyrightText: settings.copyright_text,
        email: settings.email,
        phone: settings.phone,
        location: settings.location,
        socialLinks: socialLinks.length > 0 ? socialLinks : undefined,
      }}
    />
  )
}

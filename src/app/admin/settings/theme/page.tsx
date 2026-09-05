import { Metadata } from 'next'
import ThemeSettingsPanel from './ThemeSettingsPanel'
import { readSetting } from '@/app/admin/settings/settingsStore'

import PageTitle from '@/components/PageTitle'

export const metadata: Metadata = {
  title: 'Theme Settings | Panzer IT Admin',
}

export default async function ThemeSettingsPage() {
  // Read the JSON theme colors from DB, default to empty object
  const themeColors = await readSetting<Record<string, string>>('frontend_theme_colors', {})

  return (
    <>
      <PageTitle title="Theme Colors Settings" subTitle="Setting" />
      <ThemeSettingsPanel initialColors={themeColors} />
    </>
  )
}

import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import PageTitle from '@/components/PageTitle'

export const metadata: Metadata = { title: 'Color Theme Settings' }

const ColorThemeSettingsPanel = dynamic(() => import('./ColorThemeSettingsPanel'), {
  loading: () => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
      <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
    </div>
  ),
})

const ColorThemeSettingsPage = () => {
  return (
    <>
      <PageTitle title="Color Theme" subTitle="Setting" />
      <ColorThemeSettingsPanel />
    </>
  )
}

export default ColorThemeSettingsPage

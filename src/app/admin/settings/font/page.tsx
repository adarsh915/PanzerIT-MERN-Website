import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import PageTitle from '@/components/PageTitle'

export const metadata: Metadata = { title: 'Font Settings' }

const FontSettingsPanel = dynamic(() => import('./FontSettingsPanel'), {
  loading: () => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
      <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
    </div>
  ),
})

const FontSettingsPage = () => {
  return (
    <>
      <PageTitle title="Font Settings" subTitle="Setting" />
      <FontSettingsPanel />
    </>
  )
}

export default FontSettingsPage

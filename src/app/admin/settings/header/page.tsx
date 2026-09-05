import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import PageTitle from '@/components/PageTitle'

export const metadata: Metadata = { title: 'Header Settings' }

const HeaderFooterSettingsPanel = dynamic(() => import('./HeaderFooterSettingsPanel'), {
  loading: () => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
      <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
    </div>
  ),
})

const HeaderFooterSettingsPage = () => {
  return (
    <>
      <PageTitle title="Header Settings" subTitle="Setting" />
      <HeaderFooterSettingsPanel />
    </>
  )
}

export default HeaderFooterSettingsPage

import type { Metadata } from 'next'
import dynamic from 'next/dynamic'

export const metadata: Metadata = { title: 'Brands & Partners' }

const BrandsPanel = dynamic(() => import('./BrandsPanel'), {
  loading: () => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
      <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
    </div>
  ),
})

const BrandsPage = () => <BrandsPanel />

export default BrandsPage

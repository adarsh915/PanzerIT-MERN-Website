import type { Metadata } from 'next'
import dynamic from 'next/dynamic'

export const metadata: Metadata = { title: 'Resource Categories' }

const ResourceCategoriesPanel = dynamic(() => import('./ResourceCategoriesPanel'), {
  loading: () => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
      <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
    </div>
  ),
})

const ResourceCategoriesPage = () => <ResourceCategoriesPanel />

export default ResourceCategoriesPage

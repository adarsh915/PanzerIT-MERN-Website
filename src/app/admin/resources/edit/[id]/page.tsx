import type { Metadata } from 'next'
import dynamic from 'next/dynamic'

export const metadata: Metadata = { title: 'Edit Resource' }

const ResourceFormPage = dynamic(() => import('../../ResourceFormPage'), {
  loading: () => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
      <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
    </div>
  ),
})

export default async function EditResourcePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  return <ResourceFormPage mode="edit" resourceId={resolvedParams.id} />
}

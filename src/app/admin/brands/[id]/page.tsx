import type { Metadata } from 'next'
import dynamic from 'next/dynamic'

export const metadata: Metadata = { title: 'View Brand & Partner' }

const BrandViewPage = dynamic(() => import('../BrandViewPage'), {
  loading: () => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
      <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
    </div>
  ),
})

type Props = {
  params: Promise<{ id: string }>
}

const ViewBrandPage = async ({ params }: Props) => {
  const { id } = await params
  return <BrandViewPage brandId={id} />
}

export default ViewBrandPage

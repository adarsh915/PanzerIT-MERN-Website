import type { Metadata } from 'next'
import dynamic from 'next/dynamic'

export const metadata: Metadata = { title: 'Edit Solution & Service' }

const SolutionFormPage = dynamic(() => import('../../SolutionFormPage'), {
  loading: () => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
      <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
    </div>
  ),
})

type Props = {
  params: Promise<{ id: string }>
}

const EditSolutionPage = async ({ params }: Props) => {
  const { id } = await params
  return <SolutionFormPage mode="edit" solutionId={id} />
}

export default EditSolutionPage

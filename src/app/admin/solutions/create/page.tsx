import type { Metadata } from 'next'
import dynamic from 'next/dynamic'

export const metadata: Metadata = { title: 'Add Solution & Service' }

const SolutionFormPage = dynamic(() => import('../SolutionFormPage'), {
  loading: () => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
      <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
    </div>
  ),
})

const CreateSolutionPage = () => <SolutionFormPage mode="create" />

export default CreateSolutionPage

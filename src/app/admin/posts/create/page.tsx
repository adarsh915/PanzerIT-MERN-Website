import type { Metadata } from 'next'
import { Suspense } from 'react'
import PostFormPage from '../PostFormPage'

export const metadata: Metadata = { title: 'Add Blog Post' }

const LoadingFallback = () => (
  <div style={{ 
    display: 'flex', 
    flexDirection: 'column',
    justifyContent: 'center', 
    alignItems: 'center', 
    minHeight: '60vh',
    gap: '16px'
  }}>
    <div className="spinner-border text-primary" role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
    <div style={{ fontSize: '16px', color: '#666' }}>Loading form...</div>
  </div>
)

const CreatePostPage = () => (
  <Suspense fallback={<LoadingFallback />}>
    <PostFormPage mode="create" />
  </Suspense>
)

export default CreatePostPage

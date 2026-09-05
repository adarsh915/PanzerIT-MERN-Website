import type { Metadata } from 'next'
import dynamic from 'next/dynamic'

export const metadata: Metadata = { title: 'Blog Categories' }

const BlogCategoriesPanel = dynamic(() => import('./BlogCategoriesPanel'), {
  loading: () => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
      <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
    </div>
  ),
})

const BlogCategoriesPage = () => <BlogCategoriesPanel />

export default BlogCategoriesPage

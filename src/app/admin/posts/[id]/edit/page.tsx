import type { Metadata } from 'next'
import dynamic from 'next/dynamic'

export const metadata: Metadata = { title: 'Edit Blog Post' }

const PostFormPage = dynamic(() => import('../../PostFormPage'), {
  loading: () => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
      <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
    </div>
  ),
})

type Props = {
  params: Promise<{ id: string }>
}

const EditPostPage = async ({ params }: Props) => {
  const { id } = await params
  return <PostFormPage mode="edit" postId={id} />
}

export default EditPostPage

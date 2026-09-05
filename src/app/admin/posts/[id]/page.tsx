import type { Metadata } from 'next'
import dynamic from 'next/dynamic'

export const metadata: Metadata = { title: 'View Blog Post' }

const PostViewPage = dynamic(() => import('../PostViewPage'), {
  loading: () => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
      <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
    </div>
  ),
})

type Props = {
  params: Promise<{ id: string }>
}

const ViewPostPage = async ({ params }: Props) => {
  const { id } = await params
  return <PostViewPage postId={id} />
}

export default ViewPostPage

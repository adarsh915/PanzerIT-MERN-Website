import type { Metadata } from 'next'
import FaqFormPage from '../../FaqFormPage'

export const metadata: Metadata = { title: 'Edit FAQ' }

export default async function EditFaqPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <FaqFormPage mode="edit" faqId={id} />
}

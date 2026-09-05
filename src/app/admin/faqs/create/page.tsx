import type { Metadata } from 'next'
import FaqFormPage from '../FaqFormPage'

export const metadata: Metadata = { title: 'Add FAQ' }

export default function CreateFaqPage() {
  return <FaqFormPage mode="create" />
}

import PageTitle from '@/components/PageTitle'
import EmailArea from './components/EmailArea'
import { Card } from 'react-bootstrap'
import { Metadata } from 'next'
import { EmailProvider } from '@/context/useEmailContext'

export const metadata: Metadata = { title: 'Inbox' }

const EmailPage = () => {
  return (
    <EmailProvider>
      <PageTitle title='Inbox' />
      <Card>
        <div className="d-flex">
          <EmailArea />
        </div>
      </Card>
    </EmailProvider>
  )
}

export default EmailPage
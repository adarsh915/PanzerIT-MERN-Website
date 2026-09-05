import { Metadata } from 'next'
import LogoutClient from './component/LogoutClient'

export const metadata: Metadata = { title: 'Log Out' }

const LogoutPage = () => {
  return <LogoutClient />
}

export default LogoutPage

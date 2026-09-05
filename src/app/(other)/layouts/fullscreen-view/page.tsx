import FullScreenView from './components/FullScreenView'
export const dynamic = 'force-dynamic';
import DashboardPage from '@/app/admin/page'

const FullScreenViewPage = () => {
  return (
    <FullScreenView>
      <DashboardPage />
    </FullScreenView>
  )
}

export default FullScreenViewPage

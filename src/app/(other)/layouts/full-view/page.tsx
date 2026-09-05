import FullView from './components/FullView'
export const dynamic = 'force-dynamic';
import DashboardPage from '@/app/admin/page'
const FullViewPage = () => {
  return (
    <FullView>
      <DashboardPage />
    </FullView>
  )
}

export default FullViewPage

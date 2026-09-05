import Compact from './components/Compact'
export const dynamic = 'force-dynamic';
import DashboardPage from '@/app/admin/page'
const CompactPage = () => {
  return (
    <Compact>
      <DashboardPage />
    </Compact>
  )
}

export default CompactPage

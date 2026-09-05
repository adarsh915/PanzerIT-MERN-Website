import HoverMenu from './components/HoverMenu'
export const dynamic = 'force-dynamic';
import DashboardPage from '@/app/admin/page'

const HoverMenuPage = () => {
  return (
    <HoverMenu>
      <DashboardPage />
    </HoverMenu>
  )
}

export default HoverMenuPage

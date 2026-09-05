import React from 'react'
import Detached from './components/Detached'
export const dynamic = 'force-dynamic';
import DashboardPage from '@/app/admin/page'

const DetachedPage = () => {
  return (
    <Detached>
      <DashboardPage />
    </Detached>
  )
}

export default DetachedPage

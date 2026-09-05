import React from 'react'
import DarkMode from './components/DarkMode'
export const dynamic = 'force-dynamic';
import DashboardPage from '@/app/admin/page'

const DarkModePage = () => {
  return (
    <DarkMode>
      <DashboardPage />
    </DarkMode>
  )
}

export default DarkModePage

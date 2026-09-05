import { ReactNode } from 'react'
'use client'
import VerticalLayout from '@/components/layout/VerticalLayout'
import { useLayoutContext } from '@/context/useLayoutContext'
import { useEffect } from 'react'


const DarkMode = ({ children }: { children: ReactNode }) => {
  const { changeTheme } = useLayoutContext()
  useEffect(() => {
    changeTheme('dark')
  }, [])
  return (
    <VerticalLayout>
      {children}
    </VerticalLayout>
  )
}

export default DarkMode

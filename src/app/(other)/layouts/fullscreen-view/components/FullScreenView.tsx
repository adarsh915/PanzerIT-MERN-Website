import { ReactNode } from 'react'
'use client'
import VerticalLayout from '@/components/layout/VerticalLayout'
import { useLayoutContext } from '@/context/useLayoutContext'
import { useEffect } from 'react'

const FullScreenView = ({ children }: { children: ReactNode }) => {
  const { changeMenu } = useLayoutContext()
  useEffect(() => {
    changeMenu.size('fullscreen')
  }, [])
  return (
    <>
      <VerticalLayout>
        {children}
      </VerticalLayout>
    </>
  )
}

export default FullScreenView

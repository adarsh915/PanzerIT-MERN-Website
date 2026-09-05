import { ReactNode } from 'react'
'use client'
import VerticalLayout from '@/components/layout/VerticalLayout'
import { useLayoutContext } from '@/context/useLayoutContext'
import { useEffect } from 'react'

const HoverMenu = ({ children }: { children: ReactNode }) => {
  const { changeMenu } = useLayoutContext()
  useEffect(() => {
    changeMenu.size('sm-hover')
  }, [])
  return (
    <>
      <VerticalLayout>
        {children}
      </VerticalLayout>
    </>
  )
}

export default HoverMenu

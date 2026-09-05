import { ReactNode } from 'react'
'use client'
import VerticalLayout from '@/components/layout/VerticalLayout'
import { useLayoutContext } from '@/context/useLayoutContext'
import { useEffect } from 'react'

const IconView = ({ children }: { children: ReactNode }) => {
  const { changeMenu } = useLayoutContext()
  useEffect(() => {
    changeMenu.size('condensed')
  }, [])
  return (
    <>
      <VerticalLayout>
        {children}
      </VerticalLayout>
    </>
  )
}

export default IconView

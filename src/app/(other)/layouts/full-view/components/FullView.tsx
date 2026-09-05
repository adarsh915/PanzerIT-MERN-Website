import { ReactNode } from 'react'
'use client'
import VerticalLayout from '@/components/layout/VerticalLayout'
import { useLayoutContext } from '@/context/useLayoutContext'
import dynamic from 'next/dynamic'
import { useEffect } from 'react'


const FullView = ({ children }: { children: ReactNode }) => {
  const { changeMenu } = useLayoutContext()
  useEffect(() => {
    changeMenu.size('full')
  }, [])
  return (
    <>
      <VerticalLayout>
        {children}
      </VerticalLayout>
    </>
  )
}

export default FullView

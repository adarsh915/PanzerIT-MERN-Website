import { ReactNode } from 'react'
'use client'
import VerticalLayout from '@/components/layout/VerticalLayout'
import { useLayoutContext } from '@/context/useLayoutContext'
import { useEffect } from 'react'

const Detached = ({ children }: { children: ReactNode }) => {
  const { changeLayoutMode } = useLayoutContext()
  useEffect(() => {
    changeLayoutMode('detached')
  }, [])
  return (<>
    <VerticalLayout>
      {children}
    </VerticalLayout>
  </>)
}

export default Detached

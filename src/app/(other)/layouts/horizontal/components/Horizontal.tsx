'use client'
import { useLayoutContext } from '@/context/useLayoutContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

const Horizontal = () => {
  const router = useRouter()
  const { changeLayoutOrientation } = useLayoutContext()
  useEffect(() => {
    changeLayoutOrientation('vertical')
    router.push('/dashboard')
  }, [])
  return <></>
}

export default Horizontal

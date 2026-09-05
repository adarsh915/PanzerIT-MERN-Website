'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthContext } from '@/context/useAuthContext'

const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuthContext()
  const router = useRouter()
  const pathname = usePathname()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (isMounted && !isLoading && !isAuthenticated) {
      router.replace(`/auth/login?redirectTo=${encodeURIComponent(pathname || '/admin')}`)
    }
  }, [isMounted, isLoading, isAuthenticated, router, pathname])

  if (!isMounted) return null
  if (isLoading) return null
  if (!isAuthenticated) return null
  
  return <>{children}</>
}

export default RequireAuth



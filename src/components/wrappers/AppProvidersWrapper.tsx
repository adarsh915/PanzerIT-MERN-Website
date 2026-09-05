'use client'
import { ToastContainer } from 'react-toastify'
import { ChildrenType } from '../../types/component-props'
import { AuthProvider } from '@/context/useAuthContext'
import { LayoutProvider } from '@/context/useLayoutContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

const AppProvidersWrapper = ({ children }: ChildrenType) => {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
      },
    },
  }))

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <LayoutProvider>
            {children}
            <ToastContainer theme="colored" />
          </LayoutProvider>
        </AuthProvider>
      </QueryClientProvider>
    </>
  )
}
export default AppProvidersWrapper

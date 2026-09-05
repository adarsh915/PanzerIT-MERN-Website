"use client"
import AppProvidersWrapper from '@/components/wrappers/AppProvidersWrapper'

import 'flatpickr/dist/flatpickr.min.css'
import '@/assets/scss/app.scss'

const OtherLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <AppProvidersWrapper>
      {children}
    </AppProvidersWrapper>
  )
}

export default OtherLayout

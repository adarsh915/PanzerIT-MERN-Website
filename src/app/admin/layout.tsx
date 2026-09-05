"use client"
import { ChildrenType } from '../../types/component-props'
import VerticalLayout from '@/components/layout/VerticalLayout'
import RequireAuth from '@/components/auth/RequireAuth'
import AppProvidersWrapper from '@/components/wrappers/AppProvidersWrapper'

// Load full admin CSS here so it doesn't bloat the frontend
import 'flatpickr/dist/flatpickr.min.css'
import '@/assets/scss/app.scss';
const AdminLayout = ({ children }: ChildrenType) => {

  return (
    <AppProvidersWrapper>
      <VerticalLayout>
        <RequireAuth>{children}</RequireAuth>
      </VerticalLayout>
    </AppProvidersWrapper>
  )
}

export default AdminLayout

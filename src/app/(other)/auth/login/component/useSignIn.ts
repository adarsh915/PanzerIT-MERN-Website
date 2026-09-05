'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { toast } from 'react-toastify'

import useQueryParams from '@/hooks/useQueryParams'
import { useAuthContext } from '@/context/useAuthContext'

const useSignIn = () => {
  const [loading, setLoading] = useState(false)
  const { push } = useRouter()
  const queryParams = useQueryParams()
  const { login } = useAuthContext()

  const loginFormSchema = yup.object({
    email: yup.string().email('Please enter a valid email').required('Please enter your email'),
    password: yup.string().min(1, 'Please enter your password').required('Please enter your password'),
  })

  const { control, handleSubmit } = useForm({
    resolver: yupResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  type LoginFormFields = yup.InferType<typeof loginFormSchema>

  const onSubmit = handleSubmit(async (values: LoginFormFields) => {
    setLoading(true)
    try {
      await login({ email: values.email, password: values.password })
      const redirectTo = queryParams['redirectTo'] ?? '/admin'
      push(redirectTo)
    } catch (err: any) {
      toast.error(err?.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  })

  return { loading, login: onSubmit, control }
}

export default useSignIn

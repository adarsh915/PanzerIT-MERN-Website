'use client'

import React, { useState, Suspense } from 'react'
import logoDark from '@/assets/images/logo-dark.png'
import logo from '@/assets/images/logo.jpeg'
import Image from 'next/image'
import { Card, Col, Row, Spinner, Alert } from 'react-bootstrap'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'

const CreatePasswordForm = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const token = searchParams.get('token')
  const email = searchParams.get('email')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'danger'; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    if (!token || !email) {
      setMessage({ type: 'danger', text: 'Invalid or missing reset token.' })
      return
    }

    if (password.length < 6) {
      setMessage({ type: 'danger', text: 'Password must be at least 6 characters.' })
      return
    }

    if (password !== confirmPassword) {
      setMessage({ type: 'danger', text: 'Passwords do not match.' })
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/create-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, newPassword: password }),
      })

      const data = await res.json()

      if (res.ok) {
        setMessage({ type: 'success', text: 'Password reset successful! Redirecting to login...' })
        setTimeout(() => {
          router.push('/auth/login')
        }, 2000)
      } else {
        setMessage({ type: 'danger', text: data.message || 'Failed to reset password.' })
      }
    } catch (err) {
      setMessage({ type: 'danger', text: 'An unexpected error occurred.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="overflow-hidden text-center h-100 p-xxl-4 p-3 mb-0">
      <div className="auth-brand mb-4 d-flex justify-content-center">
        <Image src={logoDark} alt="dark logo" height={26} className="logo-dark" />
        <Image src={logo} alt="logo light" height={26} className="logo-light" />
      </div>

      <h4 className="fw-semibold mb-2 fs-20">Create New Password</h4>
      <p className="text-muted mb-4">Please create your new password for {email}.</p>
      
      {message && (
        <Alert variant={message.type} className="text-start">
          {message.text}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="text-start mb-3">
        <div className="mb-3">
          <label className="form-label" htmlFor="new-password">
            New Password <small className="text-info ms-1">Must be at least 6 characters</small>
          </label>
          <input 
            type="password" 
            id="new-password" 
            className="form-control" 
            placeholder="New Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label" htmlFor="re-password">Re-enter New Password</label>
          <input 
            type="password" 
            id="re-password" 
            className="form-control" 
            placeholder="Re-enter Password" 
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <div className="mb-2 d-grid">
          <button className="btn btn-primary fw-semibold" type="submit" disabled={loading}>
            {loading ? <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" /> Saving...</> : 'Save New Password'}
          </button>
        </div>
      </form>
      <p className="text-muted fs-14 mb-4">Back To <Link href="/auth/login" className="fw-semibold text-danger ms-1">Login!</Link></p>
    </Card>
  )
}

const CreatePasswordPage = () => {
  return (
    <div className="auth-bg d-flex min-vh-100 justify-content-center align-items-center">
      <Row className="g-0 justify-content-center w-100 m-xxl-5 px-xxl-4 m-3">
        <Col xl={4} lg={5} md={6}>
          <Suspense fallback={<div className="text-center p-5"><Spinner animation="border" /></div>}>
            <CreatePasswordForm />
          </Suspense>
        </Col>
      </Row>
    </div>
  )
}

export default CreatePasswordPage
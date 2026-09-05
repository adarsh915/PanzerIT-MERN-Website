'use client'

import React, { useState } from 'react'
import logoDark from '@/assets/images/logo-dark.png'
import logo from '@/assets/images/logo.jpeg'
import Image from 'next/image'
import { Card, Col, Row, Spinner, Alert } from 'react-bootstrap'
import Link from 'next/link'

const RecoverPasswordPage = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'danger'; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    if (!email) {
      setMessage({ type: 'danger', text: 'Please enter your email address.' })
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/recover-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (res.ok) {
        setMessage({ type: 'success', text: data.message || 'Reset link sent successfully.' })
        setEmail('') // Clear the form
      } else {
        setMessage({ type: 'danger', text: data.message || 'Failed to send reset link.' })
      }
    } catch (err) {
      setMessage({ type: 'danger', text: 'An unexpected error occurred.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-bg d-flex min-vh-100 justify-content-center align-items-center">
      <Row className="g-0 justify-content-center w-100 m-xxl-5 px-xxl-4 m-3">
        <Col xl={4} lg={5} md={6}>
          <Card className="overflow-hidden text-center h-100 p-xxl-4 p-3 mb-0">


            <h4 className="fw-semibold mb-2 fs-18">Reset Your Password</h4>
            <p className="text-muted mb-4">Please enter your email address to request a password reset.</p>

            {message && (
              <Alert variant={message.type} className="text-start">
                {message.text}
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="text-start mb-3">
              <div className="mb-3">
                <label className="form-label" htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="form-control"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="d-grid">
                <button className="btn btn-primary fw-semibold" type="submit" disabled={loading}>
                  {loading ? <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" /> Sending...</> : 'Reset Password'}
                </button>
              </div>
            </form>
            <p className="text-muted fs-14 mb-4">Back To <Link href="/auth/login" className="fw-semibold text-danger ms-1">Login!</Link></p>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default RecoverPasswordPage
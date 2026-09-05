'use client'

import Image from 'next/image'
import React, { useEffect } from 'react'
import logoDark from '@/assets/images/logo-dark.png'
import logo from '@/assets/images/logo.jpeg'
import avatar1 from '@/assets/images/users/avatar-1.jpg'
import { currentYear } from '@/context/constants'
import { Card, Col, Row } from 'react-bootstrap'
import Link from 'next/link'
import { useAuthContext } from '@/context/useAuthContext'

const LogoutClient = () => {
  const { logout } = useAuthContext()

  useEffect(() => {
    logout()
  }, [logout])

  return (
    <div className="auth-bg d-flex min-vh-100 justify-content-center align-items-center">
      <Row className="g-0 justify-content-center w-100 m-xxl-5 px-xxl-4 m-3">
        <Col xl={4} lg={5} md={6}>
          <Card className="overflow-hidden text-center h-100 p-xxl-4 p-3 mb-0">
            <a href="/" className="auth-brand mb-4">
              <Image src={logoDark} alt="dark logo" height={26} className="logo-dark" />
              <Image src={logo} alt="logo light" height={26} className="logo-light" />
            </a>
            <h4 className="fw-semibold mb-2 fs-18">You are Logged Out</h4>
            <div className="d-flex align-items-center gap-2 my-3 mx-auto">
              <Image src={avatar1} alt="avatar" className="avatar-lg rounded-circle img-thumbnail" />
              <div>
                <h4 className="fw-semibold text-dark">See you again!</h4>
              </div>
            </div>
            <div className="mb-3 text-start">
              <div className="bg-success-subtle p-3 rounded fst-italic fw-medium mb-0" role="alert">
                <p className="mb-0 text-success">
                  You have been successfully logged out. To continue, please log in again.
                </p>
              </div>
            </div>
            <div className="d-grid">
              <Link href="/auth/login" className="btn btn-primary fw-semibold">
                Go to Login
              </Link>
            </div>
            <p className="mt-auto mb-0">
              {currentYear} © Greeva - By{' '}
              <span className="fw-bold text-decoration-underline text-uppercase text-reset fs-12">Coderthemes</span>
            </p>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default LogoutClient


import { getCurrentYear } from '@/context/constants'
import React from 'react'
import { Col, Row } from 'react-bootstrap'

const Footer = () => {
  const currentYear = getCurrentYear()

  return (
    <footer className="footer">
      <div className="page-container">
        <Row>
          <Col className="text-center text-md-start">
            {currentYear} © PanzerIT - By <span className="fw-bold text-reset fs-12">Crescita Software</span>
          </Col>
        </Row>
      </div>
    </footer>
  )
}

export default Footer

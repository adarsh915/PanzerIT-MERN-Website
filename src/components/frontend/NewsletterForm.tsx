'use client'

import React, { useState } from 'react'
import styles from './footer.module.css'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function NewsletterForm({
  className = '',
  inputClassName = '',
  buttonClassName = ''
}: {
  className?: string,
  inputClassName?: string,
  buttonClassName?: string
}) {
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const validateEmail = (value: string): string => {
    if (!value.trim()) return 'Email address is required.';
    if (!EMAIL_REGEX.test(value.trim())) return 'Please enter a valid email address.';
    return '';
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    // Clear error as user types
    if (emailError) setEmailError('');
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')

    const error = validateEmail(email);
    if (error) {
      setEmailError(error);
      return;
    }

    setEmailError('')
    setStatus('loading')

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })

      const data = await res.json()

      if (res.ok) {
        setStatus('success')
        setMessage(data.message || 'Successfully subscribed!')
        setEmail('')
        setTimeout(() => {
          setStatus('idle')
          setMessage('')
        }, 5000)
      } else {
        setStatus('error')
        setMessage(data.message || 'Failed to subscribe. Please try again.')
      }
    } catch {
      setStatus('error')
      setMessage('Network error. Please try again.')
    }
  }

  return (
    <form className={className || "newsletter-form"} onSubmit={handleSubmit} noValidate>
      <div className={styles.inputRow} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', position: 'relative' }}>
        <input
          type="email"
          name="email"
          placeholder="Email Address"
          autoComplete="email"
          className={inputClassName || styles.emailInput || "email"}
          value={email}
          onChange={handleChange}
          disabled={status === 'loading'}
          style={
            emailError
              ? { borderColor: '#e53e3e' }
              : status === 'success'
                ? { borderColor: '#28a745' }
                : {}
          }
        />
        <button
          type="submit"
          aria-label="Subscribe to newsletter"
          className={buttonClassName || styles.sendBtn}
          disabled={status === 'loading'}
          style={status === 'loading' ? { opacity: 0.7, pointerEvents: 'none' } : {}}
        >
          {status === 'loading' ? (
            <span style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
          ) : (
            <i className="far fa-paper-plane" />
          )}
        </button>
      </div>

      {emailError && (
        <div style={{ marginTop: '6px', fontSize: '12px', color: '#e53e3e', fontWeight: 500 }}>
          <i className="fa-solid fa-circle-exclamation" style={{ marginRight: 4 }}></i>{emailError}
        </div>
      )}

      {message && (
        <div style={{
          marginTop: '8px',
          fontSize: '13px',
          fontWeight: 500,
          color: status === 'success' ? '#28a745' : '#e53e3e',
        }}>
          {status === 'success' && <i className="fa-solid fa-circle-check" style={{ marginRight: 4 }}></i>}
          {status === 'error' && <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: 4 }}></i>}
          {message}
        </div>
      )}
    </form>
  )
}

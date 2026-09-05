'use client'
import { useState, useRef } from "react";
import { usePathname } from "next/navigation";
import ReCAPTCHA from "react-google-recaptcha";

type FieldErrors = {
  name?: string;
  company?: string;
  email?: string;
  phone?: string;
  subject?: string;
  msg?: string;
  terms?: string;
};

function validate(fields: Record<string, string>, terms: boolean): FieldErrors {
  const errors: FieldErrors = {};

  if (!fields.name?.trim()) {
    errors.name = 'Full name is required.';
  } else if (fields.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters.';
  }

  if (!fields.company?.trim()) {
    errors.company = 'Company name is required.';
  }

  if (!fields.email?.trim()) {
    errors.email = 'Email address is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim())) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!fields.phone?.trim()) {
    errors.phone = 'Mobile number is required.';
  } else if (!/^\+?[\d\s\-()]{7,15}$/.test(fields.phone.trim())) {
    errors.phone = 'Please enter a valid mobile number (7–15 digits).';
  }

  if (!fields.subject?.trim()) {
    errors.subject = 'Subject is required.';
  }

  if (!fields.msg?.trim()) {
    errors.msg = 'Message is required.';
  } else if (fields.msg.trim().length < 10) {
    errors.msg = 'Message must be at least 10 characters.';
  }

  if (!terms) {
    errors.terms = 'You must agree to be contacted before submitting.';
  }

  return errors;
}

export default function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [terms, setTerms] = useState(false);
  const pathname = usePathname();
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setApiError('');
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const fields: Record<string, string> = {};
    formData.forEach((val, key) => { fields[key] = val.toString(); });

    const errors = validate(fields, terms);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    fields.page_source = pathname || '/';

    if (process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY) {
      const recaptchaToken = recaptchaRef.current?.getValue();
      if (!recaptchaToken) {
        setApiError('Please complete the reCAPTCHA verification.');
        setLoading(false);
        return;
      }
      fields.recaptchaToken = recaptchaToken;
    }

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      });

      if (res.ok) {
        setSuccess(true);
        setFieldErrors({});
        setTerms(false);
        recaptchaRef.current?.reset();
        (e.target as HTMLFormElement).reset();
      } else {
        const errorData = await res.json();
        setApiError(errorData.message || 'Something went wrong. Please try again.');
        recaptchaRef.current?.reset();
      }
    } catch {
      setApiError('Network error. Please check your connection and try again.');
      recaptchaRef.current?.reset();
    } finally {
      setLoading(false);
    }
  };

  const fe = fieldErrors;

  return (
    <>
      {success && (
        <div className="panzer-form-success">
          <i className="fa-solid fa-circle-check"></i> Your message has been sent successfully! We will get back to you soon.
        </div>
      )}
      {apiError && (
        <div className="panzer-form-error-banner">
          <i className="fa-solid fa-triangle-exclamation"></i> {apiError}
        </div>
      )}
      <form id="panzer-contact-form" className="panzer-contact-form" onSubmit={handleSubmit} noValidate>
        <div className="form-grid">
          <div className={`form-group${fe.name ? ' panzer-field-error' : ''}`}>
            <span className="icon"><i className="fa-slab-press fa-regular fa-user"></i></span>
            <input type="text" id="fullName" name="name" placeholder="Your Name*" autoComplete="on" />
            {fe.name && <span className="panzer-error-msg">{fe.name}</span>}
          </div>
          <div className={`form-group${fe.company ? ' panzer-field-error' : ''}`}>
            <span className="icon"><i className="fa-regular fa-building"></i></span>
            <input type="text" id="companyName" name="company" placeholder="Your Company*" autoComplete="on" />
            {fe.company && <span className="panzer-error-msg">{fe.company}</span>}
          </div>
        </div>
        <div className="form-grid">
          <div className="form-group">
            <span className="icon"><i className="fa-regular fa-location-dot"></i></span>
            <input type="text" id="city" name="city" placeholder="Your City" autoComplete="on" />
          </div>
          <div className={`form-group${fe.email ? ' panzer-field-error' : ''}`}>
            <span className="icon"><i className="fa-regular fa-envelope"></i></span>
            <input type="email" id="userEmail" name="email" placeholder="Your Email*" autoComplete="on" />
            {fe.email && <span className="panzer-error-msg">{fe.email}</span>}
          </div>
        </div>
        <div className="form-grid">
          <div className={`form-group${fe.phone ? ' panzer-field-error' : ''}`}>
            <span className="icon"><i className="fa-solid fa-phone"></i></span>
            <input type="text" id="phone" name="phone" placeholder="Your Mobile*" autoComplete="off" />
            {fe.phone && <span className="panzer-error-msg">{fe.phone}</span>}
          </div>
          <div className={`form-group${fe.subject ? ' panzer-field-error' : ''}`}>
            <span className="icon"><i className="fa-regular fa-tag"></i></span>
            <input type="text" id="subject" name="subject" placeholder="Subject*" autoComplete="on" />
            {fe.subject && <span className="panzer-error-msg">{fe.subject}</span>}
          </div>
        </div>
        <div className={`form-group${fe.msg ? ' panzer-field-error' : ''}`}>
          <textarea id="msg" name="msg" placeholder="Your Message*"></textarea>
          {fe.msg && <span className="panzer-error-msg">{fe.msg}</span>}
        </div>
        <div className={`form-group terms${fe.terms ? ' panzer-field-error' : ''}`}>
          <input
            type="checkbox"
            id="terms"
            checked={terms}
            onChange={e => setTerms(e.target.checked)}
          />
          <label htmlFor="terms">I agree to be contacted regarding my enquiry.</label>
          {fe.terms && <span className="panzer-error-msg" style={{ display: 'block', marginTop: '4px' }}>{fe.terms}</span>}
        </div>
        {process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY && (
          <div className="form-group recaptcha-wrapper" style={{ marginTop: '20px' }}>
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ""}
            />
          </div>
        )}
        <button type="submit" className="theme-btn mt-30" disabled={loading}>
          <span className="link-effect">
            <span className="effect-1">{loading ? 'Submitting...' : 'Submit Now'}</span>
            <span className="effect-1">{loading ? 'Submitting...' : 'Submit Now'}</span>
          </span>
          <span className="arrow-all">
            <i>
              <svg width="16" height="19" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 6H10M10 6L6 2M10 6L6 10" stroke="var(--theme-color)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <svg width="16" height="19" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 6H10M10 6L6 2M10 6L6 10" stroke="var(--theme-color)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </i>
          </span>
        </button>
      </form>
    </>
  );
}

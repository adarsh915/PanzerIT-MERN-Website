'use client'
import { useState, useRef } from "react";
import { usePathname } from "next/navigation";
import ReCAPTCHA from "react-google-recaptcha";

type FieldErrors = {
  name?: string;
  email?: string;
  msg?: string;
};

function validate(fields: Record<string, string>): FieldErrors {
  const errors: FieldErrors = {};

  if (!fields.name?.trim()) {
    errors.name = 'Your name is required.';
  } else if (fields.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters.';
  }

  if (!fields.email?.trim()) {
    errors.email = 'Email address is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim())) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!fields.msg?.trim()) {
    errors.msg = 'Please write your message before submitting.';
  } else if (fields.msg.trim().length < 10) {
    errors.msg = 'Message must be at least 10 characters.';
  }

  return errors;
}

const serviceOptions = [
  { value: "scopd-dlp", label: "Scopd DLP with UEBA" },
  { value: "backup-recovery", label: "Backup & Disaster Recovery" },
  { value: "dlp", label: "Data Leak Prevention – DLP" },
  { value: "vapt", label: "Vulnerability Scanner, Assessment & VAPT" },
  { value: "employee-monitoring", label: "Employee Monitoring" },
  { value: "edr", label: "Advance Threat Prevention | EDR | EPS" },
];

export default function ServiceContactForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [selectedService, setSelectedService] = useState<string>("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const pathname = usePathname();
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setApiError('');
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const fields: Record<string, string> = {};
    formData.forEach((val, key) => { fields[key] = val.toString(); });

    // Add selected service to fields
    fields.service = selectedService;

    const errors = validate(fields);
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
        setSelectedService("");
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
      <style>{`
        .panzer-custom-dropdown {
          position: relative;
          width: 100%;
        }
        .panzer-custom-dropdown-button {
          width: 100%;
          padding: 12px 40px 12px 15px;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          background: var(--light-color);
          font-size: 14px;
          color: #333;
          text-align: left;
          cursor: pointer;
          transition: border-color 0.3s ease;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .panzer-custom-dropdown-button.placeholder {
          color: #999;
        }
        .panzer-custom-dropdown-button:hover,
        .panzer-custom-dropdown-button.open {
          border-color: var(--theme-color);
        }
        .panzer-custom-dropdown-arrow {
          position: absolute;
          right: 15px;
          top: 50%;
          transform: translateY(-50%);
          transition: transform 0.3s ease;
          pointer-events: none;
        }
        .panzer-custom-dropdown-button.open .panzer-custom-dropdown-arrow {
          transform: translateY(-50%) rotate(180deg);
        }
        .panzer-custom-dropdown-menu {
          position: absolute;
          top: calc(100% + 5px);
          left: 0;
          right: 0;
          background: var(--light-color);
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          max-height: 300px;
          overflow-y: auto;
          z-index: 1000;
          opacity: 0;
          visibility: hidden;
          transform: translateY(-10px);
          transition: all 0.3s ease;
        }
        .panzer-custom-dropdown-menu.open {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }
        .panzer-custom-dropdown-option {
          padding: 12px 15px;
          cursor: pointer;
          transition: background-color 0.2s ease;
          font-size: 14px;
          color: #333;
        }
        .panzer-custom-dropdown-option:hover {
          background-color: var(--theme-color);
          color: var(--text-light);
        }
        .panzer-custom-dropdown-option.selected {
          background-color: var(--theme-color);
          color: #ffffff;
        }
        .panzer-custom-dropdown-option:first-child {
          border-radius: 7px 7px 0 0;
        }
        .panzer-custom-dropdown-option:last-child {
          border-radius: 0 0 7px 7px;
        }
      `}</style>
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
      <form id="panzer-service-contact-form" className="panzer-contact-form" onSubmit={handleSubmit} noValidate style={{ position: 'relative', zIndex: 1 }}>
        <div className="form-grid">
          <div className={`form-group${fe.name ? ' panzer-field-error' : ''}`}>
            <input type="text" id="fullName" name="name" placeholder="Your Name*" autoComplete="on" />
            {fe.name && <span className="panzer-error-msg">{fe.name}</span>}
          </div>
          <div className={`form-group${fe.email ? ' panzer-field-error' : ''}`}>
            <input type="email" id="userEmail" name="email" placeholder="E-Mail*" autoComplete="on" />
            {fe.email && <span className="panzer-error-msg">{fe.email}</span>}
          </div>
        </div>
        <div className="form-grid">
          <div className="form-group" ref={dropdownRef}>
            <div className="panzer-custom-dropdown">
              <button
                type="button"
                className={`panzer-custom-dropdown-button ${!selectedService ? 'placeholder' : ''} ${dropdownOpen ? 'open' : ''}`}
                onClick={() => setDropdownOpen(!dropdownOpen)}
                onBlur={(e) => {
                  // Only close if clicking outside the dropdown
                  if (!dropdownRef.current?.contains(e.relatedTarget as Node)) {
                    setTimeout(() => setDropdownOpen(false), 200);
                  }
                }}
              >
                <span>{selectedService ? serviceOptions.find(opt => opt.value === selectedService)?.label : "Select Service"}</span>
                <span className="panzer-custom-dropdown-arrow">▼</span>
              </button>
              <div className={`panzer-custom-dropdown-menu ${dropdownOpen ? 'open' : ''}`}>
                {serviceOptions.map((option) => (
                  <div
                    key={option.value}
                    className={`panzer-custom-dropdown-option ${selectedService === option.value ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedService(option.value);
                      setDropdownOpen(false);
                    }}
                  >
                    {option.label}
                  </div>
                ))}
              </div>
            </div>
            <input type="hidden" name="service" value={selectedService} />
          </div>
        </div>
        <div className={`form-group${fe.msg ? ' panzer-field-error' : ''}`}>
          <textarea id="msg" name="msg" placeholder="Write Message*"></textarea>
          {fe.msg && <span className="panzer-error-msg">{fe.msg}</span>}
        </div>
        {process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY && (
          <div className="form-group recaptcha-wrapper" style={{ marginTop: '20px' }}>
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ""}
            />
          </div>
        )}
        <button type="submit" className="theme-btn" disabled={loading}>
          <span className="btn-title mr-10">{loading ? 'Sending...' : 'Send Message'}</span>
          <i className="fa-solid fa-arrow-right"></i>
        </button>
      </form>
    </>
  );
}

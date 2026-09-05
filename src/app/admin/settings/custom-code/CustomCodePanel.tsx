'use client'

import React, { useEffect, useState, useTransition } from 'react'
import PageTitle from '@/components/PageTitle'
import { Alert, Button, Card, CardBody, Nav, Spinner } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { getCustomCode, saveCustomCode, type CustomCode } from './customCodeStore'

// ── Lightweight "code textarea" with line numbers ──────────────────────────────
function CodeTextarea({
  label,
  hint,
  icon,
  value,
  onChange,
  placeholder,
}: {
  label: string
  hint: string
  icon: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <div className="mb-4">
      <div className="d-flex align-items-center gap-2 mb-1">
        <IconifyIcon icon={icon} className="fs-18 text-primary" />
        <label className="fw-semibold fs-15 mb-0">{label}</label>
      </div>
      <p className="text-muted fs-12 mb-2">{hint}</p>
      <textarea
        className="form-control font-monospace"
        rows={10}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        spellCheck={false}
        style={{
          resize: 'vertical',
          background: '#0d1117',
          color: '#e6edf3',
          border: '1px solid #30363d',
          borderRadius: '8px',
          fontSize: '13px',
          lineHeight: '1.6',
          padding: '12px 16px',
          tabSize: 2,
        }}
      />
    </div>
  )
}

// ── Main Panel ─────────────────────────────────────────────────────────────────
type Tab = 'head-scripts' | 'head-css' | 'footer-scripts'

export default function CustomCodePanel() {
  const [activeTab, setActiveTab] = useState<Tab>('head-scripts')
  const [form, setForm] = useState<CustomCode>({
    headScripts: '',
    headCSS: '',
    footerScripts: '',
  })
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState<{ type: 'success' | 'danger'; text: string } | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    getCustomCode().then((data) => {
      setForm(data)
      setIsLoading(false)
    })
  }, [])

  const handleSave = () => {
    setMessage(null)
    startTransition(async () => {
      const res = await saveCustomCode(form)
      if (res.success) {
        setMessage({ type: 'success', text: 'Custom code saved and deployed successfully!' })
      } else {
        setMessage({ type: 'danger', text: res.error || 'Failed to save custom code.' })
      }
    })
  }

  if (isLoading) {
    return (
      <>
        <PageTitle title="Custom Code" />
        <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
          <Spinner animation="border" variant="primary" />
        </div>
      </>
    )
  }

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'head-scripts', label: 'Head Scripts', icon: 'tabler:code-asterisk' },
    { key: 'head-css', label: 'Head CSS', icon: 'tabler:brand-css3' },
    { key: 'footer-scripts', label: 'Footer Scripts', icon: 'tabler:code-dots' },
  ]

  return (
    <>
      <PageTitle title="Custom Code" />

      {/* Warning Banner */}
      <div
        className="alert alert-warning d-flex gap-2 align-items-start mb-4"
        role="alert"
        style={{ border: '1px solid #f0ad4e' }}
      >
        <IconifyIcon icon="tabler:alert-triangle" className="fs-20 flex-shrink-0 mt-1" />
        <div>
          <strong>Use with caution.</strong> Custom code is injected directly into every page of your
          website. Malformed HTML/JS can break your site. Always test changes in a staging environment
          first.
        </div>
      </div>

      {message && (
        <Alert variant={message.type} className="d-flex align-items-center gap-2 mb-4">
          <IconifyIcon
            icon={message.type === 'success' ? 'tabler:circle-check' : 'tabler:alert-circle'}
            className="fs-18"
          />
          {message.text}
        </Alert>
      )}

      <Card>
        <CardBody>
          {/* Tab Navigation */}
          <Nav variant="tabs" className="mb-4">
            {tabs.map((tab) => (
              <Nav.Item key={tab.key}>
                <Nav.Link
                  active={activeTab === tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className="d-flex align-items-center gap-1"
                  style={{ cursor: 'pointer' }}
                >
                  <IconifyIcon icon={tab.icon} className="fs-16" />
                  {tab.label}
                </Nav.Link>
              </Nav.Item>
            ))}
          </Nav>

          {/* Tab Content */}
          {activeTab === 'head-scripts' && (
            <CodeTextarea
              label="Head Scripts"
              icon="tabler:code-asterisk"
              hint="HTML injected inside <head> on every page. Use for analytics tags (GA4, GTM snippet), Meta Pixel, etc."
              value={form.headScripts}
              onChange={(v) => setForm((p) => ({ ...p, headScripts: v }))}
              placeholder={`<!-- Example: Google Tag Manager -->
<script>(function(w,d,s,l,i){...})(window,document,'script','dataLayer','GTM-XXXX');</script>`}
            />
          )}

          {activeTab === 'head-css' && (
            <CodeTextarea
              label="Head CSS"
              icon="tabler:brand-css3"
              hint="Custom CSS injected inside <head>. Wrap in <style> tags or write bare CSS — both are supported."
              value={form.headCSS}
              onChange={(v) => setForm((p) => ({ ...p, headCSS: v }))}
              placeholder={`/* Example: Override a theme variable */
:root {
  --theme-color: #e76b1f;
}

/* Or bare <style> tags */
<style>
  .my-class { color: red; }
</style>`}
            />
          )}

          {activeTab === 'footer-scripts' && (
            <CodeTextarea
              label="Footer Scripts"
              icon="tabler:code-dots"
              hint="HTML injected at the end of every page, just before </body>. Use for chat widgets, non-critical scripts, etc."
              value={form.footerScripts}
              onChange={(v) => setForm((p) => ({ ...p, footerScripts: v }))}
              placeholder={`<!-- Example: Intercom Widget -->
<script>
  window.intercomSettings = { app_id: 'YOUR_APP_ID' };
</script>`}
            />
          )}

          {/* Footer Controls */}
          <div className="d-flex justify-content-between align-items-center pt-3 border-top mt-2">
            <p className="text-muted fs-12 mb-0">
              <IconifyIcon icon="tabler:info-circle" className="me-1" />
              Changes are applied globally to all frontend pages after saving.
            </p>
            <Button variant="primary" onClick={handleSave} disabled={isPending}>
              {isPending ? (
                <>
                  <Spinner as="span" animation="border" size="sm" className="me-2" />
                  Saving...
                </>
              ) : (
                <>
                  <IconifyIcon icon="tabler:device-floppy" className="me-1 fs-16" />
                  Save & Deploy
                </>
              )}
            </Button>
          </div>
        </CardBody>
      </Card>
    </>
  )
}

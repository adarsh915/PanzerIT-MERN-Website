'use client'

import IconifyIcon from '@/components/wrappers/IconifyIcon'
import clsx from 'clsx'
import { type DragEvent, useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify'
import { readSetting, writeSetting } from '../settingsStore'
import MediaPickerModal from '@/components/admin/MediaPickerModal'
import styles from './HeaderFooterSettingsPanel.module.scss'

// ── Types ────────────────────────────────────────────────────────────────────

type HeaderLogoState = {
  logoUrl: string
  logoAlt: string
  logoWidth: number
}

// ── Defaults ─────────────────────────────────────────────────────────────────

const defaultHeaderLogo: HeaderLogoState = {
  logoUrl: '',
  logoAlt: 'Header Logo',
  logoWidth: 140,
}

const ACCEPTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp', 'image/gif']

// ── Sub-components ────────────────────────────────────────────────────────────

const SectionTitle = ({ icon, title, subtitle }: { icon: string; title: string; subtitle: string }) => (
  <div className={styles.sectionTitle}>
    <span className={styles.sectionIcon}>
      <IconifyIcon icon={icon} />
    </span>
    <div>
      <h3>{title}</h3>
      <p>{subtitle}</p>
    </div>
  </div>
)

// ── Reusable Logo Upload Block ────────────────────────────────────────────────

interface LogoUploadSectionProps {
  logoUrl: string
  logoAlt: string
  logoWidth: number
  onUpload: (url: string) => void
  onAltChange: (alt: string) => void
  onWidthChange: (w: number) => void
  onRemove: () => void
}

const LogoUploadSection = ({ logoUrl, logoAlt, logoWidth, onUpload, onAltChange, onWidthChange, onRemove }: LogoUploadSectionProps) => {
  const [isDragOver, setIsDragOver] = useState(false)
  const [showPicker, setShowPicker] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const processFile = (file: File) => {
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast.error('Please upload a valid image (.png, .jpg, .svg, .webp, .gif)')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be under 2 MB')
      return
    }
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', 'header')
    
    const upload = async () => {
      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })
        const data = await res.json()
        if (res.ok && data.url) {
          onUpload(data.url)
          toast.success('Logo uploaded successfully')
        } else {
          toast.error(data.error || 'Image upload failed')
        }
      } catch (e) {
        toast.error('Image upload failed')
      }
    }
    upload()
  }

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) processFile(e.target.files[0])
    e.target.value = ''
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(false)
    if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0])
  }

  const handleRemove = () => {
    onRemove()
    toast.info('Logo removed')
  }

  return (
    <div className={styles.fieldStack}>
      <div
        className={clsx(styles.logoDropZone, isDragOver && styles.logoDropZoneActive)}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
        onDragLeave={() => setIsDragOver(false)}
        onClick={() => setShowPicker(true)}
        role="button"
        tabIndex={0}
        aria-label="Upload logo"
        onKeyDown={(e) => e.key === 'Enter' && setShowPicker(true)}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp,image/gif"
          className={styles.hiddenInput}
          onChange={handleInput}
          aria-hidden="true"
        />
        {logoUrl ? (
          <div className={styles.logoPreviewWrap}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoUrl} alt={logoAlt} className={styles.logoPreviewImg} style={{ maxWidth: `${logoWidth}px` }} />
            <span className={styles.logoChangeHint}>
              <IconifyIcon icon="tabler:refresh" />
              Click or drag to replace
            </span>
          </div>
        ) : (
          <>
            <span className={styles.logoDropIcon}>
              <IconifyIcon icon={isDragOver ? 'tabler:photo-down' : 'tabler:photo-up'} />
            </span>
            <strong>{isDragOver ? 'Drop to upload' : 'Upload or select your logo here'}</strong>
            <span>or click to browse &mdash; PNG, JPG, SVG, WebP, GIF &middot; max 2 MB</span>
          </>
        )}
      </div>

      {logoUrl && (
        <>
          <label className={styles.fieldRow}>
            <span>Alt text</span>
            <input
              type="text"
              value={logoAlt}
              onChange={(e) => onAltChange(e.target.value)}
              placeholder="Describe the logo for accessibility"
            />
          </label>
          <div className={styles.sliderRow}>
            <div className={styles.sliderMeta}>
              <span>Logo width</span>
              <strong>{logoWidth}px</strong>
            </div>
            <input
              type="range"
              min={40}
              max={300}
              value={logoWidth}
              onChange={(e) => onWidthChange(Number(e.target.value))}
              aria-label="Logo width"
            />
          </div>
          <button type="button" className={styles.removeLogoBtn} onClick={handleRemove}>
            <IconifyIcon icon="tabler:trash" />
            Remove logo
          </button>
        </>
      )}

      {showPicker && (
        <MediaPickerModal
          show={showPicker}
          onClose={() => setShowPicker(false)}
          onSelect={onUpload}
        />
      )}
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

const HeaderFooterSettingsPanel = () => {
  const [headerLogo, setHeaderLogo] = useState<HeaderLogoState>(defaultHeaderLogo)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const init = async () => {
      const dbHeader = await readSetting('PANZER_HEADER_SETTINGS', defaultHeaderLogo)
      setHeaderLogo({ ...defaultHeaderLogo, ...dbHeader })
    }
    init()
  }, [])

  const handleSave = async () => {
    try {
      setSaving(true)
      await writeSetting('PANZER_HEADER_SETTINGS', headerLogo)
      toast.success('Header settings saved successfully')
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save header settings')
    } finally {
      setSaving(false)
    }
  }
  
  const handleReset = () => {
    setHeaderLogo(defaultHeaderLogo)
    toast.info('Settings reset to defaults')
  }

  return (
    <div className={styles.shell}>
      {/* ── Page Header ── */}
      <div className={styles.pageHeader}>
        <div>
          <h2>Header Settings</h2>
          <p>Manage your website&apos;s header appearance</p>
        </div>
        <div className={styles.actions}>
          <button type="button" onClick={handleReset} disabled={saving}>
            <IconifyIcon icon="tabler:refresh" />
            Reset
          </button>
          <button type="button" className={styles.primaryAction} onClick={handleSave} disabled={saving}>
            <IconifyIcon icon={saving ? 'tabler:loader-2' : 'tabler:device-floppy'} />
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className={styles.layout}>
        <div className={styles.settings}>
          <section className={styles.panel}>
            <SectionTitle
              icon="tabler:photo-up"
              title="Header Logo"
              subtitle="Upload your brand logo to display in the header"
            />
            <LogoUploadSection
              logoUrl={headerLogo.logoUrl}
              logoAlt={headerLogo.logoAlt}
              logoWidth={headerLogo.logoWidth}
              onUpload={(url) => setHeaderLogo((prev) => ({ ...prev, logoUrl: url }))}
              onAltChange={(alt) => setHeaderLogo((prev) => ({ ...prev, logoAlt: alt }))}
              onWidthChange={(w) => setHeaderLogo((prev) => ({ ...prev, logoWidth: w }))}
              onRemove={() => setHeaderLogo((prev) => ({ ...prev, logoUrl: '' }))}
            />
          </section>
        </div>
      </div>
    </div>
  )
}

export default HeaderFooterSettingsPanel

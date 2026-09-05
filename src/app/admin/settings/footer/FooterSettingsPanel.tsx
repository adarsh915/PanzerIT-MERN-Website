'use client'

import PageTitle from '@/components/PageTitle'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import {
  useEffect,
  useRef,
  useState,
  useTransition,
  type ChangeEvent,
  type FormEvent,
} from 'react'
import { toast } from 'react-toastify'
import { confirmDeleteWithName } from '@/utils/confirmDelete'
import styles from './FooterSettingsPanel.module.scss'

// Server actions — Settings
import {
  readFooterSettings,
  updateFooterSettings,
  uploadFooterLogo,
  type FooterSettings,
} from './footerSettingsStore'

// Server actions — Social
import {
  readSocialLinks,
  createSocialLink,
  updateSocialLink,
  deleteSocialLink,
  type SocialLink,
} from './footerSocialStore'

// Server actions — Columns / Link Picker
import {
  readFooterColumns,
  createFooterColumn,
  updateFooterColumn,
  deleteFooterColumn,
  createFooterLink,
  updateFooterLink,
  deleteFooterLink,
  type FooterColumn,
  type FooterLink,
  type LinkType,
} from './footerStore'

import { LinkPicker } from './LinkPicker'
import MediaPickerModal from '@/components/admin/MediaPickerModal'
import { Footer } from '@/components/frontend/Footer'

// ── Constants ─────────────────────────────────────────────────────────────────

const PLATFORM_OPTIONS = [
  { value: 'linkedin',  label: 'LinkedIn',  icon: 'linkedin-in' },
  { value: 'x',        label: 'X (Twitter)', icon: 'x-twitter' },
  { value: 'facebook', label: 'Facebook',  icon: 'facebook-f' },
  { value: 'instagram',label: 'Instagram', icon: 'instagram' },
  { value: 'youtube',  label: 'YouTube',   icon: 'youtube' },
  { value: 'google',   label: 'Google',    icon: 'google' },
  { value: 'custom',   label: 'Custom',    icon: 'link' },
]

const iconForPlatform = (platform: string) =>
  PLATFORM_OPTIONS.find((p) => p.value === platform)?.icon ?? ''

// ── Social Link Row ───────────────────────────────────────────────────────────

function SocialRow({
  link,
  onSave,
  onDelete,
}: {
  link: SocialLink
  onSave: (id: string, data: { platform: string; url: string; icon: string }) => Promise<void>
  onDelete: (id: string) => Promise<void>
}) {
  const [platform, setPlatform] = useState(link.platform)
  const [url, setUrl] = useState(link.url)
  const [saving, setSaving] = useState(false)

  const isDirty = platform !== link.platform || url !== link.url

  const handleSave = async () => {
    if (!url.trim()) { toast.error('URL is required'); return }
    setSaving(true)
    await onSave(link.id, { platform, url, icon: iconForPlatform(platform) })
    setSaving(false)
  }

  return (
    <div className={styles.socialRow2}>
      <select
        className={styles.platformSelect}
        value={platform}
        onChange={(e) => setPlatform(e.target.value)}
      >
        {PLATFORM_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <input
        className={styles.linkInput}
        placeholder="https://…"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      {isDirty && (
        <button type="button" className={styles.saveLinkBtn} onClick={handleSave} disabled={saving} title="Save">
          <IconifyIcon icon={saving ? 'tabler:loader-2' : 'tabler:check'} />
        </button>
      )}
      <button type="button" className={styles.deleteLinkBtn} onClick={() => onDelete(link.id)} title="Delete">
        <IconifyIcon icon="tabler:trash" />
      </button>
    </div>
  )
}

// ── Link Row (inside column) ──────────────────────────────────────────────────

function LinkRow({
  link,
  onSave,
  onDelete,
}: {
  link: FooterLink
  onSave: (id: string, label: string, url: string, link_type: LinkType, ref_id?: string, custom_url?: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
}) {
  const [label, setLabel] = useState(link.label)
  const [pickerValue, setPickerValue] = useState({
    label: link.label,
    link_type: link.link_type,
    ref_id: link.ref_id ?? '',
    custom_url: link.custom_url ?? link.url,
    display: link.url,
  })
  const [saving, setSaving] = useState(false)

  const isDirty =
    label !== link.label ||
    pickerValue.link_type !== link.link_type ||
    pickerValue.ref_id !== (link.ref_id ?? '') ||
    pickerValue.custom_url !== (link.custom_url ?? link.url)

  const handleSave = async () => {
    if (!label.trim()) { toast.error('Label is required'); return }
    setSaving(true)
    await onSave(
      link.id, label, pickerValue.display || pickerValue.custom_url || '',
      pickerValue.link_type, pickerValue.ref_id, pickerValue.custom_url
    )
    setSaving(false)
  }

  return (
    <div className={styles.linkRowFull}>
      {link.brokenLink && (
        <span className={styles.brokenBadge} title="Linked content not found">⚠ Content not found</span>
      )}
      <span className={styles.linkDrag} title="Drag to reorder">
        <IconifyIcon icon="tabler:grip-vertical" />
      </span>
      <input
        className={styles.linkInput}
        placeholder="Label"
        value={label}
        onChange={(e) => { setLabel(e.target.value); setPickerValue((v) => ({ ...v, label: e.target.value })) }}
        autoComplete="off"
      />
      <LinkPicker
        value={pickerValue}
        onChange={(v) => {
          setPickerValue((prev) => ({ ...prev, ...v }))
          if (v.label && v.label !== label) {
            setLabel(v.label)
          }
        }}
      />
      {isDirty && (
        <button type="button" className={styles.saveLinkBtn} onClick={handleSave} disabled={saving} title="Save link">
          <IconifyIcon icon={saving ? 'tabler:loader-2' : 'tabler:check'} />
        </button>
      )}
      <button type="button" className={styles.deleteLinkBtn} onClick={() => onDelete(link.id)} title="Delete link">
        <IconifyIcon icon="tabler:trash" />
      </button>
    </div>
  )
}

// ── Add Link Row (inside column) ──────────────────────────────────────────────

function AddLinkRow({ columnId, onAdded }: { columnId: string; onAdded: (link: FooterLink) => void }) {
  const [label, setLabel] = useState('')
  const [pickerValue, setPickerValue] = useState({
    label: '',
    link_type: 'custom' as LinkType,
    ref_id: '',
    custom_url: '',
    display: '',
  })
  const [adding, setAdding] = useState(false)

  const handleAdd = async () => {
    if (!label.trim()) { toast.error('Label is required'); return }
    if (pickerValue.link_type === 'custom' && !pickerValue.custom_url?.trim()) {
      toast.error('URL is required'); return
    }
    if (pickerValue.link_type !== 'custom' && !pickerValue.ref_id?.trim()) {
      toast.error('Please select a content item'); return
    }
    setAdding(true)
    const newLink = await createFooterLink(
      columnId, label,
      pickerValue.display || pickerValue.custom_url || '',
      pickerValue.link_type,
      pickerValue.ref_id,
      pickerValue.custom_url
    )
    onAdded(newLink)
    setLabel('')
    setPickerValue({ label: '', link_type: 'custom', ref_id: '', custom_url: '', display: '' })
    setAdding(false)
    toast.success('Link added')
  }

  return (
    <div className={styles.addLinkRow}>
      <input
        className={styles.linkInput}
        placeholder="Label"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        autoComplete="off"
      />
      <LinkPicker
        value={pickerValue}
        onChange={(v) => {
          setPickerValue((prev) => ({ ...prev, ...v }))
          if (v.label && v.label !== label) {
            setLabel(v.label)
          }
        }}
      />
      <button type="button" className={styles.addLinkBtn} onClick={handleAdd} disabled={adding}>
        <IconifyIcon icon={adding ? 'tabler:loader-2' : 'tabler:plus'} />
        Add Link
      </button>
    </div>
  )
}

// ── Column Card ───────────────────────────────────────────────────────────────

function ColumnCard({
  column,
  onTitleSave,
  onDelete,
  onLinkSave,
  onLinkDelete,
  onLinkAdded,
}: {
  column: FooterColumn
  onTitleSave: (id: string, title: string, order: number) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onLinkSave: (id: string, label: string, url: string, link_type: LinkType, ref_id?: string, custom_url?: string) => Promise<void>
  onLinkDelete: (id: string) => Promise<void>
  onLinkAdded: (columnId: string, link: FooterLink) => void
}) {
  const [title, setTitle] = useState(column.title)
  const [open, setOpen] = useState(true)
  const titleDirty = title !== column.title

  return (
    <div className={styles.columnCard}>
      <div className={styles.columnHeader}>
        <span className={styles.colDrag}><IconifyIcon icon="tabler:grip-vertical" /></span>
        <input className={styles.colTitleInput} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Column heading" />
        {titleDirty && (
          <button type="button" className={styles.saveColBtn} onClick={() => onTitleSave(column.id, title, column.order)}>
            <IconifyIcon icon="tabler:check" /> Save
          </button>
        )}
        <button type="button" className={styles.colToggle} onClick={() => setOpen((v) => !v)}>
          <IconifyIcon icon={open ? 'tabler:chevron-up' : 'tabler:chevron-down'} />
        </button>
        <button type="button" className={styles.deleteColBtn} onClick={() => onDelete(column.id)}>
          <IconifyIcon icon="tabler:trash" />
        </button>
      </div>

      {open && (
        <div className={styles.columnBody}>
          {column.links.length === 0 && <p className={styles.emptyLinks}>No links yet — add one below.</p>}
          {column.links.map((link) => (
            <LinkRow key={link.id} link={link} onSave={onLinkSave} onDelete={onLinkDelete} />
          ))}
          <AddLinkRow columnId={column.id} onAdded={(link) => onLinkAdded(column.id, link)} />
        </div>
      )}
    </div>
  )
}

// ── Main Panel ────────────────────────────────────────────────────────────────

const FooterSettingsPanel = () => {
  // General settings state
  const [settings, setSettings] = useState<FooterSettings>({
    logo_url: '', brand_name: 'Panzer IT', tagline: 'MAKE IT SECURE',
    description: '', copyright_text: '', email: '', phone: '', location: '',
  })
  const [logoPreview, setLogoPreview] = useState('')
  const [showImagePicker, setShowImagePicker] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Social links state
  const [socials, setSocials] = useState<SocialLink[]>([])
  const [newPlatform, setNewPlatform] = useState('linkedin')
  const [newUrl, setNewUrl] = useState('')
  const [addingSocial, setAddingSocial] = useState(false)

  // Columns state
  const [columns, setColumns] = useState<FooterColumn[]>([])
  const [newColTitle, setNewColTitle] = useState('')
  const [addingCol, setAddingCol] = useState(false)

  useEffect(() => {
    const init = async () => {
      const [s, sl, cols] = await Promise.all([
        readFooterSettings(),
        readSocialLinks(),
        readFooterColumns(),
      ])
      setSettings(s)
      setLogoPreview(s.logo_url)
      setSocials(sl)
      setColumns(cols)
    }
    init()
  }, [])

  const set = <K extends keyof FooterSettings>(key: K, value: FooterSettings[K]) =>
    setSettings((prev) => ({ ...prev, [key]: value }))

  // ── General settings submit ─────────────────────────────────────────────────

  const handleSettingsSubmit = (e: FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      const res = await updateFooterSettings(settings)
      if (res.success) toast.success('Footer settings saved')
      else toast.error(res.error ?? 'Save failed')
    })
  }

  // ── Logo upload ─────────────────────────────────────────────────────────────

  const handleImageSelect = (url: string) => {
    setLogoPreview(url)
    set('logo_url', url)
  }

  // ── Social handlers ─────────────────────────────────────────────────────────

  const handleAddSocial = async () => {
    if (!newUrl.trim()) { toast.error('URL is required'); return }
    setAddingSocial(true)
    const res = await createSocialLink({ platform: newPlatform, url: newUrl, icon: iconForPlatform(newPlatform) })
    if (res.success && res.link) { setSocials((prev) => [...prev, res.link!]); setNewUrl(''); toast.success('Social link added') }
    else toast.error(res.error ?? 'Failed')
    setAddingSocial(false)
  }

  const handleSocialSave = async (id: string, data: { platform: string; url: string; icon: string }) => {
    const res = await updateSocialLink(id, data)
    if (res.success) {
      setSocials((prev) => prev.map((s) => (s.id === id ? { ...s, ...data } : s)))
      toast.success('Social link updated')
    } else toast.error(res.error ?? 'Failed')
  }

  const handleSocialDelete = async (id: string) => {
    try {
      await deleteSocialLink(id)
      setSocials((prev) => prev.filter((s) => s.id !== id))
      toast.success('Deleted')
    } catch {
      toast.error('Failed to delete social link')
    }
  }

  // ── Column handlers ─────────────────────────────────────────────────────────

  const handleAddColumn = async () => {
    if (!newColTitle.trim()) { toast.error('Column title required'); return }
    setAddingCol(true)
    const col = await createFooterColumn(newColTitle)
    setColumns((prev) => [...prev, col])
    setNewColTitle('')
    setAddingCol(false)
    toast.success('Column added')
  }

  const handleTitleSave = async (id: string, title: string, order: number) => {
    await updateFooterColumn(id, title, order)
    setColumns((prev) => prev.map((c) => (c.id === id ? { ...c, title } : c)))
    toast.success('Column updated')
  }

  const handleDeleteColumn = async (id: string) => {
    if (!(await confirmDeleteWithName('this column and all its links'))) return
    try {
      await deleteFooterColumn(id)
      setColumns((prev) => prev.filter((c) => c.id !== id))
      toast.success('Column deleted')
    } catch {
      toast.error('Failed to delete column')
    }
  }

  const handleLinkSave = async (id: string, label: string, url: string, link_type: LinkType, ref_id?: string, custom_url?: string) => {
    const link = columns.flatMap((c) => c.links).find((l) => l.id === id)
    if (!link) return
    await updateFooterLink(id, label, url, link.order, link_type, ref_id, custom_url)
    setColumns((prev) =>
      prev.map((c) => ({ ...c, links: c.links.map((l) => l.id === id ? { ...l, label, url, link_type, ref_id: ref_id ?? null, custom_url: custom_url ?? null } : l) }))
    )
    toast.success('Link saved')
  }

  const handleLinkDelete = async (id: string) => {
    try {
      await deleteFooterLink(id)
      setColumns((prev) => prev.map((c) => ({ ...c, links: c.links.filter((l) => l.id !== id) })))
      toast.success('Link deleted')
    } catch {
      toast.error('Failed to delete link')
    }
  }

  const handleLinkAdded = (columnId: string, link: FooterLink) => {
    setColumns((prev) =>
      prev.map((c) => (c.id === columnId ? { ...c, links: [...c.links, link] } : c))
    )
  }

  return (
    <div className={styles.shell}>
      <PageTitle title="Footer Settings" subTitle="Settings" />

      {/* ── Card 1: General & Brand ── */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitle}><IconifyIcon icon="tabler:brand-abstract" /><h3>Brand &amp; General</h3></div>
        </div>
        <form className={styles.form} onSubmit={handleSettingsSubmit}>

          {/* Logo upload */}
          <div className={styles.sectionTitle}><IconifyIcon icon="tabler:photo" /><h4>Logo</h4></div>
          <div className={styles.upload}>
            {logoPreview ? (
              <div className={styles.logoPreview}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={logoPreview} alt="Footer logo preview" />
                <button type="button" className={styles.iconBtn} onClick={() => { setLogoPreview(''); set('logo_url', '') }} aria-label="Remove logo">
                  <IconifyIcon icon="tabler:x" />
                </button>
              </div>
            ) : (
              <button type="button" className={styles.uploadPlaceholder} onClick={() => setShowImagePicker(true)}>
                <IconifyIcon icon="tabler:photo-plus" /><strong>Upload or select footer logo</strong><small>PNG, JPG, WEBP, SVG — max 2 MB</small>
              </button>
            )}
            {logoPreview && (
              <button type="button" className={styles.secondaryBtn} onClick={() => setShowImagePicker(true)}>
                <IconifyIcon icon="tabler:upload" /> Change Logo
              </button>
            )}
          </div>

          <div className={styles.gridTwo}>
            <label className={styles.field}><span>Brand Name</span>
              <input value={settings.brand_name} onChange={(e) => set('brand_name', e.target.value)} required />
            </label>
            <label className={styles.field}><span>Tagline</span>
              <input value={settings.tagline} onChange={(e) => set('tagline', e.target.value)} />
            </label>
          </div>

          <label className={styles.field}><span>Description</span>
            <textarea className={styles.textarea} rows={3} value={settings.description} onChange={(e) => set('description', e.target.value)} />
          </label>


          {/* Contact */}
          <div className={styles.sectionTitle}><IconifyIcon icon="tabler:address-book" /><h4>Contact Details</h4></div>
          <div className={styles.gridTwo}>
            <label className={styles.field}><span>Email</span>
              <input type="email" value={settings.email} onChange={(e) => set('email', e.target.value)} required />
            </label>
            <label className={styles.field}><span>Phone</span>
              <input value={settings.phone} onChange={(e) => set('phone', e.target.value)} required />
            </label>
          </div>
          <label className={styles.field}><span>Location</span>
            <input value={settings.location} onChange={(e) => set('location', e.target.value)} />
          </label>

          <button type="submit" className={styles.saveBtn} disabled={isPending}>
            <IconifyIcon icon={isPending ? 'tabler:loader-2' : 'tabler:device-floppy'} />
            {isPending ? 'Saving…' : 'Save General Settings'}
          </button>
        </form>
      </div>

      {/* ── Card 2: Social Links ── */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitle}><IconifyIcon icon="tabler:share" /><h3>Social Links</h3></div>
          <span className={styles.totalBadge}>{socials.length} link{socials.length !== 1 ? 's' : ''}</span>
        </div>
        <div className={styles.columnsArea}>
          {socials.length === 0 && <p className={styles.emptyState}><IconifyIcon icon="tabler:link-off" /> No social links yet.</p>}
          {socials.map((s) => (
            <SocialRow key={s.id} link={s} onSave={handleSocialSave} onDelete={handleSocialDelete} />
          ))}
          {/* Add new social */}
          <div className={styles.addSocialRow}>
            <select className={styles.platformSelect} value={newPlatform} onChange={(e) => setNewPlatform(e.target.value)}>
              {PLATFORM_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <input className={styles.linkInput} placeholder="https://…" value={newUrl} onChange={(e) => setNewUrl(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSocial() } }} />
            <button type="button" className={styles.addColBtn} onClick={handleAddSocial} disabled={addingSocial}>
              <IconifyIcon icon={addingSocial ? 'tabler:loader-2' : 'tabler:plus'} /> Add
            </button>
          </div>
        </div>
      </div>

      {/* ── Card 3: Navigation Columns ── */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitle}><IconifyIcon icon="tabler:columns" /><h3>Navigation Columns</h3></div>
          <span className={styles.totalBadge}>{columns.length} column{columns.length !== 1 ? 's' : ''}</span>
        </div>
        <div className={styles.columnsArea}>
          {columns.length === 0 && <p className={styles.emptyState}><IconifyIcon icon="tabler:layout-columns" /> No columns yet.</p>}
          {columns.map((col) => (
            <ColumnCard
              key={col.id} column={col}
              onTitleSave={handleTitleSave}
              onDelete={handleDeleteColumn}
              onLinkSave={handleLinkSave}
              onLinkDelete={handleLinkDelete}
              onLinkAdded={handleLinkAdded}
            />
          ))}
          {columns.length < 3 ? (
            <div className={styles.addColRow}>
              <input className={styles.addColInput} placeholder="New column heading (e.g. QUICK LINKS)" value={newColTitle}
                onChange={(e) => setNewColTitle(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddColumn() } }} />
              <button type="button" className={styles.addColBtn} onClick={handleAddColumn} disabled={addingCol}>
                <IconifyIcon icon={addingCol ? 'tabler:loader-2' : 'tabler:plus'} /> Add Column
              </button>
            </div>
          ) : (
            <p className={styles.emptyState} style={{ justifyContent: 'center' }}>
              <IconifyIcon icon="tabler:alert-circle" /> Maximum of 3 navigation columns allowed.
            </p>
          )}
        </div>
      </div>

      {/* ── Live preview ── */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitle}><IconifyIcon icon="tabler:eye" /><h3>Live Preview</h3></div>
        </div>
        <div className={styles.preview} style={{ padding: 0, overflow: 'hidden', backgroundColor: '#021024', borderRadius: '0 0 16px 16px' }}>
            <link rel="stylesheet" href="/assets/fontawesome/css/fontawesome.min.css?v=20260524" />
            <Footer 
              columns={columns} 
              contact={{
                logo: logoPreview,
                brandName: settings.brand_name,
                tagline: settings.tagline,
                description: settings.description,
                copyrightText: settings.copyright_text,
                email: settings.email,
                phone: settings.phone,
                location: settings.location,
                socialLinks: socials.map(s => ({ ...s, label: s.platform }))
              }} 
            />
        </div>
      </div>

      {showImagePicker && (
        <MediaPickerModal
          show={showImagePicker}
          onClose={() => setShowImagePicker(false)}
          onSelect={handleImageSelect}
        />
      )}
    </div>
  )
}

export default FooterSettingsPanel

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
import styles from './SeoSettingsPanel.module.scss'

import {
  getSeoData,
  updateSeoData,
  uploadSeoImage,
  type PageSeoData,
} from './seoStore'
import MediaPickerModal from '@/components/admin/MediaPickerModal'

const PAGES = [
  { key: 'seo_home', label: 'Home Page (/)' },
  { key: 'seo_about', label: 'About Page (/about)' },
  { key: 'seo_contact', label: 'Contact Page (/contact)' },
  { key: 'seo_blog_grid', label: 'Blog List Page (/blog)' },
  { key: 'seo_brand', label: 'Brand List Page (/brand)' },
  { key: 'seo_solution', label: 'Solution List Page (/solution)' },
  { key: 'seo_privacy_policy', label: 'Privacy Policy Page (/privacy-policy)' },
  { key: 'seo_resources', label: 'Resources Page (/resources)' },
  { key: 'seo_download', label: 'Download Page (/download)' },
]

export default function SeoSettingsPanel() {
  const [selectedPage, setSelectedPage] = useState(PAGES[0].key)
  const [settings, setSettings] = useState<PageSeoData>({
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    ogImage: '',
  })
  
  const [imagePreview, setImagePreview] = useState('')
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [isPending, startTransition] = useTransition()
  const [isLoading, setIsLoading] = useState(false)
  const [showImagePicker, setShowImagePicker] = useState(false)

  useEffect(() => {
    let active = true
    const fetchSeo = async () => {
      setIsLoading(true)
      const data = await getSeoData(selectedPage)
      if (active) {
        setSettings(data)
        setImagePreview(data.ogImage)
        setIsLoading(false)
      }
    }
    fetchSeo()
    return () => { active = false }
  }, [selectedPage])

  const set = <K extends keyof PageSeoData>(key: K, value: PageSeoData[K]) =>
    setSettings((prev) => ({ ...prev, [key]: value }))

  const handleSettingsSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!settings.metaTitle.trim()) {
      toast.error('Meta title is required')
      return
    }
    startTransition(async () => {
      const res = await updateSeoData(selectedPage, settings)
      if (res.success) toast.success('SEO settings saved')
      else toast.error(res.error ?? 'Save failed')
    })
  }

  const handleImageSelect = (url: string) => {
    setImagePreview(url)
    set('ogImage', url)
  }

  return (
    <div className={styles.shell}>
      <PageTitle title="Global SEO Settings" subTitle="Settings" />

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitle}>
            <IconifyIcon icon="tabler:search" />
            <h3>Page SEO Configuration</h3>
          </div>
        </div>
        <div className={styles.pageSelector}>
          <label className={styles.pageLabel}>Select Page to Configure:</label>
          <select className={styles.platformSelect} style={{ width: '100%', maxWidth: '400px' }} value={selectedPage} onChange={(e) => setSelectedPage(e.target.value)}>
            {PAGES.map((p) => (
              <option key={p.key} value={p.key}>{p.label}</option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
             <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
          </div>
        ) : (
          <form className={styles.form} onSubmit={handleSettingsSubmit}>
            <div className={styles.sectionTitle}>
              <IconifyIcon icon="tabler:text-caption" />
              <h4>Meta Data</h4>
            </div>

            <label className={styles.field}>
              <span>
                Meta Title <em style={{ color: 'var(--bs-danger)' }}>*</em>
                <span style={{ float: 'right', fontSize: '12px', color: settings.metaTitle.length > 60 ? 'var(--bs-danger)' : settings.metaTitle.length > 50 ? 'var(--bs-warning)' : 'var(--bs-secondary)' }}>
                  {settings.metaTitle.length}/60
                </span>
              </span>
              <input 
                value={settings.metaTitle} 
                onChange={(e) => set('metaTitle', e.target.value)} 
                placeholder="e.g. Panzer IT - Advanced Security Solutions"
                maxLength={80}
              />
            </label>

            <label className={styles.field}>
              <span>Meta Keywords</span>
              <input 
                value={settings.metaKeywords} 
                onChange={(e) => set('metaKeywords', e.target.value)} 
                placeholder="e.g. cybersecurity, data protection, DLP"
              />
            </label>

            <label className={styles.field}>
              <span>
                Meta Description
                <span style={{ float: 'right', fontSize: '12px', color: settings.metaDescription.length > 160 ? 'var(--bs-danger)' : settings.metaDescription.length > 140 ? 'var(--bs-warning)' : 'var(--bs-secondary)' }}>
                  {settings.metaDescription.length}/160
                </span>
              </span>
              <textarea 
                className={styles.textarea} 
                rows={4} 
                value={settings.metaDescription} 
                onChange={(e) => set('metaDescription', e.target.value)} 
                placeholder="Brief description of the page for search engines..."
                maxLength={200}
              />
            </label>



            <button type="submit" className={styles.saveBtn} disabled={isPending}>
              <IconifyIcon icon={isPending ? 'tabler:loader-2' : 'tabler:device-floppy'} />
              {isPending ? 'Saving…' : 'Save SEO Settings'}
            </button>
          </form>
        )}
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

'use client'

import PageTitle from '@/components/PageTitle'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import clsx from 'clsx'
import React, { useEffect, useMemo, useState, ErrorInfo, type ChangeEvent, type FormEvent } from 'react'
import { toast } from 'react-toastify'
import ColorPicker from 'react-best-gradient-color-picker'

class PickerErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn("Gradient Picker cannot parse this complex value:", error);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '16px', maxWidth: '300px', background: '#fff' }}>
          <p style={{ color: '#e53e3e', fontSize: '13px', fontWeight: 600 }}>This complex gradient cannot be edited visually.</p>
          <p style={{ color: '#4a5568', fontSize: '12px', marginTop: '8px' }}>Please use the text input below to modify it.</p>
        </div>
      );
    }
    return this.props.children;
  }
}
import styles from './HomepageSettingsPanel.module.scss'
import { NewHeroSlider } from '@/components/frontend/NewHeroSlider'

type BannerSlide = {
  id: string
  eyebrow: string
  title: string
  description: string
  buttonText: string
  buttonUrl: string
  backgroundImage: string
  backgroundAlt: string
}

type MarqueeItem = {
  id: string
  text: string
}

type BrandPartnerItem = {
  id: string
  name: string
  logo: string
  logoAlt: string
}

type OrbitItem = {
  label: string
  icon: string
  image?: string
}

type NewHeroSlide = {
  id: string
  eyebrow: string
  titleLine1: string
  titleLine2: string
  desc: string
  tags: string[]
  icon: string
  orbit: OrbitItem[]
  accent: string
  centerImage?: string
}

type NewHeroColors = {
  '--nh-bg': string
  '--nh-text': string
  '--nh-text-accent': string
  '--nh-cta-bg': string
  '--nh-cta-hover': string
  '--nh-cta-text': string
  '--nh-link-color': string
  '--nh-marquee-bg': string
  '--nh-marquee-text': string
  '--nh-marquee-dot': string
  '--nh-orbit-tag-bg': string
  '--nh-orbit-tag-text': string
  '--nh-ring-color': string
  '--nh-badge-bg-default': string
  '--nh-pill-bg': string
  '--nh-pill-text': string
}

type HomepageSettings = {
  slides: BannerSlide[]
  newHeroSlides: NewHeroSlide[]
  newHeroCta: string
  newHeroCtaUrl: string
  newHeroSecondaryText: string
  newHeroSecondaryUrl: string
  newHeroColors: NewHeroColors
  marqueeItems: MarqueeItem[]
  brandPartnersTitle: string
  brandPartners: BrandPartnerItem[]
  heroVideoUrl: string
}

const STORAGE_KEY = 'PANZER_HOMEPAGE_SETTINGS'

const createSlide = (index = 0): BannerSlide => ({
  id: `slide-${Date.now()}-${index}`,
  eyebrow: 'AI Powered Protection',
  title: 'Cyber Resilience For',
  description: 'Anticipate threats, reduce cyber risk and keep your teams moving with clear security, backup and data protection support.',
  buttonText: 'Enquire Today',
  buttonUrl: '/contact',
  backgroundImage: '',
  backgroundAlt: 'Cyber security banner',
})

const createMarqueeItem = (index = 0): MarqueeItem => ({
  id: `marquee-${Date.now()}-${index}`,
  text: 'ENTERPRISE CYBERSECURITY',
})

const createBrandPartner = (index = 0): BrandPartnerItem => ({
  id: `partner-${Date.now()}-${index}`,
  name: 'Brand Partner',
  logo: '',
  logoAlt: 'Brand partner logo',
})

const createOrbitItem = (label: string, icon: string): OrbitItem => ({ label, icon, image: '' })

const createNewHeroSlide = (index = 0): NewHeroSlide => ({
  id: `new-hero-${Date.now()}-${index}`,
  eyebrow: "Identity & Access",
  titleLine1: "Control",
  titleLine2: "Who Gets In",
  desc: "IAM, PAM, DBAM & MFA solutions that enforce least-privilege across users, admins, and critical databases.",
  tags: ["IAM", "PAM", "DBAM", "Zero Trust", "MFA"],
  icon: "lock",
  orbit: [
    createOrbitItem("SSO", "lock"),
    createOrbitItem("MFA", "shieldBolt"),
    createOrbitItem("RBAC", "eye"),
    createOrbitItem("IAM", "server"),
    createOrbitItem("PAM", "seal"),
    createOrbitItem("DBAM", "docLock")
  ],
  accent: "#061153"
})

const defaultSettings: HomepageSettings = {
  slides: [
    {
      ...createSlide(1),
      id: 'home-banner-1',
    },
    {
      ...createSlide(2),
      id: 'home-banner-2',
      eyebrow: 'Managed Security',
      title: 'Secure Every Layer',
      description: 'Combine assessment, endpoint protection and data controls for stronger operational resilience.',
    },
    {
      ...createSlide(3),
      id: 'home-banner-3',
      eyebrow: 'Backup Readiness',
      title: 'Recover Without Panic',
      description: 'Keep critical workloads protected with dependable backup, recovery and continuity planning.',
    },
  ],
  newHeroSlides: [
    createNewHeroSlide(1),
  ],
  newHeroCta: 'Know More',
  newHeroCtaUrl: '#',
  newHeroSecondaryText: 'See how it works',
  newHeroSecondaryUrl: '',
  newHeroColors: {
    '--nh-bg': '#E9F3FF',
    '--nh-text': '#0B1B3A',
    '--nh-text-accent': '#14295C',
    '--nh-cta-bg': '#e76b1f',
    '--nh-cta-hover': '#061153',
    '--nh-cta-text': '#ffffff',
    '--nh-link-color': '#0B1B3A',
    '--nh-marquee-bg': '#ffffff',
    '--nh-marquee-text': '#0B1B3A',
    '--nh-marquee-dot': '#e76b1f',
    '--nh-orbit-tag-bg': '#ffffff',
    '--nh-orbit-tag-text': '#061153',
    '--nh-ring-color': '#0B1B3A',
    '--nh-badge-bg-default': '#14295C',
    '--nh-pill-bg': '#ffffff',
    '--nh-pill-text': '#0B1B3A',
  },
  marqueeItems: [
    { id: 'marquee-1', text: 'ENTERPRISE CYBERSECURITY' },
    { id: 'marquee-2', text: 'DATA PROTECTION' },
    { id: 'marquee-3', text: '24x7 SUPPORT' },
    { id: 'marquee-4', text: 'ZERO TRUST ARCHITECTURE' },
    { id: 'marquee-5', text: 'VAPT & COMPLIANCE' },
  ],
  brandPartnersTitle: 'Brand Partners',
  brandPartners: [
    { ...createBrandPartner(1), id: 'partner-scopd', name: 'Scopd', logoAlt: 'Scopd logo' },
    { ...createBrandPartner(2), id: 'partner-falcongaze', name: 'Falcongaze', logoAlt: 'Falcongaze logo' },
    { ...createBrandPartner(3), id: 'partner-somansa', name: 'Somansa', logoAlt: 'Somansa logo' },
    { ...createBrandPartner(4), id: 'partner-vembu', name: 'Vembu', logoAlt: 'Vembu logo' },
  ],
  heroVideoUrl: '/assets/images/hero/banner.mp4',
}

import { readSetting, writeSetting } from '../../settingsStore'
import MediaPickerModal from '@/components/admin/MediaPickerModal'

const readSettings = async (): Promise<HomepageSettings> => {
  const parsed = await readSetting(STORAGE_KEY, defaultSettings)
  return {
    ...defaultSettings,
    ...parsed,
    slides: Array.isArray(parsed?.slides) && parsed.slides.length > 0 ? parsed.slides : defaultSettings.slides,
    newHeroSlides: Array.isArray(parsed?.newHeroSlides) && parsed.newHeroSlides.length > 0 ? parsed.newHeroSlides : defaultSettings.newHeroSlides,
    newHeroCta: parsed?.newHeroCta || defaultSettings.newHeroCta,
    newHeroCtaUrl: parsed?.newHeroCtaUrl ?? defaultSettings.newHeroCtaUrl,
    newHeroSecondaryText: parsed?.newHeroSecondaryText ?? defaultSettings.newHeroSecondaryText,
    newHeroSecondaryUrl: parsed?.newHeroSecondaryUrl ?? defaultSettings.newHeroSecondaryUrl,
    newHeroColors: { ...defaultSettings.newHeroColors, ...parsed?.newHeroColors },
    marqueeItems: Array.isArray(parsed?.marqueeItems) && parsed.marqueeItems.length > 0
      ? parsed.marqueeItems
      : defaultSettings.marqueeItems,
    brandPartnersTitle: parsed?.brandPartnersTitle || defaultSettings.brandPartnersTitle,
    brandPartners: Array.isArray(parsed?.brandPartners) && parsed.brandPartners.length > 0
      ? parsed.brandPartners
      : defaultSettings.brandPartners,
    heroVideoUrl: parsed?.heroVideoUrl || defaultSettings.heroVideoUrl,
  }
}

const HomepageSettingsPanel = () => {
  const [settings, setSettings] = useState<HomepageSettings>(defaultSettings)
  const [activeIndex, setActiveIndex] = useState(0)
  const [showSlideImagePickerIndex, setShowSlideImagePickerIndex] = useState<number | null>(null)
  const [showPartnerLogoPickerIndex, setShowPartnerLogoPickerIndex] = useState<number | null>(null)
  // [slideIndex, orbitIndex] — which orbit icon image picker is open
  const [showOrbitImagePicker, setShowOrbitImagePicker] = useState<[number, number] | null>(null)
  // slideIndex — which slide's center image picker is open
  const [showCenterImagePicker, setShowCenterImagePicker] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [activePicker, setActivePicker] = useState<string | null>(null)

  useEffect(() => {
    const init = async () => setSettings(await readSettings())
    init()
  }, [])

  const activeSlide = useMemo(
    () => settings.slides[Math.min(activeIndex, settings.slides.length - 1)] ?? settings.slides[0],
    [activeIndex, settings.slides],
  )

  const [activeNewHeroIndex, setActiveNewHeroIndex] = useState(0)

  const activeNewHeroSlide = useMemo(
    () => settings.newHeroSlides[Math.min(activeNewHeroIndex, settings.newHeroSlides.length - 1)] ?? settings.newHeroSlides[0],
    [activeNewHeroIndex, settings.newHeroSlides],
  )

  const updateNewHeroSlide = <K extends keyof NewHeroSlide>(index: number, key: K, value: NewHeroSlide[K]) => {
    setSettings((previous) => ({
      ...previous,
      newHeroSlides: previous.newHeroSlides.map((slide, slideIndex) => (slideIndex === index ? { ...slide, [key]: value } : slide)),
    }))
  }

  const addNewHeroSlide = () => {
    setSettings((previous) => ({ ...previous, newHeroSlides: [...previous.newHeroSlides, createNewHeroSlide(previous.newHeroSlides.length)] }))
    setActiveNewHeroIndex(settings.newHeroSlides.length)
  }

  const removeNewHeroSlide = (index: number) => {
    if (settings.newHeroSlides.length <= 1) {
      toast.error('New hero banner needs at least one slide')
      return
    }
    setSettings((previous) => ({ ...previous, newHeroSlides: previous.newHeroSlides.filter((_, slideIndex) => slideIndex !== index) }))
    setActiveNewHeroIndex((value) => Math.max(0, Math.min(value, settings.newHeroSlides.length - 2)))
  }

  const updateTag = (slideIndex: number, tagIndex: number, value: string) => {
    setSettings((previous) => ({
      ...previous,
      newHeroSlides: previous.newHeroSlides.map((slide, i) => i === slideIndex ? {
        ...slide,
        tags: slide.tags.map((tag, j) => j === tagIndex ? value : tag)
      } : slide)
    }))
  }

  const addTag = (slideIndex: number) => {
    setSettings((previous) => ({
      ...previous,
      newHeroSlides: previous.newHeroSlides.map((slide, i) => i === slideIndex ? {
        ...slide,
        tags: [...slide.tags, 'New Tag']
      } : slide)
    }))
  }

  const removeTag = (slideIndex: number, tagIndex: number) => {
    setSettings((previous) => ({
      ...previous,
      newHeroSlides: previous.newHeroSlides.map((slide, i) => i === slideIndex ? {
        ...slide,
        tags: slide.tags.filter((_, j) => j !== tagIndex)
      } : slide)
    }))
  }

  const updateOrbitItem = <K extends keyof OrbitItem>(slideIndex: number, orbitIndex: number, key: K, value: OrbitItem[K]) => {
    setSettings((previous) => ({
      ...previous,
      newHeroSlides: previous.newHeroSlides.map((slide, i) => i === slideIndex ? {
        ...slide,
        orbit: slide.orbit.map((orb, j) => j === orbitIndex ? { ...orb, [key]: value } : orb)
      } : slide)
    }))
  }

  const addOrbitItem = (slideIndex: number) => {
    setSettings((previous) => {
      const slide = previous.newHeroSlides[slideIndex]
      if (slide.orbit.length >= 6) {
        toast.error('Maximum 6 orbit items allowed')
        return previous
      }
      return {
        ...previous,
        newHeroSlides: previous.newHeroSlides.map((s, i) => i === slideIndex ? {
          ...s,
          orbit: [...s.orbit, { label: 'New Orbit', icon: 'lock' }]
        } : s)
      }
    })
  }

  const removeOrbitItem = (slideIndex: number, orbitIndex: number) => {
    setSettings((previous) => ({
      ...previous,
      newHeroSlides: previous.newHeroSlides.map((slide, i) => i === slideIndex ? {
        ...slide,
        orbit: slide.orbit.filter((_, j) => j !== orbitIndex)
      } : slide)
    }))
  }

  const updateSlide = <K extends keyof BannerSlide>(index: number, key: K, value: BannerSlide[K]) => {
    setSettings((previous) => ({
      ...previous,
      slides: previous.slides.map((slide, slideIndex) => (slideIndex === index ? { ...slide, [key]: value } : slide)),
    }))
  }

  const updateMarqueeItem = <K extends keyof MarqueeItem>(index: number, key: K, value: MarqueeItem[K]) => {
    setSettings((previous) => ({
      ...previous,
      marqueeItems: previous.marqueeItems.map((item, itemIndex) => (
        itemIndex === index ? { ...item, [key]: value } : item
      )),
    }))
  }

  const addMarqueeItem = () => {
    setSettings((previous) => ({
      ...previous,
      marqueeItems: [...previous.marqueeItems, createMarqueeItem(previous.marqueeItems.length)],
    }))
  }

  const removeMarqueeItem = (index: number) => {
    setSettings((previous) => ({
      ...previous,
      marqueeItems: previous.marqueeItems.filter((_, itemIndex) => itemIndex !== index),
    }))
  }

  const updateBrandPartner = <K extends keyof BrandPartnerItem>(index: number, key: K, value: BrandPartnerItem[K]) => {
    setSettings((previous) => ({
      ...previous,
      brandPartners: previous.brandPartners.map((partner, partnerIndex) => (
        partnerIndex === index ? { ...partner, [key]: value } : partner
      )),
    }))
  }

  const handleImageChange = async (index: number, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file')
      event.target.value = ''
      return
    }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', 'homepage')

    try {
      const toastId = toast.loading('Uploading banner image...')
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      const data = await res.json()
      if (res.ok && data.url) {
        updateSlide(index, 'backgroundImage', data.url)
        toast.update(toastId, { render: 'Banner image uploaded successfully', type: 'success', isLoading: false, autoClose: 2000 })
      } else {
        toast.update(toastId, { render: data.error || 'Banner image upload failed', type: 'error', isLoading: false, autoClose: 3000 })
      }
    } catch (e) {
      toast.error('Banner image upload failed')
    }
    event.target.value = ''
  }

  const handlePartnerLogoChange = async (index: number, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file')
      event.target.value = ''
      return
    }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', 'homepage')

    try {
      const toastId = toast.loading('Uploading partner logo...')
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      const data = await res.json()
      if (res.ok && data.url) {
        updateBrandPartner(index, 'logo', data.url)
        toast.update(toastId, { render: 'Partner logo uploaded successfully', type: 'success', isLoading: false, autoClose: 2000 })
      } else {
        toast.update(toastId, { render: data.error || 'Partner logo upload failed', type: 'error', isLoading: false, autoClose: 3000 })
      }
    } catch (e) {
      toast.error('Partner logo upload failed')
    }
    event.target.value = ''
  }

  const handleHeroVideoChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('video/')) {
      toast.error('Please upload a valid video file')
      event.target.value = ''
      return
    }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', 'homepage')

    try {
      const toastId = toast.loading('Uploading background video...')
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      const data = await res.json()
      if (res.ok && data.url) {
        setSettings((prev) => ({ ...prev, heroVideoUrl: data.url }))
        toast.update(toastId, { render: 'Video uploaded successfully', type: 'success', isLoading: false, autoClose: 2000 })
      } else {
        toast.update(toastId, { render: data.error || 'Video upload failed', type: 'error', isLoading: false, autoClose: 3000 })
      }
    } catch (e) {
      toast.error('Video upload failed')
    }
    event.target.value = ''
  }

  const addSlide = () => {
    setSettings((previous) => ({ ...previous, slides: [...previous.slides, createSlide(previous.slides.length)] }))
    setActiveIndex(settings.slides.length)
  }

  const removeSlide = (index: number) => {
    if (settings.slides.length <= 1) {
      toast.error('Homepage banner needs at least one slide')
      return
    }

    setSettings((previous) => ({ ...previous, slides: previous.slides.filter((_, slideIndex) => slideIndex !== index) }))
    setActiveIndex((value) => Math.max(0, Math.min(value, settings.slides.length - 2)))
  }

  const addBrandPartner = () => {
    setSettings((previous) => ({
      ...previous,
      brandPartners: [...previous.brandPartners, createBrandPartner(previous.brandPartners.length)],
    }))
  }

  const removeBrandPartner = (index: number) => {
    setSettings((previous) => ({
      ...previous,
      brandPartners: previous.brandPartners.filter((_, partnerIndex) => partnerIndex !== index),
    }))
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()

    const emptyNewSlideIndex = settings.newHeroSlides.findIndex((s) => !s.titleLine1.trim())
    if (emptyNewSlideIndex !== -1) {
      toast.error(`New Hero Slide ${emptyNewSlideIndex + 1} is missing Title Line 1`)
      setActiveNewHeroIndex(emptyNewSlideIndex)
      return
    }

    try {
      setSaving(true)
      await writeSetting(STORAGE_KEY, settings)
      toast.success('Homepage settings saved')
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save homepage settings')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={styles.shell}>
      <PageTitle title="Homepage Settings" subTitle="Pages" />

      <div className={styles.card}>
        <form className={styles.form} onSubmit={submit}>
          {/* --- HOMEPAGE HERO SETTINGS --- */}
          <div className={styles.sectionTitle}>
            <IconifyIcon icon="tabler:layers" />
            <h4>Homepage Hero</h4>
          </div>

          <div className={styles.tabs} role="tablist" aria-label="Homepage Hero slides">
            {settings.newHeroSlides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                role="tab"
                aria-selected={index === activeNewHeroIndex}
                className={clsx(styles.tab, index === activeNewHeroIndex && styles.tabActive)}
                onClick={() => setActiveNewHeroIndex(index)}
              >
                Slide {index + 1}
              </button>
            ))}
            <button type="button" className={styles.tabAdd} onClick={addNewHeroSlide}>
              <IconifyIcon icon="tabler:plus" />
              Add Slide
            </button>
          </div>

          {activeNewHeroSlide && (
            <div className={styles.slideCard}>
              <div className={styles.slideHeader}>
                <div className={styles.sectionTitle}>
                  <IconifyIcon icon="tabler:photo" />
                  <h4>Homepage Hero Slide {activeNewHeroIndex + 1}</h4>
                </div>
                <button type="button" className={styles.iconBtn} onClick={() => removeNewHeroSlide(activeNewHeroIndex)} aria-label="Delete slide">
                  <IconifyIcon icon="tabler:trash" />
                </button>
              </div>

              <label className={styles.field}>
                <span>Eyebrow</span>
                <input value={activeNewHeroSlide.eyebrow} onChange={(event) => updateNewHeroSlide(activeNewHeroIndex, 'eyebrow', event.target.value)} />
              </label>
              <label className={styles.field} style={{ display: 'none' }}>
                <span>Main Icon Name (e.g. lock, server, eye)</span>
                <select value={activeNewHeroSlide.icon} onChange={(event) => updateNewHeroSlide(activeNewHeroIndex, 'icon', event.target.value)} className={styles.select}>
                  <option value="lock">Lock</option>
                  <option value="server">Server</option>
                  <option value="eye">Eye</option>
                  <option value="shieldBolt">Shield Bolt</option>
                  <option value="docLock">Doc Lock</option>
                  <option value="seal">Seal</option>
                  <option value="fortress">Fortress</option>
                </select>
              </label>

              <div className={styles.gridTwo}>
                <label className={styles.field}>
                  <span>Title Line 1</span>
                  <input value={activeNewHeroSlide.titleLine1} onChange={(event) => updateNewHeroSlide(activeNewHeroIndex, 'titleLine1', event.target.value)} />
                </label>
                <label className={styles.field}>
                  <span>Title Line 2</span>
                  <input value={activeNewHeroSlide.titleLine2} onChange={(event) => updateNewHeroSlide(activeNewHeroIndex, 'titleLine2', event.target.value)} />
                </label>
              </div>

              <label className={styles.field}>
                <span>Description</span>
                <textarea rows={3} value={activeNewHeroSlide.desc} onChange={(event) => updateNewHeroSlide(activeNewHeroIndex, 'desc', event.target.value)} />
              </label>

              <label className={styles.field}>
                <span>Orbit Badge Color</span>
                <input type="color" value={activeNewHeroSlide.accent} onChange={(event) => updateNewHeroSlide(activeNewHeroIndex, 'accent', event.target.value)} />
              </label>

              {/* Tags Section */}
              <div className={styles.sectionTitle} style={{ marginTop: '20px' }}>
                <IconifyIcon icon="tabler:tags" />
                <h4>Left Side Pills (Tags)</h4>
              </div>
              <div className={styles.partnerRows} style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
                {activeNewHeroSlide.tags.map((tag, tagIndex) => (
                  <div key={tagIndex} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#f0f2f5', padding: '5px 10px', borderRadius: '20px' }}>
                    <input
                      style={{ border: 'none', background: 'transparent', width: '100px', fontSize: '13px' }}
                      value={tag}
                      onChange={(e) => updateTag(activeNewHeroIndex, tagIndex, e.target.value)}
                    />
                    <button type="button" style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'red' }} onClick={() => removeTag(activeNewHeroIndex, tagIndex)}>
                      <IconifyIcon icon="tabler:x" />
                    </button>
                  </div>
                ))}
              </div>
              <button type="button" className={styles.secondaryBtn} onClick={() => addTag(activeNewHeroIndex)}>
                <IconifyIcon icon="tabler:plus" /> Add Tag
              </button>

              {/* Center Image Section */}
              <div className={styles.sectionTitle} style={{ marginTop: '20px' }}>
                <IconifyIcon icon="tabler:circle" />
                <h4>Center Circle Image</h4>
              </div>
              <div className={styles.upload}>
                {activeNewHeroSlide.centerImage ? (
                  <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '120px', height: '120px', background: '#f8f9fa', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', marginBottom: '12px' }}>
                    <img src={activeNewHeroSlide.centerImage} alt="Center orbit image" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                    <button
                      type="button"
                      onClick={() => updateNewHeroSlide(activeNewHeroIndex, 'centerImage', '')}
                      aria-label="Remove center image"
                      style={{ position: 'absolute', top: '-8px', right: '-8px', width: '24px', height: '24px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                    >
                      <IconifyIcon icon="tabler:x" style={{ fontSize: '14px' }} />
                    </button>
                  </div>
                ) : (
                  <button type="button" className={styles.uploadPlaceholder} onClick={() => setShowCenterImagePicker(activeNewHeroIndex)}>
                    <IconifyIcon icon="tabler:photo-plus" />
                    <strong>Upload center circle image</strong>
                    <small>PNG, JPG, WEBP (shown in the middle of the orbit)</small>
                  </button>
                )}
                {activeNewHeroSlide.centerImage && (
                  <button type="button" className={styles.secondaryBtn} onClick={() => setShowCenterImagePicker(activeNewHeroIndex)}>
                    <IconifyIcon icon="tabler:upload" />
                    Change Center Image
                  </button>
                )}
              </div>

              {/* Orbit Icons Section */}
              <div className={styles.sectionTitle} style={{ marginTop: '20px' }}>
                <IconifyIcon icon="tabler:planet" />
                <h4>Right Side Orbit Icons ({activeNewHeroSlide.orbit.length}/6)</h4>
              </div>
              <div className={styles.partnerRows}>
                {activeNewHeroSlide.orbit.map((orb, orbIndex) => (
                  <div key={orbIndex} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 120px 40px', gap: '16px', alignItems: 'end', background: '#f8f9fa', padding: '16px', borderRadius: '8px', marginBottom: '12px', border: '1px solid #edf2f7' }}>
                    <label className={styles.field} style={{ marginBottom: 0 }}>
                      <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748b' }}>Label</span>
                      <input value={orb.label} onChange={(e) => updateOrbitItem(activeNewHeroIndex, orbIndex, 'label', e.target.value)} style={{ padding: '8px 12px', height: '40px' }} />
                    </label>
                    <label className={styles.field} style={{ marginBottom: 0 }}>
                      <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748b' }}>Icon (Fallback)</span>
                      <select value={orb.icon} onChange={(e) => updateOrbitItem(activeNewHeroIndex, orbIndex, 'icon', e.target.value)} className={styles.select} style={{ height: '40px' }}>
                        <option value="lock">Lock</option>
                        <option value="server">Server</option>
                        <option value="eye">Eye</option>
                        <option value="shieldBolt">Shield Bolt</option>
                        <option value="docLock">Doc Lock</option>
                        <option value="seal">Seal</option>
                        <option value="fortress">Fortress</option>
                      </select>
                    </label>
                    <div style={{ height: '40px', display: 'flex', alignItems: 'center' }}>
                      {orb.image ? (
                        <div style={{ position: 'relative', width: '40px', height: '40px', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <img src={orb.image} alt={orb.label} style={{ maxWidth: '24px', maxHeight: '24px', objectFit: 'contain' }} />
                          <button
                            type="button"
                            onClick={() => updateOrbitItem(activeNewHeroIndex, orbIndex, 'image', '')}
                            style={{ position: 'absolute', top: '-6px', right: '-6px', width: '16px', height: '16px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}
                          >
                            <IconifyIcon icon="tabler:x" style={{ fontSize: '10px' }} />
                          </button>
                        </div>
                      ) : (
                        <button type="button" onClick={() => setShowOrbitImagePicker([activeNewHeroIndex, orbIndex])} style={{ height: '40px', padding: '0 12px', border: '1px dashed #cbd5e1', background: '#fff', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer', fontSize: '12px', color: '#64748b', width: '100%' }}>
                          <IconifyIcon icon="tabler:upload" />
                          <span>Image</span>
                        </button>
                      )}
                    </div>
                    <button type="button" className={styles.iconBtn} onClick={() => removeOrbitItem(activeNewHeroIndex, orbIndex)} aria-label="Delete orbit" style={{ height: '40px', width: '40px', background: '#fee2e2', color: '#ef4444', margin: 0, padding: 0 }}>
                      <IconifyIcon icon="tabler:trash" />
                    </button>
                  </div>
                ))}
              </div>
              {activeNewHeroSlide.orbit.length < 6 && (
                <button type="button" className={styles.secondaryBtn} onClick={() => addOrbitItem(activeNewHeroIndex)}>
                  <IconifyIcon icon="tabler:plus" /> Add Orbit Item
                </button>
              )}
            </div>
          )}

          {/* Global CTA for Homepage Hero */}
          <div className={styles.sectionTitle} style={{ marginTop: '40px' }}>
            <IconifyIcon icon="tabler:cursor-text" />
            <h4>Homepage Hero — Global CTA Buttons</h4>
          </div>
          <div className={styles.gridTwo}>
            <label className={styles.field}>
              <span>Primary CTA Text</span>
              <input value={settings.newHeroCta} onChange={(e) => setSettings((p) => ({ ...p, newHeroCta: e.target.value }))} />
            </label>
            <label className={styles.field}>
              <span>Primary CTA URL</span>
              <input value={settings.newHeroCtaUrl} onChange={(e) => setSettings((p) => ({ ...p, newHeroCtaUrl: e.target.value }))} />
            </label>
          </div>
          <div className={styles.gridTwo}>
            <label className={styles.field}>
              <span>Secondary Link Text (e.g. "See how it works")</span>
              <input value={settings.newHeroSecondaryText} onChange={(e) => setSettings((p) => ({ ...p, newHeroSecondaryText: e.target.value }))} />
            </label>
            <label className={styles.field}>
              <span>Secondary Link URL (leave blank to hide)</span>
              <input value={settings.newHeroSecondaryUrl} onChange={(e) => setSettings((p) => ({ ...p, newHeroSecondaryUrl: e.target.value }))} />
            </label>
          </div>

          {/* Hero Theme Colors */}
          <div className={styles.sectionTitle} style={{ marginTop: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IconifyIcon icon="tabler:palette" />
              <h4 style={{ margin: 0 }}>Homepage Hero — Theme Colors</h4>
            </div>
            <button
              type="button"
              className={styles.secondaryBtn}
              style={{ padding: '6px 12px', fontSize: '13px', margin: 0, height: 'auto' }}
              onClick={() => setSettings(p => ({ ...p, newHeroColors: defaultSettings.newHeroColors }))}
            >
              <IconifyIcon icon="tabler:refresh" /> Reset to Defaults
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
            {([
              { key: '--nh-bg', label: 'Background' },
              { key: '--nh-text', label: 'Primary Text / Arrows' },
              { key: '--nh-text-accent', label: 'Title Accent (Line 2)' },
              { key: '--nh-cta-bg', label: 'CTA Button Background' },
              { key: '--nh-cta-hover', label: 'CTA Button Hover' },
              { key: '--nh-cta-text', label: 'CTA Button Text' },
              { key: '--nh-link-color', label: 'Secondary Link Color' },
              { key: '--nh-marquee-bg', label: 'Marquee Bar Background' },
              { key: '--nh-marquee-text', label: 'Marquee Text' },
              { key: '--nh-marquee-dot', label: 'Marquee Separator Dot' },
              { key: '--nh-orbit-tag-bg', label: 'Orbit Badge Label Background' },
              { key: '--nh-orbit-tag-text', label: 'Orbit Badge Label Text' },
              { key: '--nh-ring-color', label: 'Orbit Ring (Dashed Lines)' },
              { key: '--nh-badge-bg-default', label: 'Default Orbit Badge Background' },
              { key: '--nh-pill-bg', label: 'Pill Tag Background' },
              { key: '--nh-pill-text', label: 'Pill Tag Text' },
            ] as { key: keyof NewHeroColors; label: string }[]).map(({ key, label }) => (
              <div key={key} className={styles.field} style={{ flexDirection: 'column', alignItems: 'stretch', gap: '8px', marginBottom: 0, padding: '8px', background: '#f8f9fa', borderRadius: '6px', border: '1px solid #edf2f7' }}>
                <span style={{ fontSize: '12px', lineHeight: '1.2', color: '#475569' }}>{label}</span>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <div style={{ position: 'relative' }}>
                    <div
                      style={{ width: '28px', height: '28px', background: settings.newHeroColors[key] || '#000', borderRadius: '4px', cursor: 'pointer', flexShrink: 0, border: '1px solid #e0e0e0' }}
                      onClick={() => setActivePicker(key)}
                    />
                    {activePicker === key && (
                      <div style={{ position: 'absolute', zIndex: 9999, top: '100%', left: 0, marginTop: '8px' }}>
                        <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, left: 0 }} onClick={() => setActivePicker(null)} />
                        <div style={{ position: 'relative', background: '#fff', padding: '10px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                          <PickerErrorBoundary>
                            <ColorPicker
                              value={(settings.newHeroColors[key] || '').match(/gradient\(/g)?.length! > 1 ? 'linear-gradient(135deg, #d9f4ff 0%, #c7ecff 100%)' : (settings.newHeroColors[key] || '#000000')}
                              onChange={(value) => setSettings((p) => ({ ...p, newHeroColors: { ...p.newHeroColors, [key]: value } }))}
                            />
                          </PickerErrorBoundary>
                        </div>
                      </div>
                    )}
                  </div>
                  <input
                    type="text"
                    value={settings.newHeroColors[key]}
                    onChange={(e) => setSettings((p) => ({ ...p, newHeroColors: { ...p.newHeroColors, [key]: e.target.value } }))}
                    style={{ flex: 1, padding: '4px 8px', fontSize: '12px', border: '1px solid #e2e8f0', borderRadius: '4px' }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className={styles.sectionTitle} style={{ marginTop: '40px' }}>
            <IconifyIcon icon="tabler:text-wrap" />
            <h4>Hero Marquee Items</h4>
          </div>

          <div className={styles.partnerRows}>
            {settings.marqueeItems.map((item, index) => (
              <div key={item.id} className={styles.partnerRow}>
                <label className={styles.field}>
                  <span>Marquee Text</span>
                  <input value={item.text} onChange={(event) => updateMarqueeItem(index, 'text', event.target.value)} />
                </label>

                <button type="button" className={styles.iconBtn} onClick={() => removeMarqueeItem(index)} aria-label="Delete marquee item" style={{ marginTop: '22px' }}>
                  <IconifyIcon icon="tabler:trash" />
                </button>
              </div>
            ))}
          </div>

          <button type="button" className={styles.secondaryBtn} onClick={addMarqueeItem}>
            <IconifyIcon icon="tabler:plus" />
            Add Marquee Item
          </button>

          <div className={styles.sectionTitle} style={{ marginTop: '40px' }}>
            <IconifyIcon icon="tabler:building-store" />
            <h4>Brand Partners Section</h4>
          </div>

          <label className={styles.field}>
            <span>Section Title</span>
            <input
              value={settings.brandPartnersTitle}
              onChange={(event) => setSettings((previous) => ({ ...previous, brandPartnersTitle: event.target.value }))}
            />
          </label>

          <div className={styles.partnerRows}>
            {settings.brandPartners.map((partner, index) => (
              <div key={partner.id} className={styles.partnerRow}>
                <label className={styles.field}>
                  <span>Brand Name</span>
                  <input value={partner.name} onChange={(event) => updateBrandPartner(index, 'name', event.target.value)} />
                </label>

                <div className={styles.partnerLogoCell}>
                  {partner.logo ? (
                    <div className={styles.partnerLogoPreview}>
                      <img src={partner.logo} alt={partner.logoAlt || partner.name} />
                      <button
                        type="button"
                        className={clsx(styles.iconBtn, styles.partnerLogoRemove)}
                        onClick={() => updateBrandPartner(index, 'logo', '')}
                        aria-label="Remove partner logo"
                      >
                        <IconifyIcon icon="tabler:x" />
                      </button>
                    </div>
                  ) : (
                    <button type="button" className={styles.partnerUpload} onClick={() => setShowPartnerLogoPickerIndex(index)}>
                      <IconifyIcon icon="tabler:photo-plus" />
                      <span>Upload Logo</span>
                    </button>
                  )}
                </div>

                <label className={styles.field}>
                  <span>Logo Alt Text</span>
                  <input value={partner.logoAlt} onChange={(event) => updateBrandPartner(index, 'logoAlt', event.target.value)} />
                </label>

                <button type="button" className={styles.iconBtn} onClick={() => removeBrandPartner(index)} aria-label="Delete brand partner">
                  <IconifyIcon icon="tabler:trash" />
                </button>
              </div>
            ))}
          </div>

          <button type="button" className={styles.secondaryBtn} onClick={addBrandPartner}>
            <IconifyIcon icon="tabler:plus" />
            Add Brand Partner
          </button>

          <button type="submit" className={styles.saveBtn} disabled={saving}>
            <IconifyIcon icon={saving ? 'tabler:loader-2' : 'tabler:device-floppy'} />
            {saving ? 'Saving…' : 'Save Homepage Settings'}
          </button>
        </form>

        {/* Live preview of the Homepage Hero */}
        <div className={styles.preview} style={{ padding: 0, overflow: 'hidden', borderRadius: '12px' }}>
          <NewHeroSlider
            dynamicSlides={settings.newHeroSlides}
            cta={settings.newHeroCta}
            ctaUrl={settings.newHeroCtaUrl}
            secondaryText={settings.newHeroSecondaryText}
            secondaryUrl={settings.newHeroSecondaryUrl}
            colors={settings.newHeroColors}
            marqueeItems={settings.marqueeItems}
          />
        </div>

        <div className={styles.partnerPreviewWrap}>
          <section className={styles.partnerPreview}>
            <div className={styles.partnerHeader}>
              <h3>{settings.brandPartnersTitle}</h3>
            </div>

            <div className={styles.partnerGridWrapper}>
              <div className={styles.partnerGrid}>
                {settings.brandPartners.filter(p => p.logo).map((partner) => (
                  <div key={partner.id} className={styles.partnerCard}>
                    <img src={partner.logo} alt={partner.logoAlt || partner.name} />
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.partnerNav}>
              <button type="button" className={styles.partnerArrow} aria-label="Previous brand">
                <IconifyIcon icon="tabler:arrow-left" />
              </button>
              <button type="button" className={styles.partnerArrow} aria-label="Next brand">
                <IconifyIcon icon="tabler:arrow-right" />
              </button>
            </div>
          </section>
        </div>
      </div>

      {showSlideImagePickerIndex !== null && (
        <MediaPickerModal
          show={showSlideImagePickerIndex !== null}
          onClose={() => setShowSlideImagePickerIndex(null)}
          onSelect={(url) => updateSlide(showSlideImagePickerIndex, 'backgroundImage', url)}
        />
      )}

      {showPartnerLogoPickerIndex !== null && (
        <MediaPickerModal
          show={showPartnerLogoPickerIndex !== null}
          onClose={() => setShowPartnerLogoPickerIndex(null)}
          onSelect={(url) => updateBrandPartner(showPartnerLogoPickerIndex, 'logo', url)}
        />
      )}

      {showOrbitImagePicker !== null && (
        <MediaPickerModal
          show
          onClose={() => setShowOrbitImagePicker(null)}
          onSelect={(url) => {
            updateOrbitItem(showOrbitImagePicker[0], showOrbitImagePicker[1], 'image', url)
            setShowOrbitImagePicker(null)
          }}
        />
      )}

      {showCenterImagePicker !== null && (
        <MediaPickerModal
          show
          onClose={() => setShowCenterImagePicker(null)}
          onSelect={(url) => {
            updateNewHeroSlide(showCenterImagePicker, 'centerImage', url)
            setShowCenterImagePicker(null)
          }}
        />
      )}
    </div>
  )
}

export default HomepageSettingsPanel

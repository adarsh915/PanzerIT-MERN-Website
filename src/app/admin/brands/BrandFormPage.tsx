'use client'

import PageTitle from '@/components/PageTitle'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent, useMemo } from 'react'
import JoditEditor from '@/components/admin/JoditEditorWrapper'
import { toast } from 'react-toastify'
import { useQueryClient } from '@tanstack/react-query'
import {
  createBrand,
  findBrand,
  readCategories,
  updateBrand,
} from './brandStore'
import Select from 'react-select'
import MediaPickerModal from '@/components/admin/MediaPickerModal'
import {
  emptyBrand,
  toFormData,
  toSlug,
} from './brandHelpers'
import type { BrandCategory, BrandFormData } from './brandTypes'
import styles from '../posts/PostFormPage.module.scss'

type Props = {
  mode: 'create' | 'edit'
  brandId?: string
}

const stripHtml = (value: string) => {
  if (!value) return ''
  let s = value.replace(/<img[\s\S]*?(>|$)/ig, '')
  s = s.replace(/<[^>]*>/g, '')
  s = s.replace(/&amp;/g, '&')
  s = s.replace(/&lt;/g, '<')
  s = s.replace(/&gt;/g, '>')
  s = s.replace(/&quot;/g, '"')
  s = s.replace(/&#39;/g, "'")
  return s.replace(/&nbsp;/g, ' ').trim()
}

const BrandFormPage = ({ mode, brandId }: Props) => {
  const router = useRouter()
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const logoInputRef = useRef<HTMLInputElement | null>(null)
  const [form, setForm] = useState<BrandFormData>(emptyBrand)
  const [categories, setCategories] = useState<BrandCategory[]>([])
  const [notFound, setNotFound] = useState(false)
  const [showImagePicker, setShowImagePicker] = useState(false)
  const [showLogoPicker, setShowLogoPicker] = useState(false)
  const [showBreadcrumbImagePicker, setShowBreadcrumbImagePicker] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const joditUploader = {
    insertImageAsBase64URI: false,
    filesVariableName: (t?: number) => 'file',
    url: '/api/upload',
    format: 'json',
    method: 'POST',
    prepareData(data: FormData) { data.append('folder', 'media'); return data; },
    isSuccess(resp: any) { return resp.success; },
    getMsg(resp: any) { return resp.error || 'Upload failed'; },
    process(resp: any) {
      const url: string = resp.url || '';
      const lastSlash = url.lastIndexOf('/');
      const baseurl = url.substring(0, lastSlash + 1);
      const filename = url.substring(lastSlash + 1);
      return {
        files: filename ? [filename] : [],
        baseurl,
        isImages: [true],
        error: resp.error ? 1 : 0,
        msg: resp.error || '',
      };
    },
  };

  const editorConfig = useMemo(() => ({
    readonly: false,
    placeholder: '',
    height: 300,
    enableDragAndDropFileToEditor: true,
    uploader: joditUploader
  }), []);

  const editorConfig500 = useMemo(() => ({
    readonly: false,
    placeholder: '',
    height: 500,
    enableDragAndDropFileToEditor: true,
    uploader: joditUploader
  }), []);

  const editorConfig250 = useMemo(() => ({
    readonly: false,
    placeholder: '',
    height: 250,
    enableDragAndDropFileToEditor: true,
    uploader: joditUploader
  }), []);

  const editorConfig200 = useMemo(() => ({
    readonly: false,
    placeholder: '',
    height: 200,
    enableDragAndDropFileToEditor: true,
    uploader: joditUploader
  }), []);

  useEffect(() => {
    const loadCats = async () => {
      const cats = await readCategories()
      setCategories(cats.filter((category) => category.status === 'active'))
    }
    loadCats()
  }, [])

  // Removed custom dropdown listener

  useEffect(() => {
    if (mode !== 'edit' || !brandId) return

    const loadBrand = async () => {
      const brand = await findBrand(brandId)
      if (!brand) {
        setNotFound(true)
        return
      }

      setForm(toFormData(brand))
    }
    loadBrand()
  }, [mode, brandId])

  const set = <K extends keyof BrandFormData>(key: K, value: BrandFormData[K]) => {
    setForm((previous) => ({ ...previous, [key]: value }))
  }

  const handleNameChange = (name: string) => {
    setForm((previous) => ({
      ...previous,
      name,
      slug: previous.slug ? previous.slug : toSlug(name),
      metaTitle: previous.metaTitle ? previous.metaTitle : name,
    }))
  }

  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file')
      event.target.value = ''
      return
    }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', 'brands')
    
    try {
      const toastId = toast.loading('Uploading image...')
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      const data = await res.json()
      if (res.ok && data.url) {
        set('image', data.url)
        toast.update(toastId, { render: 'Image uploaded successfully', type: 'success', isLoading: false, autoClose: 2000 })
      } else {
        toast.update(toastId, { render: data.error || 'Image upload failed', type: 'error', isLoading: false, autoClose: 3000 })
      }
    } catch (e) {
      toast.error('Image upload failed')
    }
    event.target.value = ''
  }

  const removeImage = () => {
    set('image', '')
    set('imageAlt', '')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleLogoChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file')
      event.target.value = ''
      return
    }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', 'brands')
    
    try {
      const toastId = toast.loading('Uploading logo...')
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      const data = await res.json()
      if (res.ok && data.url) {
        set('logo', data.url)
        toast.update(toastId, { render: 'Logo uploaded successfully', type: 'success', isLoading: false, autoClose: 2000 })
      } else {
        toast.update(toastId, { render: data.error || 'Logo upload failed', type: 'error', isLoading: false, autoClose: 3000 })
      }
    } catch (e) {
      toast.error('Logo upload failed')
    }
    event.target.value = ''
  }

  const removeLogo = () => {
    set('logo', '')
    set('logoAlt', '')
    if (logoInputRef.current) logoInputRef.current.value = ''
  }

  const removeBreadcrumbImage = () => {
    set('breadcrumbImage', '')
    set('breadcrumbImageAlt', '')
    set('breadcrumbImageTitle', '')
    set('breadcrumbImageCaption', '')
    set('breadcrumbImageDescription', '')
  }

  const createExtraCard = () => ({ id: `new_${Date.now()}`, heading: '', description: '' })

  const updateExtraCard = (index: number, key: string, value: any) => {
    const cards = [...(form.extraCards || [])]
    cards[index] = { ...cards[index], [key]: value }
    set('extraCards', cards)
  }

  const removeExtraCard = (index: number) => {
    const cards = [...(form.extraCards || [])]
    cards.splice(index, 1)
    set('extraCards', cards)
  }

  const moveExtraCardUp = (index: number) => {
    if (index === 0) return;
    const cards = [...(form.extraCards || [])];
    const temp = cards[index - 1];
    cards[index - 1] = cards[index];
    cards[index] = temp;
    set('extraCards', cards);
  }

  const moveExtraCardDown = (index: number) => {
    const cards = [...(form.extraCards || [])];
    if (index === cards.length - 1) return;
    const temp = cards[index + 1];
    cards[index + 1] = cards[index];
    cards[index] = temp;
    set('extraCards', cards);
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.panzerit.com';

  const generatedSchema = {
    "@context": "https://schema.org",
    "@type": "Brand",
    "name": form.name || "",
    "description": form.metaDescription || (form.description || '').replace(/<[^>]*>?/gm, ''),
    "logo": form.logo || form.image,
    "url": `${siteUrl}/brand/${form.slug || 'slug'}`
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault()

    const name = form.name.trim()
    const slug = toSlug(form.slug || form.name)
    const description = form.description.trim()

    if (!name) {
      toast.error('Brand name is required')
      return
    }

    if (!slug) {
      toast.error('Brand slug is required')
      return
    }

    const payload: BrandFormData = {
      ...form,
      name,
      slug,
      website: form.website.trim(),
      category: form.category.trim(),
      description,
      imageAlt: form.image ? (form.imageAlt?.trim() || name) : '',
      logoAlt: form.logo ? (form.logoAlt?.trim() || `${name} logo`) : '',
      order: Number(form.order) || 1,
      metaTitle: form.metaTitle?.trim() || name,
      metaDescription: form.metaDescription?.trim() || stripHtml(description).slice(0, 160),
      metaKeywords: form.metaKeywords?.trim() || '',
      capabilitiesTitle: form.capabilitiesTitle?.trim() || '',
      capabilitiesHeading: form.capabilitiesHeading?.trim() || '',
      capabilitiesPoints: form.capabilitiesPoints?.trim() || '',
      breadcrumbDescription: form.breadcrumbDescription?.trim() || '',
      breadcrumbImage: form.breadcrumbImage || '',
      breadcrumbImageAlt: form.breadcrumbImageAlt?.trim() || '',
      breadcrumbImageTitle: form.breadcrumbImageTitle?.trim() || '',
      breadcrumbImageCaption: form.breadcrumbImageCaption?.trim() || '',
      breadcrumbImageDescription: form.breadcrumbImageDescription?.trim() || '',
    }

    try {
      setSubmitting(true)
      if (mode === 'edit' && brandId) {
        const res = await updateBrand(brandId, payload)
        if (res && 'success' in res && res.success === false) {
          toast.error(res.message)
          return
        }
        toast.success('Brand updated successfully')
        queryClient.invalidateQueries({ queryKey: ['brands'] })
        router.refresh()
        // Stay on edit page instead of redirecting
      } else {
        const res = await createBrand(payload)
        if (res && 'success' in res && res.success === false) {
          toast.error(res.message)
          return
        }
        toast.success('Brand created successfully')
        queryClient.invalidateQueries({ queryKey: ['brands'] })
        router.refresh()
        router.push('/admin/brands')
      }
    } catch (err: any) {
      console.error(err)
      toast.error(err?.message || 'An error occurred while saving the brand.')
    } finally {
      setSubmitting(false)
    }
  }

  const title = mode === 'create' ? 'Add Brand & Partner' : 'Edit Brand & Partner'

  return (
    <div className={styles.shell}>
      <PageTitle title={title} subTitle="Brands & Partners" />

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitle}>
            <IconifyIcon icon={mode === 'create' ? 'tabler:circle-plus' : 'tabler:pencil'} />
            <h3>{title}</h3>
          </div>
          <div className={styles.headerActions}>
            <Link href="/admin/brands" className={styles.backBtn}>Cancel</Link>
            <button type="submit" form="brandForm" className={styles.saveBtn} disabled={submitting}>
              <IconifyIcon icon={submitting ? 'tabler:loader-2' : 'tabler:device-floppy'} />
              {submitting ? 'Saving…' : mode === 'create' ? 'Create Brand' : 'Save Changes'}
            </button>
          </div>
        </div>

        {notFound ? (
          <div className={styles.notFound}>Brand not found.</div>
        ) : (
          <form id="brandForm" className={styles.form} onSubmit={submit}>
            <label className={styles.field}>
              <span>Name <em>*</em></span>
              <input
                type="text"
                value={form.name}
                onChange={(event) => handleNameChange(event.target.value)}
                placeholder="Enter brand or partner name"
                autoFocus
              />
            </label>

            <div className={styles.grid}>
              <label className={styles.field}>
                <span>Slug <em>*</em></span>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(event) => set('slug', toSlug(event.target.value))}
                  placeholder="brand-slug"
                />
              </label>
              <label className={styles.field}>
                <span>Status</span>
                <select value={form.status} onChange={(event) => set('status', event.target.value as BrandFormData['status'])}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </label>
              <label className={styles.field}>
                <span>Order</span>
                <input
                  type="number"
                  min={1}
                  value={form.order}
                  onChange={(event) => set('order', Number(event.target.value))}
                />
              </label>
            </div>

            <div className={styles.field}>
              <span>Categories</span>
              <Select
                isMulti
                options={categories.map(c => ({ value: c.name, label: c.name }))}
                value={form.category ? form.category.split(',').map(c => ({ value: c.trim(), label: c.trim() })).filter(c => c.value) : []}
                onChange={(selectedOptions: any) => {
                  set('category', selectedOptions.map((opt: any) => opt.value).join(', '));
                }}
                placeholder="Select categories"
                classNamePrefix="react-select"
                styles={{
                  control: (base) => ({
                    ...base,
                    borderRadius: '7px',
                    borderColor: '#e2e8f0',
                    boxShadow: 'none',
                    '&:hover': {
                      borderColor: '#cbd5e1'
                    }
                  })
                }}
              />
            </div>

            <div className={styles.field}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 0' }}>
                <input
                  type="checkbox"
                  id="featured"
                  checked={form.featured || false}
                  onChange={(e) => set('featured', e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer', marginTop: 0 }}
                />
                <label htmlFor="featured" style={{ margin: 0, cursor: 'pointer', fontWeight: 600, color: '#333' }}>
                  Feature this brand on the Homepage
                </label>
              </div>
            </div>

            <div className={styles.field}>
              <span>Image</span>
              <div className={styles.imageUpload}>
                {form.image ? (
                  <div className={styles.imagePreview}>
                    <img src={form.image} alt={form.imageAlt || form.name || 'Brand image'} />
                    <button type="button" className={styles.removeImageBtn} onClick={removeImage} aria-label="Remove brand image">
                      <IconifyIcon icon="tabler:x" />
                    </button>
                  </div>
                ) : (
                  <button type="button" className={styles.uploadPlaceholder} onClick={() => setShowImagePicker(true)}>
                    <IconifyIcon icon="tabler:photo-plus" />
                    <strong>Upload or select brand image</strong>
                    <small>PNG, JPG, WEBP, or GIF</small>
                  </button>
                )}
                {form.image && (
                  <button type="button" className={styles.changeImageBtn} onClick={() => setShowImagePicker(true)}>
                    <IconifyIcon icon="tabler:upload" />
                    Change Image
                  </button>
                )}
              </div>
            </div>

            {form.image && (
              <div className={styles.seoBox} style={{ marginTop: '10px' }}>
                <div className={styles.sectionTitle}>
                  <IconifyIcon icon="tabler:seo" />
                  <h4>Image SEO</h4>
                </div>
                <label className={styles.field}>
                  <span>Image Title</span>
                  <input
                    type="text"
                    value={form.imageTitle || ''}
                    onChange={(event) => set('imageTitle', event.target.value)}
                    placeholder="Enter image title"
                  />
                </label>
                <label className={styles.field}>
                  <span>Image Caption</span>
                  <input
                    type="text"
                    value={form.imageCaption || ''}
                    onChange={(event) => set('imageCaption', event.target.value)}
                    placeholder="Enter image caption"
                  />
                </label>
                <label className={styles.field}>
                  <span>Image Description</span>
                  <textarea
                    rows={2}
                    value={form.imageDescription || ''}
                    onChange={(event) => set('imageDescription', event.target.value)}
                    placeholder="Enter image description"
                  />
                </label>
                <label className={styles.field}>
                  <span>Image Alt Text</span>
                  <input
                    type="text"
                    value={form.imageAlt || ''}
                    onChange={(event) => set('imageAlt', event.target.value)}
                    placeholder="Describe the image"
                  />
                </label>
              </div>
            )}

            <div className={styles.field}>
              <span>Logo</span>
              <div className={styles.imageUpload}>
                {form.logo ? (
                  <div className={styles.logoPreview}>
                    <img src={form.logo} alt={form.logoAlt || form.name || 'Brand logo'} />
                    <button type="button" className={styles.removeImageBtn} onClick={removeLogo} aria-label="Remove brand logo">
                      <IconifyIcon icon="tabler:x" />
                    </button>
                  </div>
                ) : (
                  <button type="button" className={styles.logoUploadPlaceholder} onClick={() => setShowLogoPicker(true)}>
                    <IconifyIcon icon="tabler:photo-plus" />
                    <strong>Upload or select brand logo</strong>
                    <small>PNG, JPG, WEBP, or GIF</small>
                  </button>
                )}
                {form.logo && (
                  <button type="button" className={styles.changeImageBtn} onClick={() => setShowLogoPicker(true)}>
                    <IconifyIcon icon="tabler:upload" />
                    Change Logo
                  </button>
                )}
              </div>
            </div>

            {form.logo && (
              <label className={styles.field}>
                <span>Logo Alt Text</span>
                <input
                  type="text"
                  value={form.logoAlt}
                  onChange={(event) => set('logoAlt', event.target.value)}
                  placeholder="Describe the logo"
                />
              </label>
            )}

            <div className={styles.seoBox} style={{ marginTop: '20px' }}>
              <div className={styles.sectionTitle}>
                <IconifyIcon icon="tabler:home" />
                <h4>Homepage Product Card Text</h4>
              </div>
              <p style={{ marginBottom: '15px', color: '#666', fontSize: '14px' }}>
                These two lines appear in the Products section on the homepage (only for featured brands).
              </p>
              <label className={styles.field}>
                <span>Line 1 — Tagline</span>
                <div className={styles.editorWrap}>
                  <JoditEditor
                    value={form.homepageTagline || ''}
                    config={editorConfig200}
                    onBlur={(value: string) => set('homepageTagline', value)}
                    onChange={() => {}}
                  />
                </div>
              </label>
              <label className={styles.field}>
                <span>Line 2 — Sub Tagline</span>
                <div className={styles.editorWrap}>
                  <JoditEditor
                    value={form.homepageSubTagline || ''}
                    config={editorConfig200}
                    onBlur={(value: string) => set('homepageSubTagline', value)}
                    onChange={() => {}}
                  />
                </div>
              </label>
            </div>

            <label className={styles.field}>
              <span>Description</span>
              <div className={styles.editorWrap}>
                <JoditEditor
                  value={form.description}
                  config={editorConfig500}
                  onBlur={(value: string) => set('description', value)}
                  onChange={() => {}}
                />
              </div>
            </label>

            <div className={styles.seoBox} style={{ marginTop: '20px', marginBottom: '20px' }}>
              <div className={styles.sectionTitle}>
                <IconifyIcon icon="tabler:layout-navbar" />
                <h4>Breadcrumb & Banner Header</h4>
              </div>

              <div className={styles.field}>
                <span>Breadcrumb Banner Image</span>
                <div className={styles.imageUpload}>
                  {form.breadcrumbImage ? (
                    <div className={styles.imagePreview}>
                      <img src={form.breadcrumbImage} alt={form.breadcrumbImageAlt || form.name || 'Breadcrumb image'} />
                      <button type="button" className={styles.removeImageBtn} onClick={removeBreadcrumbImage} aria-label="Remove breadcrumb image">
                        <IconifyIcon icon="tabler:x" />
                      </button>
                    </div>
                  ) : (
                    <button type="button" className={styles.uploadPlaceholder} onClick={() => setShowBreadcrumbImagePicker(true)}>
                      <IconifyIcon icon="tabler:photo-plus" />
                      <strong>Upload or select breadcrumb image</strong>
                      <small>PNG, JPG, WEBP, or GIF</small>
                    </button>
                  )}
                  {form.breadcrumbImage && (
                    <button type="button" className={styles.changeImageBtn} onClick={() => setShowBreadcrumbImagePicker(true)}>
                      <IconifyIcon icon="tabler:upload" />
                      Change Breadcrumb Image
                    </button>
                  )}
                </div>
              </div>

              {form.breadcrumbImage && (
                <div style={{ marginTop: '15px' }}>
                  <label className={styles.field}>
                    <span>Breadcrumb Image Alt Text</span>
                    <input
                      type="text"
                      value={form.breadcrumbImageAlt || ''}
                      onChange={(event) => set('breadcrumbImageAlt', event.target.value)}
                      placeholder="Describe the breadcrumb banner image"
                    />
                  </label>
                  <label className={styles.field}>
                    <span>Breadcrumb Image Title</span>
                    <input
                      type="text"
                      value={form.breadcrumbImageTitle || ''}
                      onChange={(event) => set('breadcrumbImageTitle', event.target.value)}
                      placeholder="Breadcrumb image title"
                    />
                  </label>
                  <label className={styles.field}>
                    <span>Breadcrumb Image Caption</span>
                    <input
                      type="text"
                      value={form.breadcrumbImageCaption || ''}
                      onChange={(event) => set('breadcrumbImageCaption', event.target.value)}
                      placeholder="Breadcrumb image caption"
                    />
                  </label>
                  <label className={styles.field}>
                    <span>Breadcrumb Image Description</span>
                    <textarea
                      rows={2}
                      value={form.breadcrumbImageDescription || ''}
                      onChange={(event) => set('breadcrumbImageDescription', event.target.value)}
                      placeholder="Detailed breadcrumb image description"
                    />
                  </label>
                </div>
              )}

              <label className={styles.field} style={{ marginTop: '15px' }}>
                <span>Breadcrumb Description</span>
                <div className={styles.editorWrap}>
                  <JoditEditor
                    value={form.breadcrumbDescription || ''}
                    config={editorConfig200}
                    onBlur={(value: string) => set('breadcrumbDescription', value)}
                    onChange={() => {}}
                  />
                </div>
              </label>
            </div>

            <div className={styles.seoBox} style={{ marginTop: '20px' }}>
              <div className={styles.sectionTitle}>
                <IconifyIcon icon="tabler:list-check" />
                <h4>Brand Capabilities</h4>
              </div>
              <label className={styles.field}>
                <span>Heading Title</span>
                <div className={styles.editorWrap}>
                  <JoditEditor
                    value={form.capabilitiesTitle}
                    config={editorConfig200}
                    onBlur={(value: string) => set('capabilitiesTitle', value)}
                    onChange={() => {}}
                  />
                </div>
              </label>
              <label className={styles.field}>
                <span>Heading Description</span>
                <div className={styles.editorWrap}>
                  <JoditEditor
                    value={form.capabilitiesHeading}
                    config={editorConfig200}
                    onBlur={(value: string) => set('capabilitiesHeading', value)}
                    onChange={() => {}}
                  />
                </div>
              </label>
              <label className={styles.field}>
                <span>Capabilities Points (Hit Enter for each new point)</span>
                <div className={styles.editorWrap}>
                  <JoditEditor
                    value={form.capabilitiesPoints}
                    config={editorConfig250}
                    onBlur={(value: string) => set('capabilitiesPoints', value)}
                    onChange={() => {}}
                  />
                </div>
              </label>
            </div>

            <div className={styles.seoBox} style={{ marginTop: '20px' }}>
              <div className={styles.sectionTitle}>
                <IconifyIcon icon="tabler:cards" />
                <h4>Extra Cards</h4>
              </div>
              {(form.extraCards || []).map((card, index) => (
                <div key={card.id} className={styles.repeaterCard}>
                  <div className={styles.repeaterCardHeader}>
                    <div className={styles.repeaterTitle}>
                      <strong>Card {index + 1}</strong>
                    </div>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button type="button" className={styles.iconBtn} onClick={() => moveExtraCardUp(index)} disabled={index === 0} aria-label="Move up" title="Move up" style={{ opacity: index === 0 ? 0.5 : 1 }}>
                        <IconifyIcon icon="tabler:arrow-up" />
                      </button>
                      <button type="button" className={styles.iconBtn} onClick={() => moveExtraCardDown(index)} disabled={index === (form.extraCards?.length || 0) - 1} aria-label="Move down" title="Move down" style={{ opacity: index === (form.extraCards?.length || 0) - 1 ? 0.5 : 1 }}>
                        <IconifyIcon icon="tabler:arrow-down" />
                      </button>
                      <button type="button" className={styles.iconDangerBtn} onClick={() => removeExtraCard(index)} aria-label="Delete card" title="Delete card">
                        <IconifyIcon icon="tabler:trash" />
                      </button>
                    </div>
                  </div>

                  <div style={{ padding: '1.25rem' }}>
                    <div className={styles.repeaterFields}>
                      <label className={styles.field}>
                        <span>Heading</span>
                        <div className={styles.editorWrap}>
                          <JoditEditor
                            value={card.heading}
                            config={editorConfig200}
                            onBlur={(value: string) => updateExtraCard(index, 'heading', value)}
                            onChange={() => {}}
                          />
                        </div>
                      </label>
                      <label className={styles.field}>
                        <span>Description</span>
                        <div className={styles.editorWrap}>
                          <JoditEditor
                            value={card.description}
                            config={editorConfig}
                            onBlur={(value: string) => updateExtraCard(index, 'description', value)}
                            onChange={() => {}}
                          />
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              ))}
              <button
                type="button"
                className={styles.changeImageBtn}
                onClick={() => set('extraCards', [...(form.extraCards || []), createExtraCard()])}
                style={{ marginTop: '10px' }}
              >
                <IconifyIcon icon="tabler:plus" />
                Add Card
              </button>
            </div>

            <div className={styles.seoBox}>
              <div className={styles.sectionTitle}>
                <IconifyIcon icon="tabler:seo" />
                <h4>SEO</h4>
              </div>
              <label className={styles.field}>
                <span>Meta Title</span>
                <input value={form.metaTitle} onChange={(event) => set('metaTitle', event.target.value)} placeholder="SEO title" />
              </label>
              <label className={styles.field}>
                <span>Meta Description</span>
                <textarea rows={3} value={form.metaDescription} onChange={(event) => set('metaDescription', event.target.value)} />
              </label>
              <label className={styles.field}>
                <span>Meta Keywords</span>
                <input value={form.metaKeywords} onChange={(event) => set('metaKeywords', event.target.value)} placeholder="keyword one, keyword two" />
              </label>
            </div>

            <div className={styles.seoBox} style={{ marginTop: '30px' }}>
              <div className={styles.sectionTitle}>
                <IconifyIcon icon="tabler:code" />
                <h4>Schema Markup (Auto Generated)</h4>
              </div>
              <p style={{ marginBottom: '15px', color: '#666', fontSize: '14px' }}>
                This JSON-LD schema will be automatically injected into the brand details page to improve SEO.
              </p>
              <pre style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', overflowX: 'auto', fontSize: '13px', border: '1px solid #e9ecef' }}>
                {JSON.stringify(generatedSchema, null, 2)}
              </pre>
            </div>

            {/* Buttons moved to sticky header */}
          </form>
        )}
      </div>

      {showImagePicker && (
        <MediaPickerModal
          show={showImagePicker}
          onClose={() => setShowImagePicker(false)}
          onSelect={(url) => set('image', url)}
        />
      )}

      {showLogoPicker && (
        <MediaPickerModal
          show={showLogoPicker}
          onClose={() => setShowLogoPicker(false)}
          onSelect={(url) => set('logo', url)}
        />
      )}

      {showBreadcrumbImagePicker && (
        <MediaPickerModal
          show={showBreadcrumbImagePicker}
          onClose={() => setShowBreadcrumbImagePicker(false)}
          onSelect={(url) => set('breadcrumbImage', url)}
        />
      )}
    </div>
  )
}

export default BrandFormPage

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
  createSolution,
  findSolution,
  readCategories,
  updateSolution,
  type SolutionCategory,
  type SolutionExtraCard,
  type SolutionFeatureCard,
  type SolutionFormData,
  type SolutionImplementationStep,
} from './solutionStore'
import { emptySolution, toFormData, toSlug } from './solutionHelpers'
import MediaPickerModal from '@/components/admin/MediaPickerModal'
import styles from '../posts/PostFormPage.module.scss'

type Props = {
  mode: 'create' | 'edit'
  solutionId?: string
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

const createFeatureCard = (): SolutionFeatureCard => ({
  id: `feature-${Date.now()}`,
  icon: 'tabler:shield-check',
  image: '',
  imageAlt: '',
  title: '',
  description: '',
})

const createExtraCard = (): SolutionExtraCard => ({
  id: `extra-${Date.now()}`,
  heading: '',
  description: '',
  points: [],
})

const createImplementationStep = (index: number): SolutionImplementationStep => ({
  id: `step-${Date.now()}`,
  step: String(index + 1).padStart(2, '0'),
  title: '',
  description: '',
})

const SolutionFormPage = ({ mode, solutionId }: Props) => {
  const router = useRouter()
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const logoInputRef = useRef<HTMLInputElement | null>(null)
  const [form, setForm] = useState<SolutionFormData>(emptySolution)
  const [categories, setCategories] = useState<SolutionCategory[]>([])
  const [activeContentTab, setActiveContentTab] = useState<'features' | 'flow' | 'cards'>('features')
  const [notFound, setNotFound] = useState(false)
  const [showImagePicker, setShowImagePicker] = useState(false)
  const [showLogoPicker, setShowLogoPicker] = useState(false)
  const [showBreadcrumbImagePicker, setShowBreadcrumbImagePicker] = useState(false)
  const [showFeatureImagePickerIndex, setShowFeatureImagePickerIndex] = useState<number | null>(null)
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
      // Jodit needs: files=filenames, baseurl=base path, isImages=bool array
      // It constructs the src as baseurl + filename
      const url: string = resp.url || '';
      const lastSlash = url.lastIndexOf('/');
      const baseurl = url.substring(0, lastSlash + 1);  // e.g. /uploads/media/
      const filename = url.substring(lastSlash + 1);    // e.g. abc123.jpg
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

  const editorConfig200 = useMemo(() => ({
    readonly: false,
    placeholder: '',
    height: 200,
    enableDragAndDropFileToEditor: true,
    uploader: joditUploader
  }), []);

  useEffect(() => {
    readCategories().then((res) => {
      setCategories(res.filter((category) => category.status === 'active'))
    })
  }, [])

  useEffect(() => {
    if (mode !== 'edit' || !solutionId) return

    findSolution(solutionId).then((solution) => {
      if (!solution) {
        setNotFound(true)
        return
      }
      setForm(toFormData(solution))
    })
  }, [mode, solutionId])

  const set = <K extends keyof SolutionFormData>(key: K, value: SolutionFormData[K]) => {
    setForm((previous) => ({ ...previous, [key]: value }))
  }

  const handleTitleChange = (title: string) => {
    setForm((previous) => ({
      ...previous,
      title,
      slug: previous.slug ? previous.slug : toSlug(title),
      metaTitle: previous.metaTitle ? previous.metaTitle : title,
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
    formData.append('folder', 'solutions')

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
    formData.append('folder', 'solutions')

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

  const updateFeatureCard = <K extends keyof SolutionFeatureCard>(index: number, key: K, value: SolutionFeatureCard[K]) => {
    setForm((previous) => ({
      ...previous,
      featureCards: previous.featureCards.map((card, cardIndex) =>
        cardIndex === index ? { ...card, [key]: value } : card
      )
    }))
  }

  const handleFeatureImageChange = async (index: number, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file')
      event.target.value = ''
      return
    }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', 'solutions')

    try {
      const toastId = toast.loading('Uploading feature image...')
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      const data = await res.json()
      if (res.ok && data.url) {
        updateFeatureCard(index, 'image', data.url)
        toast.update(toastId, { render: 'Feature image uploaded successfully', type: 'success', isLoading: false, autoClose: 2000 })
      } else {
        toast.update(toastId, { render: data.error || 'Feature image upload failed', type: 'error', isLoading: false, autoClose: 3000 })
      }
    } catch (e) {
      toast.error('Feature image upload failed')
    }
    event.target.value = ''
  }

  const removeFeatureCard = (index: number) => {
    set('featureCards', form.featureCards.filter((_, cardIndex) => cardIndex !== index))
  }

  const removeImplementationStep = (index: number) => {
    set('implementationSteps', form.implementationSteps.filter((_, stepIndex) => stepIndex !== index))
  }

  const updateExtraCard = <K extends keyof SolutionExtraCard>(index: number, key: K, value: SolutionExtraCard[K]) => {
    setForm((previous) => ({
      ...previous,
      extraCards: (previous.extraCards || []).map((card, cardIndex) =>
        cardIndex === index ? { ...card, [key]: value } : card
      )
    }))
  }



  const removeExtraCard = (index: number) => {
    set('extraCards', (form.extraCards || []).filter((_, cardIndex) => cardIndex !== index))
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

  const moveFeatureCardUp = (index: number) => {
    if (index === 0) return;
    const cards = [...form.featureCards];
    const temp = cards[index - 1];
    cards[index - 1] = cards[index];
    cards[index] = temp;
    set('featureCards', cards);
  }

  const moveFeatureCardDown = (index: number) => {
    const cards = [...form.featureCards];
    if (index === cards.length - 1) return;
    const temp = cards[index + 1];
    cards[index + 1] = cards[index];
    cards[index] = temp;
    set('featureCards', cards);
  }

  const moveImplementationStepUp = (index: number) => {
    if (index === 0) return;
    const steps = [...form.implementationSteps];
    const temp = steps[index - 1];
    steps[index - 1] = steps[index];
    steps[index] = temp;
    set('implementationSteps', steps);
  }

  const moveImplementationStepDown = (index: number) => {
    const steps = [...form.implementationSteps];
    if (index === steps.length - 1) return;
    const temp = steps[index + 1];
    steps[index + 1] = steps[index];
    steps[index] = temp;
    set('implementationSteps', steps);
  }

  const updateImplementationStep = <K extends keyof SolutionImplementationStep>(
    index: number,
    key: K,
    value: SolutionImplementationStep[K],
  ) => {
    setForm((previous) => ({
      ...previous,
      implementationSteps: previous.implementationSteps.map((step, stepIndex) =>
        stepIndex === index ? { ...step, [key]: value } : step
      )
    }))
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.panzerit.com';

  const generatedSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": form.metaTitle || form.title || "",
    "description": form.metaDescription || (form.description || '').replace(/<[^>]*>?/gm, ''),
    "provider": {
      "@type": "Organization",
      "name": "Panzer IT",
      "url": siteUrl,
      "logo": `${siteUrl}/assets/images/logo/logo.png`
    },
    "image": form.image ? [form.image] : undefined,
    "url": `${siteUrl}/solution/${form.slug || 'slug'}`
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault()

    const title = form.title.trim()
    const slug = toSlug(form.slug || form.title)
    const description = form.description.trim()

    if (!title) {
      toast.error('Solution title is required')
      return
    }

    if (!slug) {
      toast.error('Solution slug is required')
      return
    }

    if (!stripHtml(description)) {
      toast.error('Description is required')
      return
    }

    const payload: SolutionFormData = {
      ...form,
      title,
      slug,
      subtitle: form.subtitle.trim(),
      category: form.category.trim(),
      description,
      imageAlt: form.image ? (form.imageAlt?.trim() || title) : '',
      logoAlt: form.logo ? (form.logoAlt?.trim() || `${title} logo`) : '',
      order: Number(form.order) || 1,
      featureCards: form.featureCards
        .map((card) => ({
          ...card,
          icon: card.icon.trim() || 'tabler:shield-check',
          image: card.image ?? '',
          imageAlt: card.image ? (card.imageAlt?.trim() || card.title.trim()) : '',
          title: card.title.trim(),
          description: card.description.trim(),
        }))
        .filter((card) => card.title || card.description || card.image),
      implementationSteps: form.implementationSteps
        .map((step, index) => ({
          ...step,
          step: String(index + 1).padStart(2, '0'),
          title: step.title.trim(),
          description: step.description.trim(),
        }))
        .filter((step) => step.title || step.description),
      extraCards: (form.extraCards || [])
        .map((card) => ({
          ...card,
          heading: card.heading.trim(),
          description: card.description.trim(),
          points: (card.points || []).map(p => p.trim()).filter(Boolean),
        }))
        .filter((card) => card.heading || card.description || card.points.length > 0),
      metaTitle: form.metaTitle?.trim() || title,
      metaDescription: form.metaDescription?.trim() || stripHtml(description).slice(0, 160),
      metaKeywords: form.metaKeywords?.trim() || '',
      breadcrumbDescription: form.breadcrumbDescription?.trim() || '',
      breadcrumbImage: form.breadcrumbImage || '',
      breadcrumbImageAlt: form.breadcrumbImageAlt?.trim() || '',
      breadcrumbImageTitle: form.breadcrumbImageTitle?.trim() || '',
      breadcrumbImageCaption: form.breadcrumbImageCaption?.trim() || '',
      breadcrumbImageDescription: form.breadcrumbImageDescription?.trim() || '',
    }

    try {
      setSubmitting(true)
      if (mode === 'edit' && solutionId) {
        const res = await updateSolution(solutionId, payload)
        if (res && 'success' in res && res.success === false) {
          toast.error(res.message)
          return
        }
        toast.success('Solution updated successfully')
        queryClient.invalidateQueries({ queryKey: ['solutions'] })
        router.refresh()
        // Stay on edit page instead of redirecting
      } else {
        const res = await createSolution(payload)
        if (res && 'success' in res && res.success === false) {
          toast.error(res.message)
          return
        }
        toast.success('Solution created successfully')
        queryClient.invalidateQueries({ queryKey: ['solutions'] })
        router.refresh()
        router.push('/admin/solutions')
      }
    } catch (err: any) {
      toast.error(err.message || 'An error occurred while saving to the database.')
    } finally {
      setSubmitting(false)
    }
  }

  const title = mode === 'create' ? 'Add Solution & Service' : 'Edit Solution & Service'

  return (
    <div className={styles.shell}>
      <PageTitle title={title} subTitle="Solutions & Services" />

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitle}>
            <IconifyIcon icon={mode === 'create' ? 'tabler:circle-plus' : 'tabler:pencil'} />
            <h3>{title}</h3>
          </div>
          <div className={styles.headerActions}>
            <Link href="/admin/solutions" className={styles.backBtn}>Cancel</Link>
            <button type="submit" form="solutionForm" className={styles.saveBtn} disabled={submitting}>
              <IconifyIcon icon={submitting ? 'tabler:loader-2' : 'tabler:device-floppy'} />
              {submitting ? 'Saving…' : mode === 'create' ? 'Create Solution' : 'Save Changes'}
            </button>
          </div>
        </div>

        {notFound ? (
          <div className={styles.notFound}>Solution not found.</div>
        ) : (
          <form id="solutionForm" className={styles.form} onSubmit={submit}>
            <label className={styles.field}>
              <span>Title <em>*</em></span>
              <input
                type="text"
                value={form.title}
                onChange={(event) => handleTitleChange(event.target.value)}
                placeholder="Enter solution title"
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
                  placeholder="solution-slug"
                />
              </label>
              <label className={styles.field}>
                <span>Status</span>
                <select value={form.status} onChange={(event) => set('status', event.target.value as SolutionFormData['status'])}>
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

            <div className={styles.gridTwo}>
              <label className={styles.field}>
                <span>Subtitle</span>
                <input
                  type="text"
                  value={form.subtitle}
                  onChange={(event) => set('subtitle', event.target.value)}
                  placeholder="e.g. Data Leak Prevention"
                />
              </label>
              <label className={styles.field}>
                <span>Category</span>
                <select value={form.category} onChange={(event) => set('category', event.target.value)}>
                  <option value="">Select category</option>
                  {categories.map((category) => <option key={category.id} value={category.name}>{category.name}</option>)}
                  {form.category && !categories.some((category) => category.name === form.category) && (
                    <option value={form.category}>{form.category}</option>
                  )}
                </select>
              </label>
            </div>

            <div className="d-flex align-items-center gap-2 mb-4 bg-light p-3 rounded border">
              <input
                type="checkbox"
                id="isFeatured"
                checked={form.isFeatured || false}
                onChange={(e) => set('isFeatured', e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer', marginTop: 0 }}
              />
              <label htmlFor="isFeatured" style={{ margin: 0, cursor: 'pointer', fontWeight: 600, color: '#333' }}>
                Feature this solution on the Homepage
              </label>
            </div>

            <div className={styles.field}>
              <span>Solution Image</span>
              <div className={styles.imageUpload}>
                {form.image ? (
                  <div className={styles.imagePreview}>
                    <img src={form.image} alt={form.imageAlt || form.title || 'Solution image'} />
                    <button type="button" className={styles.removeImageBtn} onClick={removeImage} aria-label="Remove solution image">
                      <IconifyIcon icon="tabler:x" />
                    </button>
                  </div>
                ) : (
                  <button type="button" className={styles.uploadPlaceholder} onClick={() => setShowImagePicker(true)}>
                    <IconifyIcon icon="tabler:photo-plus" />
                    <strong>Upload or select solution image</strong>
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
                    placeholder="Describe the solution image"
                  />
                </label>
              </div>
            )}

            <div className={styles.field}>
              <span>Logo</span>
              <div className={styles.imageUpload}>
                {form.logo ? (
                  <div className={styles.logoPreview}>
                    <img src={form.logo} alt={form.logoAlt || form.title || 'Solution logo'} />
                    <button type="button" className={styles.removeImageBtn} onClick={removeLogo} aria-label="Remove solution logo">
                      <IconifyIcon icon="tabler:x" />
                    </button>
                  </div>
                ) : (
                  <button type="button" className={styles.logoUploadPlaceholder} onClick={() => setShowLogoPicker(true)}>
                    <IconifyIcon icon="tabler:photo-plus" />
                    <strong>Upload or select solution logo</strong>
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
                  placeholder="Describe the solution logo"
                />
              </label>
            )}

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

            <label className={styles.field}>
              <span>Description <em>*</em></span>
              <div className={styles.editorWrap}>
                <JoditEditor
                  value={form.description}
                  config={editorConfig500}
                  onBlur={(value: string) => set('description', value)}
                  onChange={() => { }}
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
                      <img src={form.breadcrumbImage} alt={form.breadcrumbImageAlt || form.title || 'Breadcrumb image'} />
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

            <div className={styles.tabBox}>
              <div className={styles.tabHeader} role="tablist" aria-label="Solution content sections">
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeContentTab === 'features'}
                  className={activeContentTab === 'features' ? styles.tabActive : undefined}
                  onClick={() => setActiveContentTab('features')}
                >
                  <IconifyIcon icon="tabler:layout-grid-add" />
                  Feature Cards
                  <span>{form.featureCards.length}</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeContentTab === 'flow'}
                  className={activeContentTab === 'flow' ? styles.tabActive : undefined}
                  onClick={() => setActiveContentTab('flow')}
                >
                  <IconifyIcon icon="tabler:git-branch" />
                  Implementation Flow
                  <span>{form.implementationSteps.length}</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeContentTab === 'cards'}
                  className={activeContentTab === 'cards' ? styles.tabActive : undefined}
                  onClick={() => setActiveContentTab('cards')}
                >
                  <IconifyIcon icon="tabler:cards" />
                  Cards
                  <span>{(form.extraCards || []).length}</span>
                </button>
              </div>

              <div className={styles.tabPanel}>
                {activeContentTab === 'features' && (
                  <>
                    <div className={styles.sectionTitle}>
                      <IconifyIcon icon="tabler:layout-grid-add" />
                      <h4>Feature Cards</h4>
                    </div>
                    {form.featureCards.map((card, index) => (
                      <div key={card.id} className={styles.repeaterCard}>
                        <div className={styles.repeaterCardHeader}>
                          <div className={styles.repeaterTitle}>
                            <span className={styles.repeaterIconPreview}>
                              {card.image ? <img src={card.image} alt={card.imageAlt || stripHtml(card.title) || 'Feature card'} /> : <IconifyIcon icon={card.icon || 'tabler:shield-check'} />}
                            </span>
                            <strong>{stripHtml(card.title) || `Feature Card ${index + 1}`}</strong>
                          </div>
                          <div style={{ display: 'flex', gap: '5px' }}>
                            <button type="button" className={styles.iconBtn} onClick={() => moveFeatureCardUp(index)} disabled={index === 0} aria-label="Move up" title="Move up" style={{ opacity: index === 0 ? 0.5 : 1 }}>
                              <IconifyIcon icon="tabler:arrow-up" />
                            </button>
                            <button type="button" className={styles.iconBtn} onClick={() => moveFeatureCardDown(index)} disabled={index === form.featureCards.length - 1} aria-label="Move down" title="Move down" style={{ opacity: index === form.featureCards.length - 1 ? 0.5 : 1 }}>
                              <IconifyIcon icon="tabler:arrow-down" />
                            </button>
                            <button type="button" className={styles.iconDangerBtn} onClick={() => removeFeatureCard(index)} aria-label="Delete feature card" title="Delete card">
                              <IconifyIcon icon="tabler:trash" />
                            </button>
                          </div>
                        </div>

                        <div className={styles.repeaterBody}>
                          <div className={styles.miniUpload}>
                            {card.image ? (
                              <div className={styles.miniImagePreview}>
                                <img src={card.image} alt={card.imageAlt || stripHtml(card.title) || 'Feature card'} />
                                <button
                                  type="button"
                                  className={styles.removeImageBtn}
                                  onClick={() => {
                                    updateFeatureCard(index, 'image', '')
                                    updateFeatureCard(index, 'imageAlt', '')
                                  }}
                                  aria-label="Remove feature card image"
                                  title="Remove image"
                                >
                                  <IconifyIcon icon="tabler:x" />
                                </button>
                              </div>
                            ) : (
                              <button type="button" className={styles.miniUploadPlaceholder} onClick={() => setShowFeatureImagePickerIndex(index)}>
                                <IconifyIcon icon="tabler:photo-plus" />
                                <span>Upload image</span>
                              </button>
                            )}
                            {card.image && (
                              <button type="button" className={styles.changeImageBtn} onClick={() => setShowFeatureImagePickerIndex(index)}>
                                <IconifyIcon icon="tabler:upload" />
                                Change Image
                              </button>
                            )}
                          </div>

                          <div className={styles.repeaterFields}>
                            <label className={styles.field}>
                              <span>Title</span>
                              <div style={{ maxWidth: '100%' }}>
                                <JoditEditor
                                  value={card.title}
                                  config={editorConfig}
                                  onChange={(value: string) => updateFeatureCard(index, 'title', value)}
                                />
                              </div>
                            </label>
                            {card.image && (
                              <div style={{ marginTop: '10px' }}>
                                <label className={styles.field}>
                                  <span>Image Title</span>
                                  <input value={card.imageTitle ?? ''} onChange={(event) => updateFeatureCard(index, 'imageTitle', event.target.value)} />
                                </label>
                                <label className={styles.field}>
                                  <span>Image Caption</span>
                                  <input value={card.imageCaption ?? ''} onChange={(event) => updateFeatureCard(index, 'imageCaption', event.target.value)} />
                                </label>
                                <label className={styles.field}>
                                  <span>Image Description</span>
                                  <textarea rows={2} value={card.imageDescription ?? ''} onChange={(event) => updateFeatureCard(index, 'imageDescription', event.target.value)} />
                                </label>
                                <label className={styles.field}>
                                  <span>Image Alt Text</span>
                                  <input value={card.imageAlt ?? ''} onChange={(event) => updateFeatureCard(index, 'imageAlt', event.target.value)} />
                                </label>
                              </div>
                            )}
                            <label className={styles.field}>
                              <span>Description</span>
                              <div style={{ maxWidth: '100%' }}>
                                <JoditEditor
                                  value={card.description}
                                  config={editorConfig}
                                  onChange={(value: string) => updateFeatureCard(index, 'description', value)}
                                />
                              </div>
                            </label>
                          </div>
                        </div>
                      </div>
                    ))}
                    <button type="button" className={styles.changeImageBtn} onClick={() => set('featureCards', [...form.featureCards, createFeatureCard()])}>
                      <IconifyIcon icon="tabler:plus" />
                      Add Card
                    </button>
                  </>
                )}
                {activeContentTab === 'flow' && (
                  <>
                    <div className={styles.sectionTitle}>
                      <IconifyIcon icon="tabler:git-branch" />
                      <h4>Implementation Flow</h4>
                    </div>
                    {form.implementationSteps.map((step, index) => (
                      <div key={step.id} className={styles.flowCard}>
                        <div className={styles.flowStepBadge}>{String(index + 1).padStart(2, '0')}</div>
                        <div className={styles.flowFields} style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '100%' }}>
                          <label className={styles.field}>
                            <span>Title</span>
                            <div style={{ maxWidth: '100%' }}>
                              <JoditEditor
                                value={step.title}
                                config={editorConfig}
                                onChange={(value: string) => updateImplementationStep(index, 'title', value)}
                              />
                            </div>
                          </label>
                          <label className={styles.field}>
                            <span>Description</span>
                            <div style={{ maxWidth: '100%' }}>
                              <JoditEditor
                                value={step.description}
                                config={editorConfig}
                                onChange={(value: string) => updateImplementationStep(index, 'description', value)}
                              />
                            </div>
                          </label>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                          <button type="button" className={styles.iconBtn} onClick={() => moveImplementationStepUp(index)} disabled={index === 0} aria-label="Move up" title="Move up" style={{ opacity: index === 0 ? 0.5 : 1 }}>
                            <IconifyIcon icon="tabler:arrow-up" />
                          </button>
                          <button type="button" className={styles.iconBtn} onClick={() => moveImplementationStepDown(index)} disabled={index === form.implementationSteps.length - 1} aria-label="Move down" title="Move down" style={{ opacity: index === form.implementationSteps.length - 1 ? 0.5 : 1 }}>
                            <IconifyIcon icon="tabler:arrow-down" />
                          </button>
                          <button type="button" className={styles.iconDangerBtn} onClick={() => removeImplementationStep(index)} aria-label="Delete implementation step" title="Delete step">
                            <IconifyIcon icon="tabler:trash" />
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      className={styles.changeImageBtn}
                      onClick={() => set('implementationSteps', [...form.implementationSteps, createImplementationStep(form.implementationSteps.length)])}
                    >
                      <IconifyIcon icon="tabler:plus" />
                      Add Step
                    </button>
                  </>
                )}
                {activeContentTab === 'cards' && (
                  <>
                    <div className={styles.sectionTitle}>
                      <IconifyIcon icon="tabler:cards" />
                      <h4>Cards</h4>
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
                                  onChange={() => { }}
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
                                  onChange={() => { }}
                                />
                              </div>
                            </label>

                          </div>
                        </div>
                      </div>
                    ))}
                    <button type="button" className={styles.changeImageBtn} onClick={() => set('extraCards', [...(form.extraCards || []), createExtraCard()])}>
                      <IconifyIcon icon="tabler:plus" />
                      Add Card
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className={styles.seoBox} style={{ marginTop: '30px' }}>
              <div className={styles.sectionTitle}>
                <IconifyIcon icon="tabler:code" />
                <h4>Schema Markup (Auto Generated)</h4>
              </div>
              <p style={{ marginBottom: '15px', color: '#666', fontSize: '14px' }}>
                This JSON-LD schema will be automatically injected into the solution details page to improve SEO.
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

      {showFeatureImagePickerIndex !== null && (
        <MediaPickerModal
          show={showFeatureImagePickerIndex !== null}
          onClose={() => setShowFeatureImagePickerIndex(null)}
          onSelect={(url) => updateFeatureCard(showFeatureImagePickerIndex, 'image', url)}
        />
      )}
    </div>
  )
}

export default SolutionFormPage

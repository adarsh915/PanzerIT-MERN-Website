'use client'

import PageTitle from '@/components/PageTitle'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, useMemo, type ChangeEvent, type FormEvent } from 'react'
import JoditEditor from '@/components/admin/JoditEditorWrapper'
import { toast } from 'react-toastify'
import { useQueryClient } from '@tanstack/react-query'
import {
  createResource,
  findResource,
  readResourceCategories,
  updateResource,
  type ResourceCategory,
  type ResourceFormData,
} from './resourceStore'
import { toSlug } from '../solutions/solutionHelpers'
import MediaPickerModal from '@/components/admin/MediaPickerModal'
import styles from '../posts/PostFormPage.module.scss'

type Props = {
  mode: 'create' | 'edit'
  resourceId?: string
}

const emptyResource: ResourceFormData = {
  title: '',
  slug: '',
  description: '',
  fileUrl: '',
  fileType: '',
  image: '',
  category: '',
  status: 'active',
  order: 1,
}

const ResourceFormPage = ({ mode, resourceId }: Props) => {
  const router = useRouter()
  const queryClient = useQueryClient()
  const fileUploadRef = useRef<HTMLInputElement | null>(null)
  const [form, setForm] = useState<ResourceFormData>(emptyResource)
  const [categories, setCategories] = useState<ResourceCategory[]>([])
  const [notFound, setNotFound] = useState(false)
  const [showImagePicker, setShowImagePicker] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const editorConfig = useMemo(() => ({
    readonly: false,
    placeholder: '',
    height: 300,
    enableDragAndDropFileToEditor: true,
    uploader: {
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
    }
  }), []);
  useEffect(() => {
    readResourceCategories().then((res) => {
      setCategories(res.filter((category) => category.status === 'active'))
    })
  }, [])

  useEffect(() => {
    if (mode !== 'edit' || !resourceId) return

    findResource(resourceId).then((resource) => {
      if (!resource) {
        setNotFound(true)
        return
      }
      setForm({
        title: resource.title,
        slug: resource.slug,
        description: resource.description || '',
        fileUrl: resource.fileUrl,
        fileType: resource.fileType || '',
        image: resource.image || '',
        category: resource.category || '',
        status: resource.status,
        order: resource.order || 1,
      })
    })
  }, [mode, resourceId])

  const set = <K extends keyof ResourceFormData>(key: K, value: ResourceFormData[K]) => {
    setForm((previous) => ({ ...previous, [key]: value }))
  }

  const handleTitleChange = (title: string) => {
    setForm((previous) => ({
      ...previous,
      title,
      slug: previous.slug ? previous.slug : toSlug(title),
    }))
  }

  const removeImage = () => {
    set('image', '')
  }

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Allow documents
    const allowedExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt']
    const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()
    
    if (!allowedExtensions.includes(fileExt)) {
      toast.error(`Invalid file type. Allowed: ${allowedExtensions.join(', ')}`)
      event.target.value = ''
      return
    }

    if (file.size > 20 * 1024 * 1024) {
      toast.error('File size must be under 20MB')
      event.target.value = ''
      return
    }

    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'resources')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      set('fileUrl', data.url)
      set('fileType', fileExt.replace('.', '').toUpperCase())
      toast.success('File uploaded successfully')
    } catch (error: any) {
      toast.error(error.message || 'File upload failed')
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()

    const title = form.title.trim()
    const slug = toSlug(form.slug || form.title)

    if (!title) {
      toast.error('Title is required')
      return
    }

    if (!slug) {
      toast.error('Slug is required')
      return
    }

    if (!form.fileUrl) {
      toast.error('A file must be uploaded')
      return
    }

    const payload: ResourceFormData = {
      ...form,
      title,
      slug,
      description: form.description?.trim() || '',
      category: form.category?.trim() || '',
      order: Number(form.order) || 1,
    }

    try {
      setSubmitting(true)
      if (mode === 'edit' && resourceId) {
        const res = await updateResource(resourceId, payload)
        if (res && 'success' in res && res.success === false) {
          toast.error(res.message)
          return
        }
        toast.success('Resource updated successfully')
        queryClient.invalidateQueries({ queryKey: ['resources'] })
        router.refresh()
        // Stay on edit page instead of redirecting
      } else {
        const res = await createResource(payload)
        if (res && 'success' in res && res.success === false) {
          toast.error(res.message)
          return
        }
        toast.success('Resource created successfully')
        queryClient.invalidateQueries({ queryKey: ['resources'] })
        router.refresh()
        router.push('/admin/resources')
      }
    } catch (err: any) {
      toast.error(err.message || 'An error occurred while saving to the database.')
    } finally {
      setSubmitting(false)
    }
  }

  const titleText = mode === 'create' ? 'Upload Resource' : 'Edit Resource'

  return (
    <div className={styles.shell}>
      <PageTitle title={titleText} subTitle="Resources" />

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitle}>
            <IconifyIcon icon={mode === 'create' ? 'tabler:circle-plus' : 'tabler:pencil'} />
            <h3>{titleText}</h3>
          </div>
          <div className={styles.headerActions}>
            <Link href="/admin/resources" className={styles.backBtn}>Cancel</Link>
            <button type="submit" form="resourceForm" className={styles.saveBtn} disabled={uploading || submitting}>
              <IconifyIcon icon={submitting ? 'tabler:loader-2' : 'tabler:device-floppy'} />
              {submitting ? 'Saving…' : mode === 'create' ? 'Save Resource' : 'Save Changes'}
            </button>
          </div>
        </div>

        {notFound ? (
          <div className={styles.notFound}>Resource not found.</div>
        ) : (
          <form id="resourceForm" className={styles.form} onSubmit={submit}>
            <label className={styles.field}>
              <span>Title <em>*</em></span>
              <input
                type="text"
                value={form.title}
                onChange={(event) => handleTitleChange(event.target.value)}
                placeholder="Enter resource title (e.g. Q3 Industry Report)"
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
                  placeholder="resource-slug"
                />
              </label>
              <label className={styles.field}>
                <span>Category</span>
                <select value={form.category} onChange={(event) => set('category', event.target.value)}>
                  <option value="">Select category...</option>
                  {(() => {
                    const getCategoryPath = (categoryId: string, visited = new Set<string>()): string => {
                      if (visited.has(categoryId)) return ''
                      visited.add(categoryId)
                      const cat = categories.find(c => c.id === categoryId)
                      if (!cat) return ''
                      if (!cat.parentId) return cat.name
                      const parentPath = getCategoryPath(cat.parentId, visited)
                      return parentPath ? `${parentPath} > ${cat.name}` : cat.name
                    }
                    const sortedCategories = [...categories].sort((a, b) => getCategoryPath(a.id).localeCompare(getCategoryPath(b.id)))
                    return sortedCategories.map((category) => (
                      <option key={category.id} value={category.name}>{getCategoryPath(category.id)}</option>
                    ))
                  })()}
                  {form.category && !categories.some((category) => category.name === form.category) && (
                    <option value={form.category}>{form.category}</option>
                  )}
                </select>
              </label>
            </div>

            <div className={styles.gridTwo}>
              <label className={styles.field}>
                <span>Status</span>
                <select value={form.status} onChange={(event) => set('status', event.target.value as ResourceFormData['status'])}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </label>
              <label className={styles.field}>
                <span>Display Order</span>
                <input
                  type="number"
                  min={1}
                  value={form.order}
                  onChange={(event) => set('order', Number(event.target.value))}
                />
              </label>
            </div>

            <label className={styles.field}>
              <span>Description</span>
              <div className={styles.editorWrap}>
                <JoditEditor
                  value={form.description}
                  config={editorConfig}
                  onBlur={(value: string) => set('description', value)}
                  onChange={() => {}}
                />
              </div>
            </label>

            <div className={styles.field}>
              <span>Resource File (PDF, DOCX, XLSX, etc.) <em>*</em></span>
              <div style={{ border: '2px dashed #ccc', borderRadius: '8px', padding: '2rem', textAlign: 'center', background: '#f8f9fa' }}>
                {uploading ? (
                  <div className="text-primary">
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Uploading file...
                  </div>
                ) : form.fileUrl ? (
                  <div className="d-flex flex-column align-items-center">
                    <IconifyIcon icon="tabler:file-check" className="text-success mb-2" style={{ fontSize: '48px' }} />
                    <strong className="d-block mb-1">File Uploaded Successfully</strong>
                    <span className="text-muted d-block mb-3" style={{ wordBreak: 'break-all', maxWidth: '400px' }}>{form.fileUrl}</span>
                    <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => fileUploadRef.current?.click()}>
                      Replace File
                    </button>
                  </div>
                ) : (
                  <div>
                    <IconifyIcon icon="tabler:upload" className="text-muted mb-2" style={{ fontSize: '48px' }} />
                    <strong className="d-block mb-2">Select a document to upload</strong>
                    <button type="button" className="btn btn-primary" onClick={() => fileUploadRef.current?.click()}>
                      Browse Files
                    </button>
                    <p className="text-muted mt-2 mb-0" style={{ fontSize: '12px' }}>Supported: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT</p>
                  </div>
                )}
                <input
                  type="file"
                  className="d-none"
                  ref={fileUploadRef}
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                />
              </div>
            </div>

            <div className={styles.field}>
              <span>Thumbnail Image (Optional)</span>
              <div className={styles.imageUpload}>
                {form.image ? (
                  <div className={styles.imagePreview}>
                    <img src={form.image} alt={form.title || 'Resource thumbnail'} style={{ objectFit: 'contain' }} />
                    <button type="button" className={styles.removeImageBtn} onClick={removeImage} aria-label="Remove thumbnail">
                      <IconifyIcon icon="tabler:x" />
                    </button>
                  </div>
                ) : (
                  <button type="button" className={styles.uploadPlaceholder} onClick={() => setShowImagePicker(true)}>
                    <IconifyIcon icon="tabler:photo-plus" />
                    <strong>Select thumbnail image</strong>
                    <small>Used as the icon for this resource</small>
                  </button>
                )}
                {form.image && (
                  <button type="button" className={styles.changeImageBtn} onClick={() => setShowImagePicker(true)}>
                    <IconifyIcon icon="tabler:upload" />
                    Change Thumbnail
                  </button>
                )}
              </div>
            </div>

            {form.image && (
              <div className={styles.seoBox} style={{ marginTop: '10px', marginBottom: '20px' }}>
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
              </div>
            )}

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
    </div>
  )
}

export default ResourceFormPage

'use client'

import PageTitle from '@/components/PageTitle'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent, useMemo } from 'react'
import JoditEditor from '@/components/admin/JoditEditorWrapper'
import { toast } from 'react-toastify'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createPost,
  findPost,
  readCategories,
  updatePost,
  type BlogPostFormData,
} from './blogStore'
import { emptyBlogPost, toFormData, toSlug } from './blogHelpers'
import MediaPickerModal from '@/components/admin/MediaPickerModal'
import styles from './PostFormPage.module.scss'

type Props = {
  mode: 'create' | 'edit'
  postId?: string
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

const toDateLocal = (value?: string) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const offset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - offset).toISOString().slice(0, 10)
}

const fromDateLocal = (value: string) => {
  if (!value) return ''
  return new Date(value).toISOString()
}

const PostFormPage = ({ mode, postId }: Props) => {
  const router = useRouter()
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [form, setForm] = useState<BlogPostFormData>(emptyBlogPost)
  const [tagsInput, setTagsInput] = useState('')
  const [notFound, setNotFound] = useState(false)
  const [showImagePicker, setShowImagePicker] = useState(false)
  const [showBreadcrumbImagePicker, setShowBreadcrumbImagePicker] = useState(false)

  const editorConfig = useMemo(() => ({
    readonly: false,
    placeholder: '',
    height: 500,
    enableDragAndDropFileToEditor: true,
    uploader: {
      insertImageAsBase64URI: false,
      filesVariableName: (t?: number) => 'file',
      url: '/api/upload',
      format: 'json',
      method: 'POST',
      prepareData(data: FormData) {
        data.append('folder', 'media');
        return data;
      },
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

  // Fetch categories with React Query caching (cached across all form pages)
  const { data: categoriesData = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['blog-categories'],
    queryFn: readCategories,
    staleTime: 30 * 60 * 1000, // Cache categories for 30 minutes
    select: (data) => data.filter((category) => category.status === 'active'),
  })

  const categories = categoriesData

  useEffect(() => {
    if (mode !== 'edit' || !postId) return
    findPost(postId).then((post) => {
      if (!post) {
        setNotFound(true)
        return
      }
      setForm(toFormData(post))
      setTagsInput(post.tags?.join(', ') || '')
    })
  }, [mode, postId])

  const set = <K extends keyof BlogPostFormData>(key: K, value: BlogPostFormData[K]) => {
    setForm((previous) => ({ ...previous, [key]: value }))
  }

  const handleTitleChange = (title: string) => {
    setForm((previous) => ({
      ...previous,
      title,
      slug: previous.slug ? previous.slug : toSlug(title),
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
    formData.append('folder', 'posts')
    
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

  const removeBreadcrumbImage = () => {
    set('breadcrumbImage', '')
    set('breadcrumbImageAlt', '')
    set('breadcrumbImageTitle', '')
    set('breadcrumbImageCaption', '')
    set('breadcrumbImageDescription', '')
  }

  const handleTagsChange = (value: string) => {
    setTagsInput(value)
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.panzerit.com';

  const generatedSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": form.metaTitle || form.title || "",
    "description": form.metaDescription || (form.description || '').replace(/<[^>]*>?/gm, ''),
    "image": form.image ? [form.image] : [],
    "datePublished": form.publishedAt || new Date().toISOString(),
    "dateModified": form.publishedAt || new Date().toISOString(),
    "author": {
      "@type": "Organization",
      "name": "Panzer IT"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Panzer IT",
      "logo": {
        "@type": "ImageObject",
        "url": `${siteUrl}/assets/images/logo/logo.png`
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${siteUrl}/blog/${form.slug || 'slug'}`
    }
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault()

    const title = form.title.trim()
    const slug = toSlug(form.slug || form.title)
    const description = form.description.trim()

    if (!title) {
      toast.error('Post title is required')
      return
    }

    if (!slug) {
      toast.error('Post slug is required')
      return
    }

    if (!stripHtml(description)) {
      toast.error('Description is required')
      return
    }

    const payload: BlogPostFormData = {
      ...form,
      title,
      slug,
      description,
      tags: tagsInput.split(',').map((tag) => tag.trim()).filter(Boolean),
      imageAlt: form.image ? (form.imageAlt.trim() || title) : '',
      metaTitle: form.metaTitle.trim() || title,
      metaDescription: form.metaDescription.trim(),
      metaKeywords: form.metaKeywords.trim(),
      publishedAt: form.status === 'published' ? form.publishedAt || new Date().toISOString() : '',
      breadcrumbDescription: form.breadcrumbDescription?.trim() || '',
      breadcrumbImage: form.breadcrumbImage || '',
      breadcrumbImageAlt: form.breadcrumbImageAlt?.trim() || '',
      breadcrumbImageTitle: form.breadcrumbImageTitle?.trim() || '',
      breadcrumbImageCaption: form.breadcrumbImageCaption?.trim() || '',
      breadcrumbImageDescription: form.breadcrumbImageDescription?.trim() || '',
    }

    try {
      if (mode === 'edit' && postId) {
        const res = await updatePost(postId, payload)
        if (res && 'success' in res && res.success === false) {
          toast.error(res.message)
          return
        }
        toast.success('Blog post updated successfully')
        queryClient.invalidateQueries({ queryKey: ['posts'] })
        router.refresh()
        // Stay on edit page instead of redirecting
      } else {
        const res = await createPost(payload)
        if (res && 'success' in res && res.success === false) {
          toast.error(res.message)
          return
        }
        toast.success('Blog post created successfully')
        queryClient.invalidateQueries({ queryKey: ['posts'] })
        router.refresh()
        router.push('/admin/posts')
      }
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'An error occurred while saving.')
    }
  }

  const title = mode === 'create' ? 'Add Blog Post' : 'Edit Blog Post'

  return (
    <div className={styles.shell}>
      <PageTitle title={title} subTitle="Blog Posts" />

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitle}>
            <IconifyIcon icon={mode === 'create' ? 'tabler:circle-plus' : 'tabler:pencil'} />
            <h3>{title}</h3>
          </div>
          <div className={styles.headerActions}>
            <Link href="/admin/posts" className={styles.backBtn}>Cancel</Link>
            <button type="submit" form="postForm" className={styles.saveBtn}>
              <IconifyIcon icon="tabler:device-floppy" />
              {mode === 'create' ? 'Create Post' : 'Save Changes'}
            </button>
          </div>
        </div>

        {notFound ? (
          <div className={styles.notFound}>Blog post not found.</div>
        ) : (
          <form id="postForm" className={styles.form} onSubmit={submit}>
            <label className={styles.field}>
              <span>Title <em>*</em></span>
              <input
                type="text"
                value={form.title}
                onChange={(event) => handleTitleChange(event.target.value)}
                placeholder="Enter blog post title"
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
                  placeholder="blog-post-slug"
                />
              </label>
              <label className={styles.field}>
                <span>Status</span>
                <select value={form.status} onChange={(event) => set('status', event.target.value as BlogPostFormData['status'])}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </label>

              <label className={styles.field}>
                <span>Publish Date</span>
                <input
                  type="date"
                  value={toDateLocal(form.publishedAt)}
                  onChange={(event) => set('publishedAt', fromDateLocal(event.target.value))}
                  onClick={(e) => {
                    try {
                      if ('showPicker' in HTMLInputElement.prototype) {
                        (e.target as HTMLInputElement).showPicker();
                      }
                    } catch (err) {}
                  }}
                />
              </label>
            </div>

            <div className={styles.gridTwo}>
              <label className={styles.field}>
                <span>Category</span>
                <select 
                  value={form.categoryId} 
                  onChange={(event) => set('categoryId', event.target.value)}
                  disabled={categoriesLoading}
                >
                  <option value="">{categoriesLoading ? 'Loading categories...' : 'Select category'}</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </label>
              <label className={styles.field}>
                <span>Tags</span>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(event) => handleTagsChange(event.target.value)}
                  placeholder="security, backup, cloud"
                />
              </label>
            </div>

            <label className={styles.field}>
              <span>Author</span>
              <input
                type="text"
                value={form.author}
                onChange={(event) => set('author', event.target.value)}
                placeholder="Author name"
              />
            </label>

            <label className={styles.field}>
              <span>Author Bio</span>
              <div className={styles.editorWrap}>
                <JoditEditor
                  value={form.authorBio}
                  config={{ ...editorConfig, height: 250 }}
                  onBlur={(newContent: string) => set('authorBio', newContent)}
                  onChange={() => {}}
                />
              </div>
            </label>

            <div className={styles.field}>
              <span>Blog Image</span>
              <div className={styles.imageUpload}>
                {form.image ? (
                  <div className={styles.imagePreview}>
                    <img src={form.image} alt={form.imageAlt || form.title || 'Blog image'} />
                    <button
                      type="button"
                      className={styles.removeImageBtn}
                      onClick={removeImage}
                      aria-label="Remove blog image"
                      title="Remove image"
                    >
                    <IconifyIcon icon="tabler:x" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className={styles.uploadPlaceholder}
                    onClick={() => setShowImagePicker(true)}
                  >
                    <IconifyIcon icon="tabler:photo-plus" />
                    <strong>Upload or select blog image</strong>
                    <small>PNG, JPG, WEBP, or GIF</small>
                  </button>
                )}
                {form.image && (
                  <button
                    type="button"
                    className={styles.changeImageBtn}
                    onClick={() => setShowImagePicker(true)}
                  >
                    <IconifyIcon icon="tabler:upload" />
                    Change Image
                  </button>
                )}
              </div>
            </div>

            {/* Featured Post Section - Full Width Row */}
            <div style={{ 
              marginTop: '20px',
              marginBottom: '20px'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px', 
                padding: '14px 18px',
                background: 'var(--surface-color)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onClick={() => set('featured', !form.featured)}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary-color)'
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(var(--primary-rgb), 0.1)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color)'
                e.currentTarget.style.boxShadow = 'none'
              }}
              >
                <input
                  type="checkbox"
                  id="featured"
                  checked={form.featured || false}
                  onChange={(e) => set('featured', e.target.checked)}
                  onClick={(e) => e.stopPropagation()}
                  style={{ 
                    width: '18px', 
                    height: '18px', 
                    cursor: 'pointer',
                    accentColor: 'var(--primary-color)',
                    flexShrink: 0
                  }}
                />
                <label htmlFor="featured" style={{ 
                  margin: 0, 
                  cursor: 'pointer', 
                  fontWeight: 600, 
                  color: 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px'
                }}>
                  <i className="fas fa-star" style={{ 
                    color: form.featured ? '#FFB648' : '#cbd5e1',
                    fontSize: '16px'
                  }}></i>
                  Feature this blog post on the Homepage
                </label>
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
                    placeholder="Describe the blog image"
                  />
                </label>
              </div>
            )}

            <div className={styles.seoBox}>
              <div className={styles.sectionTitle}>
                <IconifyIcon icon="tabler:seo" />
                <h4>SEO</h4>
              </div>
              <label className={styles.field}>
                <span>Meta Title</span>
                <input
                  type="text"
                  value={form.metaTitle}
                  onChange={(event) => set('metaTitle', event.target.value)}
                  placeholder="SEO title for search results"
                />
              </label>
              <label className={styles.field}>
                <span>Meta Description</span>
                <textarea
                  rows={3}
                  value={form.metaDescription}
                  onChange={(event) => set('metaDescription', event.target.value)}
                  placeholder="Short SEO description"
                />
              </label>
              <label className={styles.field}>
                <span>Meta Keywords</span>
                <input
                  type="text"
                  value={form.metaKeywords}
                  onChange={(event) => set('metaKeywords', event.target.value)}
                  placeholder="keyword one, keyword two, keyword three"
                />
              </label>
            </div>

            <label className={styles.field}>
              <span>Description <em>*</em></span>
              <div className={styles.editorWrap}>
                <JoditEditor
                  value={form.description}
                  config={editorConfig}
                  onBlur={(newContent: string) => set('description', newContent)}
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
                    config={{ ...editorConfig, height: 200 }}
                    onBlur={(value: string) => set('breadcrumbDescription', value)}
                    onChange={() => {}}
                  />
                </div>
              </label>
            </div>

            <div className={styles.seoBox} style={{ marginTop: '30px' }}>
              <div className={styles.sectionTitle}>
                <IconifyIcon icon="tabler:code" />
                <h4>Schema Markup (Auto Generated)</h4>
              </div>
              <p style={{ marginBottom: '15px', color: '#666', fontSize: '14px' }}>
                This JSON-LD schema will be automatically injected into the blog details page to improve SEO.
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

export default PostFormPage

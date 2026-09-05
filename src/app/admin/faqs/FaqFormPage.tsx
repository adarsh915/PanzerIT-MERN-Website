'use client'

import PageTitle from '@/components/PageTitle'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useMemo, type FormEvent } from 'react'
import JoditEditor from '@/components/admin/JoditEditorWrapper'
import { toast } from 'react-toastify'
import { useQueryClient } from '@tanstack/react-query'
import { createFaq, findFaq, updateFaq } from './faqStore'
import { readSolutions } from '../solutions/solutionStore'
import { readBrands } from '../brands/brandStore'
import { toSlug } from '../solutions/solutionHelpers'
import type { FaqFormData } from './faqTypes'
import styles from '../posts/PostFormPage.module.scss'

type Props = {
  mode: 'create' | 'edit'
  faqId?: string
}

const emptyFaq: FaqFormData = {
  question: '',
  answer: '',
  slug: '',
  order: 1,
  status: 'active',
  pageKey: '',
  metaTitle: '',
  metaDescription: '',
  metaKeywords: '',
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

const FaqFormPage = ({ mode, faqId }: Props) => {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [form, setForm] = useState<FaqFormData>(emptyFaq)
  const [notFound, setNotFound] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [solutionsList, setSolutionsList] = useState<{name: string, slug: string}[]>([])
  const [brandsList, setBrandsList] = useState<{name: string, slug: string}[]>([])

  const editorConfig = useMemo(() => ({
    readonly: false,
    placeholder: '',
    height: 350,
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
    Promise.all([readSolutions(), readBrands()]).then(([sols, brnds]) => {
      setSolutionsList(sols.map(s => ({ name: s.title, slug: s.slug })))
      setBrandsList(brnds.map(b => ({ name: b.name, slug: b.slug })))
    }).catch(console.error)
  }, [])

  useEffect(() => {
    if (mode !== 'edit' || !faqId) return

    findFaq(faqId).then((faq) => {
      if (!faq) {
        setNotFound(true)
        return
      }
      setForm({
        question: faq.question,
        answer: faq.answer,
        slug: faq.slug,
        order: faq.order,
        status: faq.status,
        pageKey: faq.pageKey || 'global',
        metaTitle: faq.metaTitle,
        metaDescription: faq.metaDescription,
        metaKeywords: faq.metaKeywords,
      })
    })
  }, [mode, faqId])

  const set = <K extends keyof FaqFormData>(key: K, value: FaqFormData[K]) => {
    setForm((previous) => ({ ...previous, [key]: value }))
  }

  const handleQuestionChange = (question: string) => {
    setForm((previous) => ({
      ...previous,
      question,
      slug: previous.slug ? previous.slug : toSlug(question),
      metaTitle: previous.metaTitle ? previous.metaTitle : question,
    }))
  }

  const handleAnswerChange = (answer: string) => {
    const plainText = stripHtml(answer)
    setForm((previous) => ({
      ...previous,
      answer,
      metaDescription: previous.metaDescription ? previous.metaDescription : plainText.slice(0, 160),
    }))
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()

    const question = form.question.trim()
    const answer = form.answer.trim()
    const slug = toSlug(form.slug || form.question)

    if (!question) {
      toast.error('Question is required')
      return
    }

    if (!stripHtml(answer)) {
      toast.error('Answer is required')
      return
    }

    if (!slug) {
      toast.error('Slug is required')
      return
    }

    if (!form.pageKey) {
      toast.error('Please assign this FAQ to a Solution or Brand')
      return
    }

    const payload: FaqFormData = {
      ...form,
      question,
      answer,
      slug,
      order: Number(form.order) || 1,
      pageKey: form.pageKey.trim(),
      metaTitle: form.metaTitle?.trim() || question.slice(0, 60),
      metaDescription: form.metaDescription?.trim() || stripHtml(answer).slice(0, 160),
      metaKeywords: form.metaKeywords?.trim() || '',
    }

    try {
      setSubmitting(true)
      if (mode === 'edit' && faqId) {
        await updateFaq(faqId, payload)
        toast.success('FAQ updated successfully')
        queryClient.invalidateQueries({ queryKey: ['faqs'] })
        router.refresh()
        // Stay on edit page instead of redirecting
      } else {
        await createFaq(payload)
        toast.success('FAQ created successfully')
        queryClient.invalidateQueries({ queryKey: ['faqs'] })
        router.refresh()
        router.push('/admin/faqs')
      }
    } catch (err: any) {
      toast.error(err.message || 'An error occurred while saving to the database.')
    } finally {
      setSubmitting(false)
    }
  }

  const title = mode === 'create' ? 'Add FAQ' : 'Edit FAQ'

  const generatedSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": form.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": form.answer
        }
      }
    ]
  };

  return (
    <div className={styles.shell}>
      <PageTitle title={title} subTitle="FAQs Management" />

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitle}>
            <IconifyIcon icon={mode === 'create' ? 'tabler:circle-plus' : 'tabler:pencil'} />
            <h3>{title}</h3>
          </div>
          <div className={styles.headerActions}>
            <Link href="/admin/faqs" className={styles.backBtn}>Cancel</Link>
            <button type="submit" form="faqForm" className={styles.saveBtn} disabled={submitting}>
              <IconifyIcon icon={submitting ? 'tabler:loader-2' : 'tabler:device-floppy'} />
              {submitting ? 'Saving…' : mode === 'create' ? 'Create FAQ' : 'Save Changes'}
            </button>
          </div>
        </div>

        {notFound ? (
          <div className={styles.notFound}>FAQ not found.</div>
        ) : (
          <form id="faqForm" className={styles.form} onSubmit={submit}>
            
            <div className={styles.sectionTitle}>
              <IconifyIcon icon="tabler:info-circle" />
              <h4>Basic Information</h4>
            </div>

            <label className={styles.field}>
              <span>Question <em>*</em></span>
              <div className={styles.editorWrap}>
                <JoditEditor
                  value={form.question}
                  config={editorConfig}
                  onBlur={(value: string) => handleQuestionChange(value)}
                  onChange={() => {}}
                />
              </div>
            </label>

            <label className={styles.field}>
              <span>Answer <em>*</em></span>
              <div className={styles.editorWrap}>
                <JoditEditor
                  value={form.answer}
                  config={editorConfig}
                  onBlur={(value: string) => handleAnswerChange(value)}
                  onChange={() => {}}
                />
              </div>
            </label>

            <div className={styles.grid}>
              <label className={styles.field}>
                <span>Order / Position</span>
                <input
                  type="number"
                  min={1}
                  value={form.order}
                  onChange={(event) => set('order', Number(event.target.value))}
                />
              </label>
              <label className={styles.field}>
                <span>Status</span>
                <select value={form.status} onChange={(event) => set('status', event.target.value as FaqFormData['status'])}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </label>
            </div>

            <div className={styles.field}>
              <span>Assign to Page (Select where this FAQ appears)</span>
              <div style={{ display: 'grid', gap: '15px', padding: '15px', border: '1px solid #e2e8f0', borderRadius: '8px', maxHeight: '300px', overflowY: 'auto', background: '#f8fafc' }}>
                {solutionsList.length > 0 && (
                  <div>
                    <strong style={{ display: 'block', marginBottom: '8px', color: '#1e293b', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px' }}>Solutions & Services</strong>
                    {solutionsList.map(sol => {
                      const val = `solution-${sol.slug}`;
                      const selected = (form.pageKey || '').split(',').filter(Boolean).includes(val);
                      return (
                        <label key={val} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', cursor: 'pointer', fontSize: '14px', color: '#334155' }}>
                          <input 
                            type="checkbox" 
                            checked={selected}
                            style={{ width: 'auto', margin: 0, padding: 0 }}
                            onChange={(e) => {
                              const current = (form.pageKey || '').split(',').filter(Boolean);
                              if (e.target.checked) {
                                current.push(val);
                              } else {
                                const idx = current.indexOf(val);
                                if (idx > -1) current.splice(idx, 1);
                              }
                              set('pageKey', current.join(','));
                            }}
                          />
                          Solution: {sol.name}
                        </label>
                      )
                    })}
                  </div>
                )}

                {brandsList.length > 0 && (
                  <div>
                    <strong style={{ display: 'block', marginBottom: '8px', color: '#1e293b', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px' }}>Brands & Partners</strong>
                    {brandsList.map(brand => {
                      const val = `brand-${brand.slug}`;
                      const selected = (form.pageKey || '').split(',').filter(Boolean).includes(val);
                      return (
                        <label key={val} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', cursor: 'pointer', fontSize: '14px', color: '#334155' }}>
                          <input 
                            type="checkbox" 
                            checked={selected}
                            style={{ width: 'auto', margin: 0, padding: 0 }}
                            onChange={(e) => {
                              const current = (form.pageKey || '').split(',').filter(Boolean);
                              if (e.target.checked) {
                                current.push(val);
                              } else {
                                const idx = current.indexOf(val);
                                if (idx > -1) current.splice(idx, 1);
                              }
                              set('pageKey', current.join(','));
                            }}
                          />
                          Brand: {brand.name}
                        </label>
                      )
                    })}
                  </div>
                )}
                {(!form.pageKey || form.pageKey.trim() === '') && (
                   <span style={{ fontSize: '12px', color: '#ef4444' }}>Please select at least one page.</span>
                )}
              </div>
            </div>

            <div className={styles.seoBox}>
              <div className={styles.sectionTitle}>
                <IconifyIcon icon="tabler:seo" />
                <h4>SEO Settings</h4>
              </div>
              <label className={styles.field}>
                <span>Meta Title (max 60)</span>
                <input value={form.metaTitle} onChange={(event) => set('metaTitle', event.target.value)} placeholder="SEO title" maxLength={60} />
              </label>
              <label className={styles.field}>
                <span>Meta Description (max 160)</span>
                <textarea rows={3} value={form.metaDescription} onChange={(event) => set('metaDescription', event.target.value)} maxLength={160} />
              </label>
              <label className={styles.field}>
                <span>Slug <em>*</em> (auto-generated from question)</span>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(event) => set('slug', toSlug(event.target.value))}
                  placeholder="faq-slug"
                />
              </label>
              <label className={styles.field}>
                <span>Meta Keywords</span>
                <input value={form.metaKeywords} onChange={(event) => set('metaKeywords', event.target.value)} placeholder="keyword one, keyword two" />
              </label>
            </div>

            <div className={styles.seoBox} style={{ backgroundColor: '#f8f9fa' }}>
              <div className={styles.sectionTitle}>
                <IconifyIcon icon="tabler:code" />
                <h4>Schema Markup (Auto Generated)</h4>
              </div>
              <p style={{ fontSize: '13px', color: '#666', marginBottom: '10px' }}>
                This JSON-LD schema will be automatically injected into the page head to improve SEO.
              </p>
              <pre style={{ 
                background: '#2d2d2d', 
                color: '#ccc', 
                padding: '15px', 
                borderRadius: '6px',
                fontSize: '13px',
                overflowX: 'auto',
                whiteSpace: 'pre-wrap'
              }}>
                {JSON.stringify(generatedSchema, null, 2)}
              </pre>
            </div>

          </form>
        )}
      </div>
    </div>
  )
}

export default FaqFormPage

'use client'

import PageTitle from '@/components/PageTitle'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import clsx from 'clsx'
import Link from 'next/link'
import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { toast } from 'react-toastify'
import {
  createQuestionnaire,
  deleteQuestionnaire,
  readQuestionnaires,
  updateQuestionnaire,
  type Questionnaire,
  type QuestionnaireFormData,
} from './questionnaireStore'
import tableStyles from '../../solutions/SolutionsPanel.module.scss'
import formStyles from '../../posts/PostFormPage.module.scss'
import { confirmDeleteWithName } from '@/utils/confirmDelete'

const PAGE_SIZES = [5, 10, 25, 50]

const formatDate = (value?: string) => {
  if (!value) return '-'
  return new Intl.DateTimeFormat('en', { month: 'short', day: '2-digit', year: 'numeric' }).format(new Date(value))
}

type SortKey = 'name' | 'status' | 'createdAt'

const emptyForm: QuestionnaireFormData = {
  name: '',
  description: '',
  templateFileUrl: '',
  templateFilename: '',
  departmentOptions: [],
  status: 'active',
}

const QuestionnairePanel = () => {
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([])
  const [form, setForm] = useState<QuestionnaireFormData>(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sortKey, setSortKey] = useState<SortKey>('createdAt')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [uploading, setUploading] = useState(false)
  const [deptInput, setDeptInput] = useState('')
  const fileRef = useRef<HTMLInputElement | null>(null)

  const load = async () => setQuestionnaires(await readQuestionnaires())

  useEffect(() => { load() }, [])

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim()
    return questionnaires
      .filter(q => !query || q.name.toLowerCase().includes(query) || q.status.toLowerCase().includes(query))
      .sort((a, b) => {
        const va = String(a[sortKey] ?? ''), vb = String(b[sortKey] ?? '')
        return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va)
      })
  }, [questionnaires, search, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  const set = <K extends keyof QuestionnaireFormData>(key: K, value: QuestionnaireFormData[K]) =>
    setForm(prev => ({ ...prev, [key]: value }))

  const resetForm = () => {
    setForm(emptyForm)
    setEditingId(null)
    setDeptInput('')
  }

  const handleTemplateUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const allowed = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt']
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()
    if (!allowed.includes(ext)) { toast.error('Unsupported file type'); e.target.value = ''; return }

    try {
      setUploading(true)
      const fd = new FormData()
      fd.append('file', file)
      fd.append('folder', 'questionnaires')
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')
      set('templateFileUrl', data.url)
      set('templateFilename', file.name)
      toast.success('Template uploaded')
    } catch (err: any) {
      toast.error(err.message || 'Upload failed')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const addDept = () => {
    const val = deptInput.trim()
    if (!val) return
    const current = form.departmentOptions || []
    if (!current.includes(val)) set('departmentOptions', [...current, val])
    setDeptInput('')
  }

  const removeDept = (dept: string) =>
    set('departmentOptions', (form.departmentOptions || []).filter(d => d !== dept))

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('Name is required'); return }
    try {
      if (editingId) {
        await updateQuestionnaire(editingId, form)
        toast.success('Questionnaire updated')
      } else {
        await createQuestionnaire(form)
        toast.success('Questionnaire created')
      }
      resetForm()
      await load()
    } catch { toast.error('Failed to save') }
  }

  const edit = (q: Questionnaire) => {
    setEditingId(q.id)
    setForm({ name: q.name, description: q.description, templateFileUrl: q.templateFileUrl, templateFilename: q.templateFilename, departmentOptions: q.departmentOptions, status: q.status })
    setDeptInput('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const remove = async (q: Questionnaire) => {
    if (!(await confirmDeleteWithName(`Delete "${q.name}"?`))) return
    await deleteQuestionnaire(q.id)
    toast.success('Questionnaire deleted')
    await load()
  }

  const SortIcon = ({ col }: { col: SortKey }) => (
    <span className={tableStyles.sortIcon}>
      <IconifyIcon icon={sortKey === col ? (sortDir === 'asc' ? 'tabler:chevron-up' : 'tabler:chevron-down') : 'tabler:selector'} />
    </span>
  )

  return (
    <>
      <PageTitle title="Questionnaires" subTitle="Resources" />

      {/* ── Form Card ── */}
      <div className={tableStyles.card} style={{ marginBottom: '1.5rem' }}>
        <div className={tableStyles.cardHeader}>
          <div className={tableStyles.cardHeaderLeft}>
            <IconifyIcon icon={editingId ? 'tabler:pencil' : 'tabler:plus'} />
            <h3>{editingId ? 'Edit Questionnaire' : 'Add New Questionnaire'}</h3>
          </div>
          <div className={tableStyles.headerActions}>
            <Link href="/admin/resources" className={formStyles.backBtn}>
              <IconifyIcon icon="tabler:arrow-left" />
              Back to Resources
            </Link>
            <Link href="/admin/resources/submissions" className={formStyles.backBtn}>
              <IconifyIcon icon="tabler:inbox" />
              Submissions
            </Link>
          </div>
        </div>

        <form onSubmit={submit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
                Questionnaire Name *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={e => set('name', e.target.value)}
                placeholder="e.g. Security Assessment"
                style={{ width: '100%', padding: '9px 12px', border: '1px solid #e2e8f0', borderRadius: '7px', fontSize: '14px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
                Status
              </label>
              <select
                value={form.status}
                onChange={e => set('status', e.target.value as 'active' | 'inactive')}
                style={{ width: '100%', padding: '9px 12px', border: '1px solid #e2e8f0', borderRadius: '7px', fontSize: '14px' }}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
              Description (shown to user)
            </label>
            <textarea
              value={form.description}
              onChange={e => set('description', e.target.value)}
              rows={3}
              placeholder="Brief description of what this questionnaire is for..."
              style={{ width: '100%', padding: '9px 12px', border: '1px solid #e2e8f0', borderRadius: '7px', fontSize: '14px', resize: 'vertical' }}
            />
          </div>

          {/* Template File Upload */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
              Template File (downloadable by user)
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', border: '1px dashed #cbd5e1', borderRadius: '8px', background: '#f8fafc' }}>
              {form.templateFileUrl ? (
                <>
                  <IconifyIcon icon="tabler:file-check" style={{ fontSize: '32px', color: '#16a34a' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '14px' }}>{form.templateFilename || 'Template uploaded'}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{form.templateFileUrl}</div>
                  </div>
                  <button type="button" onClick={() => fileRef.current?.click()} style={{ padding: '6px 14px', border: '1px solid #2563eb', borderRadius: '6px', color: '#2563eb', background: '#fff', fontSize: '13px', cursor: 'pointer' }}>
                    Replace
                  </button>
                  <button type="button" onClick={() => { set('templateFileUrl', ''); set('templateFilename', '') }} style={{ padding: '6px 14px', border: '1px solid #ef4444', borderRadius: '6px', color: '#ef4444', background: '#fff', fontSize: '13px', cursor: 'pointer' }}>
                    Remove
                  </button>
                </>
              ) : (
                <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} style={{ padding: '8px 20px', border: 'none', borderRadius: '6px', background: '#2563eb', color: '#fff', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <IconifyIcon icon={uploading ? 'tabler:loader-2' : 'tabler:upload'} />
                  {uploading ? 'Uploading...' : 'Upload Template File'}
                </button>
              )}
              <input ref={fileRef} type="file" className="d-none" onChange={handleTemplateUpload} accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt" />
            </div>
          </div>

          {/* Department Options */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
              Department / Team Options
            </label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
              <input
                type="text"
                value={deptInput}
                onChange={e => setDeptInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addDept() } }}
                placeholder="e.g. IT, Finance, HR..."
                style={{ flex: 1, padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '7px', fontSize: '14px' }}
              />
              <button type="button" onClick={addDept} style={{ padding: '8px 16px', border: 'none', background: '#2563eb', color: '#fff', borderRadius: '7px', cursor: 'pointer', fontSize: '14px' }}>
                Add
              </button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {(form.departmentOptions || []).map(dept => (
                <span key={dept} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', background: '#eff6ff', color: '#2563eb', borderRadius: '999px', fontSize: '13px', fontWeight: 500 }}>
                  {dept}
                  <button type="button" onClick={() => removeDept(dept)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2563eb', padding: 0, display: 'flex' }}>
                    <IconifyIcon icon="tabler:x" style={{ fontSize: '14px' }} />
                  </button>
                </span>
              ))}
              {(form.departmentOptions || []).length === 0 && (
                <span style={{ fontSize: '13px', color: '#94a3b8' }}>No departments added yet</span>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', paddingTop: '0.5rem' }}>
            <button type="submit" style={{ padding: '10px 24px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IconifyIcon icon="tabler:device-floppy" />
              {editingId ? 'Update Questionnaire' : 'Save Questionnaire'}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} style={{ padding: '10px 20px', background: '#fff', color: '#374151', border: '1px solid #e2e8f0', borderRadius: '8px', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* ── Datatable ── */}
      <div className={tableStyles.card}>
        <div className={tableStyles.cardHeader}>
          <div className={tableStyles.cardHeaderLeft}>
            <IconifyIcon icon="tabler:clipboard-list" />
            <h3>All Questionnaires</h3>
            <span className={tableStyles.totalBadge}>{questionnaires.length}</span>
          </div>
        </div>

        <div className={tableStyles.tableControls}>
          <div className={tableStyles.pageSizeWrap}>
            <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1) }}>
              {PAGE_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <span>entries per page</span>
          </div>
          <div className={tableStyles.searchWrap}>
            <span>Search:</span>
            <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
          </div>
        </div>

        <div className={tableStyles.tableWrap}>
          <table className={tableStyles.table}>
            <thead>
              <tr>
                <th>#</th>
                <th className={tableStyles.thSort} onClick={() => handleSort('name')}>Name <SortIcon col="name" /></th>
                <th>Description</th>
                <th>Template</th>
                <th>Departments</th>
                <th className={tableStyles.thSort} onClick={() => handleSort('status')}>Status <SortIcon col="status" /></th>
                <th className={tableStyles.thSort} onClick={() => handleSort('createdAt')}>Created <SortIcon col="createdAt" /></th>
                <th className={tableStyles.thCenter}>Action</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length > 0 ? paginated.map((q, idx) => (
                <tr key={q.id}>
                  <td className={tableStyles.tdNum}>{(page - 1) * pageSize + idx + 1}</td>
                  <td><span className={tableStyles.tdName}>{q.name}</span></td>
                  <td style={{ maxWidth: 200 }}><span style={{ fontSize: '13px', color: '#64748b', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{q.description || '-'}</span></td>
                  <td>
                    {q.templateFileUrl ? (
                      <a href={q.templateFileUrl} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#2563eb', textDecoration: 'none' }}>
                        <IconifyIcon icon="tabler:file-download" />
                        {q.templateFilename || 'Download'}
                      </a>
                    ) : <span style={{ color: '#94a3b8', fontSize: '13px' }}>None</span>}
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {q.departmentOptions.length > 0
                        ? q.departmentOptions.slice(0, 3).map(d => (
                          <span key={d} style={{ padding: '2px 8px', background: '#f1f5f9', borderRadius: '999px', fontSize: '12px', color: '#475569' }}>{d}</span>
                        ))
                        : <span style={{ color: '#94a3b8', fontSize: '13px' }}>None</span>}
                      {q.departmentOptions.length > 3 && <span style={{ padding: '2px 8px', background: '#f1f5f9', borderRadius: '999px', fontSize: '12px', color: '#475569' }}>+{q.departmentOptions.length - 3}</span>}
                    </div>
                  </td>
                  <td>
                    <span style={{ display: 'inline-flex', padding: '3px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 600, background: q.status === 'active' ? '#f0fdf4' : '#f1f5f9', color: q.status === 'active' ? '#16a34a' : '#64748b' }}>
                      {q.status}
                    </span>
                  </td>
                  <td>{formatDate(q.createdAt)}</td>
                  <td>
                    <div className={tableStyles.actions}>
                      <button type="button" className={tableStyles.btnEdit} onClick={() => edit(q)} title="Edit">
                        <IconifyIcon icon="tabler:pencil" />
                      </button>
                      <button type="button" className={tableStyles.btnDelete} onClick={() => remove(q)} title="Delete">
                        <IconifyIcon icon="tabler:trash" />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={8} className={tableStyles.emptyRow}>
                    <IconifyIcon icon="tabler:clipboard-off" />
                    <span>No questionnaires found</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className={tableStyles.pagination}>
          <span className={tableStyles.pageInfo}>
            {filtered.length === 0 ? 'No entries' : `Showing ${(page - 1) * pageSize + 1} to ${Math.min(page * pageSize, filtered.length)} of ${filtered.length} entries`}
          </span>
          <div className={tableStyles.pageBtns}>
            <button type="button" onClick={() => setPage(1)} disabled={page === 1}>First</button>
            <button type="button" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Prev</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
              <button key={n} type="button" className={clsx(page === n && tableStyles.pageNumActive)} onClick={() => setPage(n)}>{n}</button>
            ))}
            <button type="button" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</button>
            <button type="button" onClick={() => setPage(totalPages)} disabled={page === totalPages}>Last</button>
          </div>
        </div>
      </div>
    </>
  )
}

export default QuestionnairePanel

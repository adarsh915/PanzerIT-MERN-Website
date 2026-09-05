'use client'

import PageTitle from '@/components/PageTitle'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import clsx from 'clsx'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import {
  deleteSubmission,
  markAllSubmissionsRead,
  markSubmissionRead,
  readSubmissions,
  type FormSubmission,
} from '../questionnaires/questionnaireStore'
import { confirmDeleteWithName } from '@/utils/confirmDelete'
import tableStyles from '../../solutions/SolutionsPanel.module.scss'

const PAGE_SIZES = [10, 25, 50, 100]

const formatDate = (value?: string) => {
  if (!value) return '-'
  return new Intl.DateTimeFormat('en', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(value))
}

type SortKey = 'firstName' | 'questionnaireName' | 'department' | 'createdAt'

const SubmissionsPanel = () => {
  const [submissions, setSubmissions] = useState<FormSubmission[]>([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [sortKey, setSortKey] = useState<SortKey>('createdAt')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [filterQuestionnaire, setFilterQuestionnaire] = useState('')

  const load = async () => setSubmissions(await readSubmissions())

  useEffect(() => { load() }, [])

  const uniqueQuestionnaires = useMemo(() => {
    const names = new Set(submissions.map(s => s.questionnaireName))
    return Array.from(names).sort()
  }, [submissions])

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim()
    return submissions
      .filter(s => {
        if (filterQuestionnaire && s.questionnaireName !== filterQuestionnaire) return false
        if (!query) return true
        return (
          s.firstName.toLowerCase().includes(query) ||
          s.lastName.toLowerCase().includes(query) ||
          s.email.toLowerCase().includes(query) ||
          s.department.toLowerCase().includes(query) ||
          s.notes.toLowerCase().includes(query)
        )
      })
      .sort((a, b) => {
        const va = String(a[sortKey] ?? '')
        const vb = String(b[sortKey] ?? '')
        return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va)
      })
  }, [submissions, search, filterQuestionnaire, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  const handleMarkRead = async (id: string) => {
    await markSubmissionRead(id)
    setSubmissions(prev => prev.map(s => s.id === id ? { ...s, isRead: true } : s))
  }

  const handleMarkAllRead = async () => {
    await markAllSubmissionsRead()
    setSubmissions(prev => prev.map(s => ({ ...s, isRead: true })))
    toast.success('All marked as read')
  }

  const remove = async (id: string) => {
    if (!(await confirmDeleteWithName('Delete this submission?'))) return
    await deleteSubmission(id)
    toast.success('Submission deleted')
    setSubmissions(prev => prev.filter(s => s.id !== id))
  }

  const SortIcon = ({ col }: { col: SortKey }) => (
    <span className={tableStyles.sortIcon}>
      <IconifyIcon icon={sortKey === col ? (sortDir === 'asc' ? 'tabler:chevron-up' : 'tabler:chevron-down') : 'tabler:selector'} />
    </span>
  )

  const unreadCount = submissions.filter(s => !s.isRead).length

  return (
    <>
      <PageTitle title="Form Submissions" subTitle="Resources" />

      <div className={tableStyles.card}>
        <div className={tableStyles.cardHeader}>
          <div className={tableStyles.cardHeaderLeft}>
            <IconifyIcon icon="tabler:inbox" />
            <h3>Resource Submissions</h3>
            <span className={tableStyles.totalBadge} style={{ background: unreadCount > 0 ? '#ef4444' : '#e2e8f0', color: unreadCount > 0 ? '#fff' : '#475569' }}>
              {unreadCount > 0 ? `${unreadCount} Unread` : `${submissions.length} Total`}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            <button
              onClick={handleMarkAllRead}
              disabled={unreadCount === 0}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '8px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: 600,
                border: '1px solid #bae6fd', cursor: unreadCount === 0 ? 'not-allowed' : 'pointer',
                background: unreadCount > 0 ? '#e0f2fe' : '#f8fafc',
                color: unreadCount > 0 ? '#0369a1' : '#94a3b8',
                whiteSpace: 'nowrap', transition: 'all 0.2s'
              }}
            >
              <IconifyIcon icon="tabler:checks" />
              Mark All Read
            </button>
            <Link
              href="/admin/resources/questionnaires"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '8px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: 600,
                border: '1px solid #e2e8f0', textDecoration: 'none',
                background: '#f1f5f9', color: '#475569', whiteSpace: 'nowrap'
              }}
            >
              <IconifyIcon icon="tabler:settings" />
              Questionnaires
            </Link>
          </div>
        </div>

        <div className={tableStyles.tableControls}>
          <div className={tableStyles.pageSizeWrap}>
            <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1) }}>
              {PAGE_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <span>entries per page</span>
          </div>
          <div className={tableStyles.searchWrap} style={{ display: 'flex', gap: '1rem' }}>
            <select value={filterQuestionnaire} onChange={e => { setFilterQuestionnaire(e.target.value); setPage(1) }} style={{ padding: '6px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '14px' }}>
              <option value="">All Questionnaires</option>
              {uniqueQuestionnaires.map(q => <option key={q} value={q}>{q}</option>)}
            </select>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>Search:</span>
              <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="Name, email, notes..." />
            </div>
          </div>
        </div>

        <div className={tableStyles.tableWrap}>
          <table className={tableStyles.table}>
            <thead>
              <tr>
                <th style={{ width: '40px' }}>#</th>
                <th style={{ width: '12px' }}></th>
                <th className={tableStyles.thSort} onClick={() => handleSort('firstName')}>User <SortIcon col="firstName" /></th>
                <th className={tableStyles.thSort} onClick={() => handleSort('questionnaireName')}>Questionnaire <SortIcon col="questionnaireName" /></th>
                <th className={tableStyles.thSort} onClick={() => handleSort('department')}>Department <SortIcon col="department" /></th>
                <th>Notes</th>
                <th>File</th>
                <th className={tableStyles.thSort} onClick={() => handleSort('createdAt')}>Date <SortIcon col="createdAt" /></th>
                <th className={tableStyles.thCenter}>Action</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length > 0 ? paginated.map((s, idx) => (
                <tr key={s.id} style={{ background: s.isRead ? 'transparent' : '#f0f9ff' }}>
                  <td className={tableStyles.tdNum}>{(page - 1) * pageSize + idx + 1}</td>
                  <td style={{ textAlign: 'center', paddingRight: 0 }}>
                    {!s.isRead && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6', margin: '0 auto' }} />}
                  </td>
                  <td>
                    <div style={{ fontWeight: s.isRead ? 500 : 700, color: '#1e293b' }}>{s.firstName} {s.lastName}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{s.email}</div>
                  </td>
                  <td><span style={{ fontSize: '13px', fontWeight: 500, color: '#475569' }}>{s.questionnaireName}</span></td>
                  <td><span style={{ padding: '2px 8px', background: '#f1f5f9', borderRadius: '999px', fontSize: '12px', color: '#475569' }}>{s.department || '-'}</span></td>
                  <td style={{ maxWidth: 200 }}>
                    <span style={{ fontSize: '13px', color: '#64748b', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {s.notes || '-'}
                    </span>
                  </td>
                  <td>
                    {s.uploadedFileUrl ? (
                      <a href={s.uploadedFileUrl} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#2563eb', textDecoration: 'none', fontWeight: 500 }}>
                        <IconifyIcon icon="tabler:download" />
                        {s.uploadedFilename || 'Download'}
                      </a>
                    ) : <span style={{ color: '#94a3b8', fontSize: '13px' }}>No file</span>}
                  </td>
                  <td style={{ fontSize: '13px', color: '#64748b' }}>{formatDate(s.createdAt)}</td>
                  <td>
                    <div className={tableStyles.actions} style={{ justifyContent: 'center' }}>
                      {!s.isRead && (
                        <button type="button" className={tableStyles.btnEdit} onClick={() => handleMarkRead(s.id)} title="Mark as Read" style={{ padding: '4px', background: 'transparent' }}>
                          <IconifyIcon icon="tabler:eye" style={{ color: '#3b82f6' }} />
                        </button>
                      )}
                      <button type="button" className={tableStyles.btnDelete} onClick={() => remove(s.id)} title="Delete">
                        <IconifyIcon icon="tabler:trash" />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={9} className={tableStyles.emptyRow}>
                    <IconifyIcon icon="tabler:inbox" />
                    <span>No submissions found</span>
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

export default SubmissionsPanel

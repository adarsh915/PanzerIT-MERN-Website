'use client'

import PageTitle from '@/components/PageTitle'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import clsx from 'clsx'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import { Spinner } from 'react-bootstrap'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { deleteFaq, readFaqs } from './faqStore'
import { confirmDeleteWithName } from '@/utils/confirmDelete'
import type { Faq } from './faqTypes'
import styles from './FaqsPanel.module.scss'
import { stripHtml } from '@/utils/sanitize'

const PAGE_SIZES = [5, 10, 25, 50]

const FaqsPanel = () => {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [pageFilter, setPageFilter] = useState('')
  const [pageSize, setPageSize] = useState(10)
  const [page, setPage] = useState(1)
  const [sortKey, setSortKey] = useState<keyof Faq>('order')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const { data: faqsData, isLoading } = useQuery({
    queryKey: ['faqs'],
    queryFn: async () => {
      const result = await readFaqs()
      return result
    },
    staleTime: 5 * 60 * 1000,
  })

  const faqs = faqsData || []

  const uniquePageKeys = useMemo(() => {
    const keys = faqs.map(f => f.pageKey).filter(Boolean) as string[]
    return Array.from(new Set(keys)).sort()
  }, [faqs])

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim()

    return faqs
      .filter((faq) =>
        (!pageFilter || faq.pageKey === pageFilter) &&
        (!query ||
        stripHtml(faq.question).toLowerCase().includes(query) ||
        stripHtml(faq.answer).toLowerCase().includes(query) ||
        faq.status.toLowerCase().includes(query) ||
        (faq.pageKey || '').toLowerCase().includes(query))
      )
      .sort((a, b) => {
        const first = String(a[sortKey] ?? '')
        const second = String(b[sortKey] ?? '')
        const compare = first.localeCompare(second, undefined, { numeric: true })
        return sortDir === 'asc' ? compare : -compare
      })
  }, [faqs, search, pageFilter, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  const handleSort = (key: keyof Faq) => {
    if (sortKey === key) setSortDir((direction) => (direction === 'asc' ? 'desc' : 'asc'))
    else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const handleDelete = async (faq: Faq) => {
    const confirmed = await confirmDeleteWithName(stripHtml(faq.question))
    if (!confirmed) return

    await deleteFaq(faq.id)
    queryClient.invalidateQueries({ queryKey: ['faqs'] })
    toast.success('FAQ deleted')
  }

  const SortIcon = ({ col }: { col: keyof Faq }) => (
    <span className={styles.sortIcon}>
      <IconifyIcon
        icon={sortKey === col
          ? (sortDir === 'asc' ? 'tabler:chevron-up' : 'tabler:chevron-down')
          : 'tabler:selector'}
      />
    </span>
  )

  return (
    <>
      <PageTitle title="FAQs Management" subTitle="Panzer IT" />

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardHeaderLeft}>
            <IconifyIcon icon="tabler:help" />
            <h3>FAQs List</h3>
            <span className={styles.totalBadge}>{faqs.length}</span>
          </div>
          <div className={styles.headerActions}>
            <Link href="/admin/faqs/create" className={styles.addBtn}>
              <IconifyIcon icon="tabler:plus" />
              Add New FAQ
            </Link>
          </div>
        </div>

        {isLoading ? (
          <div className="d-flex justify-content-center align-items-center py-5">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : (
          <>
            <div className={styles.tableControls}>
              <div className={styles.pageSizeWrap}>
                <select
                  value={pageSize}
                  onChange={(event) => {
                    setPageSize(Number(event.target.value))
                    setPage(1)
                  }}
                  aria-label="Entries per page"
                >
                  {PAGE_SIZES.map((size) => <option key={size} value={size}>{size}</option>)}
                </select>
                <span>entries per page</span>
              </div>
              <div className={styles.searchWrap} style={{ display: 'flex', gap: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>Filter Page:</span>
                  <select 
                    value={pageFilter}
                    onChange={(e) => {
                      setPageFilter(e.target.value)
                      setPage(1)
                    }}
                    style={{ padding: '8px', border: '1px solid #dee2e6', borderRadius: '4px', background: '#fff', fontSize: '14px', outline: 'none' }}
                  >
                    <option value="">All Pages</option>
                    {uniquePageKeys.map(k => <option key={k} value={k}>{k}</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>Search:</span>
                  <input
                    type="text"
                    value={search}
                    onChange={(event) => {
                      setSearch(event.target.value)
                      setPage(1)
                    }}
                    aria-label="Search FAQs"
                  />
                </div>
              </div>
            </div>

            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.thSort} onClick={() => handleSort('order')}># <SortIcon col="order" /></th>
                    <th className={styles.thSort} onClick={() => handleSort('question')}>Question <SortIcon col="question" /></th>
                    <th className={styles.thSort} onClick={() => handleSort('slug')}>Slug <SortIcon col="slug" /></th>
                    <th className={styles.thSort} onClick={() => handleSort('pageKey')}>Page Key <SortIcon col="pageKey" /></th>
                    <th className={styles.thSort} onClick={() => handleSort('status')}>Status <SortIcon col="status" /></th>
                    <th className={styles.thCenter}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.length > 0 ? (
                    paginated.map((faq, idx) => (
                      <tr key={faq.id}>
                        <td className={styles.tdNum}>{(page - 1) * pageSize + idx + 1}</td>
                        <td>
                          <div className="d-flex align-items-center gap-2 mb-1">
                            <span className={styles.tdName} style={{ marginBottom: 0 }}>{stripHtml(faq.question)}</span>
                          </div>
                          <span className={styles.tdSub} style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{stripHtml(faq.answer)}</span>
                        </td>
                        <td><code className={styles.slugCode}>{faq.slug || '-'}</code></td>
                        <td><span style={{ fontSize: '12px', fontWeight: 600, color: '#555', background: '#f0f0f0', padding: '2px 8px', borderRadius: '4px' }}>{faq.pageKey || 'global'}</span></td>
                        <td>
                          <span className={clsx(styles.badge, faq.status === 'active' ? styles.badgeActive : styles.badgeInactive)}>
                            {faq.status}
                          </span>
                        </td>
                        <td>
                          <div className={styles.actions}>
                            <Link href={`/admin/faqs/${faq.id}/edit`} className={styles.btnEdit} title="Edit FAQ">
                              <IconifyIcon icon="tabler:pencil" />
                            </Link>
                            <button
                              type="button"
                              className={styles.btnDelete}
                              onClick={() => handleDelete(faq)}
                              title="Delete FAQ"
                            >
                              <IconifyIcon icon="tabler:trash" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className={styles.emptyRow}>
                        <IconifyIcon icon="tabler:help-off" />
                        <span>No FAQs found</span>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className={styles.pagination}>
              <span className={styles.pageInfo}>
                {filtered.length === 0
                  ? 'No entries'
                  : `Showing ${(page - 1) * pageSize + 1} to ${Math.min(page * pageSize, filtered.length)} of ${filtered.length} entries`}
              </span>
              <div className={styles.pageBtns}>
                <button type="button" onClick={() => setPage(1)} disabled={page === 1}>First</button>
                <button type="button" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={page === 1}>Prev</button>
                {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                  <button
                    key={pageNumber}
                    type="button"
                    className={clsx(page === pageNumber && styles.pageNumActive)}
                    onClick={() => setPage(pageNumber)}
                  >
                    {pageNumber}
                  </button>
                ))}
                <button type="button" onClick={() => setPage((value) => Math.min(totalPages, value + 1))} disabled={page === totalPages}>Next</button>
                <button type="button" onClick={() => setPage(totalPages)} disabled={page === totalPages}>Last</button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}

export default FaqsPanel

'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { Spinner } from 'react-bootstrap'
import PageTitle from '@/components/PageTitle'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { toast } from 'react-toastify'
import clsx from 'clsx'
import styles from '../solutions/SolutionsPanel.module.scss'
import { confirmDeleteWithName } from '@/utils/confirmDelete'

type Subscriber = {
  id: number
  email: string
  subscribed_at: string
}

const PAGE_SIZES = [5, 10, 25, 50]

export default function NewsletterSubscribers() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [loading, setLoading] = useState(true)

  // Datatable state
  const [search, setSearch] = useState('')
  const [pageSize, setPageSize] = useState(10)
  const [page, setPage] = useState(1)
  const [sortKey, setSortKey] = useState<keyof Subscriber>('subscribed_at')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    async function fetchSubscribers() {
      try {
        const res = await fetch('/api/admin/newsletter')
        if (res.ok) {
          const data = await res.json()
          setSubscribers(data)
        }
      } catch (err) {
        console.error('Failed to fetch subscribers:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchSubscribers()
  }, [])

  // Filtering & Sorting
  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim()

    return subscribers
      .filter((sub) => !query || sub.email.toLowerCase().includes(query))
      .sort((a, b) => {
        const first = String(a[sortKey] ?? '')
        const second = String(b[sortKey] ?? '')
        const compare = first.localeCompare(second, undefined, { numeric: true })
        return sortDir === 'asc' ? compare : -compare
      })
  }, [subscribers, search, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  const handleSort = (key: keyof Subscriber) => {
    if (sortKey === key) setSortDir((direction) => (direction === 'asc' ? 'desc' : 'asc'))
    else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const handleDelete = async (subscriber: Subscriber) => {
    if (!(await confirmDeleteWithName(`Delete subscriber ${subscriber.email}?`))) return
    
    try {
      const res = await fetch(`/api/admin/newsletter?id=${subscriber.id}`, {
        method: 'DELETE',
      })
      
      if (res.ok) {
        setSubscribers((prev) => prev.filter((s) => s.id !== subscriber.id))
        toast.success('Subscriber deleted')
      } else {
        toast.error('Failed to delete subscriber')
      }
    } catch (err) {
      console.error('Delete error:', err)
      toast.error('Failed to delete subscriber')
    }
  }

  const SortIcon = ({ col }: { col: keyof Subscriber }) => (
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
      <PageTitle title="Newsletter Subscribers" subTitle="Admin" />

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardHeaderLeft}>
            <IconifyIcon icon="tabler:mail" />
            <h3>Newsletter Subscribers</h3>
            <span className={styles.totalBadge}>{subscribers.length}</span>
          </div>
        </div>

        {loading ? (
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
              <div className={styles.searchWrap}>
                <span>Search:</span>
                <input
                  type="text"
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value)
                    setPage(1)
                  }}
                  aria-label="Search subscribers"
                />
              </div>
            </div>

            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th style={{ width: '50px' }}>#</th>
                    <th className={styles.thSort} onClick={() => handleSort('email')}>Email Address <SortIcon col="email" /></th>
                    <th className={styles.thSort} onClick={() => handleSort('subscribed_at')}>Date Subscribed <SortIcon col="subscribed_at" /></th>
                    <th className={styles.thCenter}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.length > 0 ? (
                    paginated.map((sub, index) => (
                      <tr key={sub.id}>
                        <td>{(page - 1) * pageSize + index + 1}</td>
                        <td>
                          <span className={styles.tdName}>{sub.email}</span>
                        </td>
                        <td>{new Date(sub.subscribed_at).toLocaleString()}</td>
                        <td>
                          <div className={styles.actions}>
                            <button 
                              type="button" 
                              className={styles.btnDelete} 
                              onClick={() => handleDelete(sub)} 
                              title="Delete subscriber"
                            >
                              <IconifyIcon icon="tabler:trash" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className={styles.emptyRow}>
                        <IconifyIcon icon="tabler:mail-off" />
                        <span>No subscribers found</span>
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

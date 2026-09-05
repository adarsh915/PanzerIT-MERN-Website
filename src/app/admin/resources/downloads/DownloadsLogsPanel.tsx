'use client'

import React, { useMemo, useState } from 'react'
import clsx from 'clsx'
import PageTitle from '@/components/PageTitle'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Link from 'next/link'
import styles from '../../solutions/SolutionsPanel.module.scss'

const PAGE_SIZES = [10, 25, 50, 100]

export default function DownloadsLogsPanel({ initialLogs }: { initialLogs: any[] }) {
  const [search, setSearch] = useState('')
  const [pageSize, setPageSize] = useState(25)
  const [page, setPage] = useState(1)
  const [sortKey, setSortKey] = useState<string>('createdAt')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim()

    return initialLogs
      .filter((log) =>
        !query ||
        (log.resourceTitle || '').toLowerCase().includes(query) ||
        (log.city || '').toLowerCase().includes(query) ||
        (log.country || '').toLowerCase().includes(query)
      )
      .sort((a, b) => {
        let first = a[sortKey] ?? ''
        let second = b[sortKey] ?? ''
        
        if (sortKey === 'createdAt') {
           const timeA = new Date(first).getTime()
           const timeB = new Date(second).getTime()
           const compare = timeA < timeB ? -1 : (timeA > timeB ? 1 : 0)
           return sortDir === 'asc' ? compare : -compare
        }

        first = String(first)
        second = String(second)
        const compare = first.localeCompare(second, undefined, { numeric: true })
        return sortDir === 'asc' ? compare : -compare
      })
  }, [initialLogs, search, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  const handleSort = (key: string) => {
    if (sortKey === key) setSortDir((direction) => (direction === 'asc' ? 'desc' : 'asc'))
    else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const SortIcon = ({ col }: { col: string }) => (
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
      <PageTitle title="Download Logs" subTitle="Resources" />

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardHeaderLeft}>
            <IconifyIcon icon="tabler:list-details" />
            <h3>Resource Download Locations</h3>
            <span className={styles.totalBadge}>{initialLogs.length}</span>
          </div>
          <div className={styles.headerActions}>
            <Link href="/admin/resources" className={styles.addBtn} style={{ background: '#6c757d', borderColor: '#6c757d' }}>
              <IconifyIcon icon="tabler:arrow-left" />
              Back to Resources
            </Link>
          </div>
        </div>

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
              placeholder="Search resource or location..."
            />
          </div>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>#</th>
                <th className={styles.thSort} onClick={() => handleSort('resourceTitle')}>Resource Name <SortIcon col="resourceTitle" /></th>
                <th className={styles.thSort} onClick={() => handleSort('city')}>Location <SortIcon col="city" /></th>
                <th className={styles.thSort} onClick={() => handleSort('createdAt')}>Downloaded At <SortIcon col="createdAt" /></th>
              </tr>
            </thead>
            <tbody>
              {paginated.length > 0 ? (
                paginated.map((log, idx) => (
                  <tr key={log.id}>
                    <td className={styles.tdNum}>{(page - 1) * pageSize + idx + 1}</td>
                    <td><span className={styles.tdName}>{log.resourceTitle || log.resourceId}</span></td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 600 }}>{log.city !== 'Unknown' ? `${log.city}, ${log.country}` : 'Location Unknown'}</span>
                        {log.region !== 'Unknown' && <span style={{ fontSize: '12px', color: '#666' }}>{log.region}</span>}
                      </div>
                    </td>
                    <td>{new Date(log.createdAt).toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className={styles.emptyRow}>
                    <IconifyIcon icon="tabler:files-off" />
                    <span>No downloads recorded yet</span>
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
            {Array.from({ length: totalPages }, (_, index) => index + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(page - p) <= 2)
              .map((pageNumber, i, arr) => (
                <React.Fragment key={pageNumber}>
                  {i > 0 && arr[i - 1] !== pageNumber - 1 && <span style={{ padding: '0 8px', color: '#6c757d' }}>...</span>}
                  <button
                    type="button"
                    className={clsx(page === pageNumber && styles.pageNumActive)}
                    onClick={() => setPage(pageNumber)}
                  >
                    {pageNumber}
                  </button>
                </React.Fragment>
            ))}
            <button type="button" onClick={() => setPage((value) => Math.min(totalPages, value + 1))} disabled={page === totalPages}>Next</button>
            <button type="button" onClick={() => setPage(totalPages)} disabled={page === totalPages}>Last</button>
          </div>
        </div>

      </div>
    </>
  )
}

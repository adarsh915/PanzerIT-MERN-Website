'use client'

import PageTitle from '@/components/PageTitle'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import clsx from 'clsx'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import { Spinner } from 'react-bootstrap'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { deleteResource, readResourcesPaginated, type ResourceItem } from './resourceStore'
import { confirmDeleteWithName } from '@/utils/confirmDelete'
import styles from '../solutions/SolutionsPanel.module.scss'

const PAGE_SIZES = [5, 10, 25, 50]

const ResourcesPanel = () => {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [pageSize, setPageSize] = useState(10)
  const [page, setPage] = useState(1)
  const [sortKey, setSortKey] = useState<keyof ResourceItem>('order')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const { data: resourcesData, isLoading } = useQuery({
    queryKey: ['resources'],
    queryFn: async () => {
      const result = await readResourcesPaginated(1, 1000)
      return result.items
    },
    staleTime: 5 * 60 * 1000,
  })

  const resources = resourcesData || []

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim()

    return resources
      .filter((item) =>
        !query ||
        item.title.toLowerCase().includes(query) ||
        (item.description || '').toLowerCase().includes(query) ||
        (item.category || '').toLowerCase().includes(query) ||
        item.slug.toLowerCase().includes(query) ||
        item.status.toLowerCase().includes(query),
      )
      .sort((a, b) => {
        const first = String(a[sortKey] ?? '')
        const second = String(b[sortKey] ?? '')
        const compare = first.localeCompare(second, undefined, { numeric: true })
        return sortDir === 'asc' ? compare : -compare
      })
  }, [resources, search, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  const handleSort = (key: keyof ResourceItem) => {
    if (sortKey === key) setSortDir((direction) => (direction === 'asc' ? 'desc' : 'asc'))
    else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const handleDelete = async (item: ResourceItem) => {
    const confirmed = await confirmDeleteWithName(item.title)
    if (!confirmed) return

    await deleteResource(item.id)
    queryClient.invalidateQueries({ queryKey: ['resources'] })
    toast.success('Resource deleted')
  }

  const SortIcon = ({ col }: { col: keyof ResourceItem }) => (
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
      <PageTitle title="Resources" subTitle="Admin" />

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardHeaderLeft}>
            <IconifyIcon icon="tabler:folders" />
            <h3>Resources Library</h3>
            <span className={styles.totalBadge}>{resources.length}</span>
          </div>
          <div className={styles.headerActions}>
            <Link href="/admin/resources/downloads" className={styles.addBtn} style={{ background: '#10b981', borderColor: '#10b981' }}>
              <IconifyIcon icon="tabler:list-details" />
              Download Logs
            </Link>
            <Link href="/admin/resources/categories" className={styles.categoriesBtn}>
              <IconifyIcon icon="tabler:category" />
              Categories
            </Link>
            <Link href="/admin/resources/add" className={styles.addBtn}>
              <IconifyIcon icon="tabler:plus" />
              Upload Resource
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
              <div className={styles.searchWrap}>
                <span>Search:</span>
                <input
                  type="text"
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value)
                    setPage(1)
                  }}
                  aria-label="Search resources"
                />
              </div>
            </div>

            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.thSort} onClick={() => handleSort('order')}># <SortIcon col="order" /></th>
                    <th>Thumbnail</th>
                    <th className={styles.thSort} onClick={() => handleSort('title')}>Title <SortIcon col="title" /></th>
                    <th className={styles.thSort} onClick={() => handleSort('category')}>Category <SortIcon col="category" /></th>
                    <th className={styles.thSort} onClick={() => handleSort('fileType')}>File Type <SortIcon col="fileType" /></th>
                    <th className={styles.thSort} onClick={() => handleSort('downloadCount')}>Downloads <SortIcon col="downloadCount" /></th>
                    <th className={styles.thSort} onClick={() => handleSort('status')}>Status <SortIcon col="status" /></th>
                    <th className={styles.thCenter}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.length > 0 ? (
                    paginated.map((item, idx) => (
                      <tr key={item.id}>
                        <td className={styles.tdNum}>{(page - 1) * pageSize + idx + 1}</td>
                        <td>
                          {item.image ? (
                            <img src={item.image} alt={item.title} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                          ) : (
                            <div style={{ width: '40px', height: '40px', background: '#f0f0f0', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <IconifyIcon icon="tabler:file" className="text-muted" />
                            </div>
                          )}
                        </td>
                        <td>
                          <span className={styles.tdName}>{item.title}</span>
                          <span className={styles.tdSub} style={{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{item.fileUrl}</span>
                        </td>
                        <td><span className={styles.catChip}>{item.category || 'Uncategorized'}</span></td>
                        <td>{item.fileType || '-'}</td>
                        <td style={{ fontWeight: 600, color: '#10b981' }}>{item.downloadCount} <i className="fa-solid fa-download" style={{ fontSize: '10px', marginLeft: '4px' }}></i></td>
                        <td>
                          <span className={clsx(styles.badge, item.status === 'active' ? styles.badgeActive : styles.badgeInactive)}>
                            {item.status}
                          </span>
                        </td>
                        <td>
                          <div className={styles.actions}>
                            <a href={item.fileUrl} target="_blank" rel="noreferrer" className={styles.btnEdit} title="Download/View File">
                              <IconifyIcon icon="tabler:download" />
                            </a>
                            <Link href={`/admin/resources/edit/${item.id}`} className={styles.btnEdit} title="Edit resource">
                              <IconifyIcon icon="tabler:pencil" />
                            </Link>
                            <button
                              type="button"
                              className={styles.btnDelete}
                              onClick={() => handleDelete(item)}
                              title="Delete resource"
                            >
                              <IconifyIcon icon="tabler:trash" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className={styles.emptyRow}>
                        <IconifyIcon icon="tabler:files-off" />
                        <span>No resources found</span>
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

export default ResourcesPanel

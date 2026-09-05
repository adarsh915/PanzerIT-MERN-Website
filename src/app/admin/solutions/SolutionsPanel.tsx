'use client'

import PageTitle from '@/components/PageTitle'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import clsx from 'clsx'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import { Spinner } from 'react-bootstrap'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { deleteSolution, readSolutionsPaginated, type SolutionService } from './solutionStore'
import { confirmDeleteWithName } from '@/utils/confirmDelete'
import styles from './SolutionsPanel.module.scss'

const PAGE_SIZES = [5, 10, 25, 50]

const SolutionsPanel = () => {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [pageSize, setPageSize] = useState(10)
  const [page, setPage] = useState(1)
  const [sortKey, setSortKey] = useState<keyof SolutionService>('order')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  // Fetch solutions with React Query caching
  const { data: solutionsData, isLoading } = useQuery({
    queryKey: ['solutions'],
    queryFn: async () => {
      const result = await readSolutionsPaginated(1, 1000) // Load all for client-side filtering
      return result.solutions
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  })

  const solutions = solutionsData || []

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim()

    return solutions
      .filter((solution) =>
        !query ||
        solution.title.toLowerCase().includes(query) ||
        solution.subtitle.toLowerCase().includes(query) ||
        solution.category.toLowerCase().includes(query) ||
        solution.slug.toLowerCase().includes(query) ||
        solution.status.toLowerCase().includes(query) ||
        (solution.metaKeywords ?? '').toLowerCase().includes(query),
      )
      .sort((a, b) => {
        const first = String(a[sortKey] ?? '')
        const second = String(b[sortKey] ?? '')
        const compare = first.localeCompare(second, undefined, { numeric: true })
        return sortDir === 'asc' ? compare : -compare
      })
  }, [solutions, search, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  const handleSort = (key: keyof SolutionService) => {
    if (sortKey === key) setSortDir((direction) => (direction === 'asc' ? 'desc' : 'asc'))
    else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const handleDelete = async (solution: SolutionService) => {
    const confirmed = await confirmDeleteWithName(solution.title)
    if (!confirmed) return

    await deleteSolution(solution.id)
    // Invalidate cache to refetch data
    queryClient.invalidateQueries({ queryKey: ['solutions'] })
    toast.success('Solution deleted')
  }

  const SortIcon = ({ col }: { col: keyof SolutionService }) => (
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
      <PageTitle title="Solutions & Services" subTitle="Panzer IT" />

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardHeaderLeft}>
            <IconifyIcon icon="tabler:shield-check" />
            <h3>Solutions & Services List</h3>
            <span className={styles.totalBadge}>{solutions.length}</span>
          </div>
          <div className={styles.headerActions}>
            <Link href="/admin/solutions/categories" className={styles.categoriesBtn}>
              <IconifyIcon icon="tabler:category" />
              Categories
            </Link>
            <Link href="/admin/solutions/create" className={styles.addBtn}>
              <IconifyIcon icon="tabler:plus" />
              Add New Solution
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
                  aria-label="Search solutions and services"
                />
              </div>
            </div>

            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.thSort} onClick={() => handleSort('order')}># <SortIcon col="order" /></th>
                    <th className={styles.thSort} onClick={() => handleSort('title')}>Title <SortIcon col="title" /></th>
                    <th className={styles.thSort} onClick={() => handleSort('category')}>Category <SortIcon col="category" /></th>
                    <th className={styles.thSort} onClick={() => handleSort('slug')}>Slug <SortIcon col="slug" /></th>
                    <th>Cards</th>
                    <th>Flow</th>
                    <th className={styles.thSort} onClick={() => handleSort('status')}>Status <SortIcon col="status" /></th>
                    <th className={styles.thCenter}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.length > 0 ? (
                    paginated.map((solution, idx) => (
                      <tr key={solution.id}>
                        <td className={styles.tdNum}>{(page - 1) * pageSize + idx + 1}</td>
                        <td>
                          <div className="d-flex align-items-center gap-2 mb-1">
                            <span className={styles.tdName} style={{ marginBottom: 0 }}>{solution.title}</span>
                            {solution.isFeatured && (
                              <span className="badge bg-warning text-dark border d-inline-flex align-items-center gap-1" style={{ fontSize: '0.65rem', padding: '0.2rem 0.4rem' }}>
                                <IconifyIcon icon="tabler:star-filled" width={12} height={12} />
                                Featured
                              </span>
                            )}
                          </div>
                          {solution.subtitle && <span className={styles.tdSub}>{solution.subtitle}</span>}
                        </td>
                        <td><span className={styles.catChip}>{solution.category}</span></td>
                        <td><code className={styles.slugCode}>{solution.slug || '-'}</code></td>
                        <td>{solution.featureCards.length}</td>
                        <td>{solution.implementationSteps.length}</td>
                        <td>
                          <span className={clsx(styles.badge, solution.status === 'active' ? styles.badgeActive : styles.badgeInactive)}>
                            {solution.status}
                          </span>
                        </td>
                        <td>
                          <div className={styles.actions}>
                            <Link href={`/admin/solutions/${solution.id}`} className={styles.btnEdit} title="View solution">
                              <IconifyIcon icon="tabler:eye" />
                            </Link>
                            <Link href={`/admin/solutions/${solution.id}/edit`} className={styles.btnEdit} title="Edit solution">
                              <IconifyIcon icon="tabler:pencil" />
                            </Link>
                            <button
                              type="button"
                              className={styles.btnDelete}
                              onClick={() => handleDelete(solution)}
                              title="Delete solution"
                            >
                              <IconifyIcon icon="tabler:trash" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className={styles.emptyRow}>
                        <IconifyIcon icon="tabler:shield-off" />
                        <span>No solutions found</span>
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

export default SolutionsPanel

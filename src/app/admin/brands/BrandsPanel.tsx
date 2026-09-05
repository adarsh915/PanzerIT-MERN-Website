'use client'

import PageTitle from '@/components/PageTitle'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import clsx from 'clsx'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import { Spinner } from 'react-bootstrap'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { deleteBrand, readBrandsPaginated, type BrandPartner } from './brandStore'
import { confirmDeleteWithName } from '@/utils/confirmDelete'
import styles from '../solutions/SolutionsPanel.module.scss'

const PAGE_SIZES = [5, 10, 25, 50]

const BrandsPanel = () => {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [pageSize, setPageSize] = useState(10)
  const [page, setPage] = useState(1)
  const [sortKey, setSortKey] = useState<keyof BrandPartner>('order')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  // Fetch brands with React Query caching
  const { data: brandsData, isLoading } = useQuery({
    queryKey: ['brands'],
    queryFn: async () => {
      const result = await readBrandsPaginated(1, 1000)
      return result.brands
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  })

  const brands = brandsData || []

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim()

    return brands
      .filter((brand) =>
        !query ||
        brand.name.toLowerCase().includes(query) ||
        brand.category.toLowerCase().includes(query) ||
        brand.slug.toLowerCase().includes(query) ||
        brand.website.toLowerCase().includes(query) ||
        brand.status.toLowerCase().includes(query) ||
        (brand.metaKeywords ?? '').toLowerCase().includes(query),
      )
      .sort((a, b) => {
        const first = String(a[sortKey] ?? '')
        const second = String(b[sortKey] ?? '')
        const compare = first.localeCompare(second, undefined, { numeric: true })
        return sortDir === 'asc' ? compare : -compare
      })
  }, [brands, search, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  const handleSort = (key: keyof BrandPartner) => {
    if (sortKey === key) setSortDir((direction) => (direction === 'asc' ? 'desc' : 'asc'))
    else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const handleDelete = async (brand: BrandPartner) => {
    const confirmed = await confirmDeleteWithName(brand.name)
    if (!confirmed) return

    await deleteBrand(brand.id)
    // Invalidate cache to refetch data
    queryClient.invalidateQueries({ queryKey: ['brands'] })
    toast.success('Brand deleted')
  }

  const SortIcon = ({ col }: { col: keyof BrandPartner }) => (
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
      <PageTitle title="Brands & Partners" subTitle="Panzer IT" />

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardHeaderLeft}>
            <IconifyIcon icon="tabler:building-store" />
            <h3>Brands & Partners List</h3>
            <span className={styles.totalBadge}>{brands.length}</span>
          </div>
          <div className={styles.headerActions}>
            <Link href="/admin/brands/categories" className={styles.categoriesBtn}>
              <IconifyIcon icon="tabler:category" />
              Categories
            </Link>
            <Link href="/admin/brands/create" className={styles.addBtn}>
              <IconifyIcon icon="tabler:plus" />
              Add New Brand
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
                  aria-label="Search brands and partners"
                />
              </div>
            </div>

            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.thSort} onClick={() => handleSort('order')}># <SortIcon col="order" /></th>
                    <th className={styles.thSort} onClick={() => handleSort('name')}>Name <SortIcon col="name" /></th>
                    <th className={styles.thSort} onClick={() => handleSort('category')}>Category <SortIcon col="category" /></th>
                    <th className={styles.thSort} onClick={() => handleSort('slug')}>Slug <SortIcon col="slug" /></th>
                    <th className={styles.thSort} onClick={() => handleSort('status')}>Status <SortIcon col="status" /></th>
                    <th className={styles.thCenter}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.length > 0 ? (
                    paginated.map((brand, idx) => (
                      <tr key={brand.id}>
                        <td className={styles.tdNum}>{(page - 1) * pageSize + idx + 1}</td>
                        <td>
                          <div className="d-flex align-items-center gap-2 mb-1">
                            <span className={styles.tdName} style={{ marginBottom: 0 }}>{brand.name}</span>
                            {brand.featured && (
                              <span className="badge bg-warning text-dark border d-inline-flex align-items-center gap-1" style={{ fontSize: '0.65rem', padding: '0.2rem 0.4rem' }}>
                                <IconifyIcon icon="tabler:star-filled" width={12} height={12} />
                                Featured
                              </span>
                            )}
                          </div>
                          {brand.website && <span className={styles.tdSub}>{brand.website}</span>}
                        </td>
                        <td><span className={styles.catChip}>{brand.category || '-'}</span></td>
                        <td><code className={styles.slugCode}>{brand.slug || '-'}</code></td>
                        <td>
                          <span className={clsx(styles.badge, brand.status === 'active' ? styles.badgeActive : styles.badgeInactive)}>
                            {brand.status}
                          </span>
                        </td>
                        <td>
                          <div className={styles.actions}>
                            <Link href={`/admin/brands/${brand.id}`} className={styles.btnEdit} title="View brand">
                              <IconifyIcon icon="tabler:eye" />
                            </Link>
                            <Link href={`/admin/brands/${brand.id}/edit`} className={styles.btnEdit} title="Edit brand">
                              <IconifyIcon icon="tabler:pencil" />
                            </Link>
                            <button
                              type="button"
                              className={styles.btnDelete}
                              onClick={() => handleDelete(brand)}
                              title="Delete brand"
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
                        <IconifyIcon icon="tabler:building-store" />
                        <span>No brands found</span>
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

export default BrandsPanel

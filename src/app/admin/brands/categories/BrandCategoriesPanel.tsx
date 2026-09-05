'use client'

import PageTitle from '@/components/PageTitle'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import clsx from 'clsx'
import Link from 'next/link'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { toast } from 'react-toastify'
import { confirmDeleteWithName } from '@/utils/confirmDelete'
import {
  createCategory,
  deleteCategory,
  readCategories,
  updateCategory,
} from '../brandStore'
import {
  emptyBrandCategory,
  toCategoryFormData,
  toSlug,
} from '../brandHelpers'
import type {
  BrandCategory,
  BrandCategoryFormData,
} from '../brandTypes'
import styles from '../../posts/categories/BlogCategoriesPanel.module.scss'
import tableStyles from '../../solutions/SolutionsPanel.module.scss'

const PAGE_SIZES = [5, 10, 25, 50]

const formatDate = (value?: string) => {
  if (!value) return '-'
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }).format(new Date(value))
}

type SortKey = 'name' | 'slug' | 'status' | 'createdAt'

const BrandCategoriesPanel = () => {
  const [categories, setCategories] = useState<BrandCategory[]>([])
  const [form, setForm] = useState<BrandCategoryFormData>(emptyBrandCategory)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sortKey, setSortKey] = useState<SortKey>('createdAt')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const loadCategories = async () => {
    setCategories(await readCategories())
  }

  useEffect(() => {
    loadCategories()
  }, [])

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim()
    return categories
      .filter((category) =>
        !query ||
        category.name.toLowerCase().includes(query) ||
        category.slug.toLowerCase().includes(query) ||
        category.status.toLowerCase().includes(query),
      )
      .sort((a, b) => {
        const va = String(a[sortKey] ?? '')
        const vb = String(b[sortKey] ?? '')
        const cmp = va.localeCompare(vb, undefined, { numeric: true })
        return sortDir === 'asc' ? cmp : -cmp
      })
  }, [categories, search, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(key); setSortDir('asc') }
  }

  const refresh = async () => setCategories(await readCategories())

  const set = <K extends keyof BrandCategoryFormData>(key: K, value: BrandCategoryFormData[K]) => {
    setForm((previous) => ({ ...previous, [key]: value }))
  }

  const resetForm = () => {
    setForm(emptyBrandCategory)
    setEditingId(null)
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    const name = form.name.trim()
    const slug = toSlug(form.slug || form.name)
    if (!name) { toast.error('Category name is required'); return }
    if (!slug) { toast.error('Category slug is required'); return }
    const payload = { ...form, name, slug }
    try {
      if (editingId) {
        const res = await updateCategory(editingId, payload)
        if (res && 'success' in res && res.success === false) {
          toast.error(res.message)
          return
        }
        toast.success('Brand category updated')
      } else {
        const res = await createCategory(payload)
        if (res && 'success' in res && res.success === false) {
          toast.error(res.message)
          return
        }
        toast.success('Brand category created')
      }
      resetForm()
      await refresh()
    } catch (err: any) {
      toast.error(err.message || 'Error saving category')
    }
  }

  const editCategory = (category: BrandCategory) => {
    setEditingId(category.id)
    setForm(toCategoryFormData(category))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const removeCategory = async (category: BrandCategory) => {
    const confirmed = await confirmDeleteWithName(category.name)
    if (!confirmed) return
    try {
      const res = await deleteCategory(category.id)
      if (res && 'success' in res && res.success === false) {
        toast.error(res.message)
        return
      }
      toast.success('Brand category deleted')
      await refresh()
    } catch (err: any) {
      toast.error(err.message || 'Cannot delete this category')
    }
  }

  const SortIcon = ({ col }: { col: SortKey }) => (
    <span className={tableStyles.sortIcon}>
      <IconifyIcon
        icon={sortKey === col
          ? (sortDir === 'asc' ? 'tabler:chevron-up' : 'tabler:chevron-down')
          : 'tabler:selector'}
      />
    </span>
  )

  return (
    <>
      <PageTitle title="Brand Categories" subTitle="Brands & Partners" />

      {/* ── Form Card ── */}
      <div className={styles.card} style={{ marginBottom: '1.5rem' }}>
        <div className={styles.cardHeader}>
          <div className={styles.cardHeaderLeft}>
            <IconifyIcon icon={editingId ? 'tabler:pencil' : 'tabler:plus'} />
            <h3>{editingId ? 'Edit Category' : 'Add New Category'}</h3>
          </div>
          <div className={styles.headerActions}>
            <Link href="/admin/brands" className={styles.secondaryBtn}>
              <IconifyIcon icon="tabler:arrow-left" />
              Back to Brands
            </Link>
          </div>
        </div>

        <form className={styles.form} onSubmit={submit}>
          <label className={styles.field}>
            <span>Name</span>
            <input
              type="text"
              value={form.name}
              onChange={(event) => {
                const name = event.target.value
                setForm((previous) => ({
                  ...previous,
                  name,
                  slug: previous.slug ? previous.slug : toSlug(name),
                }))
              }}
              placeholder="Category name"
            />
          </label>
          <label className={styles.field}>
            <span>Slug</span>
            <input
              type="text"
              value={form.slug}
              onChange={(event) => set('slug', toSlug(event.target.value))}
              placeholder="category-slug"
            />
          </label>
          <label className={styles.field}>
            <span>Status</span>
            <select value={form.status} onChange={(event) => set('status', event.target.value as BrandCategoryFormData['status'])}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>
          <div className={styles.formActions}>
            <button type="submit" className={styles.saveBtn}>
              <IconifyIcon icon="tabler:device-floppy" />
              {editingId ? 'Update' : 'Save'}
            </button>
            {editingId && (
              <button type="button" className={styles.cancelBtn} onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* ── Datatable Card ── */}
      <div className={tableStyles.card}>
        <div className={tableStyles.cardHeader}>
          <div className={tableStyles.cardHeaderLeft}>
            <IconifyIcon icon="tabler:category" />
            <h3>All Brand Categories</h3>
            <span className={tableStyles.totalBadge}>{categories.length}</span>
          </div>
        </div>

        <div className={tableStyles.tableControls}>
          <div className={tableStyles.pageSizeWrap}>
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1) }}
              aria-label="Entries per page"
            >
              {PAGE_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <span>entries per page</span>
          </div>
          <div className={tableStyles.searchWrap}>
            <span>Search:</span>
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              aria-label="Search categories"
            />
          </div>
        </div>

        <div className={tableStyles.tableWrap}>
          <table className={tableStyles.table}>
            <thead>
              <tr>
                <th>#</th>
                <th className={tableStyles.thSort} onClick={() => handleSort('name')}>
                  Name <SortIcon col="name" />
                </th>
                <th className={tableStyles.thSort} onClick={() => handleSort('slug')}>
                  Slug <SortIcon col="slug" />
                </th>
                <th className={tableStyles.thSort} onClick={() => handleSort('status')}>
                  Status <SortIcon col="status" />
                </th>
                <th className={tableStyles.thSort} onClick={() => handleSort('createdAt')}>
                  Created <SortIcon col="createdAt" />
                </th>
                <th className={tableStyles.thCenter}>Action</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length > 0 ? (
                paginated.map((category, idx) => (
                  <tr key={category.id}>
                    <td className={tableStyles.tdNum}>{(page - 1) * pageSize + idx + 1}</td>
                    <td><span className={tableStyles.tdName}>{category.name}</span></td>
                    <td><code className={styles.slugCode}>{category.slug}</code></td>
                    <td>
                      <span className={clsx(styles.badge, category.status === 'active' ? styles.badgeActive : styles.badgeInactive)}>
                        {category.status}
                      </span>
                    </td>
                    <td>{formatDate(category.createdAt)}</td>
                    <td>
                      <div className={tableStyles.actions}>
                        <button type="button" className={tableStyles.btnEdit} onClick={() => editCategory(category)} title="Edit category">
                          <IconifyIcon icon="tabler:pencil" />
                        </button>
                        <button type="button" className={tableStyles.btnDelete} onClick={() => removeCategory(category)} title="Delete category">
                          <IconifyIcon icon="tabler:trash" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className={tableStyles.emptyRow}>
                    <IconifyIcon icon="tabler:category-off" />
                    <span>No brand categories found</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className={tableStyles.pagination}>
          <span className={tableStyles.pageInfo}>
            {filtered.length === 0
              ? 'No entries'
              : `Showing ${(page - 1) * pageSize + 1} to ${Math.min(page * pageSize, filtered.length)} of ${filtered.length} entries`}
          </span>
          <div className={tableStyles.pageBtns}>
            <button type="button" onClick={() => setPage(1)} disabled={page === 1}>First</button>
            <button type="button" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Prev</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
              <button key={n} type="button" className={clsx(page === n && tableStyles.pageNumActive)} onClick={() => setPage(n)}>
                {n}
              </button>
            ))}
            <button type="button" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</button>
            <button type="button" onClick={() => setPage(totalPages)} disabled={page === totalPages}>Last</button>
          </div>
        </div>
      </div>
    </>
  )
}

export default BrandCategoriesPanel

'use client'

import PageTitle from '@/components/PageTitle'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import clsx from 'clsx'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import { Spinner } from 'react-bootstrap'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { deletePost, readCategories, readPostsPaginated, type BlogCategory, type BlogPost } from './blogStore'
import styles from './PostsPanel.module.scss'
import { confirmDeleteWithName } from '@/utils/confirmDelete'

const PAGE_SIZES = [5, 10, 25, 50]

const formatDate = (value?: string) => {
  if (!value) return '-'
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }).format(new Date(value))
}

const PostsPanel = () => {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [pageSize, setPageSize] = useState(10)
  const [page, setPage] = useState(1)
  const [sortKey, setSortKey] = useState<keyof BlogPost>('createdAt')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  // Fetch posts with React Query caching
  const { data: postsData, isLoading: postsLoading } = useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      const result = await readPostsPaginated(1, 1000) // Load all for client-side filtering
      return result.posts
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  })

  // Fetch categories with React Query caching
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['blog-categories'],
    queryFn: readCategories,
    staleTime: 30 * 60 * 1000, // Cache categories for 30 minutes
  })

  const posts = postsData || []
  const isLoading = postsLoading || categoriesLoading

  // Prefetch categories when hovering over "Add New Post" button
  const handlePrefetchCategories = () => {
    queryClient.prefetchQuery({
      queryKey: ['blog-categories'],
      queryFn: readCategories,
      staleTime: 30 * 60 * 1000,
    })
  }

  const categoryById = useMemo(
    () => new Map(categories.map((category) => [category.id, category.name])),
    [categories],
  )

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim()

    return posts
      .filter((post) => {
        const categoryName = categoryById.get(post.categoryId ?? '') ?? ''

        return !query ||
          post.title.toLowerCase().includes(query) ||
          post.slug.toLowerCase().includes(query) ||
          post.status.toLowerCase().includes(query) ||
          (post.author ?? '').toLowerCase().includes(query) ||
          categoryName.toLowerCase().includes(query) ||
          (post.tags ?? []).some((tag) => tag.toLowerCase().includes(query))
      })
      .sort((a, b) => {
        const first = String(a[sortKey] ?? '')
        const second = String(b[sortKey] ?? '')
        const compare = first.localeCompare(second, undefined, { numeric: true })
        return sortDir === 'asc' ? compare : -compare
      })
  }, [categoryById, posts, search, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  const handleSort = (key: keyof BlogPost) => {
    if (sortKey === key) setSortDir((direction) => (direction === 'asc' ? 'desc' : 'asc'))
    else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const handleDelete = async (post: BlogPost) => {
    const confirmed = await confirmDeleteWithName(post.title)
    if (!confirmed) return

    await deletePost(post.id)
    // Invalidate cache to refetch data
    queryClient.invalidateQueries({ queryKey: ['posts'] })
    toast.success('Blog post deleted')
  }

  const SortIcon = ({ col }: { col: keyof BlogPost }) => (
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
      <PageTitle title="Blog Posts" subTitle="Panzer IT" />

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardHeaderLeft}>
            <IconifyIcon icon="tabler:article" />
            <h3>Blog Posts List</h3>
            <span className={styles.totalBadge}>{posts.length}</span>
          </div>
          <div className={styles.headerActions}>
            <Link href="/admin/posts/categories" className={styles.categoriesBtn}>
              <IconifyIcon icon="tabler:category" />
              Categories
            </Link>
            <Link 
              href="/admin/posts/create" 
              className={styles.addBtn}
              onMouseEnter={handlePrefetchCategories}
            >
              <IconifyIcon icon="tabler:plus" />
              Add New Post
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
              aria-label="Search blog posts"
            />
          </div>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.thSort} style={{ width: '50px' }}>#</th>
                <th className={styles.thSort} onClick={() => handleSort('title')}>Title <SortIcon col="title" /></th>
                <th className={styles.thSort} onClick={() => handleSort('slug')}>Slug <SortIcon col="slug" /></th>
                <th>Category</th>
                <th>Tags</th>
                <th className={styles.thSort} onClick={() => handleSort('status')}>Status <SortIcon col="status" /></th>
                <th className={styles.thSort} onClick={() => handleSort('author')}>Author <SortIcon col="author" /></th>
                <th className={styles.thSort} onClick={() => handleSort('publishedAt')}>Published <SortIcon col="publishedAt" /></th>
                <th className={styles.thCenter}>Action</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length > 0 ? (
                paginated.map((post, idx) => (
                  <tr key={post.id}>
                    <td className={styles.tdNum}>{(page - 1) * pageSize + idx + 1}</td>
                    <td>
                      <div className={styles.postCell}>
                        {post.image ? (
                          <img className={styles.postThumb} src={post.image} alt={post.imageAlt || post.title} />
                        ) : (
                          <span className={styles.postThumbEmpty}>
                            <IconifyIcon icon="tabler:photo" />
                          </span>
                        )}
                        <div>
                          <span className={styles.tdTitle}>{post.title}</span>
                          <span className={styles.tdSub}>{post.description ? 'Description added' : 'No description added'}</span>
                        </div>
                      </div>
                    </td>
                    <td><code className={styles.slugCode}>{post.slug}</code></td>
                    <td>{categoryById.get(post.categoryId ?? '') || '-'}</td>
                    <td>
                      <div className={styles.tags}>
                        {(post.tags ?? []).length > 0 ? (
                          <>
                            {post.tags!.slice(0, 5).map((tag) => <span key={tag}>{tag}</span>)}
                            {post.tags!.length > 5 && <span>+{post.tags!.length - 5} more</span>}
                          </>
                        ) : '-'}
                      </div>
                    </td>
                    <td>
                      <span className={clsx(styles.badge, post.status === 'published' ? styles.badgePublished : styles.badgeDraft)}>
                        {post.status}
                      </span>
                    </td>
                    <td>{post.author || '-'}</td>
                    <td>{formatDate(post.publishedAt)}</td>
                    <td>
                      <div className={styles.actions}>
                        <Link
                          href={`/admin/posts/${post.id}`}
                          className={styles.btnView}
                          title="View post"
                        >
                          <IconifyIcon icon="tabler:eye" />
                        </Link>
                        <Link
                          href={`/admin/posts/${post.id}/edit`}
                          className={styles.btnEdit}
                          title="Edit post"
                        >
                          <IconifyIcon icon="tabler:pencil" />
                        </Link>
                        <button
                          type="button"
                          className={styles.btnDelete}
                          onClick={() => handleDelete(post)}
                          title="Delete post"
                        >
                          <IconifyIcon icon="tabler:trash" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className={styles.emptyRow}>
                    <IconifyIcon icon="tabler:article-off" />
                    <span>No blog posts found</span>
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

export default PostsPanel

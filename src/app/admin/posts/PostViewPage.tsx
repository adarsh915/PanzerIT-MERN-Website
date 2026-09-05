'use client'

import PageTitle from '@/components/PageTitle'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import clsx from 'clsx'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { findPost, readCategories, type BlogCategory, type BlogPost } from './blogStore'
import styles from './PostViewPage.module.scss'
import { sanitizeHtml } from '@/utils/sanitize'

type Props = {
  postId: string
}

const formatDateTime = (value?: string) => {
  if (!value) return '-'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

const PostViewPage = ({ postId }: Props) => {
  const [post, setPost] = useState<BlogPost | null>(null)
  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    Promise.all([findPost(postId), readCategories()]).then(([p, cats]) => {
      setPost(p ?? null)
      setCategories(cats)
      setLoaded(true)
    })
  }, [postId])

  const categoryName = useMemo(
    () => categories.find((category) => category.id === post?.categoryId)?.name ?? '-',
    [categories, post?.categoryId],
  )

  return (
    <div className={styles.shell}>
      <PageTitle title="View Blog Post" subTitle="Blog Posts" />

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitle}>
            <IconifyIcon icon="tabler:eye" />
            <h3>Blog Post Details</h3>
          </div>
          <div className={styles.headerActions}>
            <Link href="/posts" className={styles.backBtn}>
              <IconifyIcon icon="tabler:arrow-left" />
              Back to Posts
            </Link>
            {post && (
              <Link href={`/posts/${post.id}/edit`} className={styles.editBtn}>
                <IconifyIcon icon="tabler:pencil" />
                Edit Post
              </Link>
            )}
          </div>
        </div>

        {!loaded ? (
          <div className={styles.notFound}>Loading blog post...</div>
        ) : !post ? (
          <div className={styles.notFound}>Blog post not found.</div>
        ) : (
          <div className={styles.body}>
            <div className={styles.hero}>
              <div className={styles.titleRow}>
                <h1 className={styles.title}>{post.title}</h1>
                <span className={clsx(styles.badge, post.status === 'published' ? styles.badgePublished : styles.badgeDraft)}>
                  {post.status}
                </span>
              </div>
            </div>

            <div className={styles.metaGrid}>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Slug</span>
                <code className={styles.slugCode}>{post.slug}</code>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Category</span>
                <span className={styles.metaValue}>{categoryName}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Author</span>
                <span className={styles.metaValue}>{post.author || '-'}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Created</span>
                <span className={styles.metaValue}>{formatDateTime(post.createdAt)}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Published</span>
                <span className={styles.metaValue}>{formatDateTime(post.publishedAt)}</span>
              </div>
            </div>

            {(post.tags ?? []).length > 0 && (
              <div className={styles.tags}>
                {post.tags?.map((tag) => <span key={tag}>{tag}</span>)}
              </div>
            )}

            <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
              {post.image && (
                <div>
                  <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 600 }}>Featured Image</span>
                  <img src={post.image} alt={post.imageAlt || post.title} style={{ width: '100%', maxWidth: '250px', maxHeight: '150px', objectFit: 'contain', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--surface-color)' }} />
                </div>
              )}
            </div>

            <div className={styles.seoBox}>
              <div className={styles.seoHeader}>
                <IconifyIcon icon="tabler:seo" />
                <h4>SEO</h4>
              </div>
              <div className={styles.seoGrid}>
                <div>
                  <span>Meta Title</span>
                  <p>{post.metaTitle || '-'}</p>
                </div>
                <div>
                  <span>Meta Description</span>
                  <p>{post.metaDescription || '-'}</p>
                </div>
                <div>
                  <span>Meta Keywords</span>
                  <p>{post.metaKeywords || '-'}</p>
                </div>
                <div>
                  <span>Image Title</span>
                  <p>{post.imageTitle || '-'}</p>
                </div>
                <div>
                  <span>Image Caption</span>
                  <p>{post.imageCaption || '-'}</p>
                </div>
                <div>
                  <span>Image Description</span>
                  <p>{post.imageDescription || '-'}</p>
                </div>
                <div>
                  <span>Image Alt Text</span>
                  <p>{post.imageAlt || '-'}</p>
                </div>
              </div>
            </div>

            <article
              className={styles.content}
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.description || '<p>No description added.</p>') }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default PostViewPage

'use client'

import PageTitle from '@/components/PageTitle'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import clsx from 'clsx'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { findBrand, type BrandPartner } from './brandStore'
import styles from '../posts/PostViewPage.module.scss'
import { sanitizeHtml } from '@/utils/sanitize'

type Props = {
  brandId: string
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

const BrandViewPage = ({ brandId }: Props) => {
  const [brand, setBrand] = useState<BrandPartner | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const loadBrand = async () => {
      const b = await findBrand(brandId)
      if (b) {
        setBrand(b)
      } else {
        setNotFound(true)
      }
      setLoaded(true)
    }
    loadBrand()
  }, [brandId])

  return (
    <div className={styles.shell}>
      <PageTitle title="View Brand & Partner" subTitle="Brands & Partners" />

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitle}>
            <IconifyIcon icon="tabler:eye" />
            <h3>Brand Details</h3>
          </div>
          <div className={styles.headerActions}>
            <Link href="/admin/brands" className={styles.backBtn}>
              <IconifyIcon icon="tabler:arrow-left" />
              Back to Brands
            </Link>
            {brand && (
              <Link href={`/admin/brands/${brand.id}/edit`} className={styles.editBtn}>
                <IconifyIcon icon="tabler:pencil" />
                Edit Brand
              </Link>
            )}
          </div>
        </div>

        {!loaded ? (
          <div className={styles.notFound}>Loading brand...</div>
        ) : !brand ? (
          <div className={styles.notFound}>Brand not found.</div>
        ) : (
          <div className={styles.body}>
            <div className={styles.hero}>
              <div className={styles.titleRow}>
                <div>
                  <h1 className={styles.title}>{brand.name}</h1>
                  {brand.website && <p className={styles.metaValue}>{brand.website}</p>}
                </div>
                <span className={clsx(styles.badge, brand.status === 'active' ? styles.badgePublished : styles.badgeDraft)}>
                  {brand.status}
                </span>
              </div>
            </div>

            <div className={styles.metaGrid}>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Slug</span>
                <code className={styles.slugCode}>{brand.slug}</code>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Category</span>
                <span className={styles.metaValue}>{brand.category || '-'}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Order</span>
                <span className={styles.metaValue}>{brand.order}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Featured</span>
                <span className={styles.metaValue}>{brand.featured ? 'Yes' : 'No'}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Created</span>
                <span className={styles.metaValue}>{formatDateTime(brand.createdAt)}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
              {brand.image && (
                <div>
                  <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 600 }}>Brand Image</span>
                  <img src={brand.image} alt={brand.imageAlt || brand.name} style={{ width: '100%', maxWidth: '250px', maxHeight: '150px', objectFit: 'contain', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--surface-color)' }} />
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
                  <p>{brand.metaTitle || '-'}</p>
                </div>
                <div>
                  <span>Meta Description</span>
                  <p>{brand.metaDescription || '-'}</p>
                </div>
                <div>
                  <span>Meta Keywords</span>
                  <p>{brand.metaKeywords || '-'}</p>
                </div>
                <div>
                  <span>Image Title</span>
                  <p>{brand.imageTitle || '-'}</p>
                </div>
                <div>
                  <span>Image Caption</span>
                  <p>{brand.imageCaption || '-'}</p>
                </div>
                <div>
                  <span>Image Description</span>
                  <p>{brand.imageDescription || '-'}</p>
                </div>
                <div>
                  <span>Image Alt Text</span>
                  <p>{brand.imageAlt || '-'}</p>
                </div>
                <div>
                  <span>Logo Alt Text</span>
                  <p>{brand.logoAlt || '-'}</p>
                </div>
              </div>
            </div>

            <article
              className={styles.content}
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(brand.description || '<p>No description added.</p>') }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default BrandViewPage

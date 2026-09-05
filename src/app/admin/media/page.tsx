'use client'

import PageTitle from '@/components/PageTitle'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { MediaItem } from '@/data/panzer/mock'
import { ChangeEvent, useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify'
import { Row, Col, Card, Button, Form, Modal } from 'react-bootstrap'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createMedia, deleteMedia, readMediaPaginated } from './mediaStore'

const formatBytes = (bytes: number, decimals = 2) => {
  if (!+bytes) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

const MediaPage = () => {
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  // Fetch media with React Query caching and database search
  const { data: mediaData, isLoading } = useQuery({
    queryKey: ['media', page, debouncedSearch],
    queryFn: async () => {
      const result = await readMediaPaginated(page, 20, debouncedSearch)
      return result
    },
    staleTime: 5 * 60 * 1000,
  })

  const items = mediaData?.items || []
  const total = mediaData?.total || 0
  const totalPages = Math.max(1, Math.ceil(total / 20))

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file.')
      event.target.value = ''
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.warn('Large file uploaded. Local storage might hit its quota.')
    }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', 'media')
    
    try {
      const toastId = toast.loading('Uploading media...')
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      const data = await res.json()
      if (res.ok && data.url) {
        const defaultAltText = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9]/g, ' ').trim()
        await createMedia({
          filename: file.name,
          type: file.type,
          sizeKb: Math.round(file.size / 1024),
          url: data.url,
          altText: defaultAltText,
        })
        toast.update(toastId, { render: 'Media uploaded successfully.', type: 'success', isLoading: false, autoClose: 2000 })
        queryClient.invalidateQueries({ queryKey: ['media'] })
      } else {
        toast.update(toastId, { render: data.error || 'Failed to upload media.', type: 'error', isLoading: false, autoClose: 3000 })
      }
    } catch (e) {
      toast.error('Failed to upload file.')
    }
    event.target.value = ''
  }

  const handleDelete = async (id: string) => {
    await deleteMedia(id)
    toast.success('Media deleted successfully.')
    queryClient.invalidateQueries({ queryKey: ['media'] })
  }

  return (
    <>
      <PageTitle title="Media Library" subTitle="Panzer IT" />

      <Card>
        <Card.Header className="d-flex flex-wrap justify-content-between align-items-center gap-2">
          <h4 className="header-title mb-0">Files</h4>
          <div className="d-flex align-items-center gap-2">
            <div className="position-relative" style={{ minWidth: '280px' }}>
              <Form.Control
                type="text"
                placeholder="Search by filename..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingRight: search ? '32px' : '12px' }}
              />
              {search && (
                <button
                  type="button"
                  className="btn btn-sm btn-link position-absolute end-0 top-50 translate-middle-y text-muted p-1 me-1 text-decoration-none"
                  onClick={() => setSearch('')}
                  title="Clear search"
                >
                  <IconifyIcon icon="tabler:x" />
                </button>
              )}
            </div>
            <Button variant="primary" onClick={() => fileInputRef.current?.click()}>
              <IconifyIcon icon="tabler:upload" className="me-1" />
              Upload New Media
            </Button>
            <input
              type="file"
              accept="image/*"
              className="d-none"
              ref={fileInputRef}
              onChange={handleUpload}
            />
          </div>
        </Card.Header>
        <Card.Body>
          {isLoading ? (
            <div className="text-center p-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center p-5 text-muted">
              <IconifyIcon icon="tabler:photo-off" style={{ fontSize: '48px', opacity: 0.5 }} className="mb-3" />
              <h5>{debouncedSearch ? `No media files found matching "${debouncedSearch}"` : 'No media files found'}</h5>
              <p>{debouncedSearch ? 'Try searching for another filename or clear your search query.' : 'Upload some images to get started.'}</p>
              {debouncedSearch ? (
                <Button variant="outline-primary" onClick={() => setSearch('')}>
                  <IconifyIcon icon="tabler:x" className="me-1" />
                  Clear Search
                </Button>
              ) : (
                <Button variant="outline-primary" onClick={() => fileInputRef.current?.click()}>
                  <IconifyIcon icon="tabler:upload" className="me-1" />
                  Upload Image
                </Button>
              )}
            </div>
          ) : (
          <>
            <Row className="g-3">
              {items.map((item) => (
                <Col md={4} lg={3} xl={2} key={item.id}>
                  <Card
                    className="h-100 shadow-sm border position-relative"
                    style={{ transition: 'all 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.classList.add('border-primary')}
                    onMouseLeave={(e) => e.currentTarget.classList.remove('border-primary')}
                  >
                    <button
                      type="button"
                      className="position-absolute top-0 end-0 m-1 bg-danger text-white border-0 rounded-circle d-flex align-items-center justify-content-center"
                      style={{ width: '24px', height: '24px', zIndex: 10 }}
                      onClick={() => handleDelete(item.id)}
                      title="Delete Image"
                    >
                      <IconifyIcon icon="tabler:x" style={{ fontSize: '14px' }} />
                    </button>
                    <div className="bg-light d-flex align-items-center justify-content-center h-100" style={{ minHeight: '140px', overflow: 'hidden' }}>
                      {item.url ? (
                        <img
                          src={item.url}
                          alt={item.altText || item.filename}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <IconifyIcon icon="tabler:file-unknown" className="text-muted" style={{ fontSize: '32px' }} />
                      )}
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
            {(totalPages > 1 || items.length > 0) && (
              <div className="d-flex justify-content-center align-items-center mt-4">
                <Button variant="outline-secondary" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="me-2">
                  <IconifyIcon icon="tabler:chevron-left" /> Prev
                </Button>
                <span className="text-muted small">Page {page} of {totalPages} (Total: {total} items)</span>
                <Button variant="outline-secondary" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="ms-2">
                  Next <IconifyIcon icon="tabler:chevron-right" />
                </Button>
              </div>
            )}
          </>
        )}
      </Card.Body>
      </Card>

    </>
  )
}

export default MediaPage

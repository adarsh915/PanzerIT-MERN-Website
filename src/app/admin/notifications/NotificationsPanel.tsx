'use client'

import PageTitle from '@/components/PageTitle'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import clsx from 'clsx'
import { useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import { Spinner, Button, Badge } from 'react-bootstrap'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { deleteLead, markLeadRead, markAllLeadsRead, readLeadsPaginated } from '../leads/leadStore'
import { readSubmissions, deleteSubmission, markSubmissionRead, markAllSubmissionsRead } from '../resources/questionnaires/questionnaireStore'
import { confirmDeleteWithName } from '@/utils/confirmDelete'
import styles from '../solutions/SolutionsPanel.module.scss'
import { timeSince } from '@/utils/date'

const PAGE_SIZES = [10, 25, 50]

const NotificationsPanel = () => {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [pageSize, setPageSize] = useState(10)
  const [page, setPage] = useState(1)

  const { data: leadsData, isLoading: leadsLoading } = useQuery({
    queryKey: ['leads'],
    queryFn: async () => {
      const result = await readLeadsPaginated(1, 1000)
      return result.leads
    },
    staleTime: 60 * 1000,
  })

  const { data: submissionsData, isLoading: submissionsLoading } = useQuery({
    queryKey: ['submissions'],
    queryFn: () => readSubmissions(),
    staleTime: 60 * 1000,
  })

  const isLoading = leadsLoading || submissionsLoading;

  const markReadMutation = useMutation({
    mutationFn: (data: { id: string, type: 'lead' | 'submission' }) => 
      data.type === 'lead' ? markLeadRead(data.id) : markSubmissionRead(data.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['unreadLeads'] });
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      queryClient.invalidateQueries({ queryKey: ['unreadSubmissions'] });
      queryClient.invalidateQueries({ queryKey: ['unreadSubmissionsCount'] });
      toast.success('Marked as read');
    }
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      await markAllLeadsRead();
      await markAllSubmissionsRead();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['unreadLeads'] });
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      queryClient.invalidateQueries({ queryKey: ['unreadSubmissions'] });
      queryClient.invalidateQueries({ queryKey: ['unreadSubmissionsCount'] });
      toast.success('All notifications marked as read');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (data: { id: string, type: 'lead' | 'submission' }) => 
      data.type === 'lead' ? deleteLead(data.id) : deleteSubmission(data.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['unreadLeads'] });
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      queryClient.invalidateQueries({ queryKey: ['unreadSubmissions'] });
      queryClient.invalidateQueries({ queryKey: ['unreadSubmissionsCount'] });
      toast.success('Notification deleted');
    }
  });

  const allNotifications = useMemo(() => {
    const leads = leadsData || [];
    const submissions = submissionsData || [];

    return [
      ...leads.map(l => ({
        id: l.id,
        type: 'lead' as const,
        name: l.name,
        email: l.email,
        phone: l.phone,
        subject: l.subject || 'Lead',
        message: l.message || 'No message',
        date: new Date(l.submittedAt),
        read: l.read
      })),
      ...submissions.map(s => ({
        id: s.id,
        type: 'submission' as const,
        name: `${s.firstName} ${s.lastName}`,
        email: s.email,
        phone: '', // Forms may not have phone
        subject: s.questionnaireName || 'Form Submission',
        message: s.notes || 'No notes',
        date: new Date(s.createdAt),
        read: s.isRead
      }))
    ].sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [leadsData, submissionsData]);

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim()
    return allNotifications
      .filter((item) =>
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.email.toLowerCase().includes(query) ||
        item.subject.toLowerCase().includes(query) ||
        item.message.toLowerCase().includes(query)
      )
  }, [allNotifications, search])

  const unreadCount = allNotifications.filter((item) => !item.read).length
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  return (
    <>
      <PageTitle title="Notifications" subTitle="Admin" />

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardHeaderLeft}>
            <IconifyIcon icon="tabler:bell" />
            <h3>All Notifications</h3>
            <span className={styles.totalBadge}>{allNotifications.length}</span>
            <Button variant="light" size="sm" onClick={() => {
              queryClient.invalidateQueries({ queryKey: ['leads'] });
              queryClient.invalidateQueries({ queryKey: ['submissions'] });
            }}>
              <IconifyIcon icon="tabler:refresh" className="me-1" /> Refresh
            </Button>
            {unreadCount > 0 && (
              <Button variant="primary" size="sm" onClick={() => markAllReadMutation.mutate()}>
                <IconifyIcon icon="tabler:checks" className="me-1" /> Mark all as read
              </Button>
            )}
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
                  aria-label="Search notifications"
                />
              </div>
            </div>

            <div className="list-group list-group-flush border-top">
              {paginated.length > 0 ? (
                paginated.map((item) => (
                  <div key={`${item.type}-${item.id}`} className={`list-group-item list-group-item-action d-flex align-items-start py-3 ${!item.read ? 'bg-light' : ''}`}>
                    <div className="avatar-sm me-3 flex-shrink-0">
                      <span className={`avatar-title rounded-circle ${!item.read ? 'bg-primary text-white' : 'bg-secondary-subtle text-secondary'}`}>
                        <IconifyIcon icon={!item.read ? (item.type === 'lead' ? "tabler:mail" : "tabler:file-invoice") : (item.type === 'lead' ? "tabler:mail-opened" : "tabler:file-check")} className="fs-20" />
                      </span>
                    </div>
                    <div className="flex-grow-1 overflow-hidden">
                      <div className="d-flex align-items-center justify-content-between mb-1">
                        <h5 className={`m-0 fs-15 ${!item.read ? 'fw-bold text-dark' : 'text-muted'}`}>
                          {item.name}
                          {!item.read && <Badge bg="danger" className="ms-2">New</Badge>}
                        </h5>
                        <small className="text-muted">{timeSince(item.date)}</small>
                      </div>
                      <p className={`mb-1 ${!item.read ? 'fw-medium text-dark' : 'text-muted'}`}>
                        <span className="opacity-75 me-2">[{item.subject}]</span>
                        {item.message}
                      </p>
                      <div className="text-muted fs-13 d-flex gap-3 mt-2">
                        <span className="d-flex align-items-center">
                          <IconifyIcon icon="tabler:mail" className="me-1 fs-16" /> {item.email}
                        </span>
                        {item.phone && (
                          <span className="d-flex align-items-center">
                            <IconifyIcon icon="tabler:phone" className="me-1 fs-16" /> {item.phone}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="ms-3 flex-shrink-0 d-flex flex-column gap-2">
                      {!item.read && (
                        <Button variant="outline-primary" size="sm" onClick={() => markReadMutation.mutate({ id: item.id, type: item.type })} title="Mark as Read">
                          <IconifyIcon icon="tabler:check" />
                        </Button>
                      )}
                      <Button variant="outline-danger" size="sm" onClick={async () => { if(await confirmDeleteWithName('Delete this notification?')) deleteMutation.mutate({ id: item.id, type: item.type }) }} title="Delete">
                        <IconifyIcon icon="tabler:trash" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-5">
                  <IconifyIcon icon="tabler:bell-off" className="fs-50 text-muted mb-3" />
                  <h5 className="text-muted">No notifications found</h5>
                </div>
              )}
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

export default NotificationsPanel

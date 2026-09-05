"use client"
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import SimplebarReactClient from '@/components/wrappers/SimplebarReactClient'
import { Col, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Row } from 'react-bootstrap'
import Link from 'next/link'
import { timeSince } from '@/utils/date'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getUnreadLeads, getUnreadCount, markLeadRead, markAllLeadsRead } from '@/app/admin/leads/leadStore'
import { getUnreadSubmissions, countUnreadSubmissions, markSubmissionRead, markAllSubmissionsRead } from '@/app/admin/resources/questionnaires/questionnaireStore'

const Notifications = () => {
  const queryClient = useQueryClient();

  const { data: unreadLeads = [] } = useQuery({
    queryKey: ['unreadLeads'],
    queryFn: () => getUnreadLeads(5),
    refetchInterval: 30000,
  });

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['unreadCount'],
    queryFn: () => getUnreadCount(),
    refetchInterval: 30000,
  });

  const { data: unreadSubmissions = [] } = useQuery({
    queryKey: ['unreadSubmissions'],
    queryFn: () => getUnreadSubmissions(5),
    refetchInterval: 30000,
  });

  const { data: unreadSubmissionsCount = 0 } = useQuery({
    queryKey: ['unreadSubmissionsCount'],
    queryFn: () => countUnreadSubmissions(),
    refetchInterval: 30000,
  });

  const totalUnread = unreadCount + unreadSubmissionsCount;

  // Combine and sort notifications
  const allNotifications = [
    ...unreadLeads.map(l => ({
      id: l.id,
      type: 'lead' as const,
      title: l.name,
      subtitle: l.subject || 'Lead',
      message: l.message || 'No message',
      date: new Date(l.submittedAt)
    })),
    ...unreadSubmissions.map(s => ({
      id: s.id,
      type: 'submission' as const,
      title: `${s.firstName} ${s.lastName}`,
      subtitle: s.questionnaireName || 'Form Submission',
      message: s.notes || 'No notes',
      date: new Date(s.createdAt)
    }))
  ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5); // Keep top 5

  const markReadMutation = useMutation({
    mutationFn: (data: { id: string, type: 'lead' | 'submission' }) =>
      data.type === 'lead' ? markLeadRead(data.id) : markSubmissionRead(data.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unreadLeads'] });
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['unreadSubmissions'] });
      queryClient.invalidateQueries({ queryKey: ['unreadSubmissionsCount'] });
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
    }
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      await markAllLeadsRead();
      await markAllSubmissionsRead();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unreadLeads'] });
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['unreadSubmissions'] });
      queryClient.invalidateQueries({ queryKey: ['unreadSubmissionsCount'] });
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
    }
  });

  return (
    <div className="topbar-item">
      <Dropdown align={'end'}>
        <DropdownToggle as={'button'} className="topbar-link drop-arrow-none" data-bs-toggle="dropdown" data-bs-offset="0,25" aria-haspopup="false" aria-expanded="false">
          <IconifyIcon icon='tabler:bell' className="animate-ring fs-22" />
          {totalUnread > 0 && <span className="noti-icon-badge">{totalUnread > 9 ? '9+' : totalUnread}</span>}
        </DropdownToggle>
        <DropdownMenu className="p-0 dropdown-menu-start dropdown-menu-lg" style={{ minHeight: 300 }}>
          <div className="p-3 border-bottom border-dashed">
            <Row className="align-items-center">
              <Col>
                <h6 className="m-0 fs-16 fw-semibold"> Notifications</h6>
              </Col>
            </Row>
          </div>
          <style dangerouslySetInnerHTML={{
            __html: `
            .notification-scroll-container { 
                overflow-y: auto !important;
                scrollbar-width: thin;
                scrollbar-color: #a2adb7 transparent;
            }
            .notification-scroll-container::-webkit-scrollbar { 
                width: 5px; 
            }
            .notification-scroll-container::-webkit-scrollbar-track {
                background: transparent;
            }
            .notification-scroll-container::-webkit-scrollbar-thumb {
                background: #a2adb7;
                border-radius: 7px;
            }
          `}} />
          <div className="notification-scroll-container position-relative z-2 card shadow-none rounded-0 w-100" style={{ maxHeight: 300, minWidth: '320px' }}>
            {
              allNotifications.map((item) => (
                <div className="notification-item dropdown-item py-2 text-wrap w-100" key={`${item.type}-${item.id}`}>
                  <span className="d-flex align-items-center w-100">
                    <div className="avatar-md flex-shrink-0 me-3">
                      <span className={`avatar-title bg-primary-subtle text-primary rounded-circle fs-22`}>
                        <IconifyIcon icon={item.type === 'lead' ? 'tabler:mail' : 'tabler:file-invoice'} />
                      </span>
                    </div>

                    <span className="flex-grow-1 text-muted">
                      <strong>{item.title}</strong> <span className="fs-12 opacity-75">({item.subtitle})</span>
                      <br />
                      <span className="fs-12 text-truncate d-inline-block" style={{ maxWidth: '180px' }}>
                        {item.message}
                      </span>
                      <br />
                      <span className="fs-12 text-primary">{timeSince(item.date)}</span>
                    </span>
                    <span className="notification-item-close" onClick={() => markReadMutation.mutate({ id: item.id, type: item.type })}>
                      <button type="button" className="btn btn-ghost-danger rounded-circle btn-sm btn-icon" title="Mark as read">
                        <IconifyIcon icon='tabler:check' className="fs-16" />
                      </button>
                    </span>
                  </span>
                </div>
              ))
            }

          </div>
          {allNotifications.length === 0 && (
            <div style={{ height: 300 }} className="d-flex align-items-center justify-content-center text-center position-absolute top-0 bottom-0 start-0 end-0 z-1 pointer-events-none ">
              <div style={{ marginTop: '97px' }}>
                <IconifyIcon icon="line-md:bell-twotone-alert-loop" className="fs-80 text-secondary mt-2" />
                <h4 className="fw-semibold mb-0 fst-italic lh-base mt-3">Hey! 👋 <br />You have no unread notifications</h4>
              </div>
            </div>

          )}
          <div className="border-top border-light py-2 text-center bg-white" style={{ position: 'sticky', bottom: 0, zIndex: 10 }}>
            <Link href="/admin/notifications" className="text-reset text-decoration-underline link-offset-2 fw-bold">
              View All
            </Link>
          </div>
        </DropdownMenu>
      </Dropdown>
    </div>
  )
}

export default Notifications
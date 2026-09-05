import PageTitle from '@/components/PageTitle'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Link from 'next/link'
import { Badge, Card, CardBody, CardHeader, Col, ProgressBar, Row, Table } from 'react-bootstrap'
import { 
  readDashboardStats, 
  readRecentLeads, 
  readTopDownloads,
  type DashboardLead,
  type DashboardDownload
} from './dashboard/dashboardStore'

const leadStatusVariant: Record<string, string> = {
  new: 'primary',
  contacted: 'info',
  qualified: 'success',
  closed: 'secondary',
  spam: 'danger',
}

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('en', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }).format(new Date(value))

export const dynamic = 'force-dynamic'

const DashboardPage = async () => {
  // Optimized: Single database query instead of loading full datasets
  const [stats, recentLeads, topDownloads] = await Promise.all([
    readDashboardStats(),
    readRecentLeads(5),
    readTopDownloads(5)
  ])

  const {
    publishedPosts,
    totalPosts,
    activeSolutions,
    totalSolutions,
    featuredBrands,
    totalBrands,
    newLeads,
    totalLeads,
    totalMedia,
    totalMediaKb,
    totalResources,
    totalDownloads
  } = stats

  const modules = [
    {
      title: 'Blog Posts',
      href: '/admin/posts',
      icon: 'tabler:article',
      total: totalPosts,
      detail: `${publishedPosts} published`,
      color: 'primary',
    },
    {
      title: 'Solutions & Services',
      href: '/admin/solutions',
      icon: 'tabler:shield-check',
      total: totalSolutions,
      detail: `${activeSolutions} active`,
      color: 'success',
    },
    {
      title: 'Brands & Partners',
      href: '/admin/brands',
      icon: 'tabler:building-store',
      total: totalBrands,
      detail: `${featuredBrands} featured`,
      color: 'info',
    },
    {
      title: 'Leads',
      href: '/admin/leads',
      icon: 'tabler:mail-opened',
      total: totalLeads,
      detail: `${newLeads} new`,
      color: 'warning',
    },
    {
      title: 'Downloads',
      href: '/admin/downloads',
      icon: 'tabler:download',
      total: totalResources,
      detail: `${totalDownloads} total downloads`,
      color: 'danger',
    },
    {
      title: 'Media Library',
      href: '/admin/media',
      icon: 'tabler:photo',
      total: totalMedia,
      detail: `${Math.round(totalMediaKb)} KB stored`,
      color: 'secondary',
    },
  ]

  return (
    <>
      <PageTitle title="Dashboard" />

      <Row>
        <Col xl={3} md={6}>
          <Card>
            <CardBody>
              <div className="d-flex align-items-center gap-3">
                <div className="avatar-md rounded bg-primary-subtle text-primary d-flex align-items-center justify-content-center">
                  <IconifyIcon icon="tabler:shield-check" className="fs-24" />
                </div>
                <div>
                  <p className="text-muted mb-1">Active Services</p>
                  <h3 className="mb-0">{activeSolutions}</h3>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col xl={3} md={6}>
          <Card>
            <CardBody>
              <div className="d-flex align-items-center gap-3">
                <div className="avatar-md rounded bg-success-subtle text-success d-flex align-items-center justify-content-center">
                  <IconifyIcon icon="tabler:article" className="fs-24" />
                </div>
                <div>
                  <p className="text-muted mb-1">Published Posts</p>
                  <h3 className="mb-0">{publishedPosts}</h3>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col xl={3} md={6}>
          <Card>
            <CardBody>
              <div className="d-flex align-items-center gap-3">
                <div className="avatar-md rounded bg-warning-subtle text-warning d-flex align-items-center justify-content-center">
                  <IconifyIcon icon="tabler:mail-opened" className="fs-24" />
                </div>
                <div>
                  <p className="text-muted mb-1">New Leads</p>
                  <h3 className="mb-0">{newLeads}</h3>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col xl={3} md={6}>
          <Card>
            <CardBody>
              <div className="d-flex align-items-center gap-3">
                <div className="avatar-md rounded bg-danger-subtle text-danger d-flex align-items-center justify-content-center">
                  <IconifyIcon icon="tabler:download" className="fs-24" />
                </div>
                <div>
                  <p className="text-muted mb-1">Downloads</p>
                  <h3 className="mb-0">{totalDownloads}</h3>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>

      <Row>
        {modules.map((item) => (
          <Col xxl={3} xl={4} md={6} key={item.href}>
            <Card>
              <CardBody>
                <div className="d-flex align-items-start justify-content-between gap-3">
                  <div>
                    <p className="text-muted mb-1">{item.title}</p>
                    <h4 className="mb-1">{item.total}</h4>
                    <span className="text-muted fs-13">{item.detail}</span>
                  </div>
                  <div className={`avatar-md rounded bg-${item.color}-subtle text-${item.color} d-flex align-items-center justify-content-center`}>
                    <IconifyIcon icon={item.icon} className="fs-24" />
                  </div>
                </div>
                <Link href={item.href} className="btn btn-sm btn-light w-100 mt-3">
                  Manage
                </Link>
              </CardBody>
            </Card>
          </Col>
        ))}
      </Row>

      <Row>
        <Col xl={7}>
          <Card>
            <CardHeader className="d-flex align-items-center justify-content-between">
              <h5 className="card-title mb-0">Recent Leads</h5>
              <Link href="/admin/leads" className="btn btn-sm btn-soft-primary">
                View All
              </Link>
            </CardHeader>
            <CardBody className="p-0 px-3">
              <Table responsive hover className="mb-0">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {recentLeads.map((lead: DashboardLead) => (
                    <tr key={lead.id}>
                      <td className="fw-medium">{lead.name}</td>
                      <td>{lead.email}</td>
                      <td>
                        <Badge bg={leadStatusVariant[lead.status] || 'secondary'}>{lead.status}</Badge>
                      </td>
                      <td>{formatDate(lead.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </CardBody>
          </Card>
        </Col>
        <Col xl={5}>
          <Card>
            <CardHeader>
              <h5 className="card-title mb-0">Content Health</h5>
            </CardHeader>
            <CardBody>
              <div className="mb-4">
                <div className="d-flex justify-content-between mb-2">
                  <span className="fw-medium">Published blog posts</span>
                  <span>{publishedPosts}/{totalPosts}</span>
                </div>
                <ProgressBar now={totalPosts > 0 ? (publishedPosts / totalPosts) * 100 : 0} variant="success" />
              </div>
              <div className="mb-4">
                <div className="d-flex justify-content-between mb-2">
                  <span className="fw-medium">Active services</span>
                  <span>{activeSolutions}/{totalSolutions}</span>
                </div>
                <ProgressBar now={totalSolutions > 0 ? (activeSolutions / totalSolutions) * 100 : 0} variant="primary" />
              </div>
              <div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="fw-medium">Featured brands</span>
                  <span>{featuredBrands}/{totalBrands}</span>
                </div>
                <ProgressBar now={totalBrands > 0 ? (featuredBrands / totalBrands) * 100 : 0} variant="info" />
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col xl={6}>
          <Card>
            <CardHeader>
              <h5 className="card-title mb-0">Top Downloads</h5>
            </CardHeader>
            <CardBody>
              {topDownloads.map((download: DashboardDownload) => (
                <div className="d-flex align-items-center justify-content-between border-bottom pb-3 mb-3" key={download.id}>
                  <div>
                    <h6 className="mb-1">{download.title}</h6>
                    <span className="text-muted fs-13">/{download.slug}</span>
                  </div>
                  <Badge bg="danger">{download.downloadCount || 0}</Badge>
                </div>
              ))}
              <Link href="/admin/downloads" className="btn btn-sm btn-light w-100">
                Manage Downloads
              </Link>
            </CardBody>
          </Card>
        </Col>
        <Col xl={6}>
          <Card>
            <CardHeader>
              <h5 className="card-title mb-0">Quick Actions</h5>
            </CardHeader>
            <CardBody>
              <Row className="g-2">
                {modules.slice(0, 6).map((item) => (
                  <Col sm={6} key={`quick-${item.href}`}>
                    <Link href={item.href} className="btn btn-light w-100 text-start">
                      <IconifyIcon icon={item.icon} className="me-2 fs-18" />
                      {item.title}
                    </Link>
                  </Col>
                ))}
              </Row>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  )
}

export default DashboardPage

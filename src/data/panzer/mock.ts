export type PostStatus = 'draft' | 'published'

export type Post = {
  id: string
  title: string
  slug: string
  status: PostStatus
  publishedAt?: string
  createdAt: string
}

export type Solution = {
  id: string
  title: string
  subtitle: string
  description: string
  category: string
  image: string
  slug: string
  order: number
  status: 'active' | 'inactive'
}

export type Brand = {
  id: string
  name: string
  website?: string
  featured: boolean
}

export type Lead = {
  id: string
  name: string
  email: string
  status: 'new' | 'contacted' | 'qualified' | 'closed' | 'spam'
  createdAt: string
}

export type Download = {
  id: string
  title: string
  slug: string
  downloadCount: number
  createdAt: string
}

export type MediaItem = {
  id: string
  filename: string
  type: string
  sizeKb: number
  createdAt: string
  url?: string
  altText?: string
}


export const MOCK_POSTS: Post[] = [
  {
    id: 'p1',
    title: 'Hardening Express APIs: Security Checklist',
    slug: 'hardening-express-apis-security-checklist',
    status: 'published',
    publishedAt: '2026-05-10T10:20:00Z',
    createdAt: '2026-05-08T12:00:00Z',
  },
  {
    id: 'p2',
    title: 'NoSQL Injection: How to Prevent $ne Attacks',
    slug: 'nosql-injection-prevent-ne-attacks',
    status: 'draft',
    createdAt: '2026-05-18T09:12:00Z',
  },
]

export const MOCK_SOLUTIONS: Solution[] = [
  {
    id: 's1',
    title: 'Scoped DLP with UEBA',
    subtitle: 'Data Leak Prevention',
    description: 'Protect sensitive data with user behavior analytics, policy-driven control and visibility across endpoints and business workflows.',
    category: 'Data Protection',
    image: '/assets/images/service/leak.webp',
    slug: 'scoped-dlp-ueba',
    order: 1,
    status: 'active',
  },
  {
    id: 's2',
    title: 'Vulnerability Scanner, Assessment & VAPT',
    subtitle: 'Security Assessment',
    description: 'Identify exploitable weaknesses before attackers do with guided vulnerability assessment and penetration testing support.',
    category: 'Security',
    image: '/assets/images/service/sccanner.webp',
    slug: 'vulnerability-scanner-vapt',
    order: 2,
    status: 'active',
  },
  {
    id: 's3',
    title: 'Employee Monitoring Solution',
    subtitle: 'User Activity Monitoring',
    description: 'Track risky behavior, improve accountability and support compliance with secure user activity monitoring for enterprise teams.',
    category: 'Monitoring',
    image: '/assets/images/service/i-1.webp',
    slug: 'employee-monitoring-solution',
    order: 3,
    status: 'active',
  },
  {
    id: 's4',
    title: 'Most Advanced Anti-Malware',
    subtitle: 'Endpoint Protection',
    description: 'Deploy next-generation anti-malware protection against ransomware, zero-day threats and known or unknown endpoint attacks.',
    category: 'Security',
    image: '/assets/images/service/malware.webp',
    slug: 'advanced-anti-malware',
    order: 4,
    status: 'active',
  },
  {
    id: 's5',
    title: 'Backup & Disaster Recovery',
    subtitle: 'Business Continuity',
    description: 'Keep virtual, physical, cloud and SaaS workloads recoverable with resilient backup strategy and business continuity planning.',
    category: 'Backup',
    image: '/assets/images/service/backup.webp',
    slug: 'backup-disaster-recovery',
    order: 5,
    status: 'active',
  },
  {
    id: 's6',
    title: 'Backup Solution for All Platforms',
    subtitle: 'Cross-Platform Backup',
    description: 'Choose scalable backup for endpoints, servers and enterprise environments with flexible licensing and strong return on investment.',
    category: 'Backup',
    image: '/assets/images/service/recovery.webp',
    slug: 'backup-solution-all-platforms',
    order: 6,
    status: 'active',
  },
  {
    id: 's7',
    title: 'Data Leak Prevention DLP',
    subtitle: 'Data Security',
    description: 'Discover, monitor and prevent sensitive data exposure across endpoint, network and cloud channels before it leaves your control.',
    category: 'Data Protection',
    image: '/assets/images/service/pre.webp',
    slug: 'data-leak-prevention-dlp',
    order: 7,
    status: 'active',
  },
  {
    id: 's8',
    title: 'Advanced Threat Prevention EDR | EPS',
    subtitle: 'Endpoint Detection & Response',
    description: 'Improve detection and response with layered endpoint defense built for targeted attacks, APTs and modern persistent threats.',
    category: 'Security',
    image: '/assets/images/service/lock.webp',
    slug: 'advanced-threat-prevention-edr',
    order: 8,
    status: 'active',
  },
  {
    id: 's9',
    title: 'IAM | PAM | PSM & DBAM',
    subtitle: 'Identity & Access Management',
    description: 'Secure identities, privileged access and critical sessions with enterprise-grade access management and stronger control over sensitive systems.',
    category: 'Identity',
    image: '/assets/images/service/i-2.webp',
    slug: 'iam-pam-psm-dbam',
    order: 9,
    status: 'active',
  },
]

export const MOCK_BRANDS: Brand[] = [
  { id: 'b1', name: 'CrowdStrike', website: 'https://www.crowdstrike.com', featured: true },
  { id: 'b2', name: 'Palo Alto Networks', website: 'https://www.paloaltonetworks.com', featured: false },
]

export const MOCK_LEADS: Lead[] = [
  { id: 'l1', name: 'Amit Sharma', email: 'amit@example.com', status: 'new', createdAt: '2026-05-25T06:10:00Z' },
  { id: 'l2', name: 'Sara Khan', email: 'sara@example.com', status: 'contacted', createdAt: '2026-05-24T15:45:00Z' },
]

export const MOCK_DOWNLOADS: Download[] = [
  { id: 'd1', title: 'Zero Trust Whitepaper', slug: 'zero-trust-whitepaper', downloadCount: 128, createdAt: '2026-04-22T11:00:00Z' },
  { id: 'd2', title: 'Ransomware Defense Checklist', slug: 'ransomware-defense-checklist', downloadCount: 89, createdAt: '2026-05-02T11:00:00Z' },
]

export const MOCK_MEDIA: MediaItem[] = [
  { id: 'm1', filename: 'hero-banner.webp', type: 'image/webp', sizeKb: 240, createdAt: '2026-05-01T10:00:00Z', url: '/assets/images/service/leak.webp', altText: 'Hero Banner' },
  { id: 'm2', filename: 'brochure.pdf', type: 'application/pdf', sizeKb: 1024, createdAt: '2026-05-03T10:00:00Z', url: '', altText: 'Brochure PDF' },
]
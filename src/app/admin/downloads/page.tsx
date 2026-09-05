import { Metadata } from 'next'
import TablePage from '@/components/panzer/TablePage'
import { readAllResources } from '@/app/admin/resources/resourceStore'
import { ResourceItem } from '@/app/admin/resources/resourceTypes'

export const metadata: Metadata = { title: 'Downloads' }
export const dynamic = 'force-dynamic'

const DownloadsPage = async () => {
  const resources = await readAllResources()

  // Sort resources by download count (highest first)
  const sortedResources = [...resources].sort((a, b) => (b.downloadCount || 0) - (a.downloadCount || 0))

  return (
    <TablePage<ResourceItem>
      title="Downloads"
      subTitle="Panzer IT"
      rows={sortedResources}
      columns={[
        { key: 'title', label: 'Title' },
        { key: 'slug', label: 'Slug' },
        { key: 'downloadCount', label: 'Downloads' },
        { key: 'createdAt', label: 'Created', format: 'dateTime' },
      ]}
    />
  )
}

export default DownloadsPage

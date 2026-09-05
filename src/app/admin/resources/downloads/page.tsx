import { Metadata } from 'next'
import { readResourceDownloadLogs } from '../resourceStore'
import DownloadsLogsPanel from './DownloadsLogsPanel'

export const metadata: Metadata = { title: 'Download Logs' }

export const dynamic = 'force-dynamic'

export default async function DownloadLogsPage() {
  const logs = await readResourceDownloadLogs()
  return <DownloadsLogsPanel initialLogs={logs} />
}

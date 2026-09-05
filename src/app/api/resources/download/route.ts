import { NextRequest, NextResponse } from 'next/server'
import { incrementResourceDownloadCount, logResourceDownload } from '@/app/admin/resources/resourceStore'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const id = searchParams.get('id')
  const url = searchParams.get('url')

  if (!id || !url) {
    return new NextResponse('Missing id or url', { status: 400 })
  }

  try {
    // 1. Increment total counter
    await incrementResourceDownloadCount(id)

    // 2. Log individual download with location
    try {
      let ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1'
      if (ip.includes(',')) ip = ip.split(',')[0].trim()

      let city = 'Unknown'
      let region = 'Unknown'
      let country = 'Unknown'

      if (ip && ip !== '127.0.0.1' && ip !== '::1') {
        const geoRes = await fetch(`http://ip-api.com/json/${ip}`)
        if (geoRes.ok) {
          const geo = await geoRes.json()
          if (geo.status === 'success') {
            city = geo.city || 'Unknown'
            region = geo.regionName || 'Unknown'
            country = geo.country || 'Unknown'
          }
        }
      } else {
        city = 'Local'
        region = 'Development'
        country = 'Environment'
      }

      await logResourceDownload(id, ip, city, region, country)
    } catch (geoError) {
      console.error('Failed to fetch/log location:', geoError)
    }

  } catch (error) {
    console.error('Failed to increment download count:', error)
  }

  let redirectUrl = url
  if (url.startsWith('/')) {
    const host = request.headers.get('host') || 'localhost:3000'
    const proto = request.headers.get('x-forwarded-proto') || 'http'
    redirectUrl = `${proto}://${host}${url}`
  }

  try {
    const fileRes = await fetch(redirectUrl)
    if (fileRes.ok) {
      const arrayBuffer = await fileRes.arrayBuffer()
      const rawFilename = url.split('/').pop()?.split('?')[0] || 'resource-download'
      const filename = decodeURIComponent(rawFilename)
      const contentType = fileRes.headers.get('content-type') || 'application/octet-stream'

      return new NextResponse(arrayBuffer, {
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Cache-Control': 'no-cache',
        },
      })
    }
  } catch (fileErr) {
    console.error('Failed to proxy download file, falling back to redirect:', fileErr)
  }

  return NextResponse.redirect(new URL(redirectUrl))
}

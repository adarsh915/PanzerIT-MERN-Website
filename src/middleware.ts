import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/sessionToken'

// Middleware runs on the default Edge runtime.
// We use HMAC-signed cookies (Web Crypto API) — no DB call needed here.
// Forged cookies are rejected by HMAC verification without touching the database.

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    const cookieValue = request.cookies.get('admin_session')?.value
 
    // No cookie → redirect to login (or return 401 for API routes)
    if (!cookieValue) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(loginUrl)
    }
 
    // Verify the HMAC signature — rejects forged cookies instantly, no DB call
    const tokenData = await verifyToken(cookieValue)
    if (!tokenData) {
      // Invalid or forged cookie → clear it and redirect/respond
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('redirectTo', pathname)
      const response = NextResponse.redirect(loginUrl)
      response.cookies.delete('admin_session')
      return response
    }

    const { role } = tokenData

    // Enforce RBAC
    if (role === 'author') {
      const allowedPaths = ['/admin', '/admin/', '/admin/posts', '/admin/media', '/admin/profile']
      const allowedApiPaths = ['/api/admin/posts', '/api/admin/media', '/api/admin/profile']
      
      const isAllowed = allowedPaths.some(p => pathname === p || pathname.startsWith(`${p}/`)) || 
                        allowedApiPaths.some(p => pathname.startsWith(p))
                        
      if (!isAllowed) {
        if (pathname.startsWith('/api/')) {
          return NextResponse.json({ error: 'Forbidden: Authors cannot access this area' }, { status: 403 })
        }
        return NextResponse.redirect(new URL('/admin', request.url))
      }
    }

    if (role === 'manager') {
      const restrictedPaths = ['/admin/users', '/admin/settings']
      const restrictedApiPaths = ['/api/admin/users', '/api/admin/settings']

      const isRestricted = restrictedPaths.some(p => pathname.startsWith(p)) || 
                           restrictedApiPaths.some(p => pathname.startsWith(p))
                           
      if (isRestricted) {
        if (pathname.startsWith('/api/')) {
          return NextResponse.json({ error: 'Forbidden: Managers cannot access this area' }, { status: 403 })
        }
        return NextResponse.redirect(new URL('/admin', request.url))
      }
    }
  }
 
  return NextResponse.next()
}
 
export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}

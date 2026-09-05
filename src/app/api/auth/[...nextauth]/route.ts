// NextAuth is not used in this project.
// Authentication is handled by /api/auth/login and /api/auth/logout
// with session tokens stored in the admin_sessions MySQL table.
//
// This file is intentionally left as a stub to avoid breaking the route.
// The handler returns 404 for all requests.

import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ error: 'Not found' }, { status: 404 })
}
export async function POST() {
  return NextResponse.json({ error: 'Not found' }, { status: 404 })
}

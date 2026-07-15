import { NextResponse } from 'next/server'
import { requireAdminApiAccess } from '@/lib/adminAuth'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Lets an admin manually run the property-alerts cron. The CRON_SECRET never
// leaves the server: this route adds the Authorization header the cron
// endpoint requires.
export async function POST(request) {
  const access = await requireAdminApiAccess()
  if (!access.ok) return access.response

  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    return NextResponse.json(
      { error: 'CRON_SECRET is not configured on the server' },
      { status: 503 }
    )
  }

  try {
    const cronUrl = new URL('/api/cron/alerts', request.nextUrl.origin)
    const response = await fetch(cronUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${cronSecret}`,
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    })

    const data = await response.json().catch(() => ({}))
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('[ADMIN_TRIGGER_ALERTS] Failed to trigger cron:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to trigger property alerts' },
      { status: 500 }
    )
  }
}

import { NextResponse } from 'next/server'
import { META_ALLOWED_EVENTS, sendMetaEvent } from '@/lib/metaConversions'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request) {
  try {
    const consent = request.cookies.get('domy_meta_consent')?.value
    if (consent !== 'granted') {
      return NextResponse.json({ sent: false, reason: 'consent_required' }, { status: 202 })
    }

    const body = await request.json()
    if (!META_ALLOWED_EVENTS.has(body?.eventName) || !body?.eventId || !body?.eventSourceUrl) {
      return NextResponse.json({ error: 'Invalid Meta event' }, { status: 400 })
    }

    const result = await sendMetaEvent({ request, event: body })
    return NextResponse.json(result)
  } catch (error) {
    console.error('[META_CAPI] Event delivery failed:', error?.message || error)
    return NextResponse.json({ sent: false }, { status: 502 })
  }
}

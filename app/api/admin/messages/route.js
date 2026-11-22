import { NextResponse } from 'next/server'
import { requireAdminApiAccess } from '@/lib/adminAuth'
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin'
import {
  CLIENT_MESSAGES_TABLE,
  MISSING_MIGRATION_MESSAGE,
  TEAM_AUTHOR_KINDS,
  isMissingTableError,
  normalizeMessageBody,
  normalizePropertyId
} from '@/lib/clientMessages'
import { MESSAGE_COLUMNS, isUuid, notifyClient, withHouses } from '@/lib/clientMessagesServer'
import { resolveZoneHouses } from '@/lib/zoneHouses'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function missingMigration() {
  return NextResponse.json({ error: MISSING_MIGRATION_MESSAGE, code: 'missing_migration' }, { status: 503 })
}

// Thread history with one client (team messages, client replies, read state).
export async function GET(request) {
  const access = await requireAdminApiAccess()
  if (!access.ok) return access.response

  const clientId = new URL(request.url).searchParams.get('clientId')
  if (!isUuid(clientId)) {
    return NextResponse.json({ error: 'clientId is required' }, { status: 400 })
  }

  try {
    const admin = getSupabaseAdminClient()
    const { data, error } = await admin
      .from(CLIENT_MESSAGES_TABLE)
      .select(MESSAGE_COLUMNS)
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
      .limit(200)

    if (error) {
      if (isMissingTableError(error)) return missingMigration()
      throw error
    }

    return NextResponse.json({ messages: await withHouses(data || []) }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('[admin/messages] GET failed:', error?.message || error)
    return NextResponse.json({ error: 'Failed to load messages' }, { status: 500 })
  }
}

export async function POST(request) {
  const access = await requireAdminApiAccess()
  if (!access.ok) return access.response

  const payload = await request.json().catch(() => ({}))
  const clientId = payload?.clientId
  const authorKind = payload?.authorKind
  const body = normalizeMessageBody(payload?.body)
  const propertyId = normalizePropertyId(payload?.propertyId)

  if (!isUuid(clientId)) return NextResponse.json({ error: 'Vyberte klienta.' }, { status: 400 })
  if (!TEAM_AUTHOR_KINDS.includes(authorKind)) return NextResponse.json({ error: 'Vyberte autora.' }, { status: 400 })
  if (!body) return NextResponse.json({ error: 'Zpráva je prázdná nebo příliš dlouhá.' }, { status: 400 })

  try {
    const admin = getSupabaseAdminClient()

    if (propertyId) {
      const houses = await resolveZoneHouses([propertyId])
      if (!houses.get(propertyId)) {
        return NextResponse.json({ error: 'Dům nebyl v nabídce nalezen.' }, { status: 400 })
      }
    }

    const { data, error } = await admin
      .from(CLIENT_MESSAGES_TABLE)
      .insert({
        client_id: clientId,
        author_kind: authorKind,
        author_id: access.user.id,
        body,
        property_id: propertyId
      })
      .select(MESSAGE_COLUMNS)
      .single()

    if (error) {
      if (isMissingTableError(error)) return missingMigration()
      if (error.code === '23503') return NextResponse.json({ error: 'Klient neexistuje.' }, { status: 400 })
      throw error
    }

    const [message] = await withHouses([data])
    const notification = await notifyClient(admin, clientId, authorKind)
    return NextResponse.json({ message, notification }, { status: 201 })
  } catch (error) {
    console.error('[admin/messages] POST failed:', error?.message || error)
    return NextResponse.json({ error: 'Zprávu se nepodařilo uložit.' }, { status: 500 })
  }
}

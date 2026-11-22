import { NextResponse } from 'next/server'
import { createRouteSupabaseClient, getAuthenticatedUser } from '@/lib/serverAuth'
import { checkRateLimit } from '@/lib/rateLimit'
import { CLIENT_MESSAGES_TABLE, isMissingTableError, normalizeMessageBody } from '@/lib/clientMessages'
import { MESSAGE_COLUMNS, withHouses } from '@/lib/clientMessagesServer'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const NO_STORE = { 'Cache-Control': 'no-store' }

// Client zone thread: own messages only (RLS: client_id = auth.uid()),
// newest first. Until db/setup-client-messages.sql is applied the thread is
// simply empty and the zone looks as before.
export async function GET() {
  const { supabase, applyCookies } = await createRouteSupabaseClient()
  if (!supabase) {
    return NextResponse.json({ messages: [] }, { headers: NO_STORE })
  }

  const user = await getAuthenticatedUser(supabase)
  if (!user) {
    return applyCookies(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
  }

  const { data, error } = await supabase
    .from(CLIENT_MESSAGES_TABLE)
    .select(MESSAGE_COLUMNS)
    .eq('client_id', user.id)
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) {
    if (!isMissingTableError(error)) {
      console.error('[zone/messages] load failed:', error.message)
    }
    return applyCookies(NextResponse.json({ messages: [] }, { headers: NO_STORE }))
  }

  const messages = await withHouses(data || [])
  return applyCookies(NextResponse.json({ messages }, { headers: NO_STORE }))
}

// Client reply (plain text).
export async function POST(request) {
  const { supabase, applyCookies } = await createRouteSupabaseClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  }

  const user = await getAuthenticatedUser(supabase)
  if (!user) {
    return applyCookies(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
  }

  const rateLimit = checkRateLimit({
    request,
    bucket: 'zone-messages',
    identifier: user.id,
    limit: 10,
    windowMs: 10 * 60 * 1000
  })
  if (!rateLimit.allowed) {
    return applyCookies(
      NextResponse.json(
        { error: 'Příliš mnoho zpráv. Zkuste to prosím později.' },
        { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) } }
      )
    )
  }

  const payload = await request.json().catch(() => ({}))
  const body = normalizeMessageBody(payload?.body)
  if (!body) {
    return applyCookies(NextResponse.json({ error: 'Zpráva je prázdná nebo příliš dlouhá.' }, { status: 400 }))
  }

  const { data, error } = await supabase
    .from(CLIENT_MESSAGES_TABLE)
    .insert({ client_id: user.id, author_kind: 'client', author_id: user.id, body })
    .select(MESSAGE_COLUMNS)
    .single()

  if (error) {
    const missing = isMissingTableError(error)
    if (!missing) console.error('[zone/messages] reply failed:', error.message)
    return applyCookies(
      NextResponse.json({ error: 'Zprávu se nepodařilo odeslat.' }, { status: missing ? 503 : 500 })
    )
  }

  const [message] = await withHouses([data])
  return applyCookies(NextResponse.json({ message }, { status: 201 }))
}

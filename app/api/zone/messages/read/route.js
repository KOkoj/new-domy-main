import { NextResponse } from 'next/server'
import { createRouteSupabaseClient, getAuthenticatedUser } from '@/lib/serverAuth'
import { CLIENT_MESSAGES_TABLE, isMissingTableError } from '@/lib/clientMessages'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Marks the client's unread team messages as read (RLS + column grant allow
// only read_at on own team messages).
export async function POST() {
  const { supabase, applyCookies } = await createRouteSupabaseClient()
  if (!supabase) {
    return NextResponse.json({ updated: 0 })
  }

  const user = await getAuthenticatedUser(supabase)
  if (!user) {
    return applyCookies(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
  }

  const { data, error } = await supabase
    .from(CLIENT_MESSAGES_TABLE)
    .update({ read_at: new Date().toISOString() })
    .eq('client_id', user.id)
    .neq('author_kind', 'client')
    .is('read_at', null)
    .select('id')

  if (error) {
    if (!isMissingTableError(error)) {
      console.error('[zone/messages/read] failed:', error.message)
    }
    return applyCookies(NextResponse.json({ updated: 0 }))
  }

  return applyCookies(NextResponse.json({ updated: (data || []).length }))
}

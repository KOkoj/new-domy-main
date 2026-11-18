import { NextResponse } from 'next/server'
import { createRouteSupabaseClient, getAuthenticatedUser } from '@/lib/serverAuth'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Saved searches go through the server so the page never waits on the
// browser Supabase auth lock (which could hang the page forever).
async function withUser(handler) {
  const { supabase, applyCookies } = await createRouteSupabaseClient()
  if (!supabase) return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  const user = await getAuthenticatedUser(supabase)
  if (!user) return applyCookies(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
  try {
    return applyCookies(await handler(supabase, user))
  } catch (error) {
    console.error('saved-searches error:', error)
    return applyCookies(NextResponse.json({ error: 'Server error' }, { status: 500 }))
  }
}

const pick = (body) => {
  const out = {}
  if (typeof body?.name === 'string') out.name = body.name.trim().slice(0, 200)
  if (body?.filters && typeof body.filters === 'object') out.filters = body.filters
  if (typeof body?.notifications === 'boolean') out.notifications = body.notifications
  return out
}

export async function GET() {
  return withUser(async (supabase, user) => {
    const { data, error } = await supabase
      .from('saved_searches').select('*').eq('user_id', user.id)
      .order('created_at', { ascending: false })
    if (error) throw error
    return NextResponse.json({ searches: data || [] })
  })
}

export async function POST(request) {
  return withUser(async (supabase, user) => {
    const fields = pick(await request.json().catch(() => ({})))
    if (!fields.name) return NextResponse.json({ error: 'Name required' }, { status: 400 })
    const { data, error } = await supabase
      .from('saved_searches').insert([{ ...fields, user_id: user.id }]).select().single()
    if (error) throw error
    return NextResponse.json({ search: data })
  })
}

export async function PATCH(request) {
  return withUser(async (supabase, user) => {
    const body = await request.json().catch(() => ({}))
    if (!body?.id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    const { data, error } = await supabase
      .from('saved_searches').update(pick(body)).eq('id', body.id).eq('user_id', user.id)
      .select().single()
    if (error) throw error
    return NextResponse.json({ search: data })
  })
}

export async function DELETE(request) {
  return withUser(async (supabase, user) => {
    const id = new URL(request.url).searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    const { error } = await supabase.from('saved_searches').delete().eq('id', id).eq('user_id', user.id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  })
}

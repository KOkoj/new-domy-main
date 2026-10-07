import { NextResponse } from 'next/server'
import { createRouteSupabaseClient, getAuthenticatedUser } from '@/lib/serverAuth'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request) {
  try {
    const { password } = await request.json()
    if (typeof password !== 'string' || password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    const { supabase, applyCookies } = await createRouteSupabaseClient()
    if (!supabase) {
      return NextResponse.json({ error: 'Auth is not configured on server' }, { status: 503 })
    }

    const user = await getAuthenticatedUser(supabase)
    if (!user) {
      return applyCookies(
        NextResponse.json({ error: 'Reset session expired. Request a new link.' }, { status: 401 })
      )
    }

    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      return applyCookies(
        NextResponse.json({ error: error.message }, { status: error.status || 400 })
      )
    }

    return applyCookies(NextResponse.json({ success: true }))
  } catch (error) {
    return NextResponse.json(
      { error: error?.message || 'Unexpected password update error' },
      { status: 502 }
    )
  }
}

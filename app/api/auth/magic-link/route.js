import { NextResponse } from 'next/server'
import { createRouteSupabaseClient } from '@/lib/serverAuth'
import { getPublicSiteUrl } from '@/lib/siteUrl'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request) {
  try {
    const { email } = await request.json()
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : ''

    if (!normalizedEmail) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const { supabase, applyCookies } = await createRouteSupabaseClient()
    if (!supabase) {
      return NextResponse.json({ error: 'Auth is not configured on server' }, { status: 503 })
    }

    const emailRedirectTo = `${getPublicSiteUrl(request)}/auth/callback?next=${encodeURIComponent('/dashboard')}`
    const { error } = await supabase.auth.signInWithOtp({
      email: normalizedEmail,
      options: {
        emailRedirectTo,
        shouldCreateUser: false
      }
    })

    if (error) {
      return applyCookies(
        NextResponse.json({ error: error.message }, { status: error.status || 400 })
      )
    }

    return applyCookies(NextResponse.json({ success: true }))
  } catch (error) {
    return NextResponse.json(
      { error: error?.message || 'Unexpected magic link error' },
      { status: 502 }
    )
  }
}

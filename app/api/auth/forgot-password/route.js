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

    const redirectTo = `${getPublicSiteUrl(request)}/auth/callback?next=${encodeURIComponent('/reset-password')}`
    const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, { redirectTo })

    if (error) {
      return applyCookies(
        NextResponse.json({ error: error.message }, { status: error.status || 400 })
      )
    }

    return applyCookies(NextResponse.json({ success: true }))
  } catch (error) {
    return NextResponse.json(
      { error: error?.message || 'Unexpected password reset error' },
      { status: 502 }
    )
  }
}

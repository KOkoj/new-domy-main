import { NextResponse } from 'next/server'
import { createRouteSupabaseClient } from '@/lib/serverAuth'
import { getPublicSiteUrl } from '@/lib/siteUrl'
import { authErrorPayload, mapSupabaseAuthError } from '@/lib/authMessages'
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from '@/lib/userPreferences'
import { getSafeRedirectPath } from '@/lib/safeRedirect'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// One e-mail field for everyone: the magic link signs existing users in and
// creates the account for new e-mails (shouldCreateUser: true). Post-signup
// work (profile, lead linking, welcome e-mail) runs in /auth/callback only
// after the address is confirmed.
export async function POST(request) {
  try {
    const { email, next, language } = await request.json()
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : ''

    if (!normalizedEmail) {
      return NextResponse.json(authErrorPayload('emailRequired'), { status: 400 })
    }

    const { supabase, applyCookies } = await createRouteSupabaseClient()
    if (!supabase) {
      return NextResponse.json(authErrorPayload('authNotConfigured'), { status: 503 })
    }

    const nextPath = getSafeRedirectPath(next)
    const emailLanguage = SUPPORTED_LANGUAGES.includes(language) ? language : DEFAULT_LANGUAGE
    const callbackParams = new URLSearchParams({ next: nextPath, lang: emailLanguage })
    const emailRedirectTo = `${getPublicSiteUrl(request)}/auth/callback?${callbackParams.toString()}`
    const { error } = await supabase.auth.signInWithOtp({
      email: normalizedEmail,
      options: {
        emailRedirectTo,
        shouldCreateUser: true
      }
    })

    if (error) {
      return applyCookies(
        NextResponse.json(
          authErrorPayload(mapSupabaseAuthError(error, 'magicLinkFailed')),
          { status: error.status || 400 }
        )
      )
    }

    return applyCookies(NextResponse.json({ success: true }))
  } catch (error) {
    return NextResponse.json(
      authErrorPayload(mapSupabaseAuthError(error, 'unexpectedError')),
      { status: 502 }
    )
  }
}

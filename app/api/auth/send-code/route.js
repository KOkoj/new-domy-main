import { NextResponse } from 'next/server'
import { createRouteSupabaseClient } from '@/lib/serverAuth'
import { getPublicSiteUrl } from '@/lib/siteUrl'
import { authErrorPayload, mapSupabaseAuthError } from '@/lib/authMessages'
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from '@/lib/userPreferences'
import { getSafeRedirectPath } from '@/lib/safeRedirect'
import { checkRateLimit } from '@/lib/rateLimit'
import { isValidEmailAddress } from '@/lib/emailCode'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const SEND_LIMIT_PER_IP = 6
const SEND_WINDOW_MS = 10 * 60 * 1000

// One e-mail field for everyone: Supabase sends a one-time code (and a
// fallback link) that signs existing users in and creates the account for
// new e-mails (shouldCreateUser: true). Post-signup work (profile, lead
// linking, welcome e-mail) runs only after the code or link is verified.
export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}))
    const { email, next, language, website } = body || {}

    // Honeypot: real visitors never see or fill this field. Answer like a
    // success so bots get no signal, but send nothing.
    if (typeof website === 'string' && website.trim()) {
      return NextResponse.json({ success: true })
    }

    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : ''
    if (!normalizedEmail) {
      return NextResponse.json(authErrorPayload('emailRequired'), { status: 400 })
    }
    if (!isValidEmailAddress(normalizedEmail)) {
      return NextResponse.json(authErrorPayload('invalidEmail'), { status: 400 })
    }

    const rate = checkRateLimit({
      request,
      bucket: 'auth-send-code',
      limit: SEND_LIMIT_PER_IP,
      windowMs: SEND_WINDOW_MS
    })
    if (!rate.allowed) {
      return NextResponse.json(
        authErrorPayload('overRequestRateLimit', { retryAfterSeconds: rate.retryAfterSeconds }),
        { status: 429, headers: { 'Retry-After': String(rate.retryAfterSeconds) } }
      )
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
      const errorKey = mapSupabaseAuthError(error, 'codeSendFailed')
      const status = errorKey === 'emailRateLimited' || errorKey === 'overRequestRateLimit'
        ? 429
        : (error.status || 400)
      return applyCookies(NextResponse.json(authErrorPayload(errorKey), { status }))
    }

    return applyCookies(NextResponse.json({ success: true }))
  } catch (error) {
    return NextResponse.json(
      authErrorPayload(mapSupabaseAuthError(error, 'unexpectedError')),
      { status: 502 }
    )
  }
}

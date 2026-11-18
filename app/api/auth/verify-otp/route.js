import { NextResponse } from 'next/server'
import { createRouteSupabaseClient } from '@/lib/serverAuth'
import { authErrorPayload, mapSupabaseAuthError, mapVerifyCodeError } from '@/lib/authMessages'
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from '@/lib/userPreferences'
import { getSafeRedirectPath } from '@/lib/safeRedirect'
import { checkRateLimit } from '@/lib/rateLimit'
import { isCompleteOtp, isValidEmailAddress, normalizeOtpInput } from '@/lib/emailCode'
import { completeEmailSignIn } from '@/lib/authOnboarding'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const VERIFY_LIMIT_PER_IP = 20
const VERIFY_WINDOW_MS = 10 * 60 * 1000

// Second step of the e-mail sign-in: verifies the code from the e-mail with
// the SSR route client, so the session cookies are set server-side, then runs
// the same first-sign-in work as /auth/callback.
export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}))
    const { email, token, next, language } = body || {}

    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : ''
    if (!normalizedEmail) {
      return NextResponse.json(authErrorPayload('emailRequired'), { status: 400 })
    }
    if (!isValidEmailAddress(normalizedEmail)) {
      return NextResponse.json(authErrorPayload('invalidEmail'), { status: 400 })
    }

    const code = normalizeOtpInput(token)
    if (!isCompleteOtp(code)) {
      return NextResponse.json(authErrorPayload('codeRequired'), { status: 400 })
    }

    const rate = checkRateLimit({
      request,
      bucket: 'auth-verify-otp',
      limit: VERIFY_LIMIT_PER_IP,
      windowMs: VERIFY_WINDOW_MS
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

    const { data, error } = await supabase.auth.verifyOtp({
      email: normalizedEmail,
      token: code,
      type: 'email'
    })

    if (error) {
      const errorKey = mapVerifyCodeError(error)
      const status = errorKey === 'overRequestRateLimit' || errorKey === 'emailRateLimited' ? 429 : 400
      return applyCookies(NextResponse.json(authErrorPayload(errorKey), { status }))
    }

    const nextPath = getSafeRedirectPath(next)
    const emailLanguage = SUPPORTED_LANGUAGES.includes(language) ? language : DEFAULT_LANGUAGE

    let isNewAccount = false
    try {
      const result = await completeEmailSignIn({
        supabase,
        user: data?.user || data?.session?.user || null,
        request,
        language: emailLanguage,
        location: 'email-code'
      })
      isNewAccount = Boolean(result?.isNewAccount)
    } catch (onboardingError) {
      console.error('[AUTH VERIFY OTP] First sign-in step failed:', onboardingError?.message || onboardingError)
    }

    const user = data?.user || data?.session?.user || null
    return applyCookies(NextResponse.json({
      success: true,
      next: nextPath,
      isNewAccount,
      user: user ? { id: user.id, email: user.email } : null
    }))
  } catch (error) {
    return NextResponse.json(
      authErrorPayload(mapSupabaseAuthError(error, 'unexpectedError')),
      { status: 502 }
    )
  }
}

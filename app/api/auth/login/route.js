import { NextResponse } from 'next/server'
import { createRouteSupabaseClient } from '@/lib/serverAuth'
import { authErrorPayload, mapSupabaseAuthError } from '@/lib/authMessages'
import { normalizeEmailAddress } from '@/lib/authInput'
import { getSafeRedirectPath } from '@/lib/safeRedirect'
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin'
import { completeEmailSignIn } from '@/lib/authOnboarding'
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from '@/lib/userPreferences'
import { applyPendingPassword } from '@/lib/passwordAuth'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function getAdminOrNull() {
  try {
    return getSupabaseAdminClient()
  } catch {
    return null
  }
}

// Sign-in with e-mail + password. When the password is not the account's
// current one, it may be a pending password from "Zapomenuté heslo" (or a
// repeated registration): if it matches, it becomes the real password and the
// user is signed in. Until then the old password keeps working.
export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}))
    const { email, password, next, language } = body || {}
    const normalizedEmail = normalizeEmailAddress(email)

    if (!normalizedEmail || typeof password !== 'string' || !password) {
      return NextResponse.json(authErrorPayload('emailPasswordRequired'), { status: 400 })
    }

    const { supabase, applyCookies } = await createRouteSupabaseClient()
    if (!supabase) {
      return NextResponse.json(authErrorPayload('authNotConfigured'), { status: 503 })
    }

    let { data, error } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password })

    if (error && mapSupabaseAuthError(error, 'invalidCredentials') === 'invalidCredentials') {
      const admin = getAdminOrNull()
      if (admin) {
        try {
          const pending = await applyPendingPassword({ admin, request, email: normalizedEmail, password })
          if (pending.status === 'limited') {
            return applyCookies(NextResponse.json(
              authErrorPayload('overRequestRateLimit', { retryAfterSeconds: pending.retryAfterSeconds }),
              { status: 429, headers: { 'Retry-After': String(pending.retryAfterSeconds) } }
            ))
          }
          if (pending.status === 'applied') {
            ;({ data, error } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password }))
          }
        } catch (pendingError) {
          console.error('[AUTH LOGIN] Pending password check failed:', pendingError?.message || pendingError)
        }
      }
    }

    if (error) {
      const errorKey = mapSupabaseAuthError(error, 'invalidCredentials')
      const status = errorKey === 'overRequestRateLimit' || errorKey === 'emailRateLimited'
        ? 429
        : (errorKey === 'invalidCredentials' ? 401 : (error.status || 401))
      return applyCookies(NextResponse.json(authErrorPayload(errorKey), { status }))
    }

    const user = data?.user || data?.session?.user || null
    try {
      // Profile row + linking of earlier enquiries (idempotent).
      await completeEmailSignIn({
        supabase,
        user,
        request,
        language: SUPPORTED_LANGUAGES.includes(language) ? language : DEFAULT_LANGUAGE,
        location: 'password'
      })
    } catch (onboardingError) {
      console.error('[AUTH LOGIN] Sign-in step failed:', onboardingError?.message || onboardingError)
    }

    return applyCookies(NextResponse.json({
      success: true,
      next: getSafeRedirectPath(next),
      user: user ? { id: user.id, email: user.email } : null
    }))
  } catch (error) {
    return NextResponse.json(
      authErrorPayload(mapSupabaseAuthError(error, 'unexpectedError')),
      { status: 502 }
    )
  }
}

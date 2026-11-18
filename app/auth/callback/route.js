import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from '@/lib/userPreferences'
import { getSafeRedirectPath } from '@/lib/safeRedirect'
import { mapSupabaseAuthError } from '@/lib/authMessages'
import { completeEmailSignIn } from '@/lib/authOnboarding'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

async function createAuthClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return { supabase: null, applyCookies: (response) => response }
  }

  const cookieStore = await cookies()
  const pendingCookies = []

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        for (const cookie of cookiesToSet) {
          pendingCookies.push(cookie)
        }
      }
    }
  })

  const applyCookies = (response) => {
    for (const cookie of pendingCookies) {
      response.cookies.set(cookie.name, cookie.value, cookie.options)
    }
    return response
  }

  return { supabase, applyCookies }
}

const ALLOWED_OTP_TYPES = new Set(['email', 'signup', 'magiclink', 'invite', 'recovery', 'email_change'])

export async function GET(request) {
  const url = new URL(request.url)
  const nextPath = getSafeRedirectPath(url.searchParams.get('next'), '/dashboard')
  const redirectUrl = new URL(nextPath, url.origin)

  try {
    const { supabase, applyCookies } = await createAuthClient()

    if (!supabase) {
      redirectUrl.pathname = '/login'
      redirectUrl.searchParams.set('error', 'auth-not-configured')
      return applyCookies(NextResponse.redirect(redirectUrl))
    }

    const code = url.searchParams.get('code')
    const tokenHash = url.searchParams.get('token_hash')
    const type = url.searchParams.get('type')

    let authError = null
    let signedInUser = null

    if (code) {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      authError = error
      signedInUser = data?.user || data?.session?.user || null
    } else if (tokenHash && type) {
      if (!ALLOWED_OTP_TYPES.has(type)) {
        authError = { code: 'invalid_token', message: 'unsupported type' }
      } else {
        // `type=email` covers both the first confirmation of a new account
        // and a sign-in of an existing one (template fallback link).
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type
        })
        authError = error
        signedInUser = data?.user || data?.session?.user || null
      }
    }

    if (authError) {
      const loginUrl = new URL('/login', url.origin)
      loginUrl.searchParams.set('error', mapSupabaseAuthError(authError, 'authCallbackFailed'))
      loginUrl.searchParams.set('redirect', nextPath)
      return applyCookies(NextResponse.redirect(loginUrl))
    }

    if ((code || (tokenHash && type)) && type !== 'recovery' && !nextPath.startsWith('/reset-password')) {
      const langParam = url.searchParams.get('lang')
      const language = SUPPORTED_LANGUAGES.includes(langParam) ? langParam : DEFAULT_LANGUAGE
      try {
        await completeEmailSignIn({
          supabase,
          user: signedInUser,
          request,
          language,
          location: 'email-link'
        })
      } catch (onboardingError) {
        console.error('[AUTH CALLBACK] First sign-in step failed:', onboardingError?.message || onboardingError)
      }
    }

    return applyCookies(NextResponse.redirect(redirectUrl))
  } catch (error) {
    const loginUrl = new URL('/login', url.origin)
    loginUrl.searchParams.set('error', 'auth-callback-failed')
    loginUrl.searchParams.set('redirect', nextPath)
    return NextResponse.redirect(loginUrl)
  }
}

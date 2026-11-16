import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import emailService from '@/lib/emailService'
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin'
import { getPublicAbsoluteUrl } from '@/lib/siteUrl'
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from '@/lib/userPreferences'
import { getSafeRedirectPath } from '@/lib/safeRedirect'
import { trackServerEvent } from '@/lib/trackServerEvent'

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

function getSafeRedirect(nextParam) {
  return getSafeRedirectPath(nextParam, '/dashboard')
}

const NEW_ACCOUNT_WINDOW_MS = 48 * 60 * 60 * 1000

// Accounts created through the e-mail-only magic link have no signup request,
// so the one-time onboarding (profile row, lead linking, welcome e-mail,
// signup event) runs here, after the address is confirmed. The
// `welcome_email_sent` metadata flag makes it idempotent; accounts older than
// the window (existing users signing in) are skipped.
async function completeFirstSignIn(supabase, request, language) {
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user?.id || !user.email) return
  if (user.user_metadata?.welcome_email_sent) return

  const createdAt = Date.parse(user.created_at || '')
  if (!Number.isFinite(createdAt) || Date.now() - createdAt > NEW_ACCOUNT_WINDOW_MS) return

  const normalizedEmail = String(user.email).trim().toLowerCase()

  try {
    const admin = getSupabaseAdminClient()
    const { error: profileError } = await admin
      .from('profiles')
      .upsert({
        id: user.id,
        first_name: normalizedEmail.split('@')[0] || 'User',
        last_name: null,
        role: normalizedEmail === 'luca.croce@domyvitalii.cz' ? 'admin' : 'user'
      }, { onConflict: 'id', ignoreDuplicates: true })
    if (profileError) {
      console.error('[AUTH CALLBACK] Profile create failed:', profileError.message)
    }

    const { error: leadLinkError } = await admin
      .from('leads')
      .update({ user_id: user.id })
      .eq('email', normalizedEmail)
      .is('user_id', null)
    if (leadLinkError) {
      console.error('[AUTH CALLBACK] Lead linking failed:', leadLinkError.message)
    }
  } catch (adminError) {
    console.error('[AUTH CALLBACK] Onboarding failed:', adminError?.message || adminError)
  }

  try {
    await emailService.sendWelcomeEmail({
      userEmail: user.email,
      userName: user.user_metadata?.name || '',
      language,
      dashboardUrl: getPublicAbsoluteUrl('/dashboard', request)
    })
  } catch (emailError) {
    console.error('[AUTH CALLBACK] Welcome email failed:', emailError?.message || emailError)
  }

  try {
    await supabase.auth.updateUser({ data: { welcome_email_sent: true } })
  } catch (metaError) {
    console.error('[AUTH CALLBACK] Metadata update failed:', metaError?.message || metaError)
  }

  await trackServerEvent(request, 'signup', { location: 'magic-link' })
}

export async function GET(request) {
  const url = new URL(request.url)
  const nextPath = getSafeRedirect(url.searchParams.get('next'))
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

    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      authError = error
    } else if (tokenHash && type) {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type
      })
      authError = error
    }

    if (authError) {
      const loginUrl = new URL('/login', url.origin)
      loginUrl.searchParams.set('error', authError.message || 'auth-callback-failed')
      loginUrl.searchParams.set('redirect', nextPath)
      return applyCookies(NextResponse.redirect(loginUrl))
    }

    if ((code || (tokenHash && type)) && type !== 'recovery' && !nextPath.startsWith('/reset-password')) {
      const langParam = url.searchParams.get('lang')
      const language = SUPPORTED_LANGUAGES.includes(langParam) ? langParam : DEFAULT_LANGUAGE
      try {
        await completeFirstSignIn(supabase, request, language)
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

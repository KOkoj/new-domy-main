import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

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
  if (typeof nextParam !== 'string' || !nextParam.startsWith('/')) {
    return '/dashboard'
  }

  return nextParam
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

    return applyCookies(NextResponse.redirect(redirectUrl))
  } catch (error) {
    const loginUrl = new URL('/login', url.origin)
    loginUrl.searchParams.set('error', 'auth-callback-failed')
    loginUrl.searchParams.set('redirect', nextPath)
    return NextResponse.redirect(loginUrl)
  }
}

import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { PUBLIC_SITE_STANDBY } from '@/lib/featureFlags'
import { SITE_HOST } from '@/lib/siteConfig'

function isMaintenanceBypassPath(pathname) {
  return (
    pathname === '/maintenance' ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/login')
  )
}

function isVercelPreviewHost(hostname) {
  return typeof hostname === 'string' && hostname.includes('vercel.app')
}

export async function proxy(request) {
  const requestHost = request.headers.get('host')
  const pathname = request.nextUrl.pathname
  const legacySearch = request.nextUrl.searchParams.get('s')
  const legacyCategory = request.nextUrl.searchParams.get('id_kategorie')

  if (requestHost === 'domyvitalii.cz') {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.host = SITE_HOST
    redirectUrl.protocol = 'https'
    return NextResponse.redirect(redirectUrl, 308)
  }

  if (pathname === '/' && legacySearch) {
    const normalizedSearch = legacySearch.trim().toLowerCase()
    const redirectMap = {
      clanky: '/blog',
      nabidka: '/properties',
      regiony: '/regions',
      proces: '/process',
      kontakt: '/contact',
      faq: '/faq'
    }

    if (redirectMap[normalizedSearch]) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = redirectMap[normalizedSearch]
      redirectUrl.search = ''
      return NextResponse.redirect(redirectUrl, 308)
    }

    if (/^\d+$/.test(normalizedSearch)) {
      return new NextResponse(null, { status: 410 })
    }
  }

  if (pathname === '/' && legacyCategory === '10') {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/properties'
    redirectUrl.search = ''
    return NextResponse.redirect(redirectUrl, 308)
  }

  if (
    PUBLIC_SITE_STANDBY &&
    !isVercelPreviewHost(requestHost) &&
    !isMaintenanceBypassPath(request.nextUrl.pathname)
  ) {
    const maintenanceUrl = request.nextUrl.clone()
    maintenanceUrl.pathname = '/maintenance'
    maintenanceUrl.search = ''
    return NextResponse.rewrite(maintenanceUrl)
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      // Mirror cookies onto BOTH the incoming request and the outgoing response
      // so that Supabase reads the freshest session within this same request.
      // Without updating request cookies, a refreshed (single-use) refresh
      // token can be re-read in its old form and invalidated, terminating the
      // user's session prematurely.
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value)
        }
        supabaseResponse = NextResponse.next({ request })
        for (const { name, value, options } of cookiesToSet) {
          supabaseResponse.cookies.set(name, value, options)
        }
      }
    }
  })

  // IMPORTANT: Do not run code between createServerClient and getUser().
  // A simple mistake could cause hard-to-debug random logouts.
  // We only call getUser() to refresh auth cookies if needed; gating of
  // protected articles is handled client-side by <ArticlePaywallGate /> so
  // logged-out visitors can see a teaser + register CTA instead of being
  // bounced to /login.
  await supabase.auth.getUser()

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|css|js|map)$).*)'
  ]
}

import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { PUBLIC_SITE_STANDBY } from '@/lib/featureFlags'
import { SITE_HOST } from '@/lib/siteConfig'

function isProtectedContentPath(pathname) {
  if (pathname === '/regions') return false
  if (pathname.startsWith('/regions/')) return true

  if (pathname === '/clanky/pruvodce-italii') return false
  if (pathname.startsWith('/clanky/pruvodce-italii/')) return true

  if (pathname === '/blog') return false
  if (pathname.startsWith('/blog/regions/')) return true

  if (pathname === '/guides') return false
  if (pathname.startsWith('/guides/')) return true

  return false
}

function buildLoginRedirect(request) {
  const loginUrl = request.nextUrl.clone()
  loginUrl.pathname = '/login'
  loginUrl.search = ''
  loginUrl.searchParams.set(
    'redirect',
    `${request.nextUrl.pathname}${request.nextUrl.search}`
  )
  return loginUrl
}

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

  const response = NextResponse.next({
    request: {
      headers: request.headers
    }
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return response
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        for (const cookie of cookiesToSet) {
          response.cookies.set(cookie.name, cookie.value, cookie.options)
        }
      }
    }
  })

  // Forces Supabase SSR to revalidate and refresh auth cookies when needed.
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (isProtectedContentPath(request.nextUrl.pathname) && !user) {
    const redirectResponse = NextResponse.redirect(buildLoginRedirect(request))

    for (const cookie of response.cookies.getAll()) {
      redirectResponse.cookies.set(cookie)
    }

    return redirectResponse
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|css|js|map)$).*)'
  ]
}

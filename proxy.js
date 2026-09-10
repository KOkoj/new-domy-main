import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { PUBLIC_SITE_STANDBY } from '@/lib/featureFlags'
import { SITE_HOST } from '@/lib/siteConfig'
import { getPropertyBySlug } from '@/lib/propertyApi'
import bundledProperties from '@/data/local-properties.json'
import { isDisplayableProperty } from '@/lib/propertyTransform'
import { resolvePropertySlug } from '@/lib/propertyAliases'

// Positive matches only: the bundled inventory has precedence in the existing
// data store. Import it explicitly so Node Proxy does not depend on fs tracing.
// Unknown keys still use the live lookup, including listings added after build.
const bundledPropertyKeys = new Set(bundledProperties
  .filter(isDisplayableProperty)
  .flatMap(property => [property?.slug?.current, property?._id])
  .filter(Boolean))

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

    // Verified historical article; handle before the numeric legacy 410 rule.
    if (normalizedSearch === '373') {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/guides/costs'
      redirectUrl.search = ''
      return NextResponse.redirect(redirectUrl, 301)
    }

    // IDs 360 and 372 remain unidentified and intentionally keep returning 410.
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

  // Resolve missing property URLs before loading.js can stream a 200 response.
  // Use the same live lookup as the page: new and sold listings remain reachable.
  const propertyMatch = pathname.match(/^\/properties\/([^/]+)$/)
  let missingProperty = pathname === '/property-not-found'
  if (propertyMatch) {
    let slug
    try {
      slug = decodeURIComponent(propertyMatch[1])
    } catch {
      return new NextResponse(null, { status: 400 })
    }
    const canonicalSlug = resolvePropertySlug(slug)
    if (canonicalSlug !== slug) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/properties/' + canonicalSlug
      return NextResponse.redirect(redirectUrl, 301)
    }
    missingProperty = !bundledPropertyKeys.has(slug) && !await getPropertyBySlug(slug)
  }
  if (missingProperty) {
    const notFoundUrl = request.nextUrl.clone()
    notFoundUrl.pathname = '/property-not-found'
    notFoundUrl.search = ''
    return NextResponse.rewrite(notFoundUrl, {
      status: 404,
      // A slug that is missing now may be published later without a rebuild.
      headers: { 'Cache-Control': 'private, no-store' }
    })
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
  // We only call getUser() to refresh auth cookies if needed. Public pages,
  // including all articles and buying guides, are never gated here.
  await supabase.auth.getUser()

  return supabaseResponse
}

export const config = {
  matcher: [
    '/properties/:slug',
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|css|js|map)$).*)'
  ]
}

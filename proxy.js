import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

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

export async function proxy(request) {
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

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

export async function POST() {
  try {
    const { supabase, applyCookies } = await createAuthClient()

    if (!supabase) {
      return NextResponse.json({ success: true })
    }

    await supabase.auth.signOut()
    return applyCookies(NextResponse.json({ success: true }))
  } catch (error) {
    return NextResponse.json(
      { error: 'Unexpected server logout error' },
      { status: 500 }
    )
  }
}

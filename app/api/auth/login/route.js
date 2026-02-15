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

export async function POST(request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const { supabase, applyCookies } = await createAuthClient()

    if (!supabase) {
      return NextResponse.json(
        { error: 'Auth is not configured on server' },
        { status: 503 }
      )
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      const status = error.status || 401
      return applyCookies(
        NextResponse.json({ error: error.message }, { status })
      )
    }

    return applyCookies(
      NextResponse.json({
        success: true,
        user: data?.user
          ? {
              id: data.user.id,
              email: data.user.email
            }
          : null
      })
    )
  } catch (error) {
    const message = error?.message || 'Unexpected server login error'
    return NextResponse.json(
      { error: message },
      { status: 502 }
    )
  }
}

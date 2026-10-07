import { NextResponse } from 'next/server'
import { createRouteSupabaseClient, getAuthenticatedUser } from '@/lib/serverAuth'
import { authErrorPayload, mapSupabaseAuthError } from '@/lib/authMessages'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request) {
  try {
    const { password } = await request.json()
    if (typeof password !== 'string' || password.length < 6) {
      return NextResponse.json(authErrorPayload('passwordTooShort'), { status: 400 })
    }

    const { supabase, applyCookies } = await createRouteSupabaseClient()
    if (!supabase) {
      return NextResponse.json(authErrorPayload('authNotConfigured'), { status: 503 })
    }

    const user = await getAuthenticatedUser(supabase)
    if (!user) {
      return applyCookies(
        NextResponse.json(authErrorPayload('resetSessionExpired'), { status: 401 })
      )
    }

    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      return applyCookies(
        NextResponse.json(
          authErrorPayload(mapSupabaseAuthError(error, 'resetUpdateFailed')),
          { status: error.status || 400 }
        )
      )
    }

    return applyCookies(NextResponse.json({ success: true }))
  } catch (error) {
    return NextResponse.json(
      authErrorPayload(mapSupabaseAuthError(error, 'unexpectedError')),
      { status: 502 }
    )
  }
}

import { NextResponse } from 'next/server'
import { createRouteSupabaseClient, getAuthenticatedUser } from '@/lib/serverAuth'
import { authErrorPayload, mapSupabaseAuthError } from '@/lib/authMessages'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request) {
  try {
    const { currentPassword, newPassword } = await request.json()
    if (typeof currentPassword !== 'string' || !currentPassword) {
      return NextResponse.json(authErrorPayload('currentPasswordRequired'), { status: 400 })
    }
    if (typeof newPassword !== 'string' || newPassword.length < 6) {
      return NextResponse.json(authErrorPayload('passwordTooShort'), { status: 400 })
    }

    const { supabase, applyCookies } = await createRouteSupabaseClient()
    if (!supabase) {
      return NextResponse.json(authErrorPayload('authNotConfigured'), { status: 503 })
    }

    const user = await getAuthenticatedUser(supabase)
    if (!user?.email) {
      return applyCookies(
        NextResponse.json(authErrorPayload('unauthorized'), { status: 401 })
      )
    }

    const { error: reauthError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword
    })

    if (reauthError) {
      return applyCookies(
        NextResponse.json(authErrorPayload('currentPasswordInvalid'), { status: 401 })
      )
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) {
      return applyCookies(
        NextResponse.json(
          authErrorPayload(mapSupabaseAuthError(error, 'unexpectedError')),
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

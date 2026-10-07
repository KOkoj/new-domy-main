import { NextResponse } from 'next/server'
import { createRouteSupabaseClient, getAuthenticatedUser } from '@/lib/serverAuth'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request) {
  try {
    const { currentPassword, newPassword } = await request.json()
    if (typeof currentPassword !== 'string' || !currentPassword) {
      return NextResponse.json({ error: 'Current password is required' }, { status: 400 })
    }
    if (typeof newPassword !== 'string' || newPassword.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    const { supabase, applyCookies } = await createRouteSupabaseClient()
    if (!supabase) {
      return NextResponse.json({ error: 'Auth is not configured on server' }, { status: 503 })
    }

    const user = await getAuthenticatedUser(supabase)
    if (!user?.email) {
      return applyCookies(
        NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      )
    }

    const { error: reauthError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword
    })

    if (reauthError) {
      return applyCookies(
        NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 })
      )
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) {
      return applyCookies(
        NextResponse.json({ error: error.message }, { status: error.status || 400 })
      )
    }

    return applyCookies(NextResponse.json({ success: true }))
  } catch (error) {
    return NextResponse.json(
      { error: error?.message || 'Unexpected password change error' },
      { status: 502 }
    )
  }
}

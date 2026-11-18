import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createRouteSupabaseClient, getAuthenticatedUser } from '@/lib/serverAuth'
import { authErrorPayload, mapSupabaseAuthError } from '@/lib/authMessages'
import { isValidNewPassword } from '@/lib/authInput'
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin'
import {
  PENDING_LOGIN_LIMITS,
  consumeAuthLimit,
  deletePendingPassword,
  getPendingPassword,
  verifyPasswordHash
} from '@/lib/passwordAuth'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function getAdminOrNull() {
  try {
    return getSupabaseAdminClient()
  } catch {
    return null
  }
}

// Checks the current password without touching the browser session: a
// throw-away client signs in and the extra session is revoked right away.
async function isCurrentPassword(email, password) {
  const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false }
  })
  const { error } = await client.auth.signInWithPassword({ email, password })
  if (error) return false
  try {
    await client.auth.signOut({ scope: 'local' })
  } catch {
    // The extra session simply expires.
  }
  return true
}

// "Nastavení účtu → Změnit heslo" (only for signed-in users).
// The current password is verified first; a not-yet-used password from the
// "Zapomenuté heslo" e-mail counts as current too. Other devices stay signed in.
export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}))
    const { currentPassword, newPassword } = body || {}
    if (typeof currentPassword !== 'string' || !currentPassword) {
      return NextResponse.json(authErrorPayload('currentPasswordRequired'), { status: 400 })
    }
    if (!isValidNewPassword(newPassword)) {
      return NextResponse.json(authErrorPayload('passwordTooShort'), { status: 400 })
    }

    const { supabase, applyCookies } = await createRouteSupabaseClient()
    if (!supabase) {
      return NextResponse.json(authErrorPayload('authNotConfigured'), { status: 503 })
    }

    const user = await getAuthenticatedUser(supabase)
    if (!user?.email) {
      return applyCookies(NextResponse.json(authErrorPayload('unauthorized'), { status: 401 }))
    }

    const email = String(user.email).trim().toLowerCase()
    const admin = getAdminOrNull()

    const limit = await consumeAuthLimit({
      admin,
      request,
      kind: 'change_password',
      email,
      limits: PENDING_LOGIN_LIMITS
    })
    if (!limit.allowed) {
      return applyCookies(NextResponse.json(
        authErrorPayload('overRequestRateLimit', { retryAfterSeconds: limit.retryAfterSeconds }),
        { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } }
      ))
    }

    let verified = await isCurrentPassword(email, currentPassword)
    if (!verified && admin) {
      try {
        const pending = await getPendingPassword(admin, email)
        verified = Boolean(pending && pending.user_id === user.id &&
          await verifyPasswordHash(currentPassword, pending.password_hash))
      } catch (pendingError) {
        console.error('[AUTH CHANGE PASSWORD] Pending check failed:', pendingError?.message || pendingError)
      }
    }
    if (!verified) {
      return applyCookies(NextResponse.json(authErrorPayload('currentPasswordInvalid'), { status: 401 }))
    }

    if (currentPassword === newPassword) {
      return applyCookies(NextResponse.json(authErrorPayload('samePassword'), { status: 400 }))
    }

    const { error } = admin
      ? await admin.auth.admin.updateUserById(user.id, { password: newPassword })
      : await supabase.auth.updateUser({ password: newPassword })
    if (error) {
      return applyCookies(NextResponse.json(
        authErrorPayload(mapSupabaseAuthError(error, 'unexpectedError')),
        { status: error.status || 400 }
      ))
    }

    // An older e-mailed password must not replace the one just chosen.
    await deletePendingPassword(admin, user.id)

    return applyCookies(NextResponse.json({ success: true }))
  } catch (error) {
    return NextResponse.json(
      authErrorPayload(mapSupabaseAuthError(error, 'unexpectedError')),
      { status: 502 }
    )
  }
}

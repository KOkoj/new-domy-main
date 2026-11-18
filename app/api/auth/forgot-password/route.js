import { NextResponse } from 'next/server'
import { authErrorPayload } from '@/lib/authMessages'
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from '@/lib/userPreferences'
import { isValidEmailAddress, normalizeEmailAddress } from '@/lib/authInput'
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin'
import {
  PASSWORD_EMAIL_LIMITS,
  consumeAuthLimit,
  deletePendingPassword,
  findAuthUserByEmail,
  generatePassword,
  savePendingPassword,
  sendPasswordEmail
} from '@/lib/passwordAuth'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// "Zapomenuté heslo": sends a NEW generated password (Figma 5b). It is stored
// as a pending hash; the current password keeps working until the user signs
// in with the new one (/api/auth/login), so nobody can lock anybody out.
// The answer is the same whether the account exists or not.
export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}))
    const { email, language, website } = body || {}

    if (typeof website === 'string' && website.trim()) {
      return NextResponse.json({ success: true })
    }

    const normalizedEmail = normalizeEmailAddress(email)
    if (!normalizedEmail) {
      return NextResponse.json(authErrorPayload('emailRequired'), { status: 400 })
    }
    if (!isValidEmailAddress(normalizedEmail)) {
      return NextResponse.json(authErrorPayload('invalidEmail'), { status: 400 })
    }

    let admin
    try {
      admin = getSupabaseAdminClient()
    } catch {
      return NextResponse.json(authErrorPayload('authNotConfigured'), { status: 503 })
    }

    // Counted for unknown e-mails too, so the limit reveals nothing.
    const limit = await consumeAuthLimit({
      admin,
      request,
      kind: 'password_email',
      email: normalizedEmail,
      limits: PASSWORD_EMAIL_LIMITS
    })
    if (!limit.allowed) {
      return NextResponse.json(
        authErrorPayload('emailRateLimited', { retryAfterSeconds: limit.retryAfterSeconds }),
        { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } }
      )
    }

    const existing = await findAuthUserByEmail(admin, normalizedEmail)
    if (existing) {
      const password = generatePassword()
      await savePendingPassword(admin, { userId: existing.id, email: normalizedEmail, password })
      const sent = await sendPasswordEmail({
        kind: 'newPassword',
        email: normalizedEmail,
        password,
        language: SUPPORTED_LANGUAGES.includes(language) ? language : DEFAULT_LANGUAGE,
        request
      })
      if (!sent?.success) {
        // Answer stays the same (no account enumeration); the failure is logged.
        console.error('[AUTH FORGOT] Password e-mail failed:', sent?.error || 'unknown')
        await deletePendingPassword(admin, existing.id)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[AUTH FORGOT] Unexpected error:', error?.message || error)
    return NextResponse.json(authErrorPayload('unexpectedError'), { status: 502 })
  }
}

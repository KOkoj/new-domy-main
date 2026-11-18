import { NextResponse } from 'next/server'
import { authErrorPayload } from '@/lib/authMessages'
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from '@/lib/userPreferences'
import { isValidEmailAddress, normalizeEmailAddress } from '@/lib/authInput'
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin'
import { trackServerEvent } from '@/lib/trackServerEvent'
import {
  PASSWORD_EMAIL_LIMITS,
  consumeAuthLimit,
  deletePendingPassword,
  findAuthUserByEmail,
  generatePassword,
  isEmailExistsError,
  savePendingPassword,
  sendPasswordEmail
} from '@/lib/passwordAuth'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Registration by e-mail: the server generates an 8-character password,
// creates the confirmed account with it and sends ONE e-mail with the
// password (Figma 5a). The answer is the same for a new and an existing
// e-mail. An existing account gets a pending password instead (its current
// password keeps working), so nobody can lock anybody out.
export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}))
    const { email, language, website } = body || {}

    // Honeypot: real visitors never fill it. Same answer, nothing sent.
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

    const emailLanguage = SUPPORTED_LANGUAGES.includes(language) ? language : DEFAULT_LANGUAGE
    const password = generatePassword()

    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email: normalizedEmail,
      password,
      email_confirm: true,
      // The password e-mail is the welcome e-mail: no second one at sign-in.
      app_metadata: { welcome_email_sent: true },
      user_metadata: { preferred_language: emailLanguage }
    })

    if (!createError && created?.user?.id) {
      const sent = await sendPasswordEmail({
        kind: 'registration',
        email: normalizedEmail,
        password,
        language: emailLanguage,
        request
      })
      if (!sent?.success) {
        // Without the e-mail nobody knows the password: remove the account
        // so the next attempt starts clean.
        const { error: deleteError } = await admin.auth.admin.deleteUser(created.user.id)
        if (deleteError) console.error('[AUTH REGISTER] Cleanup failed:', deleteError.message)
        return NextResponse.json(authErrorPayload('passwordEmailFailed'), { status: 502 })
      }

      try {
        await trackServerEvent(request, 'signup', { location: 'registration' })
      } catch (eventError) {
        console.error('[AUTH REGISTER] Signup event failed:', eventError?.message || eventError)
      }
      return NextResponse.json({ success: true })
    }

    if (!isEmailExistsError(createError)) {
      console.error('[AUTH REGISTER] createUser failed:', createError?.message || createError)
      return NextResponse.json(authErrorPayload('serverSignupFailed'), { status: 502 })
    }

    // Existing account: pending password, the current one keeps working.
    const existing = await findAuthUserByEmail(admin, normalizedEmail)
    if (!existing) {
      return NextResponse.json(authErrorPayload('serverSignupFailed'), { status: 502 })
    }

    await savePendingPassword(admin, { userId: existing.id, email: normalizedEmail, password })
    const sent = await sendPasswordEmail({
      // Never signed in yet (e.g. a repeated registration): same e-mail as a
      // new registration. Otherwise the "new password" e-mail.
      kind: existing.last_sign_in_at ? 'newPassword' : 'registration',
      email: normalizedEmail,
      password,
      language: emailLanguage,
      request
    })
    if (!sent?.success) {
      await deletePendingPassword(admin, existing.id)
      return NextResponse.json(authErrorPayload('passwordEmailFailed'), { status: 502 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[AUTH REGISTER] Unexpected error:', error?.message || error)
    return NextResponse.json(authErrorPayload('unexpectedError'), { status: 502 })
  }
}

import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import emailService from '@/lib/emailService'
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin'
import { getPublicAbsoluteUrl, getPublicSiteUrl } from '@/lib/siteUrl'
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from '@/lib/userPreferences'
import { splitFullName } from '@/lib/profileName'
import { authErrorPayload, mapSupabaseAuthError } from '@/lib/authMessages'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function resolveBaseUrl(request) {
  return getPublicSiteUrl(request)
}

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
    const { name, email, password, language } = await request.json()
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : ''
    const trimmedName = typeof name === 'string' ? name.trim() : ''
    const emailLanguage = SUPPORTED_LANGUAGES.includes(language) ? language : DEFAULT_LANGUAGE

    if (!trimmedName || !normalizedEmail || !password) {
      return NextResponse.json(
        authErrorPayload('nameEmailPasswordRequired'),
        { status: 400 }
      )
    }

    const { supabase, applyCookies } = await createAuthClient()

    if (!supabase) {
      return NextResponse.json(
        authErrorPayload('authNotConfigured'),
        { status: 503 }
      )
    }

    const baseUrl = resolveBaseUrl(request)
    const emailRedirectTo = `${baseUrl}/auth/callback?next=${encodeURIComponent('/dashboard')}`

    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        emailRedirectTo,
        data: {
          name: trimmedName,
          full_name: trimmedName
        }
      }
    })

    if (error) {
      const status = error.status || 400
      return applyCookies(
        NextResponse.json(
          authErrorPayload(mapSupabaseAuthError(error, 'serverSignupFailed')),
          { status }
        )
      )
    }

    // Send welcome email after successful signup without blocking registration flow.
    // Supabase may return an obfuscated user on duplicate signups in some configurations
    // (identities can be empty), so avoid sending in that case.
    const isLikelyNewUser =
      !Array.isArray(data?.user?.identities) || data.user.identities.length > 0

    if (isLikelyNewUser && data?.user?.id) {
      try {
        const admin = getSupabaseAdminClient()
        const { firstName, lastName } = splitFullName(trimmedName)
        const { error: profileError } = await admin
          .from('profiles')
          .upsert({
            id: data.user.id,
            first_name: firstName || trimmedName,
            last_name: lastName || null,
            role: String(normalizedEmail) === 'luca.croce@domyvitalii.cz' ? 'admin' : 'user'
          }, { onConflict: 'id' })
        if (profileError) {
          console.error('[SIGNUP] Profile name save failed:', profileError.message)
        }

        const { error: leadLinkError } = await admin
          .from('leads')
          .update({ user_id: data.user.id })
          .eq('email', normalizedEmail)
          .is('user_id', null)
        if (leadLinkError) {
          console.error('[SIGNUP] Lead linking failed:', leadLinkError.message)
        }
      } catch (leadLinkError) {
        // Signup must continue if the optional leads migration is not installed yet.
        console.error('[SIGNUP] Lead linking failed:', leadLinkError?.message || leadLinkError)
      }

      if (data.user.email) {
        try {
          const displayName =
            (typeof data.user.user_metadata?.name === 'string' && data.user.user_metadata.name.trim()) ||
            trimmedName

          await emailService.sendWelcomeEmail({
            userEmail: data.user.email,
            userName: displayName,
            language: emailLanguage,
            dashboardUrl: getPublicAbsoluteUrl('/dashboard', request)
          })
        } catch (emailError) {
          console.error('[SIGNUP] Welcome email failed:', emailError?.message || emailError)
        }
      }
    }

    return applyCookies(
      NextResponse.json({
        success: true,
        user: data?.user
          ? {
              id: data.user.id,
              email: data.user.email
            }
          : null,
        hasSession: Boolean(data?.session?.user)
      })
    )
  } catch (error) {
    return NextResponse.json(
      authErrorPayload(mapSupabaseAuthError(error, 'unexpectedError')),
      { status: 502 }
    )
  }
}

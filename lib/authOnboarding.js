import emailService from '@/lib/emailService'
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin'
import { getPublicAbsoluteUrl } from '@/lib/siteUrl'
import { trackServerEvent } from '@/lib/trackServerEvent'

const ADMIN_EMAIL = 'luca.croce@domyvitalii.cz'

// An address confirmed within this window counts as a brand-new account.
// Supabase sets `email_confirmed_at` when the first code / link is verified,
// so a late first click still counts, while existing users signing in again
// (confirmed long ago) never do.
export const NEW_ACCOUNT_CONFIRM_WINDOW_MS = 15 * 60 * 1000

export function hasWelcomeFlag(user) {
  return Boolean(user?.app_metadata?.welcome_email_sent || user?.user_metadata?.welcome_email_sent)
}

export function isFreshlyConfirmed(user, now = Date.now()) {
  const confirmedAt = Date.parse(user?.email_confirmed_at || user?.confirmed_at || '')
  if (!Number.isFinite(confirmedAt)) return false
  return now - confirmedAt >= -60 * 1000 && now - confirmedAt <= NEW_ACCOUNT_CONFIRM_WINDOW_MS
}

function getAdminOrNull() {
  try {
    return getSupabaseAdminClient()
  } catch (error) {
    console.error('[AUTH ONBOARDING] Admin client unavailable:', error?.message || error)
    return null
  }
}

// Idempotent: creates the profile row only when it is missing and links
// anonymous leads with the same e-mail. Runs on every e-mail sign-in,
// independent of the welcome flag, so a failed attempt is repaired next time.
async function ensureProfileAndLeads(admin, user, normalizedEmail) {
  if (!admin) return

  try {
    const { data: existingProfile, error: lookupError } = await admin
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle()

    if (lookupError) {
      console.error('[AUTH ONBOARDING] Profile lookup failed:', lookupError.message)
    } else if (!existingProfile) {
      const { error: profileError } = await admin
        .from('profiles')
        .upsert({
          id: user.id,
          first_name: normalizedEmail.split('@')[0] || 'User',
          last_name: null,
          role: normalizedEmail === ADMIN_EMAIL ? 'admin' : 'user'
        }, { onConflict: 'id', ignoreDuplicates: true })
      if (profileError) {
        console.error('[AUTH ONBOARDING] Profile create failed:', profileError.message)
      }
    }
  } catch (error) {
    console.error('[AUTH ONBOARDING] Profile step failed:', error?.message || error)
  }

  try {
    const { error: leadLinkError } = await admin
      .from('leads')
      .update({ user_id: user.id })
      .eq('email', normalizedEmail)
      .is('user_id', null)
    if (leadLinkError) {
      console.error('[AUTH ONBOARDING] Lead linking failed:', leadLinkError.message)
    }
  } catch (error) {
    console.error('[AUTH ONBOARDING] Lead linking step failed:', error?.message || error)
  }
}

// Marks the welcome as sent before sending it, so a retry can never send it
// twice. Prefers app_metadata (not writable by the user); falls back to the
// user's own metadata when the service-role key is missing.
async function markWelcomeSent(admin, supabase, user) {
  if (admin) {
    const { error } = await admin.auth.admin.updateUserById(user.id, {
      app_metadata: { welcome_email_sent: true }
    })
    if (!error) return true
    console.error('[AUTH ONBOARDING] app_metadata update failed:', error.message)
  }

  if (supabase) {
    const { error } = await supabase.auth.updateUser({ data: { welcome_email_sent: true } })
    if (!error) return true
    console.error('[AUTH ONBOARDING] user_metadata update failed:', error.message)
  }

  return false
}

/**
 * Shared post-sign-in work for e-mail code and e-mail link sign-ins
 * (/api/auth/verify-otp and /auth/callback).
 * - profile row + lead linking: always, idempotent
 * - welcome e-mail + `signup` event: once, only for a freshly confirmed address
 */
export async function completeEmailSignIn({ supabase, user: knownUser, request, language, location }) {
  let user = knownUser
  if (!user && supabase) {
    const { data, error } = await supabase.auth.getUser()
    if (error) {
      console.error('[AUTH ONBOARDING] getUser failed:', error.message)
    }
    user = data?.user || null
  }

  if (!user?.id || !user.email) return { isNewAccount: false }

  const normalizedEmail = String(user.email).trim().toLowerCase()
  const admin = getAdminOrNull()

  await ensureProfileAndLeads(admin, user, normalizedEmail)

  if (hasWelcomeFlag(user) || !isFreshlyConfirmed(user)) {
    return { isNewAccount: false }
  }

  const flagged = await markWelcomeSent(admin, supabase, user)
  if (!flagged) {
    // Without a stored flag the welcome could repeat on every sign-in.
    console.error('[AUTH ONBOARDING] Welcome skipped: flag could not be stored')
    return { isNewAccount: true }
  }

  try {
    await emailService.sendWelcomeEmail({
      userEmail: user.email,
      userName: user.user_metadata?.name || '',
      language,
      dashboardUrl: getPublicAbsoluteUrl('/dashboard', request)
    })
  } catch (emailError) {
    console.error('[AUTH ONBOARDING] Welcome email failed:', emailError?.message || emailError)
  }

  try {
    await trackServerEvent(request, 'signup', { location })
  } catch (eventError) {
    console.error('[AUTH ONBOARDING] Signup event failed:', eventError?.message || eventError)
  }

  return { isNewAccount: true }
}

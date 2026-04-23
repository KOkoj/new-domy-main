import { NextResponse } from 'next/server'
import emailService from '@/lib/emailService'
import { createRouteSupabaseClient, getAuthenticatedUser } from '@/lib/serverAuth'
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SUPPORTED_FREE_PDFS = {
  'inspections-guide': {
    emailType: 'free_pdf_upsell_insp',
    premiumProductKey: 'premium-domy'
  },
  'mistakes-guide': {
    emailType: 'free_pdf_upsell_mistakes',
    premiumProductKey: 'premium-domy'
  }
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}))
    const pdfKey = typeof body?.pdfKey === 'string' ? body.pdfKey : 'inspections-guide'
    const sourcePath = typeof body?.sourcePath === 'string' ? body.sourcePath : null
    const language = body?.language === 'cs' || body?.language === 'en' ? body.language : 'it'

    const config = SUPPORTED_FREE_PDFS[pdfKey]
    if (!config) {
      return NextResponse.json({ error: 'Unsupported free PDF key' }, { status: 400 })
    }

    const { supabase } = await createRouteSupabaseClient()
    const user = await getAuthenticatedUser(supabase)

    if (!user?.id || !user?.email) {
      return NextResponse.json({
        success: true,
        emailSent: false,
        reason: 'anonymous-or-missing-email'
      })
    }

    let prefs = null
    if (supabase) {
      const { data } = await supabase
        .from('notification_preferences')
        .select('email_enabled, marketing_emails')
        .eq('user_id', user.id)
        .maybeSingle()
      prefs = data || null
    }

    // GDPR-safe default: promotional upsell emails require explicit marketing consent.
    const emailEnabled = prefs?.email_enabled === true
    const canSendPromotionalFollowUp = prefs?.marketing_emails === true

    if (!emailEnabled || !canSendPromotionalFollowUp) {
      return NextResponse.json({
        success: true,
        emailSent: false,
        reason: 'preferences-blocked'
      })
    }

    let admin = null
    try {
      admin = getSupabaseAdminClient()
    } catch {
      admin = null
    }

    if (admin) {
      const { data: existingLog } = await admin
        .from('email_logs')
        .select('id')
        .eq('user_id', user.id)
        .eq('email_type', config.emailType)
        .limit(1)
        .maybeSingle()

      if (existingLog?.id) {
        return NextResponse.json({
          success: true,
          emailSent: false,
          reason: 'already-sent'
        })
      }
    }

    const displayName =
      (typeof user.user_metadata?.name === 'string' && user.user_metadata.name.trim()) ||
      (typeof user.user_metadata?.full_name === 'string' && user.user_metadata.full_name.trim()) ||
      'there'

    const result = await emailService.sendFreePdfUpsellEmail({
      userEmail: user.email,
      userName: displayName,
      language,
      freePdfKey: pdfKey,
      premiumProductKey: config.premiumProductKey
    })

    if (admin) {
      await admin.from('email_logs').insert({
        user_id: user.id,
        email_type: config.emailType,
        recipient_email: user.email,
        subject: result?.success ? 'Free PDF upsell follow-up' : 'Free PDF upsell follow-up (failed)',
        status: result?.success ? 'sent' : 'failed',
        error_message: result?.success ? null : (result?.error || 'Unknown email send error'),
        metadata: {
          pdfKey,
          sourcePath,
          language,
          premiumProductKey: config.premiumProductKey,
          provider: result?.provider || null
        }
      })
    }

    return NextResponse.json({
      success: true,
      emailSent: Boolean(result?.success),
      provider: result?.provider || null
    })
  } catch (error) {
    console.error('[FREE PDF UPSELL] Error:', error)
    return NextResponse.json(
      { error: error?.message || 'Unexpected error' },
      { status: 500 }
    )
  }
}

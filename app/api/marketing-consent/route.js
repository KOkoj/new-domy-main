import { NextResponse } from 'next/server'
import crypto from 'node:crypto'
import { createRouteSupabaseClient, getAuthenticatedUser } from '@/lib/serverAuth'
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin'
import { getMarketingConsentRecord } from '@/lib/marketingConsent'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function getClientIp(request) {
  const xff = request.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0].trim()
  const xri = request.headers.get('x-real-ip')
  if (xri) return xri.trim()
  return null
}

function hashValue(value) {
  if (!value) return null
  const salt = process.env.CONSENT_HASH_SALT || ''
  return crypto.createHash('sha256').update(`${salt}:${value}`).digest('hex')
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}))
    const granted = body?.granted === true
    const source = typeof body?.source === 'string' ? body.source.slice(0, 120) : 'free-pdf-popup'
    const sourcePath = typeof body?.sourcePath === 'string' ? body.sourcePath.slice(0, 200) : null
    const language = body?.language === 'cs' || body?.language === 'en' ? body.language : 'it'

    const { supabase } = await createRouteSupabaseClient()
    const user = await getAuthenticatedUser(supabase)

    if (!supabase || !user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const consentRecord = getMarketingConsentRecord(language)
    const nowIso = new Date().toISOString()
    const ipHash = hashValue(getClientIp(request))
    const userAgent = (request.headers.get('user-agent') || '').slice(0, 500) || null

    let proofStored = false
    let updateResult = null

    // First try: update preferences + proof columns (requires migration)
    const payloadWithProof = {
      user_id: user.id,
      marketing_emails: granted,
      updated_at: nowIso,
      marketing_consent_at: granted ? nowIso : null,
      marketing_consent_revoked_at: granted ? null : nowIso,
      marketing_consent_source: source,
      marketing_consent_source_path: sourcePath,
      marketing_consent_language: consentRecord.language,
      marketing_consent_version: consentRecord.version,
      marketing_consent_text: consentRecord.text,
      marketing_consent_ip_hash: ipHash,
      marketing_consent_user_agent: userAgent
    }

    let { data, error } = await supabase
      .from('notification_preferences')
      .upsert(payloadWithProof, { onConflict: 'user_id' })
      .select('user_id, marketing_emails, email_enabled')
      .single()

    if (error) {
      // Fallback: schema not migrated yet. Still store the consent flag safely.
      const fallback = await supabase
        .from('notification_preferences')
        .upsert(
          {
            user_id: user.id,
            marketing_emails: granted,
            updated_at: nowIso
          },
          { onConflict: 'user_id' }
        )
        .select('user_id, marketing_emails, email_enabled')
        .single()

      data = fallback.data
      error = fallback.error
    } else {
      proofStored = true
    }

    if (error) {
      return NextResponse.json({ error: error.message || 'Failed to store consent' }, { status: 500 })
    }

    updateResult = data

    // Best-effort append-only audit log (requires migration). Do not fail request if missing.
    try {
      const admin = getSupabaseAdminClient()
      await admin.from('consent_events').insert({
        user_id: user.id,
        consent_type: consentRecord.type,
        granted,
        source,
        source_path: sourcePath,
        language: consentRecord.language,
        consent_version: consentRecord.version,
        consent_text: consentRecord.text,
        ip_hash: ipHash,
        user_agent: userAgent,
        metadata: {
          trigger: 'free-pdf-upsell-popup'
        }
      })
      proofStored = true
    } catch {
      // Migration and/or admin key may not be configured yet. Ignore for now.
    }

    return NextResponse.json({
      success: true,
      granted,
      proofStored,
      preferences: updateResult
    })
  } catch (error) {
    console.error('[MARKETING CONSENT] Error:', error)
    return NextResponse.json(
      { error: error?.message || 'Unexpected error' },
      { status: 500 }
    )
  }
}

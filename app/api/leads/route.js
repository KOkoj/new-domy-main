import { randomUUID } from 'node:crypto'
import { NextResponse } from 'next/server'
import emailService from '@/lib/emailService'
import { checkRateLimit } from '@/lib/rateLimit'
import {
  LEAD_CONSENT_TEXT,
  buildLeadUrl,
  getLeadAssetBySource,
  isValidLeadEmail
} from '@/lib/leadAssets'
import { logLeadEmail } from '@/lib/leadService'
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const CONFIRM_SUBJECT = 'Potvrďte svůj e-mail a stáhněte si PDF zdarma'

export async function POST(request) {
  const rateLimit = checkRateLimit({
    request,
    bucket: 'pdf-leads',
    limit: 5,
    windowMs: 15 * 60 * 1000
  })

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Příliš mnoho pokusů. Zkuste to prosím později.' },
      {
        status: 429,
        headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) }
      }
    )
  }

  try {
    const body = await request.json().catch(() => ({}))
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
    const source = typeof body?.source === 'string' ? body.source : ''
    const asset = getLeadAssetBySource(source)

    if (!isValidLeadEmail(email)) {
      return NextResponse.json({ error: 'Zadejte platnou e-mailovou adresu.' }, { status: 400 })
    }
    if (!asset) {
      return NextResponse.json({ error: 'Neznámý PDF průvodce.' }, { status: 400 })
    }
    if (body?.consent !== true) {
      return NextResponse.json({ error: 'Pro pokračování je nutný souhlas.' }, { status: 400 })
    }

    const admin = getSupabaseAdminClient()
    const { data: existing, error: existingError } = await admin
      .from('leads')
      .select('*')
      .eq('email', email)
      .maybeSingle()

    if (existingError) throw existingError

    if (existing?.status === 'confirmed') {
      const { data: lead, error } = await admin
        .from('leads')
        .update({ source, consent_text: LEAD_CONSENT_TEXT })
        .eq('id', existing.id)
        .select('*')
        .single()
      if (error) throw error

      return NextResponse.json({
        success: true,
        confirmed: true,
        redirectUrl: `/dekujeme?asset=${encodeURIComponent(asset.key)}&token=${encodeURIComponent(lead.confirm_token)}`
      })
    }

    const confirmToken = randomUUID()
    const now = new Date().toISOString()
    let lead

    if (existing) {
      const { data, error } = await admin
        .from('leads')
        .update({
          source,
          status: 'pending',
          confirm_token: confirmToken,
          consent_text: LEAD_CONSENT_TEXT,
          created_at: now,
          confirmed_at: null,
          unsubscribed_at: null
        })
        .eq('id', existing.id)
        .select('*')
        .single()
      if (error) throw error
      lead = data
    } else {
      const { data, error } = await admin
        .from('leads')
        .insert({
          email,
          source,
          status: 'pending',
          confirm_token: confirmToken,
          consent_text: LEAD_CONSENT_TEXT
        })
        .select('*')
        .single()
      if (error) throw error
      lead = data
    }

    const confirmUrl = buildLeadUrl(
      `/api/leads/confirm?token=${encodeURIComponent(lead.confirm_token)}`
    )
    const unsubscribeUrl = buildLeadUrl(
      `/api/leads/unsubscribe?token=${encodeURIComponent(lead.confirm_token)}`
    )

    if (!confirmUrl || !unsubscribeUrl) {
      return NextResponse.json({ error: 'Chybí konfigurace adresy webu.' }, { status: 500 })
    }

    const result = await emailService.sendLeadConfirmEmail({
      userEmail: lead.email,
      confirmUrl,
      unsubscribeUrl,
      assetLabel: asset.label
    })

    await logLeadEmail({
      lead,
      emailType: 'lead_confirm',
      subject: CONFIRM_SUBJECT,
      result
    })

    if (!result.success) {
      return NextResponse.json(
        { error: 'Potvrzovací e-mail se nepodařilo odeslat. Zkuste to znovu.' },
        { status: 502 }
      )
    }

    return NextResponse.json({ success: true, confirmed: false })
  } catch (error) {
    console.error('[LEADS] Submission failed:', error.message)
    return NextResponse.json({ error: 'Požadavek se nepodařilo zpracovat.' }, { status: 500 })
  }
}

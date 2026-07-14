import { NextResponse } from 'next/server'
import emailService from '@/lib/emailService'
import { buildLeadUrl, getLeadAssetBySource } from '@/lib/leadAssets'
import { createLeadAssetSignedUrl, logLeadEmail } from '@/lib/leadService'
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const ASSET_SUBJECT = 'Vaše PDF zdarma je připravené ke stažení'
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function redirectToThankYou(request, lead, asset) {
  const url = new URL('/dekujeme', request.url)
  url.searchParams.set('asset', asset.key)
  url.searchParams.set('token', lead.confirm_token)
  return NextResponse.redirect(url, 302)
}

export async function GET(request) {
  try {
    const token = new URL(request.url).searchParams.get('token') || ''
    if (!UUID_PATTERN.test(token)) {
      return new NextResponse('Neplatný potvrzovací odkaz.', { status: 400 })
    }

    const admin = getSupabaseAdminClient()
    const { data: current, error } = await admin
      .from('leads')
      .select('*')
      .eq('confirm_token', token)
      .maybeSingle()

    if (error) throw error
    if (!current) return new NextResponse('Neplatný potvrzovací odkaz.', { status: 404 })
    if (current.status === 'unsubscribed') {
      return new NextResponse('Tento e-mail byl odhlášen.', { status: 410 })
    }

    const asset = getLeadAssetBySource(current.source)
    if (!asset) return new NextResponse('PDF není dostupné.', { status: 400 })
    if (current.status === 'confirmed') return redirectToThankYou(request, current, asset)

    const signedUrl = await createLeadAssetSignedUrl(asset)
    const confirmedAt = new Date().toISOString()
    const { data: confirmed, error: updateError } = await admin
      .from('leads')
      .update({
        status: 'confirmed',
        confirmed_at: confirmedAt,
        unsubscribed_at: null
      })
      .eq('id', current.id)
      .eq('status', 'pending')
      .select('*')
      .maybeSingle()

    if (updateError) throw updateError
    if (!confirmed) {
      const { data: refreshed } = await admin
        .from('leads')
        .select('*')
        .eq('id', current.id)
        .single()
      if (refreshed?.status === 'confirmed') return redirectToThankYou(request, refreshed, asset)
      return new NextResponse('Potvrzení se nepodařilo dokončit.', { status: 409 })
    }

    const unsubscribeUrl = buildLeadUrl(
      `/api/leads/unsubscribe?token=${encodeURIComponent(confirmed.confirm_token)}`
    )
    if (!unsubscribeUrl) throw new Error('Missing NEXT_PUBLIC_BASE_URL')

    const result = await emailService.sendLeadAssetEmail({
      userEmail: confirmed.email,
      downloadUrl: signedUrl,
      unsubscribeUrl,
      assetLabel: asset.label
    })

    await logLeadEmail({
      lead: confirmed,
      emailType: 'lead_asset',
      subject: ASSET_SUBJECT,
      result,
      metadata: { signed_url_ttl_seconds: 3600 }
    })

    return redirectToThankYou(request, confirmed, asset)
  } catch (error) {
    console.error('[LEADS] Confirmation failed:', error.message)
    return new NextResponse('Potvrzení se nepodařilo dokončit.', { status: 500 })
  }
}

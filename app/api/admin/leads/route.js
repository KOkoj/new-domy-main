import { NextResponse } from 'next/server'
import { requireAdminApiAccess } from '@/lib/adminAuth'
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin'
import emailService from '@/lib/emailService'
import { buildLeadUrl, getLeadAssetBySource, LEAD_ASSETS } from '@/lib/leadAssets'
import { logLeadEmail } from '@/lib/leadService'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const LEAD_STATUSES = new Set(['pending', 'confirmed', 'unsubscribed'])
const LEAD_SOURCES = new Set(Object.keys(LEAD_ASSETS))
const DEFAULT_PAGE_SIZE = 25
const MAX_PAGE_SIZE = 100

export async function GET(request) {
  const access = await requireAdminApiAccess()
  if (!access.ok) return access.response

  try {
    const url = new URL(request.url)
    const status = String(url.searchParams.get('status') || '').trim()
    const source = String(url.searchParams.get('source') || '').trim()
    const search = String(url.searchParams.get('search') || '').trim()
    const page = Math.max(1, Number.parseInt(url.searchParams.get('page'), 10) || 1)
    const pageSize = Math.min(
      MAX_PAGE_SIZE,
      Math.max(1, Number.parseInt(url.searchParams.get('pageSize'), 10) || DEFAULT_PAGE_SIZE)
    )

    const supabaseAdmin = getSupabaseAdminClient()

    let query = supabaseAdmin
      .from('leads')
      .select('id, email, source, status, created_at, confirmed_at, unsubscribed_at', { count: 'exact' })

    if (LEAD_STATUSES.has(status)) {
      query = query.eq('status', status)
    }
    if (LEAD_SOURCES.has(source)) {
      query = query.eq('source', source)
    }
    if (search) {
      query = query.ilike('email', `%${search}%`)
    }

    const from = (page - 1) * pageSize
    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, from + pageSize - 1)

    if (error) throw error

    // Sitewide status counts for the stat cards, independent of filters.
    const statusCounts = {}
    await Promise.all(
      [...LEAD_STATUSES].map(async (statusValue) => {
        const { count: statusCount, error: countError } = await supabaseAdmin
          .from('leads')
          .select('id', { count: 'exact', head: true })
          .eq('status', statusValue)
        if (countError) {
          console.error(`[ADMIN_LEADS] Failed to count ${statusValue} leads:`, countError.message)
        }
        statusCounts[statusValue] = statusCount || 0
      })
    )

    return NextResponse.json({
      leads: data || [],
      total: count || 0,
      page,
      pageSize,
      statusCounts
    })
  } catch (error) {
    console.error('[ADMIN_LEADS] Failed to load leads:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to load leads' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  const access = await requireAdminApiAccess()
  if (!access.ok) return access.response

  try {
    const body = await request.json()
    const action = String(body?.action || '').trim()
    const leadId = String(body?.leadId || '').trim()

    if (!leadId || !['resend', 'unsubscribe'].includes(action)) {
      return NextResponse.json({ error: 'Missing or invalid leadId/action' }, { status: 400 })
    }

    const supabaseAdmin = getSupabaseAdminClient()
    const { data: lead, error: leadError } = await supabaseAdmin
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .maybeSingle()

    if (leadError) throw leadError
    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    if (action === 'unsubscribe') {
      if (lead.status === 'unsubscribed') {
        return NextResponse.json({ error: 'Lead is already unsubscribed' }, { status: 400 })
      }

      const { data: updated, error } = await supabaseAdmin
        .from('leads')
        .update({ status: 'unsubscribed', unsubscribed_at: new Date().toISOString() })
        .eq('id', lead.id)
        .select('id, email, source, status, created_at, confirmed_at, unsubscribed_at')
        .single()

      if (error) throw error
      return NextResponse.json({ success: true, lead: updated })
    }

    // action === 'resend': re-send the double-opt-in confirmation email.
    if (lead.status !== 'pending') {
      return NextResponse.json(
        { error: 'Confirmation emails can only be resent for pending leads' },
        { status: 400 }
      )
    }

    const asset = getLeadAssetBySource(lead.source)
    if (!asset) {
      return NextResponse.json({ error: `Unknown lead source: ${lead.source}` }, { status: 400 })
    }

    const confirmUrl = buildLeadUrl(
      `/api/leads/confirm?token=${encodeURIComponent(lead.confirm_token)}`
    )
    const unsubscribeUrl = buildLeadUrl(
      `/api/leads/unsubscribe?token=${encodeURIComponent(lead.confirm_token)}`
    )

    if (!confirmUrl || !unsubscribeUrl) {
      return NextResponse.json(
        { error: 'NEXT_PUBLIC_BASE_URL is not configured' },
        { status: 500 }
      )
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
      subject: 'Potvrďte svůj e-mail a stáhněte si PDF zdarma',
      result,
      metadata: { resent_by_admin: access.user?.id || true }
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to send confirmation email' },
        { status: 502 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[ADMIN_LEADS] Action failed:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to perform lead action' },
      { status: 500 }
    )
  }
}

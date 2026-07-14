import { NextResponse } from 'next/server'
import { getLeadAssetByKey } from '@/lib/leadAssets'
import { createLeadAssetSignedUrl } from '@/lib/leadService'
import { createRouteSupabaseClient, getAuthenticatedUser } from '@/lib/serverAuth'
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

async function recordAuthenticatedDownload(user, asset) {
  if (!user?.email) throw new Error('Authenticated user has no email')

  const admin = getSupabaseAdminClient()
  const email = user.email.trim().toLowerCase()
  const { data: existing, error: selectError } = await admin
    .from('leads')
    .select('*')
    .eq('email', email)
    .maybeSingle()
  if (selectError) throw selectError

  if (existing) {
    const updates = {
      source: asset.source,
      user_id: user.id
    }
    // A download must never silently reverse an explicit unsubscribe.
    if (existing.status !== 'unsubscribed') {
      updates.status = 'confirmed'
      updates.confirmed_at = existing.confirmed_at || new Date().toISOString()
    }
    const { error } = await admin.from('leads').update(updates).eq('id', existing.id)
    if (error) throw error
    return
  }

  const { error } = await admin.from('leads').insert({
    email,
    source: asset.source,
    status: 'confirmed',
    confirmed_at: new Date().toISOString(),
    consent_text: null,
    user_id: user.id
  })
  if (error) throw error
}

export async function GET(request) {
  const { supabase, applyCookies } = await createRouteSupabaseClient()

  try {
    const url = new URL(request.url)
    const asset = getLeadAssetByKey(url.searchParams.get('asset'))
    if (!asset) {
      return applyCookies(NextResponse.json({ error: 'Unknown asset' }, { status: 400 }))
    }

    const user = await getAuthenticatedUser(supabase)
    if (user) {
      await recordAuthenticatedDownload(user, asset)
    } else {
      const token = url.searchParams.get('token') || ''
      if (!UUID_PATTERN.test(token)) {
        return applyCookies(NextResponse.json({ error: 'CONFIRMATION_REQUIRED' }, { status: 401 }))
      }

      const admin = getSupabaseAdminClient()
      const { data: lead, error } = await admin
        .from('leads')
        .select('id,status,source')
        .eq('confirm_token', token)
        .maybeSingle()
      if (error) throw error
      if (!lead || lead.status !== 'confirmed' || lead.source !== asset.source) {
        return applyCookies(NextResponse.json({ error: 'CONFIRMATION_REQUIRED' }, { status: 403 }))
      }
    }

    const signedUrl = await createLeadAssetSignedUrl(asset)
    return applyCookies(NextResponse.redirect(signedUrl, 302))
  } catch (error) {
    console.error('[LEADS] Download failed:', error.message)
    return applyCookies(
      NextResponse.json({ error: 'Download could not be prepared' }, { status: 500 })
    )
  }
}

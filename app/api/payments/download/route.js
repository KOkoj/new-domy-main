import { NextResponse } from 'next/server'
import { createRouteSupabaseClient, getAuthenticatedUser } from '@/lib/serverAuth'
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin'
import { getStripeServerClient } from '@/lib/stripeServer'
import { getPremiumProduct, getStoragePathForProduct } from '@/lib/premiumProducts'
import { persistPaidPremiumPurchaseFromSession } from '@/lib/premiumPurchaseStore'
import { PREMIUM_PDFS_ENABLED, getPremiumPdfDisabledResponse } from '@/lib/featureFlags'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

async function ensurePurchaseEntitlement({ userId, productKey, sessionId }) {
  const supabaseAdmin = getSupabaseAdminClient()

  const { data: purchase, error: purchaseError } = await supabaseAdmin
    .from('premium_purchases')
    .select('id')
    .eq('user_id', userId)
    .eq('product_key', productKey)
    .eq('status', 'paid')
    .limit(1)
    .maybeSingle()

  if (purchaseError) {
    throw new Error(`Could not verify purchase: ${purchaseError.message}`)
  }

  if (purchase) return true
  if (!sessionId) return false

  const stripe = getStripeServerClient()
  const session = await stripe.checkout.sessions.retrieve(sessionId)
  const sessionUserId = session?.metadata?.user_id || session?.client_reference_id
  const sessionProductKey = session?.metadata?.product_key

  if (
    session.payment_status !== 'paid' ||
    sessionUserId !== userId ||
    sessionProductKey !== productKey
  ) {
    return false
  }

  await persistPaidPremiumPurchaseFromSession(session)
  return true
}

export async function GET(request) {
  if (!PREMIUM_PDFS_ENABLED) {
    return NextResponse.json(getPremiumPdfDisabledResponse(), { status: 503 })
  }

  try {
    const url = new URL(request.url)
    const productKey = url.searchParams.get('product')
    const sessionId = url.searchParams.get('session_id')

    if (!productKey) {
      return NextResponse.json({ error: 'Missing product' }, { status: 400 })
    }

    if (!getPremiumProduct(productKey)) {
      return NextResponse.json({ error: 'Unknown product' }, { status: 400 })
    }

    const { supabase, applyCookies } = await createRouteSupabaseClient()
    if (!supabase) {
      return NextResponse.json(
        { error: 'Auth is not configured on server' },
        { status: 503 }
      )
    }

    const user = await getAuthenticatedUser(supabase)
    if (!user) {
      return applyCookies(
        NextResponse.json({ error: 'AUTH_REQUIRED' }, { status: 401 })
      )
    }

    const entitled = await ensurePurchaseEntitlement({
      userId: user.id,
      productKey,
      sessionId
    })

    if (!entitled) {
      return applyCookies(
        NextResponse.json({ error: 'PURCHASE_REQUIRED' }, { status: 403 })
      )
    }

    const supabaseAdmin = getSupabaseAdminClient()
    const bucket = process.env.PREMIUM_PDF_BUCKET || 'documents'
    const filePath = getStoragePathForProduct(productKey)

    if (!filePath) {
      return applyCookies(
        NextResponse.json({ error: 'Missing premium file path config' }, { status: 500 })
      )
    }

    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .createSignedUrl(filePath, 60 * 10, { download: true })

    if (error || !data?.signedUrl) {
      return applyCookies(
        NextResponse.json(
          { error: `Unable to create signed URL: ${error?.message || 'unknown error'}` },
          { status: 500 }
        )
      )
    }

    return applyCookies(NextResponse.redirect(data.signedUrl, 302))
  } catch (error) {
    return NextResponse.json(
      { error: error?.message || 'Download authorization failed' },
      { status: 500 }
    )
  }
}

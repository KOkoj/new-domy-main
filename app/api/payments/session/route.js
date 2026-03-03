import { NextResponse } from 'next/server'
import { createRouteSupabaseClient, getAuthenticatedUser } from '@/lib/serverAuth'
import { getStripeServerClient } from '@/lib/stripeServer'
import { getPremiumProduct } from '@/lib/premiumProducts'
import { persistPaidPremiumPurchaseFromSession } from '@/lib/premiumPurchaseStore'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    const url = new URL(request.url)
    const sessionId = url.searchParams.get('session_id')

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing session_id' },
        { status: 400 }
      )
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

    const stripe = getStripeServerClient()
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    const sessionUserId = session?.metadata?.user_id || session?.client_reference_id
    if (!sessionUserId || sessionUserId !== user.id) {
      return applyCookies(
        NextResponse.json({ error: 'Session does not belong to current user' }, { status: 403 })
      )
    }

    if (session.payment_status !== 'paid') {
      return applyCookies(
        NextResponse.json(
          { error: `Session not paid yet (status: ${session.payment_status})` },
          { status: 409 }
        )
      )
    }

    const productKey = session?.metadata?.product_key
    if (!getPremiumProduct(productKey)) {
      return applyCookies(
        NextResponse.json(
          { error: 'Unknown product key in Stripe session metadata' },
          { status: 400 }
        )
      )
    }

    await persistPaidPremiumPurchaseFromSession(session)

    return applyCookies(
      NextResponse.json({
        ok: true,
        productKey,
        language:
          (session?.metadata?.language === 'cs' || session?.metadata?.language === 'en'
            ? session.metadata.language
            : 'it'),
        downloadUrl: `/api/payments/download?product=${encodeURIComponent(productKey)}&session_id=${encodeURIComponent(session.id)}`
      })
    )
  } catch (error) {
    return NextResponse.json(
      { error: error?.message || 'Could not validate checkout session' },
      { status: 500 }
    )
  }
}

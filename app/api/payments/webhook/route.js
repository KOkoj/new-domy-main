import { NextResponse } from 'next/server'
import { getStripeServerClient } from '@/lib/stripeServer'
import { persistPaidPremiumPurchaseFromSession } from '@/lib/premiumPurchaseStore'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

async function savePaidSession(session) {
  await persistPaidPremiumPurchaseFromSession(session)
}

export async function POST(request) {
  try {
    const signature = request.headers.get('stripe-signature')
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

    if (!signature || !webhookSecret) {
      return NextResponse.json(
        { error: 'Missing webhook signature or STRIPE_WEBHOOK_SECRET' },
        { status: 400 }
      )
    }

    const stripe = getStripeServerClient()
    const body = await request.text()

    let event
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (error) {
      return NextResponse.json(
        { error: `Webhook signature verification failed: ${error.message}` },
        { status: 400 }
      )
    }

    if (
      event.type === 'checkout.session.completed' ||
      event.type === 'checkout.session.async_payment_succeeded'
    ) {
      await savePaidSession(event.data.object)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    return NextResponse.json(
      { error: error?.message || 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

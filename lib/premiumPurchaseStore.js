import { getSupabaseAdminClient } from '@/lib/supabaseAdmin'
import { getPremiumProduct } from '@/lib/premiumProducts'

function resolvePaymentIntentId(paymentIntent) {
  if (!paymentIntent) return null
  if (typeof paymentIntent === 'string') return paymentIntent
  return paymentIntent.id || null
}

function parseBooleanMetadata(value) {
  return value === 'true' || value === true
}

function safeMetadataString(value, maxLen = 500) {
  if (typeof value !== 'string') return null
  return value.slice(0, maxLen)
}

function buildBasePayload(session, userId, productKey) {
  return {
    user_id: userId,
    product_key: productKey,
    stripe_session_id: session.id,
    stripe_payment_intent: resolvePaymentIntentId(session.payment_intent),
    stripe_customer_id: typeof session.customer === 'string' ? session.customer : null,
    stripe_customer_email: session.customer_details?.email || null,
    amount_total: session.amount_total || null,
    currency: session.currency || null,
    status: 'paid',
    purchased_at: new Date().toISOString()
  }
}

function buildLegalPayload(session) {
  const metadata = session?.metadata || {}
  return {
    checkout_language: safeMetadataString(metadata.legal_language, 5),
    legal_version: safeMetadataString(metadata.legal_version, 80),
    legal_acceptance_at: safeMetadataString(metadata.legal_acceptance_at, 60),
    legal_source: safeMetadataString(metadata.legal_source, 120),
    legal_source_path: safeMetadataString(metadata.legal_source_path, 200),
    legal_terms_accepted: parseBooleanMetadata(metadata.terms_accepted),
    legal_privacy_accepted: parseBooleanMetadata(metadata.privacy_accepted),
    legal_digital_waiver_accepted: parseBooleanMetadata(metadata.digital_waiver_accepted),
    legal_terms_text: safeMetadataString(metadata.legal_terms_text, 500),
    legal_privacy_text: safeMetadataString(metadata.legal_privacy_text, 500),
    legal_digital_waiver_text: safeMetadataString(metadata.legal_digital_waiver_text, 500),
    legal_ip_hash: safeMetadataString(metadata.legal_ip_hash, 128),
    legal_user_agent: safeMetadataString(metadata.legal_user_agent, 500)
  }
}

async function upsertPurchasePayload(supabaseAdmin, payload) {
  return supabaseAdmin
    .from('premium_purchases')
    .upsert(payload, { onConflict: 'stripe_session_id' })
}

async function upsertLegalEvent(supabaseAdmin, payload) {
  const eventPayload = {
    user_id: payload.user_id,
    product_key: payload.product_key,
    stripe_session_id: payload.stripe_session_id,
    legal_version: payload.legal_version,
    language: payload.checkout_language,
    acceptance_at: payload.legal_acceptance_at || payload.purchased_at,
    source: payload.legal_source,
    source_path: payload.legal_source_path,
    terms_accepted: payload.legal_terms_accepted === true,
    privacy_accepted: payload.legal_privacy_accepted === true,
    digital_waiver_accepted: payload.legal_digital_waiver_accepted === true,
    terms_text: payload.legal_terms_text,
    privacy_text: payload.legal_privacy_text,
    digital_waiver_text: payload.legal_digital_waiver_text,
    ip_hash: payload.legal_ip_hash,
    user_agent: payload.legal_user_agent,
    metadata: {
      amount_total: payload.amount_total,
      currency: payload.currency
    }
  }

  return supabaseAdmin
    .from('purchase_legal_events')
    .upsert(eventPayload, { onConflict: 'stripe_session_id' })
}

export async function persistPaidPremiumPurchaseFromSession(session) {
  const productKey = session?.metadata?.product_key
  const userId = session?.metadata?.user_id || session?.client_reference_id

  if (!productKey || !userId) return { stored: false, reason: 'missing-user-or-product' }
  if (!getPremiumProduct(productKey)) return { stored: false, reason: 'invalid-product' }
  if (session?.payment_status !== 'paid') return { stored: false, reason: 'not-paid' }

  const supabaseAdmin = getSupabaseAdminClient()
  const basePayload = buildBasePayload(session, userId, productKey)
  const fullPayload = { ...basePayload, ...buildLegalPayload(session) }

  const { error: fullError } = await upsertPurchasePayload(supabaseAdmin, fullPayload)
  if (fullError) {
    const { error: fallbackError } = await upsertPurchasePayload(supabaseAdmin, basePayload)
    if (fallbackError) {
      throw new Error(`Purchase upsert failed: ${fallbackError.message}`)
    }

    return {
      stored: true,
      legalStored: false,
      fallbackUsed: true
    }
  }

  const { error: legalEventError } = await upsertLegalEvent(supabaseAdmin, fullPayload)
  return {
    stored: true,
    legalStored: !legalEventError,
    fallbackUsed: false
  }
}

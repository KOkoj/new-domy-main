import { NextResponse } from 'next/server'
import crypto from 'node:crypto'
import { createRouteSupabaseClient, getAuthenticatedUser } from '@/lib/serverAuth'
import { getStripeServerClient } from '@/lib/stripeServer'
import { getPremiumProduct, getStripePriceIdForProduct } from '@/lib/premiumProducts'
import { getPurchaseLegalSnapshot } from '@/lib/purchaseLegal'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const DEFAULT_DISCOUNTED_PRICE_KC = 70

function resolveBaseUrl(request) {
  return (
    process.env.NEXT_PUBLIC_BASE_URL ||
    request.headers.get('origin') ||
    new URL(request.url).origin
  )
}

function sanitizeCancelPath(rawPath, fallbackPath) {
  if (!rawPath || typeof rawPath !== 'string' || !rawPath.startsWith('/')) {
    return fallbackPath
  }
  return rawPath
}

function sanitizeSourcePath(rawPath, fallbackPath) {
  if (!rawPath || typeof rawPath !== 'string' || !rawPath.startsWith('/')) {
    return fallbackPath
  }
  return rawPath.slice(0, 200)
}

function getClientIp(request) {
  const xff = request.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0].trim()
  const xri = request.headers.get('x-real-ip')
  if (xri) return xri.trim()
  return null
}

function hashValue(value) {
  if (!value) return null
  const salt = process.env.LEGAL_HASH_SALT || process.env.CONSENT_HASH_SALT || ''
  return crypto.createHash('sha256').update(`${salt}:${value}`).digest('hex')
}

function buildLineItems(product, priceId) {
  if (priceId) {
    return [{ price: priceId, quantity: 1 }]
  }

  const discountedPriceKc = product.marketingDiscountedPriceKc || DEFAULT_DISCOUNTED_PRICE_KC

  // Fallback for local setup when STRIPE_PRICE_* envs are not set yet.
  return [
    {
      quantity: 1,
      price_data: {
        currency: 'czk',
        // CZK is handled by Stripe in minor units.
        unit_amount: discountedPriceKc * 100,
        product_data: {
          name: product.checkoutProductName || 'Premium PDF'
        }
      }
    }
  ]
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}))
    const productKey = body?.productKey
    const language = typeof body?.language === 'string' ? body.language : 'it'
    const legalConsent = body?.legalConsent || {}

    const product = getPremiumProduct(productKey)
    if (!product) {
      return NextResponse.json(
        { error: 'Invalid premium product key' },
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

    const termsAccepted = legalConsent?.termsAccepted === true
    const privacyAccepted = legalConsent?.privacyAccepted === true
    const digitalWaiverAccepted = legalConsent?.digitalWaiverAccepted === true

    if (!termsAccepted || !privacyAccepted || !digitalWaiverAccepted) {
      return applyCookies(
        NextResponse.json(
          { error: 'LEGAL_CONSENT_REQUIRED' },
          { status: 400 }
        )
      )
    }

    const legalSnapshot = getPurchaseLegalSnapshot(language)
    const nowIso = new Date().toISOString()
    const sourcePath = sanitizeSourcePath(
      legalConsent?.sourcePath,
      `/premium?product=${encodeURIComponent(productKey)}`
    )
    const userAgent = (request.headers.get('user-agent') || '').slice(0, 500) || null
    const ipHash = hashValue(getClientIp(request))

    const priceId = getStripePriceIdForProduct(productKey)
    const stripe = getStripeServerClient()
    const baseUrl = resolveBaseUrl(request)
    const cancelPath = sanitizeCancelPath(body?.cancelPath, product.defaultCancelPath)

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: buildLineItems(product, priceId),
      success_url: `${baseUrl}/premium/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}${cancelPath}`,
      client_reference_id: user.id,
      customer_email: user.email || undefined,
      metadata: {
        product_key: productKey,
        user_id: user.id,
        language,
        legal_version: legalSnapshot.version,
        legal_language: legalSnapshot.language,
        legal_acceptance_at: nowIso,
        legal_source: 'premium-page-checkout',
        legal_source_path: sourcePath,
        terms_accepted: String(termsAccepted),
        privacy_accepted: String(privacyAccepted),
        digital_waiver_accepted: String(digitalWaiverAccepted),
        legal_terms_text: legalSnapshot.termsText,
        legal_privacy_text: legalSnapshot.privacyText,
        legal_digital_waiver_text: legalSnapshot.digitalWaiverText,
        legal_ip_hash: ipHash || '',
        legal_user_agent: userAgent || '',
        original_price_kc: String(product.marketingOriginalPriceKc || 250),
        discounted_price_kc: String(product.marketingDiscountedPriceKc || DEFAULT_DISCOUNTED_PRICE_KC)
      }
    })

    return applyCookies(NextResponse.json({ url: session.url }))
  } catch (error) {
    return NextResponse.json(
      { error: error?.message || 'Checkout creation failed' },
      { status: 500 }
    )
  }
}

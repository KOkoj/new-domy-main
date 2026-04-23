import { NextResponse } from 'next/server'
import crypto from 'node:crypto'
import { createRouteSupabaseClient, getAuthenticatedUser } from '@/lib/serverAuth'
import { getStripeServerClient } from '@/lib/stripeServer'
import { getPremiumProduct, getStripePriceIdForProduct } from '@/lib/premiumProducts'
import { getPurchaseLegalSnapshot } from '@/lib/purchaseLegal'
import { PREMIUM_PDFS_ENABLED, getPremiumPdfDisabledResponse } from '@/lib/featureFlags'

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

function sanitizeMetadataValue(value, maxLen = 200) {
  if (typeof value !== 'string') return ''
  return value.trim().slice(0, maxLen)
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
  if (!PREMIUM_PDFS_ENABLED) {
    return NextResponse.json(getPremiumPdfDisabledResponse(), { status: 503 })
  }

  try {
    const body = await request.json().catch(() => ({}))
    const productKey = body?.productKey
    const language = typeof body?.language === 'string' ? body.language : 'it'
    const legalConsent = body?.legalConsent || {}
    const billingInfo = body?.billingInfo || {}

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
    const invoiceRequested = billingInfo?.invoiceRequested === true
    const companyName = sanitizeMetadataValue(billingInfo?.companyName, 120)
    const taxReference = sanitizeMetadataValue(billingInfo?.taxReference, 80)
    const billingNote = sanitizeMetadataValue(billingInfo?.billingNote, 160)
    const automaticTaxEnabled = process.env.STRIPE_AUTOMATIC_TAX === 'true'

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: buildLineItems(product, priceId),
      success_url: `${baseUrl}/premium/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}${cancelPath}`,
      client_reference_id: user.id,
      customer_email: user.email || undefined,
      customer_creation: 'always',
      billing_address_collection: 'required',
      phone_number_collection: { enabled: true },
      tax_id_collection: { enabled: true },
      automatic_tax: { enabled: automaticTaxEnabled },
      invoice_creation: {
        enabled: true,
        invoice_data: {
          description: `${product.checkoutProductName || 'Premium PDF'} digital content purchase`,
          metadata: {
            product_key: productKey,
            user_id: user.id,
            invoice_requested: String(invoiceRequested),
            billing_company_name: companyName,
            billing_tax_reference: taxReference,
            billing_note: billingNote
          }
        }
      },
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
        discounted_price_kc: String(product.marketingDiscountedPriceKc || DEFAULT_DISCOUNTED_PRICE_KC),
        invoice_requested: String(invoiceRequested),
        billing_company_name: companyName,
        billing_tax_reference: taxReference,
        billing_note: billingNote,
        automatic_tax_enabled: String(automaticTaxEnabled)
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

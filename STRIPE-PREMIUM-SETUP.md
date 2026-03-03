# Stripe Premium PDFs Setup

This project now supports:
- Stripe Checkout for 2 premium products (`premium-notary`, `premium-domy`)
- Webhook persistence to Supabase (`premium_purchases`)
- Private PDF delivery via signed URLs
- Success page with immediate download

## 1. Run DB migration

Run this SQL in Supabase SQL Editor:

- `setup-premium-payments.sql`
- `setup-premium-legal-proof.sql`

## 2. Upload private PDFs to Supabase Storage

Use your `documents` bucket (or another private bucket) and upload:

- `premium/premium-notary.pdf`
- `premium/premium-domy.pdf`

Important:
- Bucket should be private.
- Do not keep premium files in `public/pdfs`.

## 3. Create Stripe products/prices

In Stripe Dashboard create:

1. Product: Premium Notary PDF
2. Product: Premium Domy PDF

For each product create one one-time Price and copy the `price_...` id.

Note:
- `STRIPE_PRICE_PREMIUM_NOTARY` and `STRIPE_PRICE_PREMIUM_DOMY` are recommended for production.
- If they are missing, checkout falls back to inline prices:
  - `premium-notary`: `70 kc`
  - `premium-domy`: `85 kc`

## 4. Configure environment variables

Set these in `.env.local` (and in production env):

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_PREMIUM_NOTARY`
- `STRIPE_PRICE_PREMIUM_DOMY`
- `PREMIUM_PDF_BUCKET` (default: `documents`)
- `PREMIUM_PDF_PATH_NOTARY`
- `PREMIUM_PDF_PATH_DOMY`
- `NEXT_PUBLIC_BASE_URL` (must match your app URL)
- `CONSENT_HASH_SALT`
- `LEGAL_HASH_SALT`

## 5. Configure Stripe webhook endpoint

Create endpoint in Stripe:

- URL (local): `http://localhost:3000/api/payments/webhook`
- URL (prod): `https://your-domain.com/api/payments/webhook`

Events to send:
- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`

Copy webhook signing secret into:
- `STRIPE_WEBHOOK_SECRET`

## 6. Test full flow

1. Login on the site.
2. Click CTA in:
   - `/guides/notary` (product `premium-notary`)
   - `/guides/costs` (product `premium-domy`)
3. Complete payment in Stripe test mode.
4. You should be redirected to `/premium/success`.
5. Download starts automatically; button fallback is available.
6. Verify in DB:
   - `premium_purchases` contains legal columns (`legal_version`, `legal_terms_accepted`, etc.)
   - `purchase_legal_events` has one row for the paid `stripe_session_id`

## 7. Key implementation files

- `app/api/payments/checkout/route.js`
- `app/api/payments/session/route.js`
- `app/api/payments/download/route.js`
- `app/api/payments/webhook/route.js`
- `app/premium/success/page.js`
- `lib/premiumProducts.js`
- `lib/stripeServer.js`
- `lib/supabaseAdmin.js`

These files are deployment sources and are not served by Next.js.

- `premium-domy.pdf` uploads to `PREMIUM_PDF_PATH_DOMY`
- `premium-notary.pdf` uploads to `PREMIUM_PDF_PATH_NOTARY`

Run `npm run upload:premium:pdfs` to copy them to the private Supabase Storage
bucket. Customer downloads continue through `/api/payments/download`, which
requires an authenticated user and a verified paid purchase before creating a
short-lived signed URL.

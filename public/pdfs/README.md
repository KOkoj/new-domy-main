Do not place gated or premium PDF files in this directory. Public, non-gated
downloads may remain here when anonymous access is intentional.

Everything under `public/` is anonymously accessible and bypasses lead,
authentication, and purchase checks. Free lead-magnet PDFs belong in the
private Supabase Storage bucket configured by `FREE_PDF_BUCKET` and the
`FREE_PDF_PATH_*` environment variables.

The inspections and mistakes lead magnets, plus the old premium source files,
were intentionally removed from this directory. Their former public addresses
should return 404 and must not be redirected. Premium upload sources live in
`private/pdfs/` and are copied to private Supabase Storage by
`npm run upload:premium:pdfs`.


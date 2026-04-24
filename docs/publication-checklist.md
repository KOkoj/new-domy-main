# Publication checklist

This project is technically prepared for launch, but a few release actions must be completed when `PUBLIC_SITE_STANDBY` is switched to `false`.

## 1. Remove stand-by mode

- Set `PUBLIC_SITE_STANDBY = false` in `lib/featureFlags.js`
- Run `npm run build`
- Deploy production to Vercel

## 2. Verify crawlability after launch

- `https://www.domyvitalii.cz/robots.txt`
  - must allow crawling
  - must point to `https://www.domyvitalii.cz/sitemap.xml`
- `https://www.domyvitalii.cz/sitemap.xml`
  - must include homepage
  - must include guides
  - must include travel articles
  - must include regions
  - must include property detail pages

## 3. Google Search Console

These steps cannot be completed from the repository alone. They require access to the Google account used for Search Console.

- Create or open the **Domain property** for `domyvitalii.cz`
- Verify ownership through DNS TXT record on Active24 if it is not already verified
- Submit sitemap:
  - `https://www.domyvitalii.cz/sitemap.xml`
- Request indexing for:
  - `/`
  - `/properties`
  - `/regions`
  - `/guides`
  - `/blog`
  - 2-3 highest-priority guide pages
  - 2-3 highest-priority property pages

## 4. Live checks after launch

- Root host redirects to canonical host:
  - `https://domyvitalii.cz` -> `https://www.domyvitalii.cz`
- Legacy root query URLs:
  - `/?s=clanky` -> `/blog`
  - `/?s=nabidka` -> `/properties`
  - `/?s=regiony` -> `/regions`
  - numeric old query IDs return `410`
- Main pages return `200`
- Canonical tags point to `https://www.domyvitalii.cz/...`
- No public page should expose maintenance content once stand-by is disabled

## 5. Final manual validation

- Homepage
- Property listing page
- At least 3 property detail pages
- Region listing page
- At least 3 region detail pages
- Guides hub and 3 guide pages
- Travel article hub and 3 article pages
- Contact page and main lead forms

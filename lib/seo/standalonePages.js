import { PREMIUM_PDFS_ENABLED } from '@/lib/featureFlags'
import { absoluteUrl, SITE_NAME } from '@/lib/siteConfig'

// Policy for autonomous pages and utilities only; property metadata is separate.
export const STANDALONE_PAGE_SEO = {
  '/reference': {
    title: 'Reference | Domy v Itálii',
    description: 'Přečtěte si reference a hodnocení klientů, kteří koupili nemovitost v Itálii s pomocí Domy v Itálii. Skutečné zkušenosti z celého procesu koupě.',
    index: true, sitemap: true
  },
  '/book-call': {
    title: 'Konzultace ke koupi nemovitosti v Itálii | Domy v Itálii',
    description: 'Naplánujte si konzultaci ke koupi nemovitosti v Itálii. Vyberte termín a hovor přes Google Meet, WhatsApp nebo telefon. Dostupnost potvrdíme e-mailem.',
    index: true, sitemap: true
  },
  '/cookies': {
    title: 'Používání cookies | Domy v Itálii',
    description: 'Informace o používání cookies a podobných technologií na webu Domy v Itálii, jejich účelu a možnostech správy v nastavení prohlížeče.',
    index: true, sitemap: false
  },
  '/guides/mistakes/free-pdf': {
    title: 'PDF zdarma: Nejčastější chyby při koupi v Itálii | Domy v Itálii',
    description: 'Stáhněte si zdarma praktický přehled nejčastějších chyb při koupi nemovitosti v Itálii.',
    index: true, sitemap: true
  },
  '/agenda': {
    title: 'Event agenda | Domy v Itálii',
    description: 'Internal demonstration agenda for a customer satisfaction event.',
    locale: 'en_US', index: false, sitemap: false
  },
  '/login': {
    title: 'Přihlášení a registrace | Domy v Itálii',
    description: 'Přihlaste se ke svému účtu nebo se zaregistrujte do Klubu Domy v Itálii.',
    index: false, sitemap: false
  },
  '/dekujeme': {
    title: 'Potvrzení e-mailu a stažení PDF | Domy v Itálii',
    description: 'Stránka pro potvrzení e-mailu a stažení vyžádaného PDF průvodce Domy v Itálii.',
    index: false, sitemap: false
  },
  '/premium': {
    title: PREMIUM_PDFS_ENABLED ? 'Premium PDF průvodce koupí v Itálii | Domy v Itálii' : 'Premium PDF připravujeme | Domy v Itálii',
    description: PREMIUM_PDFS_ENABLED
      ? 'Praktické PDF průvodce ke koupi nemovitosti v Itálii: kontroly před podpisem, náklady a rizika. Vyberte si materiál a získejte přístup po zaplacení.'
      : 'Premium PDF průvodce Domy v Itálii připravujeme. Zatím můžete využít bezplatné průvodce nebo nás kontaktovat.',
    index: PREMIUM_PDFS_ENABLED, sitemap: PREMIUM_PDFS_ENABLED
  },
  '/premium/success': {
    title: 'Stav platby a stažení PDF | Domy v Itálii',
    description: 'Ověření platby a přístup ke stažení zakoupeného PDF průvodce Domy v Itálii.',
    index: false, sitemap: false
  },
  '/maintenance': {
    title: 'Stand-by | Domy v Itálii',
    description: 'Web je dočasně nedostupný, zatímco dokončujeme finální úpravy.',
    index: false, sitemap: false
  }
}

export function getStandalonePageMetadata(path) {
  const entry = STANDALONE_PAGE_SEO[path]
  if (!entry) throw new Error(`Unknown standalone SEO page: ${path}`)
  const { title, description, index, locale = 'cs_CZ' } = entry
  return {
    title,
    description,
    alternates: { canonical: path },
    robots: { index, follow: true },
    openGraph: { title, description, url: absoluteUrl(path), siteName: SITE_NAME, locale, type: 'website' },
    twitter: { card: 'summary_large_image', title, description }
  }
}

export function getStandaloneSitemapPaths() {
  return Object.entries(STANDALONE_PAGE_SEO)
    .filter(([, entry]) => entry.index && entry.sitemap)
    .map(([path]) => path)
}

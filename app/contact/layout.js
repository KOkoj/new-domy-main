import { absoluteUrl, SITE_NAME } from '@/lib/siteConfig'

const title = 'Kontakt a konzultace | Domy v Itálii'
const description = 'Máte otázky ke koupi nemovitosti v Itálii? Kontaktujte Domy v Itálii e-mailem, přes WhatsApp nebo kontaktní formulář. Najdete nás také v Praze.'

export const metadata = {
  title,
  description,
  alternates: { canonical: '/contact' },
  openGraph: { title, description, url: absoluteUrl('/contact'), siteName: SITE_NAME, locale: 'cs_CZ', type: 'website' },
  twitter: { card: 'summary', title, description }
}

export default function PageLayout({ children }) {
  return children
}

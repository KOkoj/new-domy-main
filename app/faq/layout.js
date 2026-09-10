import { absoluteUrl, SITE_NAME } from '@/lib/siteConfig'

const title = 'Časté otázky ke koupi nemovitosti v Itálii | Domy v Itálii'
const description = 'Odpovědi na časté otázky českých kupujících: podmínky koupě nemovitosti v Itálii, náklady, role notáře, délka procesu a nákup na dálku.'

export const metadata = {
  title,
  description,
  alternates: { canonical: '/faq' },
  openGraph: { title, description, url: absoluteUrl('/faq'), siteName: SITE_NAME, locale: 'cs_CZ', type: 'website' },
  twitter: { card: 'summary', title, description }
}

export default function PageLayout({ children }) {
  return children
}

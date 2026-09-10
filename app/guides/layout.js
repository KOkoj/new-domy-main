import { absoluteUrl, SITE_NAME } from '@/lib/siteConfig'

const title = 'Průvodce koupí nemovitosti v Itálii | Domy v Itálii'
const description = 'Praktické průvodce pro české kupující: náklady, daně, notář, prohlídky a kontroly nemovitostí v Itálii. Připravte se na jednotlivé kroky koupě.'

export const metadata = {
  title,
  description,
  alternates: { canonical: '/guides' },
  openGraph: { title, description, url: absoluteUrl('/guides'), siteName: SITE_NAME, locale: 'cs_CZ', type: 'website' },
  twitter: { card: 'summary', title, description }
}

export default function PageLayout({ children }) {
  return children
}

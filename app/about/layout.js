import { absoluteUrl, SITE_NAME } from '@/lib/siteConfig'

const title = 'O nás a náš tým | Domy v Itálii'
const description = 'Poznejte tým Domy v Itálii a náš přístup k pomoci českým kupujícím. Provázíme vás od výběru nemovitosti v Itálii až po předání klíčů.'

export const metadata = {
  title,
  description,
  alternates: { canonical: '/about' },
  openGraph: { title, description, url: absoluteUrl('/about'), siteName: SITE_NAME, locale: 'cs_CZ', type: 'website' },
  twitter: { card: 'summary', title, description }
}

export default function PageLayout({ children }) {
  return children
}

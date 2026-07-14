import { absoluteUrl, SITE_NAME } from '@/lib/siteConfig'

const TITLE_CS = 'Průvodci a články o Itálii | ' + SITE_NAME
const DESCRIPTION_CS =
  'Průvodci a články o Itálii pro kupující nemovitostí i cestovatele: ceny, regiony, právní proces, praktické plánování a místní kontext.'

export const metadata = {
  title: TITLE_CS,
  description: DESCRIPTION_CS,
  alternates: {
    canonical: '/blog',
    languages: {
      'cs-CZ': '/blog',
      en: '/blog',
      'it-IT': '/blog',
      'x-default': '/blog'
    }
  },
  openGraph: {
    title: TITLE_CS,
    description: DESCRIPTION_CS,
    url: absoluteUrl('/blog'),
    type: 'website',
    siteName: SITE_NAME,
    locale: 'cs_CZ',
    alternateLocale: ['en_US', 'it_IT']
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE_CS,
    description: DESCRIPTION_CS
  }
}

export default function BlogLayout({ children }) {
  return children
}

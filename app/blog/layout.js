import { absoluteUrl, SITE_NAME } from '@/lib/siteConfig'

const TITLE_CS = 'Pruvodci a clanky o Italii | ' + SITE_NAME
const DESCRIPTION_CS =
  'Pruvodci a clanky o Italii pro kupujici nemovitosti i cestovatele: ceny, regiony, pravni proces, prakticke planovani a mistni kontext.'

export const metadata = {
  title: TITLE_CS,
  description: DESCRIPTION_CS,
  keywords:
    'clanky Italie, pruvodce Italii, koupit nemovitost v Italii, dovolena v Italii, rekonstrukce v Italii, italske regiony, italian buying guide',
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

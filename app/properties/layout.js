import { absoluteUrl, SITE_NAME } from '@/lib/siteConfig'

const TITLE_CS = 'Domy a nemovitosti v Itálii na prodej | ' + SITE_NAME
const DESCRIPTION_CS =
  'Aktuální nabídka domů, bytů a vil na prodej v Itálii pro české kupující. Prověřené nemovitosti s právní a technickou kontrolou.'

export const metadata = {
  title: TITLE_CS,
  description: DESCRIPTION_CS,
  alternates: {
    canonical: '/properties',
    languages: {
      'cs-CZ': '/properties',
      en: '/properties',
      'it-IT': '/properties',
      'x-default': '/properties'
    }
  },
  openGraph: {
    title: TITLE_CS,
    description: DESCRIPTION_CS,
    url: absoluteUrl('/properties'),
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

export const revalidate = 3600

export default function PropertiesLayout({ children }) {
  return children
}

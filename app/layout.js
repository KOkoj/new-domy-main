import { Manrope, Sora } from 'next/font/google'
import './globals.css'
import ScrollToTop from '@/components/ScrollToTop'
import NavigationProgress from '@/components/NavigationProgress'
import { PUBLIC_SITE_STANDBY } from '@/lib/featureFlags'
import { SITE_NAME, SITE_URL } from '@/lib/siteConfig'
import { Analytics } from '@vercel/analytics/next'

const manrope = Manrope({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-manrope',
  fallback: ['system-ui', 'arial'],
  preload: true,
  weight: ['200', '300', '400', '500', '600', '700', '800'],
})

const sora = Sora({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-sora',
  fallback: ['system-ui', 'arial'],
  preload: true,
  weight: ['100', '200', '300', '400', '500', '600', '700', '800'],
})

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Domy v Italii - Pruvodce koupi domu v Italii pro Cechy',
  description: 'Pomahame Cechum s koupi nemovitosti v Italii. Luxusni vily, byty a statky v nejkrasnejsich italskych regionech.',
  keywords: 'domy v Italii, nemovitosti Italie, koupe domu Italie, Italian properties, real estate Italy, villas Italy',
  alternates: {
    canonical: '/'
  },
  robots: PUBLIC_SITE_STANDBY
    ? {
        index: false,
        follow: false
      }
    : {
        index: true,
        follow: true
      },
  openGraph: {
    title: 'Domy v Italii - Pruvodce koupi domu v Italii',
    description: 'Pomahame Cechum s koupi nemovitosti v Italii. Jasne, prakticky a bez stresu.',
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: 'cs_CZ',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Domy v Italii - Pruvodce koupi domu v Italii',
    description: 'Pomahame Cechum s koupi nemovitosti v Italii. Jasne, prakticky a bez stresu.'
  },
}

export default function RootLayout({ children }) {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    email: 'info@domyvitalii.cz'
  }

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL
  }

  const GA_MEASUREMENT_ID = 'G-XXXXXXX'

  return (
    <html lang="cs" className={`${manrope.variable} ${sora.variable} font-sans overflow-x-hidden`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        {/* Google Analytics 4 */}
        <script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_MEASUREMENT_ID}');
            `,
          }}
        />
      </head>
      <body className="antialiased overflow-x-hidden">
        <NavigationProgress />
        {children}
        <ScrollToTop />
        {/* Vercel Analytics */}
        <Analytics />
      </body>
    </html>
  )
}

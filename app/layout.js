import { Manrope, Sora } from 'next/font/google'
import './globals.css'
import ScrollToTop from '@/components/ScrollToTop'
import NavigationProgress from '@/components/NavigationProgress'
import ArticlePaywallGate from '@/components/ArticlePaywallGate'
import { PUBLIC_SITE_STANDBY } from '@/lib/featureFlags'
import { SITE_NAME, SITE_URL } from '@/lib/siteConfig'
import { DEFAULT_LANGUAGE } from '@/lib/userPreferences'
import { Analytics } from '@vercel/analytics/next'
import AffiliateClickAnalytics from '@/components/AffiliateClickAnalytics'

const manrope = Manrope({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-manrope',
  fallback: ['system-ui', 'arial'],
  preload: true,
  weight: ['400', '600', '700'],
})

const sora = Sora({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sora',
  fallback: ['system-ui', 'arial'],
  preload: false,
  weight: ['600', '700', '800'],
})

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Domy v Itálii - Průvodce koupí domů v Itálii pro Čechy',
  description: 'Pomáháme Čechům s koupí nemovitostí v Itálii. Luxusní vily, byty a statky v nejkrásnějších italských regionech.',
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
    title: 'Domy v Itálii - Průvodce koupí domů v Itálii',
    description: 'Pomáháme Čechům s koupí nemovitostí v Itálii. Jasně, prakticky a bez stresu.',
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: 'cs_CZ',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Domy v Itálii - Průvodce koupí domů v Itálii',
    description: 'Pomáháme Čechům s koupí nemovitostí v Itálii. Jasně, prakticky a bez stresu.'
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

  return (
    <html lang={DEFAULT_LANGUAGE} className={`${manrope.variable} ${sora.variable} font-sans overflow-x-hidden`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        {/* LCP hero background — preload the best format the browser supports.
            AVIF-capable browsers (Chrome, Edge, Firefox, Safari 16+) fetch the
            14 KiB AVIF; others fall back to the 44 KiB WebP via the <picture>
            element in BackgroundImageTransition. */}
        <link
          rel="preload"
          as="image"
          href="/hero-background.avif"
          type="image/avif"
          fetchPriority="high"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body className="antialiased overflow-x-hidden">
        <NavigationProgress />
        {children}
        <ArticlePaywallGate />
        <ScrollToTop />
        <AffiliateClickAnalytics />
        {/* Vercel Analytics */}
        <Analytics />
      </body>
    </html>
  )
}

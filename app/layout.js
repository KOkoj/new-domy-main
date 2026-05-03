import { Manrope, Sora } from 'next/font/google'
import { cookies } from 'next/headers'
import './globals.css'
import ScrollToTop from '@/components/ScrollToTop'
import NavigationProgress from '@/components/NavigationProgress'
import ArticlePaywallGate from '@/components/ArticlePaywallGate'
import { PUBLIC_SITE_STANDBY } from '@/lib/featureFlags'
import { SITE_NAME, SITE_URL } from '@/lib/siteConfig'
import { readLanguageFromCookies } from '@/lib/userPreferences'
import { Analytics } from '@vercel/analytics/next'

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

export default async function RootLayout({ children }) {
  // Read the language preference cookie on the server so the very first
  // server-rendered HTML carries the correct lang attribute. Search engines
  // use this to identify content language and to surface region-appropriate
  // results.
  const cookieStore = await cookies()
  const language = readLanguageFromCookies(cookieStore)

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
    <html lang={language} className={`${manrope.variable} ${sora.variable} font-sans overflow-x-hidden`}>
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
        <ArticlePaywallGate />
        <ScrollToTop />
        {/* Vercel Analytics */}
        <Analytics />
      </body>
    </html>
  )
}

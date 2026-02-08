import { Manrope, Sora } from 'next/font/google'
import './globals.css'
import ScrollToTop from '@/components/ScrollToTop'
import NavigationProgress from '@/components/NavigationProgress'

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
  title: 'Domy v Itálii - Průvodce koupí domu v Itálii pro Čechy',
  description: 'Pomáháme Čechům s koupí nemovitosti v Itálii. Luxusní vily, byty a statky v nejkrásnějších italských regionech. Find your dream property in Italy.',
  keywords: 'domy v Itálii, nemovitosti Itálie, koupě domu Itálie, Italian properties, real estate Italy, villas Italy',
  openGraph: {
    title: 'Domy v Itálii - Průvodce koupí domu v Itálii',
    description: 'Pomáháme Čechům s koupí nemovitosti v Itálii. Jasně, prakticky a bez stresu.',
    url: 'https://www.domyvitalii.cz',
    siteName: 'Domy v Itálii',
    locale: 'cs_CZ',
    type: 'website',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="cs" className={`${manrope.variable} ${sora.variable} font-sans overflow-x-hidden`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="antialiased overflow-x-hidden">
        <NavigationProgress />
        {children}
        <ScrollToTop />
      </body>
    </html>
  )
}
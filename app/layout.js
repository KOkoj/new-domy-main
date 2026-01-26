import { Manrope, Sora } from 'next/font/google'
import './globals.css'

const manrope = Manrope({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-manrope',
  fallback: ['system-ui', 'arial'],
  preload: true,
  weight: ['200', '300', '400', '500', '600', '700', '800'],
})

const sora = Sora({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sora',
  fallback: ['system-ui', 'arial'],
  preload: true,
  weight: ['100', '200', '300', '400', '500', '600', '700', '800'],
})

export const metadata = {
  title: 'Domy v Itálii - Italian Properties for Czech Buyers',
  description: 'Find your dream property in Italy. Luxury villas, apartments, and farmhouses across Italy\'s most beautiful regions.',
  keywords: 'Italian properties, real estate Italy, villas Italy, apartments Italy, property investment',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${manrope.variable} ${sora.variable} font-sans overflow-x-hidden`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="antialiased overflow-x-hidden">
        {children}
      </body>
    </html>
  )
}
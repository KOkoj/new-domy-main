'use client'

import Script from 'next/script'
import { usePathname, useSearchParams } from 'next/navigation'
import { Suspense, useCallback, useEffect, useState } from 'react'

const CONSENT_COOKIE = 'domy_meta_consent'

function cookieValue(name) {
  return document.cookie.split('; ').find((item) => item.startsWith(`${name}=`))?.split('=')[1]
}

function setConsent(value) {
  const secure = location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `${CONSENT_COOKIE}=${value}; Path=/; Max-Age=31536000; SameSite=Lax${secure}`
}

function newEventId() {
  return globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function PageTracker({ enabled }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!enabled || typeof window.fbq !== 'function') return
    const eventId = newEventId()
    window.fbq('track', 'PageView', {}, { eventID: eventId })
    fetch('/api/meta/events', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        eventName: 'PageView',
        eventId,
        eventSourceUrl: window.location.href,
        fbp: cookieValue('_fbp'),
        fbc: cookieValue('_fbc')
      }),
      keepalive: true
    }).catch(() => {})
  }, [enabled, pathname, searchParams])

  return null
}

export default function MetaTracking() {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID
  const [consent, setConsentState] = useState(null)
  const [pixelReady, setPixelReady] = useState(false)

  useEffect(() => setConsentState(cookieValue(CONSENT_COOKIE) || 'unset'), [])

  const choose = useCallback((value) => {
    setConsent(value)
    setConsentState(value)
  }, [])

  if (!pixelId) return null

  return (
    <>
      {consent === 'granted' ? (
        <>
          <Script id="meta-pixel" strategy="afterInteractive" onReady={() => setPixelReady(true)}>
            {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixelId}');`}
          </Script>
          <Suspense fallback={null}><PageTracker enabled={pixelReady} /></Suspense>
        </>
      ) : null}

      {consent === 'unset' ? (
        <aside className="fixed inset-x-4 bottom-4 z-[100] mx-auto max-w-3xl rounded-2xl border border-white/15 bg-slate-950 p-5 text-sm text-white shadow-2xl" aria-label="Nastavení marketingových cookies">
          <p className="font-semibold">Marketingové cookies</p>
          <p className="mt-2 text-slate-300">Se souhlasem používáme Meta Pixel a Conversions API k měření účinnosti reklam. Odmítnutí neomezí používání webu.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" onClick={() => choose('granted')} className="rounded-full bg-white px-5 py-2 font-semibold text-slate-950">Povolit</button>
            <button type="button" onClick={() => choose('denied')} className="rounded-full border border-white/30 px-5 py-2 font-semibold">Odmítnout</button>
            <a href="/cookies" className="px-2 py-2 underline">Více informací</a>
          </div>
        </aside>
      ) : null}
    </>
  )
}

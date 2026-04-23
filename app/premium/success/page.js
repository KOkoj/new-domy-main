'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PREMIUM_PDFS_ENABLED } from '@/lib/featureFlags'

const PRODUCT_LABELS = {
  'premium-notary': {
    it: 'Premium Notaio',
    en: 'Premium Notary',
    cs: 'Premium Notar'
  },
  'premium-domy': {
    it: 'Premium Domy',
    en: 'Premium Domy',
    cs: 'Premium Domy'
  }
}

const TEXT = {
  it: {
    title: 'Pagamento completato',
    loading: 'Stiamo preparando il download sicuro del tuo PDF...',
    missingSession: 'Sessione pagamento non trovata.',
    verifyFailed: 'Verifica pagamento fallita',
    downloadError: 'Errore durante il recupero del download',
    purchaseConfirmed: "Il tuo acquisto {product} e' confermato.",
    fallbackInfo: 'Se il download non parte automaticamente, usa il bottone qui sotto.',
    downloadNow: 'Scarica PDF adesso',
    backHome: 'Torna alla home'
  },
  en: {
    title: 'Payment completed',
    loading: 'We are preparing the secure download of your PDF...',
    missingSession: 'Payment session not found.',
    verifyFailed: 'Payment verification failed',
    downloadError: 'Error while preparing download',
    purchaseConfirmed: 'Your purchase {product} is confirmed.',
    fallbackInfo: 'If download does not start automatically, use the button below.',
    downloadNow: 'Download PDF now',
    backHome: 'Back to home'
  },
  cs: {
    title: 'Platba dokoncena',
    loading: 'Pripravujeme bezpecne stazeni vaseho PDF...',
    missingSession: 'Platebni relace nebyla nalezena.',
    verifyFailed: 'Overeni platby selhalo',
    downloadError: 'Chyba pri priprave stazeni',
    purchaseConfirmed: 'Vas nakup {product} je potvrzen.',
    fallbackInfo: 'Pokud se stahovani nespusti automaticky, pouzijte tlacitko niz.',
    downloadNow: 'Stahnout PDF',
    backHome: 'Zpet na home'
  }
}

export default function PremiumSuccessPage() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const hasTriggeredDownload = useRef(false)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [downloadUrl, setDownloadUrl] = useState('')
  const [productKey, setProductKey] = useState('')
  const [language, setLanguage] = useState('it')

  const t = TEXT[language] || TEXT.it

  const productLabel = useMemo(() => {
    const labels = PRODUCT_LABELS[productKey]
    if (!labels) return 'Premium PDF'
    return labels[language] || labels.it
  }, [productKey, language])

  const purchaseConfirmedText = useMemo(
    () => t.purchaseConfirmed.replace('{product}', productLabel),
    [t.purchaseConfirmed, productLabel]
  )

  if (!PREMIUM_PDFS_ENABLED) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f7f4ed] via-amber-50/20 to-slate-50">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-xl mx-auto">
            <Card className="bg-white/95 border-gray-200 shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-slate-800">
                  {language === 'cs' ? 'Premium PDF zatim nejsou aktivni' : language === 'it' ? 'I PDF premium non sono ancora attivi' : 'Premium PDFs are not active yet'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">
                  {language === 'cs'
                    ? 'Tato cast zustava vypnuta do dalsi faze spusteni.'
                    : language === 'it'
                      ? 'Questa sezione resta disattivata fino a una fase successiva del progetto.'
                      : 'This section stays disabled until a later launch phase.'}
                </p>
                <Link href="/">
                  <Button variant="outline">{t.backHome}</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  useEffect(() => {
    if (typeof window === 'undefined') return
    const savedLanguage = localStorage.getItem('preferred-language')
    if (savedLanguage === 'cs' || savedLanguage === 'en' || savedLanguage === 'it') {
      setLanguage(savedLanguage)
      document.documentElement.lang = savedLanguage
      return
    }
    document.documentElement.lang = 'it'
  }, [])

  useEffect(() => {
    async function validateSessionAndDownload() {
      if (!sessionId) {
        setError(t.missingSession)
        setLoading(false)
        return
      }

      try {
        const response = await fetch(
          `/api/payments/session?session_id=${encodeURIComponent(sessionId)}`,
          { cache: 'no-store' }
        )
        const payload = await response.json().catch(() => ({}))

        if (!response.ok) {
          throw new Error(payload?.error || t.verifyFailed)
        }

        setProductKey(payload.productKey || '')
        if (payload?.language === 'cs' || payload?.language === 'en' || payload?.language === 'it') {
          setLanguage(payload.language)
          if (typeof window !== 'undefined') {
            localStorage.setItem('preferred-language', payload.language)
            document.documentElement.lang = payload.language
          }
        }
        setDownloadUrl(payload.downloadUrl || '')
        setLoading(false)

        if (payload.downloadUrl && !hasTriggeredDownload.current) {
          hasTriggeredDownload.current = true
          window.location.assign(payload.downloadUrl)
        }
      } catch (err) {
        setError(err?.message || t.downloadError)
        setLoading(false)
      }
    }

    validateSessionAndDownload()
  }, [sessionId, t.missingSession, t.verifyFailed, t.downloadError])

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f7f4ed] via-amber-50/20 to-slate-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-xl mx-auto">
          <Card className="bg-white/95 border-gray-200 shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-slate-800">
                {t.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading && (
                <p className="text-gray-700">
                  {t.loading}
                </p>
              )}

              {!loading && error && (
                <p className="text-red-700">
                  {error}
                </p>
              )}

              {!loading && !error && (
                <>
                  <p className="text-gray-700">
                    {purchaseConfirmedText}
                  </p>
                  <p className="text-gray-700">
                    {t.fallbackInfo}
                  </p>
                  <Button
                    onClick={() => downloadUrl && window.location.assign(downloadUrl)}
                    className="bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-400 text-amber-950 hover:from-amber-200 hover:via-yellow-200 hover:to-amber-300 border border-amber-200/70"
                    disabled={!downloadUrl}
                  >
                    {t.downloadNow}
                  </Button>
                </>
              )}

              <div className="pt-2">
                <Link href="/">
                  <Button variant="outline">
                    {t.backHome}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}


'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { CheckCircle2, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Footer from '@/components/Footer'

const VALID_ASSETS = new Set(['inspections', 'mistakes'])

function ThankYouContent() {
  const searchParams = useSearchParams()
  const asset = searchParams.get('asset') || ''
  const token = searchParams.get('token') || ''
  const triggered = useRef(false)
  const [downloadUrl, setDownloadUrl] = useState('')

  useEffect(() => {
    if (!VALID_ASSETS.has(asset) || !token || triggered.current) return
    triggered.current = true
    setDownloadUrl(
      `/api/leads/download?asset=${encodeURIComponent(asset)}&token=${encodeURIComponent(token)}`
    )
  }, [asset, token])

  const valid = VALID_ASSETS.has(asset) && Boolean(token)

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f7f4ed] via-amber-50/20 to-slate-50">
      {downloadUrl ? <iframe src={downloadUrl} title="Stažení PDF" className="hidden" /> : null}
      <main className="container mx-auto px-4 py-16 md:py-24">
        <Card className="mx-auto max-w-xl border-slate-200 bg-white/95 shadow-xl">
          <CardHeader>
            <CheckCircle2 className="mb-3 h-10 w-10 text-emerald-600" />
            <CardTitle className="text-2xl font-bold text-slate-900">
              {valid ? 'Děkujeme, váš e-mail je potvrzený' : 'Odkaz není platný'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {valid ? (
              <>
                <p className="text-slate-700">
                  Stahování PDF se právě spouští. Pokud nezačne automaticky, použijte tlačítko níže.
                </p>
                <Button asChild className="bg-slate-800 text-white hover:bg-slate-700">
                  <a href={downloadUrl || '#'}>
                    <Download className="mr-2 h-4 w-4" />
                    Stáhnout PDF
                  </a>
                </Button>
                <div className="border-t border-slate-200 pt-5">
                  <h2 className="font-bold text-slate-900">Chcete více praktických průvodců?</h2>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    V bezplatném Klubu najdete další články, návody a přehledy ke koupi nemovitosti v Itálii.
                  </p>
                  <Link
                    href="/login?tab=signup"
                    className="mt-3 inline-block text-sm font-semibold text-amber-700 underline underline-offset-4"
                  >
                    Registrovat se do Klubu zdarma
                  </Link>
                </div>
              </>
            ) : (
              <p className="text-slate-700">Vraťte se prosím k formuláři a vyžádejte si nový odkaz.</p>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer language="cs" />
    </div>
  )
}

export default function ThankYouPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f7f4ed]" />}>
      <ThankYouContent />
    </Suspense>
  )
}

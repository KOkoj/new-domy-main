'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, FileText } from 'lucide-react'
import EmailGateModal from '@/components/EmailGateModal'
import Footer from '@/components/Footer'
import Navigation from '@/components/Navigation'
import InformationalDisclaimer from '@/components/legal/InformationalDisclaimer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function MistakesFreePdfPage() {
  const [language, setLanguage] = useState('cs')

  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferred-language')
    if (savedLanguage) {
      setLanguage(savedLanguage)
      document.documentElement.lang = savedLanguage
    }

    const handleLanguageChange = (event) => {
      if (event.detail) {
        setLanguage(event.detail)
        document.documentElement.lang = event.detail
      }
    }
    window.addEventListener('languageChange', handleLanguageChange)
    return () => window.removeEventListener('languageChange', handleLanguageChange)
  }, [])

  const copy = useMemo(() => {
    if (language === 'it') {
      return {
        backToArticle: "Torna all'articolo completo",
        badge: 'PDF gratuito',
        title: "Gli errori più comuni nell'acquisto di un immobile in Italia",
        intro:
          'Una sintesi pratica per riconoscere i rischi prima che diventino problemi costosi.',
        benefits: [
          'costi che gli acquirenti spesso trascurano',
          'controlli legali e tecnici prima della firma',
          'passi pratici per decidere con più sicurezza'
        ]
      }
    }

    if (language === 'en') {
      return {
        backToArticle: 'Back to the full article',
        badge: 'Free PDF',
        title: 'The most common mistakes when buying property in Italy',
        intro:
          'A short practical overview to help you spot risks before they become expensive problems.',
        benefits: [
          'costs buyers often overlook',
          'legal and technical checks before signing',
          'practical steps for safer decisions'
        ]
      }
    }

    return {
      backToArticle: 'Zpět na celý článek',
      badge: 'PDF zdarma',
      title: 'Nejčastější chyby při koupi nemovitosti v Itálii',
      intro:
        'Stručný praktický přehled, který vám pomůže odhalit rizika dřív, než se z nich stanou drahé problémy.',
      benefits: [
        'náklady, které kupující často přehlédnou',
        'právní a technické kontroly před podpisem',
        'praktické kroky pro bezpečnější rozhodování'
      ]
    }
  }, [language])

  return (
    <div className="site-page min-h-screen bg-[#f7f4ed]">
      <Navigation />
      <main className="mx-auto max-w-2xl px-6 pb-20 pt-32">
        <Link
          href="/guides/mistakes"
          className="mb-6 inline-flex items-center gap-2 text-sm text-slate-700 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          {copy.backToArticle}
        </Link>

        <Card className="border-slate-200 bg-white/95 shadow-lg">
          <CardHeader>
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
              <FileText className="h-3.5 w-3.5" />
              {copy.badge}
            </div>
            <CardTitle className="mt-3 text-2xl font-bold text-slate-900">
              {copy.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="leading-relaxed text-slate-700">
              {copy.intro}
            </p>
            <ul className="space-y-3 text-sm text-slate-700">
              {copy.benefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>

            <EmailGateModal source="pdf_mistakes" assetKey="mistakes" language={language} />
            <InformationalDisclaimer language={language} variant="pdf" />
          </CardContent>
        </Card>
      </main>
      <Footer language={language} />
    </div>
  )
}

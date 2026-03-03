'use client'

import { useEffect, useState } from 'react'
import Navigation from '../../components/Navigation'
import Footer from '../../components/Footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const GDPR_CONTENT = {
  cs: {
    title: 'Osobní údaje a GDPR',
    subtitle: 'Jak pracujeme s vašimi daty',
    intro: 'Respektujeme vaše soukromí. Tato stránka stručně vysvětluje, jaké údaje zpracováváme a proč.',
    list: [
      'Shromažďujeme pouze údaje nutné pro registraci a komunikaci.',
      'Údaje nepředáváme třetím stranám bez právního důvodu.',
      'Můžete požádat o úpravu nebo smazání svých údajů.',
    ],
    contact: 'Pro GDPR požadavky nás kontaktujte na info@domyvitalii.cz.',
  },
  it: {
    title: 'Dati personali e GDPR',
    subtitle: 'Come trattiamo i tuoi dati',
    intro: 'Rispettiamo la tua privacy. Questa pagina spiega in breve quali dati trattiamo e perché.',
    list: [
      'Raccogliamo solo i dati necessari per registrazione e comunicazione.',
      'Non condividiamo i dati con terzi senza una base legale.',
      'Puoi richiedere modifica o cancellazione dei tuoi dati.',
    ],
    contact: 'Per richieste GDPR contattaci a info@domyvitalii.cz.',
  },
  en: {
    title: 'Personal Data and GDPR',
    subtitle: 'How we handle your data',
    intro: 'We respect your privacy. This page briefly explains which data we process and why.',
    list: [
      'We collect only data needed for registration and communication.',
      'We do not share data with third parties without legal basis.',
      'You can request correction or deletion of your personal data.',
    ],
    contact: 'For GDPR requests, contact us at info@domyvitalii.cz.',
  },
}

export default function GdprPage() {
  const [language, setLanguage] = useState('en')

  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferred-language') || 'en'
    setLanguage(savedLanguage)
    document.documentElement.lang = savedLanguage

    const handleLanguageChange = (event) => {
      setLanguage(event.detail)
      document.documentElement.lang = event.detail
    }

    window.addEventListener('languageChange', handleLanguageChange)
    return () => window.removeEventListener('languageChange', handleLanguageChange)
  }, [])

  const content = GDPR_CONTENT[language] || GDPR_CONTENT.en

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <Navigation />

      <main className="pt-28 md:pt-32 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <Card className="bg-white/95 backdrop-blur-sm border border-gray-200 shadow-xl rounded-2xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-3xl md:text-4xl font-bold text-slate-800 leading-tight">
                  {content.title}
                </CardTitle>
                <p className="text-lg text-slate-600">{content.subtitle}</p>
              </CardHeader>
              <CardContent className="space-y-4 text-slate-700">
                <p className="leading-relaxed">{content.intro}</p>
                <ul className="list-disc pl-5 space-y-2">
                  {content.list.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <p className="font-medium">{content.contact}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer language={language} />
    </div>
  )
}

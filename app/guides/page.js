'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { BookOpen, Clock, ChevronRight } from 'lucide-react'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

const GUIDES = [
  {
    slug: 'rekonstrukce-domu-v-italii',
    date: '2026-03-10',
    readTime: '8 min',
    title: {
      en: 'How much does house renovation in Italy cost?',
      cs: 'Kolik stojĂ­ rekonstrukce domu v ItĂˇlii?',
      it: 'Quanto costa ristrutturare una casa in Italia?'
    },
    excerpt: {
      en: 'Indicative price ranges, key cost drivers, and what to verify before purchase.',
      cs: 'OrientaÄŤnĂ­ cenovĂ© pĂˇsmo, hlavnĂ­ faktory nĂˇkladĹŻ a co ovÄ›Ĺ™it pĹ™ed koupĂ­.',
      it: 'Fasce indicative di costo, fattori principali e verifiche da fare prima dell\'acquisto.'
    }
  },
  {
    slug: 'real-estate-purchase-system-italy',
    date: '2026-02-11',
    readTime: '10 min',
    title: {
      en: 'How the Italian Property Buying System Really Works (and Why Itâ€™s Different from the Czech Republic)',
      cs: 'Jak skuteÄŤnÄ› funguje italskĂ˝ systĂ©m koupÄ› nemovitosti (a proÄŤ se liĹˇĂ­ od ÄŚeskĂ© republiky)',
      it: 'Come funziona davvero il sistema di acquisto immobiliare in Italia (e perchĂ© Ă¨ diverso dalla Repubblica Ceca)'
    },
    excerpt: {
      en: 'Roles, checks, risks, and practical process logic for foreign buyers.',
      cs: 'Role, kontroly, rizika a praktickĂˇ logika procesu pro zahraniÄŤnĂ­ kupujĂ­cĂ­.',
      it: 'Ruoli, controlli, rischi e logica pratica del processo per chi compra dallâ€™estero.'
    }
  },
  {
    slug: 'notary',
    date: '2026-01-21',
    readTime: '7 min',
    title: {
      en: 'Notary in Italy: role and costs',
      cs: 'NotĂˇĹ™ v ItĂˇlii: role a nĂˇklady',
      it: 'Notaio in Italia: ruolo e costi'
    },
    excerpt: {
      en: 'What the notary verifies and what remains outside notarial scope.',
      cs: 'Co notĂˇĹ™ ovÄ›Ĺ™uje a co zĹŻstĂˇvĂˇ mimo notĂˇĹ™skĂ˝ rozsah.',
      it: 'Cosa verifica il notaio e cosa resta fuori dal suo ambito.'
    }
  },
  {
    slug: 'inspections',
    date: '2026-01-21',
    readTime: '6 min',
    title: {
      en: 'How property viewings work in Italy',
      cs: 'Jak probĂ­hajĂ­ prohlĂ­dky nemovitostĂ­ v ItĂˇlii',
      it: 'Come funzionano le visite immobiliari in Italia'
    },
    excerpt: {
      en: 'What to check during viewings and right after each visit.',
      cs: 'Co kontrolovat bÄ›hem prohlĂ­dek a hned po nich.',
      it: 'Cosa controllare durante le visite e subito dopo.'
    }
  },
  {
    slug: 'mistakes',
    date: '2026-01-15',
    readTime: '7 min',
    title: {
      en: 'Most common mistakes when buying in Italy',
      cs: 'NejÄŤastÄ›jĹˇĂ­ chyby pĹ™i koupi v ItĂˇlii',
      it: 'Gli errori piĂą comuni nellâ€™acquisto in Italia'
    },
    excerpt: {
      en: 'Typical pitfalls and how to avoid expensive errors.',
      cs: 'TypickĂ© pasti a jak pĹ™edejĂ­t drahĂ˝m chybĂˇm.',
      it: 'Le trappole piĂą frequenti e come evitare errori costosi.'
    }
  },
  {
    slug: 'costs',
    date: '2026-01-06',
    readTime: '8 min',
    title: {
      en: 'Real costs of buying a house in Italy',
      cs: 'ReĂˇlnĂ© nĂˇklady na koupi domu v ItĂˇlii',
      it: 'Costi reali per acquistare una casa in Italia'
    },
    excerpt: {
      en: 'The real cost structure beyond listing price.',
      cs: 'SkuteÄŤnĂˇ struktura nĂˇkladĹŻ nad rĂˇmec inzerovanĂ© ceny.',
      it: 'La struttura reale dei costi oltre il prezzo di annuncio.'
    }
  }
]

const UI = {
  en: {
    badge: 'Guides Hub',
    title: 'All guides about buying property in Italy',
    subtitle: 'Structured resources for foreign buyers, from first planning to final deed.'
  },
  cs: {
    badge: 'Hub prĹŻvodcĹŻ',
    title: 'VĹˇechny prĹŻvodce ke koupi nemovitosti v ItĂˇlii',
    subtitle: 'StrukturovanĂ© zdroje pro zahraniÄŤnĂ­ kupujĂ­cĂ­ od prvnĂ­ho plĂˇnovĂˇnĂ­ aĹľ po finĂˇlnĂ­ podpis.'
  },
  it: {
    badge: 'Hub guide',
    title: "Tutte le guide per acquistare casa in Italia",
    subtitle: "Risorse strutturate per chi compra dall'estero, dalla pianificazione iniziale al rogito."
  }
}

function localize(value, language) {
  if (!value) return ''
  if (typeof value === 'string') return value
  return value[language] || value.en || value.cs || value.it || ''
}

export default function GuidesHubPage() {
  const [language, setLanguage] = useState('en')

  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferred-language')
    if (savedLanguage && UI[savedLanguage]) {
      setLanguage(savedLanguage)
      document.documentElement.lang = savedLanguage
    }

    const handleLanguageChange = (event) => {
      const nextLanguage = event?.detail
      if (nextLanguage && UI[nextLanguage]) {
        setLanguage(nextLanguage)
        document.documentElement.lang = nextLanguage
      }
    }

    window.addEventListener('languageChange', handleLanguageChange)
    return () => window.removeEventListener('languageChange', handleLanguageChange)
  }, [])

  const copy = UI[language] || UI.en

  const guides = useMemo(() => {
    return [...GUIDES].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [])

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <Navigation />

      <main className="pt-28 pb-14">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 border border-slate-200 mb-5">
                <BookOpen className="h-4 w-4 text-slate-600" />
                <span className="text-sm text-slate-700 font-medium">{copy.badge}</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">{copy.title}</h1>
              <p className="text-slate-600 text-lg">{copy.subtitle}</p>
            </div>

            <div className="space-y-4">
              {guides.map((guide) => (
                <Link
                  key={guide.slug}
                  href={`/guides/${guide.slug}`}
                  className="block bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <h2 className="text-xl font-semibold text-slate-900">{localize(guide.title, language)}</h2>
                    <ChevronRight className="h-5 w-5 text-slate-400 flex-shrink-0" />
                  </div>
                  <p className="text-slate-600 mb-3">{localize(guide.excerpt, language)}</p>
                  <div className="text-sm text-slate-500 flex items-center gap-4">
                    <span>{guide.date}</span>
                    <span className="inline-flex items-center">
                      <Clock className="h-4 w-4 mr-1.5" />
                      {guide.readTime}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer language={language} />
    </div>
  )
}


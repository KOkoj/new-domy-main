'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, ChevronRight, BookOpen, Mail, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

const ARTICLES = [
  {
    slug: 'costs-2026',
    title: {
      en: 'How Much Does Buying a House in Italy Really Cost in 2026',
      cs: 'Kolik skutečně stojí koupě domu v Itálii v roce 2026',
      it: 'Quanto costa realmente acquistare una casa in Italia nel 2026'
    },
    excerpt: {
      en: 'An overview of real costs, taxes, and fees you need to account for before signing a contract. The purchase price is just the beginning.',
      cs: 'Přehled reálných nákladů, daní a poplatků, se kterými je nutné počítat ještě před podpisem smlouvy. Kupní cena je pouze začátek.',
      it: 'Una panoramica dei costi reali, tasse e spese da considerare prima di firmare un contratto. Il prezzo di acquisto è solo l\'inizio.'
    },
    date: '2026-01-06',
    readTime: '8 min',
    category: { en: 'Costs', cs: 'Náklady', it: 'Costi' },
    link: '/guides/costs'
  },
  {
    slug: 'common-mistakes',
    title: {
      en: 'Most Common Mistakes Czechs Make When Buying a House in Italy',
      cs: 'Nejčastější chyby Čechů při koupi domu v Itálii',
      it: 'Gli errori più comuni dei cechi quando acquistano una casa in Italia'
    },
    excerpt: {
      en: 'What to watch out for so you don\'t waste time and money. The biggest problems arise not from carelessness but from unfamiliarity with the Italian system.',
      cs: 'Na co si dát pozor, abyste neztratili čas a peníze. Největší problémy vznikají ne z nepozornosti, ale z neznalosti italského systému.',
      it: 'A cosa fare attenzione per non perdere tempo e denaro. I maggiori problemi non nascono dalla disattenzione ma dalla scarsa conoscenza del sistema italiano.'
    },
    date: '2026-01-15',
    readTime: '7 min',
    category: { en: 'Guide', cs: 'Průvodce', it: 'Guida' },
    link: '/guides/mistakes'
  },
  {
    slug: 'one-euro-houses',
    title: {
      en: '1 Euro Houses in Italy – Reality or Trap?',
      cs: 'Dům za 1 euro v Itálii – realita nebo past?',
      it: 'Case a 1 euro in Italia – realtà o trappola?'
    },
    excerpt: {
      en: 'What do the 1 euro house offers really mean? We look at the conditions, hidden costs, and whether it\'s worth considering these offers seriously.',
      cs: 'Co skutečně znamenají nabídky domů za 1 euro? Podíváme se na podmínky, skryté náklady a zda stojí za to tyto nabídky brát vážně.',
      it: 'Cosa significano realmente le offerte di case a 1 euro? Esaminiamo le condizioni, i costi nascosti e se vale la pena considerare seriamente queste offerte.'
    },
    date: '2026-01-18',
    readTime: '6 min',
    category: { en: 'Analysis', cs: 'Analýza', it: 'Analisi' },
    link: '/blog/one-euro-houses'
  },
  {
    slug: 'choose-region',
    title: {
      en: 'How to Choose the Right Region in Italy for Buying a House (Sea, Mountains, Investment)',
      cs: 'Jak vybrat správný region v Itálii pro koupi domu (moře, hory, investice)',
      it: 'Come scegliere la regione giusta in Italia per acquistare una casa (mare, montagna, investimento)'
    },
    excerpt: {
      en: 'Italy offers very different regions. Learn how to choose based on your goal – whether it\'s a vacation home, investment, or a place for a new life.',
      cs: 'Itálie nabízí velmi odlišné regiony. Zjistěte, jak vybrat podle vašeho cíle – ať už jde o rekreační dům, investici nebo místo pro nový život.',
      it: 'L\'Italia offre regioni molto diverse. Scopri come scegliere in base al tuo obiettivo – che si tratti di una casa vacanze, investimento o posto per una nuova vita.'
    },
    date: '2026-01-20',
    readTime: '10 min',
    category: { en: 'Regions', cs: 'Regiony', it: 'Regioni' },
    link: '/regions'
  },
  {
    slug: 'property-inspections',
    title: {
      en: 'How Property Viewings Work in Italy',
      cs: 'Jak probíhají prohlídky nemovitostí v Itálii',
      it: 'Come funzionano le visite immobiliari in Italia'
    },
    excerpt: {
      en: 'What to expect during property viewings in Italy, how to prepare, and what to look for. A practical guide from experience.',
      cs: 'Co očekávat při prohlídkách nemovitostí v Itálii, jak se připravit a na co se zaměřit. Praktický průvodce ze zkušenosti.',
      it: 'Cosa aspettarsi durante le visite immobiliari in Italia, come prepararsi e a cosa prestare attenzione. Una guida pratica dall\'esperienza.'
    },
    date: '2026-01-21',
    readTime: '6 min',
    category: { en: 'Guide', cs: 'Průvodce', it: 'Guida' },
    link: '/guides/inspections'
  },
  {
    slug: 'notary-role',
    title: {
      en: 'Notary in Italy: Role and Costs When Buying a House',
      cs: 'Notář v Itálii: role a náklady při koupi domu',
      it: 'Il notaio in Italia: ruolo e costi nell\'acquisto di una casa'
    },
    excerpt: {
      en: 'The notary\'s role in Italy differs significantly from the Czech Republic. Learn what to expect, what they verify, and what they don\'t.',
      cs: 'Role notáře v Itálii se výrazně liší od České republiky. Zjistěte, co očekávat, co notář kontroluje a co ne.',
      it: 'Il ruolo del notaio in Italia differisce significativamente dalla Repubblica Ceca. Scopri cosa aspettarti, cosa verifica e cosa no.'
    },
    date: '2026-01-21',
    readTime: '7 min',
    category: { en: 'Legal', cs: 'Právo', it: 'Legale' },
    link: '/guides/notary'
  },
  {
    slug: 'buying-timeline',
    title: {
      en: 'How Long Does Buying a House in Italy Take and What Delays the Process Most',
      cs: 'Jak dlouho trvá koupě domu v Itálii a co celý proces nejčastěji zdržuje',
      it: 'Quanto tempo ci vuole per acquistare una casa in Italia e cosa ritarda di più il processo'
    },
    excerpt: {
      en: 'A realistic look at the timeline of buying Italian property – from the first viewing to receiving the keys. What causes the most common delays.',
      cs: 'Realistický pohled na časový plán koupě italské nemovitosti – od první prohlídky po předání klíčů. Co způsobuje nejčastější zdržení.',
      it: 'Uno sguardo realistico alla tempistica dell\'acquisto di un immobile italiano – dalla prima visita alla consegna delle chiavi. Cosa causa i ritardi più comuni.'
    },
    date: '2026-01-21',
    readTime: '8 min',
    category: { en: 'Guide', cs: 'Průvodce', it: 'Guida' },
    link: '/guides/timeline'
  }
]

export default function BlogPage() {
  const [language, setLanguage] = useState('en')

  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferred-language')
    if (savedLanguage) {
      setLanguage(savedLanguage)
      document.documentElement.lang = savedLanguage
    }

    const handleLanguageChange = (event) => {
      setLanguage(event.detail)
      document.documentElement.lang = event.detail
    }

    window.addEventListener('languageChange', handleLanguageChange)
    return () => window.removeEventListener('languageChange', handleLanguageChange)
  }, [])

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <Navigation />

      <div className="pt-28 md:pt-32 pb-12">
        {/* Hero Section */}
        <div className="container mx-auto px-4 py-12 md:py-16 mb-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 border border-slate-200 mb-6">
              <BookOpen className="h-4 w-4 text-slate-500" />
              <span className="text-sm text-slate-600 font-medium">
                {language === 'cs' ? 'Články' : language === 'it' ? 'Articoli' : 'Articles'}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-slate-800 leading-tight">
              {language === 'cs' ? 'Články o koupi domu v Itálii' :
               language === 'it' ? 'Articoli sull\'acquisto di una casa in Italia' :
               'Articles About Buying a House in Italy'}
            </h1>
            <p className="text-lg text-gray-500 leading-relaxed max-w-2xl mx-auto">
              {language === 'cs' ? 'Praktické články, které vám pomohou se zorientovat v procesu koupě nemovitosti v Itálii.' :
               language === 'it' ? 'Articoli pratici che vi aiuteranno a orientarvi nel processo di acquisto di un immobile in Italia.' :
               'Practical articles to help you navigate the process of buying property in Italy.'}
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4">
          {/* Articles List */}
          <div className="max-w-3xl mx-auto mb-20">
            <div className="divide-y divide-gray-100">
              {ARTICLES.map((article, index) => (
                <Link key={article.slug} href={article.link} className="block group">
                  <article className="py-8 first:pt-4">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-xs font-semibold uppercase tracking-wider text-copper-600 bg-copper-50 px-2.5 py-1 rounded-md">
                        {article.category[language]}
                      </span>
                      <span className="text-sm text-gray-400 flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        {article.readTime}
                      </span>
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-2.5 group-hover:text-slate-600 transition-colors leading-tight">
                      {article.title[language]}
                    </h2>
                    <p className="text-gray-500 leading-relaxed mb-3">
                      {article.excerpt[language]}
                    </p>
                    <span className="text-sm font-medium text-slate-600 group-hover:text-copper-600 flex items-center gap-1 transition-colors">
                      {language === 'cs' ? 'Číst článek' : language === 'it' ? 'Leggi articolo' : 'Read Article'}
                      <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </article>
                </Link>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="max-w-3xl mx-auto">
            <div className="relative rounded-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900" />
              <div className="relative p-10 md:p-14 text-center">
                <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="h-7 w-7 text-white" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold mb-4 text-white">
                  {language === 'cs' ? 'Chcete vědět více?' :
                   language === 'it' ? 'Vuoi saperne di più?' :
                   'Want to Know More?'}
                </h2>
                <p className="text-gray-300 text-lg mb-8 leading-relaxed max-w-xl mx-auto">
                  {language === 'cs' ? 'Každá situace je jiná. Rádi vám doporučíme správný další krok podle vašeho cíle, rozpočtu a plánu.' :
                   language === 'it' ? 'Ogni situazione è diversa. Saremo lieti di consigliarvi il prossimo passo giusto in base al vostro obiettivo, budget e piano.' :
                   'Every situation is different. We\'ll gladly recommend the right next step based on your goal, budget, and plan.'}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <a href="https://wa.me/420731450001" target="_blank" rel="noopener noreferrer">
                    <Button size="lg" className="w-full sm:w-auto bg-white hover:bg-gray-100 text-slate-800 font-semibold px-8 py-5 text-base transition-all duration-300 hover:scale-[1.02] shadow-lg rounded-xl">
                      <MessageSquare className="h-5 w-5 mr-2" />
                      WhatsApp
                    </Button>
                  </a>
                  <Button 
                    size="lg" 
                    className="w-full sm:w-auto border-white/20 text-white hover:bg-white/10 hover:border-white/30 font-medium px-8 py-5 text-base transition-all duration-300 rounded-xl bg-transparent border"
                    onClick={() => window.location.href = 'mailto:info@domyvitalii.cz'}
                  >
                    <Mail className="h-5 w-5 mr-2" />
                    info@domyvitalii.cz
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer language={language} />
    </div>
  )
}

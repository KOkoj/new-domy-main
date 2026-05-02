'use client'

import { useState, useEffect } from 'react'
import { Quote, ArrowRight, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

const TESTIMONIALS = [
  {
    name: 'Adéla Babišová',
    tag: 'Umbria',
    quote: <>Koupě domu v zahraničí má svoje specifika a rozhodně bych to nepodcenila. Sama jsem se přesvědčila, že tam je tolik detailů, které je lepší vždy ověřit a prověřit. Sama bych se do tohoto procesu nepouštěla — <span className="font-semibold text-emerald-800 bg-emerald-100 rounded px-0.5">moje nejlepší rozhodnutí bylo spojit síly s Domy v Itálii</span> a nechat si krýt záda od parťáka, který tomu rozumí, má zkušenosti a <span className="font-semibold text-emerald-800 bg-emerald-100 rounded px-0.5">odhalil chyby v kupní smlouvě</span>, které chystala italská realitka. Vykomunikovala veškeré termíny s notářem a veškerou dokumentaci zkontrolovali do posledního písmenka. <span className="font-semibold text-emerald-800 bg-emerald-100 rounded px-0.5">Servis vážně na jedničku s hvězdičkou.</span></>,
  },
  {
    name: 'Lenka Kluková',
    tag: 'Slovensko',
    quote: <>Původně jsme si chtěli zabezpečit dom po vlastní ose, ale velmi rychle jsme zjistili, že italské agentury nezdvihají zahraniční čísla a většina agentů parla solo italiano. Domy v Itálii byla <span className="font-semibold text-emerald-800 bg-emerald-100 rounded px-0.5">ta správná volba</span> — <span className="font-semibold text-emerald-800 bg-emerald-100 rounded px-0.5">vstřícný a rychlý přístup</span>, ochota poradit, promptná komunikace s realitními agenturami a prověření zásadních informací o nemovitostech, které většinou nejsou uvedeny v inzerátech. Za nás <span className="font-semibold text-emerald-800 bg-emerald-100 rounded px-0.5">absolutní spokojenost</span>.</>,
  },
  {
    name: 'Marcela Dejlová',
    tag: 'Itálie',
    quote: <>Děkuji za <span className="font-semibold text-emerald-800 bg-emerald-100 rounded px-0.5">perfektní servis</span>, pomoc při koupi domu včetně všech nezbytných úředních procedur, osobní asistenci a <span className="font-semibold text-emerald-800 bg-emerald-100 rounded px-0.5">neuvěřitelně vstřícné, milé a přátelské jednání</span>. Zdravím z Itálie.</>,
  },
]

const pageLabels = {
  badge: {
    cs: 'Reference',
    it: 'Referenze',
    en: 'References',
  },
  title: {
    cs: 'Reference',
    it: 'Referenze',
    en: 'References',
  },
  subtitle: {
    cs: 'Co říkají klienti, kteří koupili nemovitost v Itálii s naší pomocí.',
    it: 'Cosa dicono i clienti che hanno acquistato un immobile in Italia con il nostro aiuto.',
    en: 'What clients say after buying property in Italy with our help.',
  },
  ctaHeading: {
    cs: 'Chcete být dalším spokojeným klientem?',
    it: 'Vuoi essere il prossimo cliente soddisfatto?',
    en: 'Want to be the next happy client?',
  },
  ctaSubtext: {
    cs: 'Rezervujte si bezplatnou konzultaci a zjistěte, jak vám můžeme pomoci.',
    it: 'Prenota una consulenza gratuita e scopri come possiamo aiutarti.',
    en: 'Book a free consultation and find out how we can help you.',
  },
  ctaButton: {
    cs: 'Rezervovat konzultaci zdarma',
    it: 'Prenota consulenza gratuita',
    en: 'Book a Free Consultation',
  },
}

export default function ReferencePage() {
  const [language, setLanguage] = useState('cs')

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

  const t = (key) => pageLabels[key]?.[language] ?? pageLabels[key]?.cs ?? ''

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <Navigation />

      {/* Hero */}
      <section className="relative pt-28 pb-24 md:pt-36 md:pb-32 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=1920&q=80"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/80 to-slate-900/70" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
        </div>

        <div className="container mx-auto px-6 relative z-10" style={{ maxWidth: '1200px' }}>
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 mb-6">
              <Quote className="h-4 w-4 text-copper-300" />
              <span className="text-sm text-white/80 font-medium">{t('badge')}</span>
            </div>
            <h1 className="font-extrabold text-white">{t('title')}</h1>
            <p className="mt-4 text-lg md:text-2xl text-copper-100 max-w-3xl leading-[1.75] font-semibold">
              {t('subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Testimonial list */}
      <div className="container mx-auto px-6 py-16 md:py-24" style={{ maxWidth: '800px' }}>
        <div className="space-y-6">
          {TESTIMONIALS.map((item, i) => (
            <article
              key={i}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 p-8 md:p-10"
            >
              <blockquote className="text-lg md:text-xl text-slate-600 leading-[1.85] italic mb-6">
                &ldquo;{item.quote}&rdquo;
              </blockquote>
              <footer className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-copper-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-copper-700">{item.name.charAt(0)}</span>
                </div>
                <span className="font-bold text-slate-800">{item.name}</span>
              </footer>
            </article>
          ))}
        </div>

        {/* CTA block */}
        <div className="mt-20">
          <div className="relative rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-slate-800 to-slate-900" />
            <div className="relative p-10 md:p-16 text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-white">
                {t('ctaHeading')}
              </h2>
              <p className="text-gray-300 mb-10 text-lg leading-[1.75] max-w-xl mx-auto">
                {t('ctaSubtext')}
              </p>
              <Link href="/book-call">
                <Button
                  size="lg"
                  className="bg-white hover:bg-gray-100 text-slate-900 font-semibold px-8 py-6 text-base transition-all duration-200 shadow-lg rounded-xl"
                >
                  {t('ctaButton')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer language={language} />
    </div>
  )
}

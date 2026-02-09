'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, Users, Globe, Award, Heart, Mail, ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

const SERVICES = [
  {
    title: {
      en: 'Understanding the Process',
      cs: 'Vysvětlíme celý proces',
      it: 'Spiegheremo l\'intero processo'
    },
    description: {
      en: 'We explain the entire process of buying property in Italy step by step.',
      cs: 'Vysvětlíme celý proces koupě nemovitosti v Itálii krok za krokem.',
      it: 'Spieghiamo l\'intero processo di acquisto di un immobile in Italia passo dopo passo.'
    },
    icon: <Globe className="h-7 w-7" />,
    color: 'from-blue-500/10 to-blue-600/10',
    iconColor: 'text-blue-600'
  },
  {
    title: {
      en: 'Avoiding Mistakes',
      cs: 'Předejdeme chybám',
      it: 'Eviteremo errori'
    },
    description: {
      en: 'We alert you to mistakes that cost Czechs time and money.',
      cs: 'Upozorníme na chyby, které Čechy stojí čas i peníze.',
      it: 'Vi avvisiamo sugli errori che costano tempo e denaro ai cechi.'
    },
    icon: <CheckCircle className="h-7 w-7" />,
    color: 'from-emerald-500/10 to-emerald-600/10',
    iconColor: 'text-emerald-600'
  },
  {
    title: {
      en: 'Region Selection',
      cs: 'Výběr regionu',
      it: 'Selezione della regione'
    },
    description: {
      en: 'We help you choose the region and type of property that suits you.',
      cs: 'Pomůžeme s výběrem regionu a typu nemovitosti, která vám vyhovuje.',
      it: 'Ti aiutiamo a scegliere la regione e il tipo di proprietà adatto a te.'
    },
    icon: <Users className="h-7 w-7" />,
    color: 'from-amber-500/10 to-amber-600/10',
    iconColor: 'text-amber-600'
  },
  {
    title: {
      en: 'Step-by-Step Guidance',
      cs: 'Vedení krok za krokem',
      it: 'Guida passo dopo passo'
    },
    description: {
      en: 'We guide you step by step to a safe purchase.',
      cs: 'Provedeme vás krok za krokem až k bezpečné koupi.',
      it: 'Ti guidiamo passo dopo passo verso un acquisto sicuro.'
    },
    icon: <Heart className="h-7 w-7" />,
    color: 'from-rose-500/10 to-rose-600/10',
    iconColor: 'text-rose-600'
  }
]

export default function AboutPage() {
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

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <Navigation />

      {/* Hero Section - Full bleed with image background */}
      <section className="relative pt-28 pb-20 md:pt-36 md:pb-28 overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=1920&q=80" 
            alt="" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/80 to-slate-900/70" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 mb-6">
              <Sparkles className="h-4 w-4 text-copper-300" />
              <span className="text-sm text-white/80 font-medium">
                {language === 'cs' ? 'O nás' : language === 'it' ? 'Chi siamo' : 'About Us'}
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-white leading-tight">
              {language === 'cs' ? 'Průvodce koupí domu v Itálii' :
               language === 'it' ? 'Guida all\'acquisto di una casa in Italia' :
               'Guide to Buying a House in Italy'}
            </h1>
            <p className="text-lg md:text-xl text-gray-200 mb-10 leading-relaxed max-w-2xl">
              {language === 'cs' ? 'Jasně, prakticky a bez stresu. Pomáháme Čechům porozumět tomu, jak koupě nemovitosti v Itálii skutečně funguje – ještě předtím, než udělají první krok.' :
               language === 'it' ? 'Chiaro, pratico e senza stress. Aiutiamo i cechi a capire come funziona realmente l\'acquisto di un immobile in Italia - prima ancora di fare il primo passo.' :
               'Clear, practical and stress-free. We help Czechs understand how buying property in Italy really works - before they take the first step.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/process">
                <Button size="lg" className="bg-white text-slate-900 hover:bg-gray-100 font-semibold px-8 py-6 text-base transition-all duration-300 hover:scale-[1.02] shadow-lg rounded-xl">
                  {language === 'cs' ? 'Začít průvodce' : 
                   language === 'it' ? 'Inizia la guida' : 
                   'Start the Guide'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-white/30 text-white hover:bg-white/10 hover:border-white/50 font-medium px-8 py-6 text-base transition-all duration-300 rounded-xl bg-transparent"
                onClick={() => window.location.href = 'mailto:info@domyvitalii.cz'}
              >
                <Mail className="h-4 w-4 mr-2" />
                info@domyvitalii.cz
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main content */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        {/* Our Approach - Alternating layout */}
        <div className="max-w-6xl mx-auto mb-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-800">
              {language === 'cs' ? 'Náš přístup' : 
               language === 'it' ? 'Il nostro approccio' : 
               'Our Approach'}
            </h2>
            <div className="w-16 h-1 bg-copper-400 mx-auto rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-copper-100/50 to-amber-100/50 rounded-3xl -z-10 rotate-1" />
              <img 
                src="https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=800&q=80" 
                alt="Italian landscape" 
                className="w-full h-80 md:h-96 object-cover rounded-2xl shadow-xl"
              />
            </div>
            <div className="space-y-6">
              <p className="text-gray-600 leading-relaxed text-lg">
                {language === 'cs' ? 'Ať už vás láká jih nebo sever Itálie, moře nebo hory, klidná vesnice nebo historické město, pomůžeme vám zorientovat se a rozhodnout správně.' :
                 language === 'it' ? 'Che tu sia attratto dal sud o dal nord Italia, dal mare o dalle montagne, da un tranquillo villaggio o da una città storica, ti aiuteremo a orientarti e decidere correttamente.' :
                 'Whether you\'re drawn to southern or northern Italy, sea or mountains, quiet village or historic city, we\'ll help you navigate and decide correctly.'}
              </p>
              <p className="text-slate-800 leading-relaxed text-lg font-semibold">
                {language === 'cs' ? 'Naše práce stojí na:' :
                 language === 'it' ? 'Il nostro lavoro si basa su:' :
                 'Our work is based on:'}
              </p>
              <ul className="space-y-4">
                {[
                  { cs: 'Individuálním přístupu', it: 'Approccio individuale', en: 'Individual approach' },
                  { cs: 'Znalosti italského prostředí', it: 'Conoscenza dell\'ambiente italiano', en: 'Knowledge of Italian environment' },
                  { cs: 'Srozumitelném vysvětlení celého procesu krok za krokem', it: 'Spiegazione chiara dell\'intero processo passo dopo passo', en: 'Clear explanation of the entire process step by step' },
                ].map((item, i) => (
                  <li key={i} className="flex items-start group">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-emerald-50 flex items-center justify-center mr-3 mt-0.5 group-hover:bg-emerald-100 transition-colors">
                      <CheckCircle className="h-4 w-4 text-emerald-600" />
                    </span>
                    <span className="text-gray-700 leading-relaxed text-lg">{item[language]}</span>
                  </li>
                ))}
              </ul>
              <div className="pt-4 pl-10">
                <p className="text-slate-800 leading-relaxed text-lg font-semibold italic border-l-2 border-copper-300 pl-4">
                  {language === 'cs' ? 'Jsme tady proto, abychom hájili vaše zájmy a předešli zbytečným chybám.' :
                   language === 'it' ? 'Siamo qui per difendere i vostri interessi ed evitare errori inutili.' :
                   'We are here to protect your interests and prevent unnecessary mistakes.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Our Services - Card grid */}
        <div className="mb-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-800">
              {language === 'cs' ? 'Jak vám můžeme pomoci' : 
               language === 'it' ? 'Come possiamo aiutarvi' : 
               'How We Can Help You'}
            </h2>
            <div className="w-16 h-1 bg-copper-400 mx-auto mb-6 rounded-full"></div>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg">
              {language === 'cs' ? 'Nabízíme komplexní podporu, která vám pomůže orientovat se v celém procesu koupě nemovitosti v Itálii.' :
               language === 'it' ? 'Offriamo supporto completo per aiutarvi a orientarvi nell\'intero processo di acquisto di un immobile in Italia.' :
               'We provide comprehensive support to help you navigate the entire process of buying property in Italy.'}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {SERVICES.map((service, index) => (
              <div 
                key={index} 
                className="group relative bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-gray-200"
              >
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${service.color} mb-5`}>
                  <span className={service.iconColor}>{service.icon}</span>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">{service.title[language]}</h3>
                <p className="text-gray-500 leading-relaxed">{service.description[language]}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Who is it for - Modern columns */}
        <div className="mb-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-800">
              {language === 'cs' ? 'Pro koho je služba určena' : 
               language === 'it' ? 'Per chi è destinato il servizio' : 
               'Who Is This Service For?'}
            </h2>
            <div className="w-16 h-1 bg-copper-400 mx-auto mb-6 rounded-full"></div>
            <p className="text-gray-500 max-w-3xl mx-auto text-lg leading-relaxed">
              {language === 'cs' ? 'Pomáháme lidem, kteří o koupi domu v Itálii uvažují vážně a chtějí se rozhodnout s klidem a dostatkem informací.' :
               language === 'it' ? 'Aiutiamo persone che stanno considerando seriamente l\'acquisto di una casa in Italia e vogliono decidere con calma e informazioni sufficienti.' :
               'We help people who are seriously considering buying a house in Italy and want to decide with peace of mind and sufficient information.'}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { 
                icon: <Heart className="h-8 w-8" />,
                title: { cs: 'Rekreační dům', it: 'Casa per vacanze', en: 'Vacation Home' },
                desc: { cs: 'Hledáte místo pro odpočinek a dovolenou v Itálii.', it: 'Cercate un posto per riposare e vacanze in Italia.', en: 'Looking for a place to rest and vacation in Italy.' },
                gradient: 'from-rose-50 to-pink-50',
                iconColor: 'text-rose-500'
              },
              { 
                icon: <Award className="h-8 w-8" />,
                title: { cs: 'Investice', it: 'Investimento', en: 'Investment' },
                desc: { cs: 'Chcete investovat do nemovitosti v Itálii.', it: 'Volete investire in un immobile in Italia.', en: 'Want to invest in Italian property.' },
                gradient: 'from-amber-50 to-yellow-50',
                iconColor: 'text-amber-500'
              },
              { 
                icon: <Globe className="h-8 w-8" />,
                title: { cs: 'Místo pro nový život', it: 'Posto per una nuova vita', en: 'Place for New Life' },
                desc: { cs: 'Plánujete přestěhování a nový začátek v Itálii.', it: 'State pianificando un trasferimento e un nuovo inizio in Italia.', en: 'Planning to relocate and start anew in Italy.' },
                gradient: 'from-blue-50 to-sky-50',
                iconColor: 'text-blue-500'
              },
            ].map((item, index) => (
              <div key={index} className={`text-center p-8 rounded-2xl bg-gradient-to-br ${item.gradient} border border-gray-100 hover:shadow-md transition-all duration-300 group`}>
                <div className={`w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm ${item.iconColor} group-hover:scale-110 transition-transform duration-300`}>
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-800">{item.title[language]}</h3>
                <p className="text-gray-500 leading-relaxed">{item.desc[language]}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact CTA */}
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-slate-800 to-slate-900" />
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
            <div className="relative p-10 md:p-16 text-center">
              <h3 className="text-2xl md:text-3xl font-bold mb-4 text-white">
                {language === 'cs' ? 'Začněte správně' : 
                 language === 'it' ? 'Inizia correttamente' : 
                 'Start Correctly'}
              </h3>
              <p className="text-gray-300 mb-10 text-lg leading-relaxed max-w-2xl mx-auto">
                {language === 'cs' ? 'Pokud jste na začátku, doporučujeme nejprve porozumět základům a reálným nákladům koupě domu v Itálii.' :
                 language === 'it' ? 'Se siete all\'inizio, raccomandiamo prima di comprendere le basi e i costi reali dell\'acquisto di un immobile in Italia.' :
                 'If you\'re at the beginning, we recommend first understanding the basics and real costs of buying a house in Italy.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/process">
                  <Button size="lg" className="text-slate-900 font-semibold px-8 py-6 text-base transition-all duration-300 hover:scale-[1.02] shadow-lg rounded-xl bg-white hover:bg-gray-100">
                    {language === 'cs' ? 'Průvodce a zdroje' : 
                     language === 'it' ? 'Guida e risorse' : 
                     'Guide & Resources'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-white/20 text-white hover:bg-white/10 hover:border-white/30 font-medium px-8 py-6 text-base transition-all duration-300 rounded-xl bg-transparent"
                  onClick={() => window.location.href = 'mailto:info@domyvitalii.cz'}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  info@domyvitalii.cz
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer language={language} />
    </div>
  )
}
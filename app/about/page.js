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
      it: 'Orientamento strategico',
      en: 'Strategic Orientation',
      cs: 'Strategické směrování'
    },
    description: {
      it: 'Definiamo obiettivo, budget, tempi e rischio prima di ogni decisione.',
      en: 'We define objective, budget, timing, and risk before any decision.',
      cs: 'Před každým rozhodnutím definujeme cíl, rozpočet, čas a riziko.'
    },
    icon: <Globe className="h-7 w-7" />,
    color: 'from-blue-500/10 to-blue-600/10',
    iconColor: 'text-blue-600'
  },
  {
    title: {
      it: 'Metodo e controllo',
      en: 'Method and Control',
      cs: 'Metoda a kontrola'
    },
    description: {
      it: 'Lavoriamo con passaggi chiari per ridurre errori e costi inutili.',
      en: 'We work with clear steps to reduce mistakes and unnecessary costs.',
      cs: 'Pracujeme s jasnými kroky, aby se snížily chyby a zbytečné náklady.'
    },
    icon: <CheckCircle className="h-7 w-7" />,
    color: 'from-emerald-500/10 to-emerald-600/10',
    iconColor: 'text-emerald-600'
  },
  {
    title: {
      it: 'Coordinamento operativo',
      en: 'Operational Coordination',
      cs: 'Operativní koordinace'
    },
    description: {
      it: 'Coordiniamo il contesto ceco e quello italiano con un flusso unico.',
      en: 'We coordinate Czech and Italian context with one clear workflow.',
      cs: 'Koordinujeme český a italský kontext v jednom jasném workflow.'
    },
    icon: <Users className="h-7 w-7" />,
    color: 'from-amber-500/10 to-amber-600/10',
    iconColor: 'text-amber-600'
  },
  {
    title: {
      it: 'Decisioni chiare',
      en: 'Clear Decisions',
      cs: 'Jasná rozhodnutí'
    },
    description: {
      it: 'Ogni scelta viene valutata su costi, responsabilita e impatto reale.',
      en: 'Every choice is assessed on costs, responsibility, and real impact.',
      cs: 'Každá volba se hodnotí podle nákladů, odpovědnosti a reálného dopadu.'
    },
    icon: <Heart className="h-7 w-7" />,
    color: 'from-rose-500/10 to-rose-600/10',
    iconColor: 'text-rose-600'
  }
]

const TEAM = [
  {
    name: 'Lucie Kucerova',
    avatar: '/team/source/lucieprimo.jpeg',
    role: {
      it: 'CEO e Co-Founder',
      en: 'CEO and Co-Founder',
      cs: 'CEO a spoluzakladatelka'
    },
    description: {
      it: "Ceca, originaria della Moravia, trasferita da oltre 20 anni a Praga. CEO aziendale, innamorata dell'Italia e dei viaggi.",
      en: 'Czech, from Moravia, living in Prague for over 20 years. Company CEO, in love with Italy and travel.',
      cs: 'Češka, původem z Moravy, už přes 20 let v Praze. CEO společnosti, miluje Itálii a cestování.'
    }
  },
  {
    name: 'Luca Croce',
    avatar: '/team/source/lucaprimo.jpeg',
    role: {
      it: 'Co-Founder italiano',
      en: 'Italian Co-Founder',
      cs: 'Italský spoluzakladatel'
    },
    description: {
      it: 'Italiano, originario del Sud Italia (provincia di Caserta), a Praga da 5 anni. Appassionato di sport e viaggi.',
      en: 'Italian, from southern Italy (province of Caserta), based in Prague for 5 years. Passionate about sport and travel.',
      cs: 'Ital, původem z jihu Itálie (provincie Caserta), 5 let v Praze. Miluje sport a cestování.'
    }
  }
]

const WHO_FOR = [
  {
    icon: <Heart className="h-8 w-8" />,
    title: { it: 'Casa per vacanze', en: 'Vacation Home', cs: 'Dům na dovolenou' },
    desc: {
      it: 'Per chi cerca una seconda casa in Italia con un piano concreto.',
      en: 'For people looking for a second home in Italy with a concrete plan.',
      cs: 'Pro lidi, kteří hledají druhý dům v Itálii s konkrétním plánem.'
    },
    gradient: 'from-rose-50 to-pink-50',
    iconColor: 'text-rose-500'
  },
  {
    icon: <Award className="h-8 w-8" />,
    title: { it: 'Investimento', en: 'Investment', cs: 'Investice' },
    desc: {
      it: 'Per chi vuole valutare rendimento, liquidita e gestione del rischio.',
      en: 'For people who want to evaluate yield, liquidity, and risk management.',
      cs: 'Pro lidi, kteří chtějí hodnotit výnos, likviditu a riziko.'
    },
    gradient: 'from-amber-50 to-yellow-50',
    iconColor: 'text-amber-500'
  },
  {
    icon: <Globe className="h-8 w-8" />,
    title: { it: 'Nuovo inizio', en: 'New Start', cs: 'Nový začátek' },
    desc: {
      it: 'Per chi pianifica un trasferimento stabile in Italia.',
      en: 'For people planning a long-term relocation to Italy.',
      cs: 'Pro lidi, kteří plánují dlouhodobý přesun do Itálie.'
    },
    gradient: 'from-blue-50 to-sky-50',
    iconColor: 'text-blue-500'
  }
]

export default function AboutPage() {
  const [language, setLanguage] = useState('it')

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
              {language === 'cs'
                ? 'Domy v Itálii: osobní projekt o nákupu domu v Itálii'
                : language === 'it'
                ? 'Domy v Italii: passione reale per comprare casa in Italia'
                : 'Domy v Italii: real passion for buying a home in Italy'}
            </h1>
            <p className="text-lg md:text-xl text-gray-200 mb-10 leading-relaxed max-w-2xl">
              {language === 'cs'
                ? 'Domy v Itálii vzniklo skoro pro zábavu, ale hlavně z velké lásky k Itálii. Dnes jsme italsko-český tým z Prahy, který pomáhá kupujícím rozhodovat s metodou, kontrolou a jasnými daty.'
                : language === 'it'
                ? "Domy v Italii nasce quasi per gioco, ma soprattutto per una grande passione per l'Italia. Oggi siamo un team italo-ceco con base a Praga che aiuta a comprare casa in Italia con metodo, controllo e chiarezza su costi, tempi e rischi."
                : 'Domy v Italii started almost as a game, but mostly from a deep passion for Italy. Today we are an Italian-Czech team based in Prague helping buyers with method, control, and clarity on costs, timing, and risk.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/process">
                <Button size="lg" className="bg-white text-slate-900 hover:bg-gray-100 font-semibold px-8 py-6 text-base transition-all duration-300 hover:scale-[1.02] shadow-lg rounded-xl">
                  {language === 'cs' ? 'Zobrazit proces' : language === 'it' ? 'Vai al processo' : 'See the process'}
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

      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-6xl mx-auto mb-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-800">
              {language === 'cs' ? 'Proč to funguje' : language === 'it' ? 'Perché funziona' : 'Why it works'}
            </h2>
            <div className="w-16 h-1 bg-copper-400 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-copper-100/50 to-amber-100/50 rounded-3xl -z-10 rotate-1" />
              <img
                src="/team/source/noi.jpeg"
                alt={language === 'cs' ? 'Luca a Lucie spolu' : language === 'it' ? 'Luca e Lucie insieme' : 'Luca and Lucie together'}
                className="w-full h-80 md:h-96 object-cover object-[50%_65%] rounded-2xl shadow-xl"
              />
            </div>
            <div className="space-y-6">
              <p className="text-gray-600 leading-relaxed text-lg">
                {language === 'cs'
                  ? 'Nejsme klasická realitní kancelář. Jsme operativní partner, který pomáhá lidem pochopit reálný proces koupě domu v Itálii. Víc než prodej služby je pro nás důležité pomoct vám splnit sen a cítit se po celou dobu doprovázeni.'
                  : language === 'it'
                  ? 'Non siamo una classica agenzia immobiliare. Siamo un partner operativo per chi vuole capire il processo reale di acquisto in Italia. Ma più che vendere un servizio, vogliamo dare la possibilità di realizzare un sogno sentendovi accompagnati.'
                  : 'We are not a traditional real estate agency. We are an operational partner for buyers who want to understand the real process in Italy. More than selling a service, we want to help you realize a dream while feeling supported throughout the journey.'}
              </p>
              <p className="text-slate-800 leading-relaxed text-lg font-semibold">
                {language === 'cs' ? 'Naše principy:' : language === 'it' ? 'I nostri principi:' : 'Our principles:'}
              </p>
              <ul className="space-y-4">
                {[
                  {
                    it: 'Metodo prima della fretta',
                    en: 'Method before speed',
                    cs: 'Metoda před spěchem'
                  },
                  {
                    it: 'Controllo prima della firma',
                    en: 'Control before signature',
                    cs: 'Kontrola před podpisem'
                  },
                  {
                    it: 'Decisioni basate su dati, non su pressione',
                    en: 'Data-based decisions, not pressure-based',
                    cs: 'Rozhodnutí podle dat, ne podle tlaku'
                  },
                  {
                    it: 'Trasparenza in ogni fase del percorso',
                    en: 'Transparency in every phase of the process',
                    cs: 'Transparentnost v každé fázi procesu'
                  },
                  {
                    it: 'Accompagnamento di persona alle visite e agli atti in Italia',
                    en: 'In-person assistance during viewings and deed-signing in Italy',
                    cs: 'Osobní doprovod na prohlídkách a aktech v Itálii'
                  }
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-emerald-50 flex items-center justify-center mr-3 mt-0.5">
                      <CheckCircle className="h-4 w-4 text-emerald-600" />
                    </span>
                    <span className="text-gray-700 leading-relaxed text-lg">{item[language]}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mb-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-800">
              {language === 'cs' ? 'Naše duo' : language === 'it' ? 'Il team' : 'Our Team'}
            </h2>
            <div className="w-16 h-1 bg-copper-400 mx-auto mb-6 rounded-full"></div>
            <p className="text-gray-500 max-w-3xl mx-auto text-lg leading-relaxed">
              {language === 'cs'
                ? 'Italsko-český pohled v jednom projektu.'
                : language === 'it'
                ? 'Uno sguardo italo-ceco in un unico progetto.'
                : 'An Italian-Czech perspective in one project.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {TEAM.map((member, index) => (
              <Card key={index} className="bg-white border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 rounded-2xl group">
                <CardHeader>
                  <div className="mb-4 flex justify-center">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="h-[210px] w-[210px] md:h-[230px] md:w-[230px] rounded-2xl object-cover transition-transform duration-300 group-hover:scale-105 group-hover:-translate-y-1"
                    />
                  </div>
                  <CardTitle className="text-slate-800 text-2xl">{member.name}</CardTitle>
                  <p className="text-copper-700 font-semibold">{member.role[language]}</p>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed">{member.description[language]}</p>
                </CardContent>
              </Card>
            ))}
          </div>

        </div>

        <div className="mb-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-800">
              {language === 'cs' ? 'Co děláme v praxi' : language === 'it' ? 'Cosa facciamo in pratica' : 'What We Do in Practice'}
            </h2>
            <div className="w-16 h-1 bg-copper-400 mx-auto mb-6 rounded-full"></div>
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

        <div className="mb-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-800">
              {language === 'cs' ? 'Pro koho je to' : language === 'it' ? 'Per chi è il servizio' : 'Who This Is For'}
            </h2>
            <div className="w-16 h-1 bg-copper-400 mx-auto mb-6 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {WHO_FOR.map((item, index) => (
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

        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-slate-800 to-slate-900" />
            <div className="relative p-10 md:p-16 text-center">
              <h3 className="text-2xl md:text-3xl font-bold mb-4 text-white">
                {language === 'cs' ? 'Pojďme to probrat konkrétně' : language === 'it' ? 'Parliamone in modo concreto' : 'Let us discuss it concretely'}
              </h3>
              <p className="text-gray-300 mb-10 text-lg leading-relaxed max-w-2xl mx-auto">
                {language === 'cs'
                  ? 'Pokud jste na začátku, doporučujeme nejdříve nastavit plán a priority. Potom je každý další krok jednodušší.'
                  : language === 'it'
                  ? "Se sei all'inizio, conviene prima impostare metodo e priorità. Da lì in poi ogni passo diventa più semplice."
                  : 'If you are at the beginning, start by setting method and priorities. Every next step becomes simpler.'}
              </p>
              <div className="flex justify-center">
                <Button
                  size="lg"
                  className="text-slate-900 font-semibold px-8 py-6 text-base transition-all duration-300 hover:scale-[1.02] shadow-lg rounded-xl bg-white hover:bg-gray-100"
                  onClick={() => window.location.href = 'mailto:info@domyvitalii.cz'}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  {language === 'cs' ? 'Kontaktujte nás' : language === 'it' ? 'Contattaci' : 'Contact us'}
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

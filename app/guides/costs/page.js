'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, Calculator, CheckCircle, Euro, FileText } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import InformationalDisclaimer from '@/components/legal/InformationalDisclaimer'
import Footer from '@/components/Footer'
import Navigation from '@/components/Navigation'

const COPY = {
  cs: {
    blogLabel: 'Články',
    home: 'Domů',
    guide: 'Průvodce',
    page: 'Náklady',
    title: 'Kolik skutečně stojí koupě domu v Itálii v roce 2026',
    intro:
      'V tomto článku shrnujeme reálné náklady, daně a poplatky, se kterými je potřeba počítat ještě před podpisem kupní smlouvy.',
    overviewTitle: 'Rychlá orientace',
    overviewBody:
      'Kupní cena je jen začátek. Finální částka se mění podle daňového režimu, typu nemovitosti, struktury koupě i vedlejších nákladů spojených s aktem.',
    lead:
      'Mnoho kupujících vychází pouze z ceny v inzerátu. Právě tady ale často vznikají nepříjemná překvapení. Konečný rozpočet ovlivňují daně, notář, doprovodné služby i technické prověrky.',
    firstSectionTitle: 'Cena nemovitosti není konečná částka',
    firstSectionBody:
      'Dvě nemovitosti se stejnou kupní cenou mohou mít velmi odlišné konečné náklady. Rozhoduje právní režim, stav dokumentace, typ prodávajícího i to, zda kupujete jako první nebo další nemovitost.',
    firstSectionBullets: [
      'daňový režim a typ prodávajícího',
      'notářské náklady a registrace',
      'extra notářské výdaje spojené s aktem',
      'případné technické prověrky a opravy dokumentace'
    ],
    costTitle: 'Přehled nákladů',
    costSubtitle:
      'Níže najdete orientační strukturu hlavních položek, se kterými je potřeba při koupi počítat.',
    costs: [
      {
        title: 'Daň z koupě - první nemovitost + rezidence',
        description:
          'Platí při koupi první nemovitosti v Itálii a při nastavení trvalé rezidence.',
        price: 'EUR 2 % z katastrální hodnoty'
      },
      {
        title: 'Daň z koupě - druhá nemovitost / bez rezidence',
        description:
          'Používá se tehdy, když nemovitost nebude vaší hlavní rezidencí.',
        price: 'EUR 9 % z katastrální hodnoty'
      },
      {
        title: 'DPH (nové / rekonstruované do 5 let) - koupě od stavební firmy',
        description:
          'Uplatní se hlavně při koupi od developera nebo stavební společnosti.',
        price: '10 % nebo 4 % podle režimu'
      },
      {
        title: 'Notářské výdaje',
        description: 'Odměna notáře, ověření dokumentace a registrace aktu.',
        price: 'EUR 2.500-4.500'
      },
      {
        title: 'Extra notářské výdaje',
        description: 'Překlad aktu, tlumočník, úschova kupní ceny.',
        price: 'EUR 500-1.200'
      },
      {
        title: 'Dodatečné náklady (zřídka nutné)',
        description: 'Případné technické inspekce nebo úpravy v katastru.',
        price: 'EUR 1.000-3.000'
      }
    ],
    risksTitle: 'Jak se vyhnout nepříjemným překvapením',
    risksLead: 'Nejlepší je mít:',
    risks: [
      'jasně spočítané hlavní daně ještě před podpisem',
      'potvrzený notářský rozpočet a vedlejší výdaje',
      'ověřený právní a technický stav nemovitosti',
      'rezervu na položky, které v inzerátu nejsou vidět'
    ]
  },
  it: {
    blogLabel: 'Articoli',
    home: 'Casa',
    guide: 'Guida',
    page: 'Costi',
    title: 'Quanto costa davvero acquistare una casa in Italia nel 2026',
    intro:
      'In questo articolo analizziamo i costi reali, le imposte e le spese da considerare prima della firma.',
    overviewTitle: 'Orientamento rapido',
    overviewBody:
      "Il prezzo dell'immobile è solo il punto di partenza. Il costo finale cambia in base al regime fiscale, al tipo di immobile, alla struttura dell'acquisto e alle spese accessorie legate all'atto.",
    lead:
      "Molti acquirenti partono solo dal prezzo dell'annuncio. Le sorprese arrivano dopo: imposte, notaio, servizi collegati all'atto e verifiche tecniche possono cambiare molto il totale.",
    firstSectionTitle: "Il prezzo dell'immobile non è l'importo finale",
    firstSectionBody:
      "Due immobili con lo stesso prezzo possono avere costi finali molto diversi. Contano il regime giuridico, il tipo di venditore, la documentazione e il profilo dell'acquirente.",
    firstSectionBullets: [
      'regime fiscale e tipo di venditore',
      'spese notarili e registrazione',
      "spese extra notarili collegate all'atto",
      'eventuali verifiche tecniche e correzioni documentali'
    ],
    costTitle: 'Panoramica dei costi',
    costSubtitle:
      'Qui sotto trovi la struttura orientativa delle principali voci di costo da considerare.',
    costs: [
      {
        title: 'Imposta di acquisto - prima casa + residenza',
        description:
          "Si applica all'acquisto della prima proprietà in Italia con trasferimento della residenza.",
        price: '2% del valore catastale'
      },
      {
        title: 'Imposta di acquisto - seconda casa / senza residenza',
        description:
          "Si applica quando l'immobile non diventerà la residenza principale.",
        price: '9% del valore catastale'
      },
      {
        title: 'IVA (nuovi / ristrutturati entro 5 anni) - acquisto da impresa',
        description:
          'Riguarda soprattutto immobili nuovi o recentemente ristrutturati acquistati da un’impresa.',
        price: '10% oppure 4% secondo il regime'
      },
      {
        title: 'Spese notarili',
        description: "Onorario del notaio, verifiche e registrazione dell'atto.",
        price: 'EUR 2.500-4.500'
      },
      {
        title: 'Spese extra notarili',
        description: "Traduzione dell'atto, interprete, deposito del prezzo.",
        price: 'EUR 500-1.200'
      },
      {
        title: 'Costi aggiuntivi (raramente necessari)',
        description: 'Eventuali ispezioni tecniche o aggiornamenti catastali.',
        price: 'EUR 1.000-3.000'
      }
    ],
    risksTitle: 'Come evitare brutte sorprese',
    risksLead: 'La cosa migliore è avere:',
    risks: [
      'le imposte principali calcolate prima della firma',
      'un preventivo notarile e le spese collegate già verificati',
      "lo stato giuridico e tecnico dell'immobile controllato",
      "un margine per i costi che non compaiono nell'annuncio"
    ]
  },
  en: {
    blogLabel: 'Articles',
    home: 'Home',
    guide: 'Guide',
    page: 'Costs',
    title: 'How Much Does Buying a House in Italy Really Cost in 2026',
    intro:
      'This article breaks down the real costs, taxes, and fees you should account for before signing.',
    overviewTitle: 'Quick overview',
    overviewBody:
      'The property price is only the starting point. The final amount changes depending on the tax regime, property type, purchase structure, and extra expenses tied to the deed.',
    lead:
      'Many buyers look only at the listing price. That is usually where surprises begin. Taxes, notary fees, deed-related services, and technical checks can change the real total significantly.',
    firstSectionTitle: 'The property price is not the final amount',
    firstSectionBody:
      'Two properties with the same purchase price can end up with very different final costs. The legal regime, seller type, documentation, and buyer profile all matter.',
    firstSectionBullets: [
      'tax regime and seller type',
      'notary fees and registration',
      'extra deed-related costs',
      'technical checks and document corrections when needed'
    ],
    costTitle: 'Cost overview',
    costSubtitle:
      'Below is an indicative structure of the main cost items you should expect during the purchase.',
    costs: [
      {
        title: 'Purchase tax - first home + residency',
        description:
          'Applies when buying a first property in Italy with residency established there.',
        price: '2% of cadastral value'
      },
      {
        title: 'Purchase tax - second home / no residency',
        description:
          'Applies when the property will not become your main residency.',
        price: '9% of cadastral value'
      },
      {
        title: 'VAT (new / renovated within 5 years) - purchase from construction company',
        description:
          'Mostly relevant when buying from a developer or building company.',
        price: '10% or 4% depending on regime'
      },
      {
        title: 'Notary fees',
        description: 'Notary compensation, checks, and deed registration.',
        price: 'EUR 2,500-4,500'
      },
      {
        title: 'Extra notary-related expenses',
        description: 'Deed translation, interpreter, purchase-price escrow.',
        price: 'EUR 500-1,200'
      },
      {
        title: 'Additional costs (rarely necessary)',
        description: 'Potential technical inspections and cadastral updates.',
        price: 'EUR 1,000-3,000'
      }
    ],
    risksTitle: 'How to avoid unpleasant surprises',
    risksLead: 'The safest setup is to have:',
    risks: [
      'your main taxes calculated before signing',
      'the notary quote and related side costs already confirmed',
      'the legal and technical status of the property verified',
      'a reserve for costs that never appear in the listing'
    ]
  }
}

export default function CostsGuidePage() {
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

  const copy = COPY[language] || COPY.en
  const articleImage =
    language === 'cs'
      ? {
          src: '/articles/costs-money-house.jpg',
          alt: 'Pár řeší peníze s modely domků v pozadí',
          caption:
            'Skutečné náklady začnou být jasné ve chvíli, kdy vedle ceny domu začnete řešit i všechny související výdaje.'
        }
      : language === 'it'
        ? {
            src: '/articles/costs-money-house.jpg',
            alt: 'Coppia preoccupata per i soldi con modellini di case sullo sfondo',
            caption:
              'Il costo reale si capisce quando, oltre al prezzo della casa, inizi a considerare tutte le spese che la accompagnano.'
          }
        : {
            src: '/articles/costs-money-house.jpg',
            alt: 'Couple worried about money with house models in the background',
            caption:
              'The real cost becomes clear when you move beyond the house price and start counting every related expense.'
          }

  const launchCtaCopy =
    language === 'cs'
      ? {
          title: 'Chcete přesnější odhad pro váš konkrétní případ?',
          body:
            'Podrobnější materiály doplníme později. Prozatím můžete pokračovat v bezplatných průvodcích nebo nám napsat pro orientační nasměrování.',
          primary: 'Kontaktovat nás'
        }
      : language === 'it'
        ? {
            title: 'Vuoi una stima più precisa per il tuo caso?',
            body:
              'I materiali di approfondimento arriveranno più avanti. Per ora puoi continuare con le guide gratuite oppure scriverci per un primo orientamento.',
            primary: 'Contattaci'
          }
        : {
            title: 'Do you want a more precise estimate for your case?',
            body:
              'More detailed materials will be added later. For now, continue with the free guides or contact us for initial direction.',
            primary: 'Contact us'
          }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f7f4ed] via-amber-50/20 to-slate-50">
      <Navigation />

      <div className="pb-16 pt-28 md:pb-24">
        <div className="container mx-auto mb-6 px-6" style={{ maxWidth: '1200px' }}>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-slate-700">
              {copy.home}
            </Link>
            <span>/</span>
            <Link href="/process" className="hover:text-slate-700">
              {copy.guide}
            </Link>
            <span>/</span>
            <span className="font-medium text-slate-700">{copy.page}</span>
          </div>
        </div>

        <div className="container mx-auto px-6" style={{ maxWidth: '1200px' }}>
          <div className="mx-auto max-w-4xl" style={{ maxWidth: '720px', marginLeft: 'auto', marginRight: 'auto' }}>
            <div className="mb-8">
              <Button
                asChild
                variant="outline"
                className="mb-5 inline-flex items-center border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-700"
              >
                <Link href="/blog">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {copy.blogLabel}
                </Link>
              </Button>
              <h1 className="mb-8 bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text font-bold text-transparent">
                {copy.title}
              </h1>
              <p className="leading-relaxed text-gray-500" style={{color:'#4a4a4a', lineHeight:'1.75'}}>{copy.intro}</p>
            </div>

            <div className="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <img
                src={articleImage.src}
                alt={articleImage.alt}
                className="h-64 w-full object-cover md:h-80"
                loading="lazy"
              />
              <p className="px-4 py-3 text-sm text-slate-600">{articleImage.caption}</p>
            </div>

            <Card className="mb-8 border-green-200 bg-green-50">
              <CardContent className="p-6">
                <h2 className="mb-3 flex items-center font-bold text-green-900">
                  <AlertTriangle className="mr-2 h-5 w-5" />
                  {copy.overviewTitle}
                </h2>
                <p className="leading-relaxed text-green-800">{copy.overviewBody}</p>
              </CardContent>
            </Card>

            <p className="mb-8 text-lg font-semibold leading-relaxed text-slate-800">{copy.lead}</p>

            <div className="space-y-8">
              <Card className="bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="mb-8">{copy.firstSectionTitle}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="leading-relaxed text-gray-500" style={{color:'#4a4a4a', lineHeight:'1.75'}}>{copy.firstSectionBody}</p>
                  <ul className="space-y-2 text-gray-700">
                    {copy.firstSectionBullets.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-white/95 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-amber-100 p-3 text-amber-700">
                      <Calculator className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="mb-8">{copy.costTitle}</CardTitle>
                      <p className="mt-2 text-gray-500" style={{color:'#4a4a4a', lineHeight:'1.75'}}>{copy.costSubtitle}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  {copy.costs.map((item) => (
                    <div
                      key={item.title}
                      className="rounded-3xl border border-slate-200 bg-slate-50/80 p-5 shadow-sm"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div className="md:max-w-[70%]">
                          <h3 className="text-xl font-semibold text-slate-800">{item.title}</h3>
                          <p className="mt-2 leading-relaxed text-slate-600">{item.description}</p>
                        </div>
                        <div className="text-right text-2xl font-bold text-slate-700">{item.price}</div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-amber-200 bg-amber-50/80">
                <CardContent className="p-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="md:max-w-2xl">
                      <h2 className="text-2xl font-bold text-slate-800">{launchCtaCopy.title}</h2>
                      <p className="mt-2 leading-relaxed text-slate-700">{launchCtaCopy.body}</p>
                    </div>
                    <div className="flex justify-center">
                      <Link href="/contact">
                        <Button className="bg-slate-800 text-white hover:bg-slate-700">
                          <FileText className="mr-2 h-4 w-4" />
                          {launchCtaCopy.primary}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-sky-200 bg-sky-50/80">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-sky-100 p-3 text-sky-700">
                      <Euro className="h-5 w-5" />
                    </div>
                    <CardTitle className="mb-8">{copy.risksTitle}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 font-semibold text-slate-800">{copy.risksLead}</p>
                  <ul className="space-y-3 text-slate-700">
                    {copy.risks.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-sky-700" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            <InformationalDisclaimer language={language} className="mt-14" />
          </div>
        </div>
      </div>

      <Footer language={language} />
    </div>
  )
}

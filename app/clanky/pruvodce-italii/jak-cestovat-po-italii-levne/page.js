'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Calendar, Clock, Train, Car, Bus, Route, Plane } from 'lucide-react'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const PUBLISHED_AT = '2026-03-12'

const TRAVEL_PARTNER_LINKS = {
  booking: 'https://www.booking.com/searchresults.cs.html?ss=Italia&order=early_year_deals_upsorter&label=gen173rf-10Eg5kZWFscy1jYW1wYWlnbiiCAjjoB0gFWANoOogBAZgBM7gBF8gBDNgBA-gBAfgBAYgCAaICDm1lbWJlcnMuY2ouY29tqAIBuAKpjMzNBsACAdICJGQzM2IxZGFiLWM0NjUtNGRlMS04Zjc1LTEwNWQyNjJkZTAyM9gCAeACAQ&aid=304142&lang=cs&sb=1&src_elem=sb&dest_id=104&dest_type=country&ac_position=0&ac_click_type=b&ac_langcode=it&ac_suggestion_list_length=5&search_selected=true&search_pageview_id=fd70821489bb0dca&ac_meta=GhBmZDcwODIxNDg5YmIwZGNhIAAoATICaXQ6Bkl0YWxpYQ%3D%3D&checkin=2026-03-13&checkout=2026-03-14&group_adults=2&no_rooms=1&group_children=0&lpsrc=sb',
  getYourGuide: 'https://gyg.me/fnMmh4S3'
}
const CAR_RENT_PARTNER_LINKS = {
  homepage: 'https://www.jdoqocy.com/click-101629596-17122732',
  trackingPixel: 'https://www.ftjcfx.com/image-101629596-17122732'
}
const FLIGHTS_PARTNER_LINKS = {
  homepage: 'https://www.dpbolvw.net/click-101629596-17053224',
  trackingPixel: 'https://www.ftjcfx.com/image-101629596-17053224'
}
const SIDEBAR_TRAVEL_WIDGET = {
  href: 'https://www.kqzyfj.com/click-101629596-17122710',
  image: 'https://www.tqlkg.com/image-101629596-17122710'
}

const CONTENT = {
  cs: {
    navGuide: 'Průvodce Itálií',
    navArticles: 'Články',
    badge: 'Průvodce Itálií',
    title: 'Jak cestovat po Itálii levně - vlak, auto nebo autobus?',
    readTime: '10 min',
    intro: {
      paragraphs: [
        'Levné cestování po Itálii není o jednom univerzálním řešení. Nejlépe funguje kombinace dopravy podle regionu a typu cesty.',
        'Jiný přístup se hodí pro city break mezi velkými městy, jiný pro moře, hory nebo menší lokality mimo hlavní trasy.'
      ],
      bullets: ['kam cestujete', 'jak dlouho zůstáváte', 'kolik přesunů plánujete'],
      outro: 'Níže najdete praktické srovnání a orientační příklady, které vám pomohou držet náklady pod kontrolou.'
    },
    factorsTitle: 'Co nejvíce ovlivňuje cenu dopravy',
    factors: [
      'Sezóna a termín rezervace (v létě bývá doprava dražší).',
      'Typ lokality: velká města vs menší regiony.',
      'Počet cestujících a délka trasy.',
      'Celkové náklady cesty, ne jen cena jedné jízdenky.'
    ],
    partnerTop: {
      title: 'Naplánujte dopravu i pobyt včas',
      text: 'Nejlepší poměr ceny a dostupnosti bývá při rezervaci dopředu.',
      booking: 'Najít ubytování (Booking.com)',
      gyg: 'Najít zážitky (GetYourGuide)'
    },
    train: {
      title: 'Vlak',
      text: 'Mezi velkými městy je vlak často nejefektivnější volba. Pro regionální cestování jsou důležité i oficiální tarify Trenitalia.',
      official: [
        'Italia in Tour: 3 po sobě jdoucí dny regionálních vlaků za 35 EUR.',
        'Italia in Tour: 5 po sobě jdoucích dní regionálních vlaků za 59 EUR.',
        'Trenitalia Pass pro cizince žijící mimo Itálii: od 139 EUR.'
      ],
      examples: []
    },
    car: {
      title: 'Auto',
      text: 'Auto je výhodné hlavně pro více osob a menší lokality (moře, hory, venkov). Počítejte s mýtným, parkováním a palivem.',
      official: [
        'Ceny paliv se průběžně mění; oficiálně je sleduje Weekly Oil Bulletin Evropské komise.',
        'Ve velkých městech sledujte zóny s omezeným vjezdem (ZTL).'
      ],
      examples: []
    },
    bus: {
      title: 'Autobus',
      text: 'Autobus bývá obvykle nejlevnější varianta, ale za cenu delší cesty a nižšího komfortu.',
      official: [
        'FlixBus v Itálii komunikuje promo tarify od cca 5 EUR.',
        'Itabus komunikuje promo tarify od cca 1,59 EUR.',
        'Městské autobusové jízdné se v Itálii obvykle pohybuje kolem 1,50-3 EUR za jednorázový lístek (podle města).'
      ],
      examples: []
    },
    flight: {
      title: 'Kdy se vyplatí letadlo',
      text: 'Na delší trase uvnitř Itálie (zejména sever-jih) může být letadlo nejrychlejší. Vždy ale počítejte i transfer z letiště.',
      examples: [
        'Milán-Catania: cca 45-120 EUR',
        'Bologna-Neapol: cca 35-110 EUR',
        'Janov-Bari: cca 55-150 EUR'
      ]
    },
    watchoutsTitle: 'Na čem lidé nejčastěji přeplácí',
    watchouts: [
      'Pozdní rezervace během hlavní sezóny.',
      'Podcenění mýtného, parkování a transferů.',
      'Srovnání jen podle jedné ceny bez celkového kontextu.'
    ],
    strategyTitle: 'Praktická strategie podle typu cesty',
    strategy: [
      'City break: obvykle vlak + místní doprava.',
      'Road trip: auto nebo vlak + pronájem auta.',
      'Nízký rozpočet: autobus při včasné rezervaci.',
      'Krátká dovolená: let + návazná regionální doprava.'
    ],
    partnerMid: {
      title: 'Chcete si porovnat dopravu a ubytování?',
      text: 'Rezervujte chytře a držte rozpočet pod kontrolou.',
      booking: 'Najít ubytování',
      gyg: 'Najít aktivity'
    },
    sourcesTitle: 'Použité zdroje',
    sources: [
      'Trenitalia (Italia in Tour, Trenitalia Pass).',
      'European Commission Weekly Oil Bulletin.',
      'FlixBus a Itabus (oficiálně komunikované promo tarify).'
    ],
    bridge: {
      title: 'Mnoho Čechů začíná Itálii objevovat jako cestovatelé.',
      paragraphs: [
        'A později zjistí, že by zde chtěli trávit více času.',
        'Pokud vás zaujal konkrétní region, podívejte se na naše přehledy regionů.'
      ],
      button: 'Regiony Itálie'
    },
    conclusion: {
      title: 'Závěr',
      paragraphs: [
        'Cestovat po Itálii levně v roce 2026 je reálné, pokud dopravu vybíráte podle typu cesty a ne jen podle první ceny.',
        'Nejvíce obvykle ušetříte kombinací více dopravních prostředků a včasnou rezervací.'
      ]
    }
  },
  en: {
    navGuide: 'Italy Travel Guide',
    navArticles: 'Articles',
    badge: 'Italy Travel Guide',
    title: 'How to Travel Across Italy on a Budget - Train, Car, or Bus?',
    readTime: '10 min',
    intro: {
      paragraphs: [
        'Budget travel in Italy is usually about choosing the right transport mix, not one universal option.',
        'A city itinerary requires different choices than a coastal or mountain route.'
      ],
      bullets: ['where you travel', 'how long you stay', 'how many transfers you need'],
      outro: 'Below is a practical comparison with indicative examples to help you control transport costs.'
    },
    factorsTitle: 'What Impacts Transport Cost the Most',
    factors: [
      'Season and booking timing.',
      'Major cities versus smaller regions.',
      'Group size and trip length.',
      'Total route cost, not one ticket only.'
    ],
    partnerTop: {
      title: 'Plan transport and stay early',
      text: 'Better prices and availability usually come with advance booking.',
      booking: 'Find Accommodation (Booking.com)',
      gyg: 'Find Activities (GetYourGuide)'
    },
    train: {
      title: 'Train',
      text: 'For major city connections, train is often the most efficient option. Official Trenitalia offers can reduce costs significantly.',
      official: [
        'Italia in Tour: 3 consecutive days of regional trains at EUR 35.',
        'Italia in Tour: 5 consecutive days of regional trains at EUR 59.',
        'Trenitalia Pass for non-Italian residents: from EUR 139.'
      ],
      examples: []
    },
    car: {
      title: 'Car',
      text: 'Car travel is often practical for multiple travelers and smaller destinations (coast, mountains, countryside).',
      official: [
        'Fuel prices change over time and are officially tracked in the European Commission Weekly Oil Bulletin.',
        'In larger cities, check restricted traffic zones (ZTL).'
      ],
      examples: []
    },
    bus: {
      title: 'Bus',
      text: 'Long-distance buses are usually the cheapest option, but slower and less comfortable.',
      official: [
        'FlixBus in Italy promotes fares from around EUR 5.',
        'Itabus promotes fares from around EUR 1.59.',
        'Local city bus tickets are usually around EUR 1.50-3 per ride, depending on the city.'
      ],
      examples: []
    },
    flight: {
      title: 'When Flights Make Sense',
      text: 'For long north-south routes inside Italy, flights can be the fastest option, but always include airport transfer cost.',
      examples: [
        'Milan-Catania: approx. EUR 45-120',
        'Bologna-Naples: approx. EUR 35-110',
        'Genoa-Bari: approx. EUR 55-150'
      ]
    },
    watchoutsTitle: 'Where Travelers Commonly Overspend',
    watchouts: ['Late booking in peak season.', 'Ignoring tolls, parking, and transfer costs.', 'Comparing one fare only.'],
    strategyTitle: 'Quick Strategy by Trip Type',
    strategy: [
      'City break: usually train + local transport.',
      'Road trip: car or train + rental car.',
      'Low budget: bus with early booking.',
      'Short trip: flight + regional transfers.'
    ],
    partnerMid: {
      title: 'Want to compare transport and accommodation?',
      text: 'Book smart and keep costs under control.',
      booking: 'Find Accommodation',
      gyg: 'Find Activities'
    },
    sourcesTitle: 'Sources Used',
    sources: ['Trenitalia (Italia in Tour, Trenitalia Pass).', 'European Commission Weekly Oil Bulletin.', 'FlixBus and Itabus official promo communication.'],
    bridge: {
      title: 'Many Czechs first discover Italy as travelers.',
      paragraphs: ['Later, they often choose regions where they want to spend more time.', 'If a region caught your attention, see our regional overviews.'],
      button: 'Regions of Italy'
    },
    conclusion: {
      title: 'Conclusion',
      paragraphs: [
        'Traveling across Italy on a budget in 2026 is realistic with the right transport mix.',
        'The biggest savings usually come from early booking and route planning with total cost in mind.'
      ]
    }
  },
  it: {
    navGuide: 'Guida all’Italia',
    navArticles: 'Articoli',
    badge: 'Guida all’Italia',
    title: 'Come viaggiare in Italia spendendo poco - treno, auto o autobus?',
    readTime: '10 min',
    intro: {
      paragraphs: [
        'Viaggiare in Italia spendendo poco richiede di combinare bene i mezzi, non solo scegliere il prezzo più basso.',
        'Un city break e un viaggio tra borghi o coste hanno logiche di trasporto diverse.'
      ],
      bullets: ['dove viaggi', 'quanto resti', 'quanti spostamenti prevedi'],
      outro: 'Qui trovi un confronto pratico con esempi orientativi per gestire meglio il budget.'
    },
    factorsTitle: 'Cosa Incide di Più sul Costo dei Trasporti',
    factors: ['Stagione e anticipo di prenotazione.', 'Grandi città vs aree minori.', 'Numero di persone e durata della tratta.', 'Costo totale del percorso, non solo un biglietto.'],
    partnerTop: {
      title: 'Hai già un viaggio in programma?',
      text: 'Prenota in sicurezza con i nostri partner ufficiali.',
      booking: 'Trova alloggio (Booking.com)',
      gyg: 'Trova attività (GetYourGuide)'
    },
    train: {
      title: 'Treno',
      text: 'Tra le grandi città il treno è spesso la soluzione più efficiente. Le offerte ufficiali possono ridurre molto i costi.',
      official: [
        'Italia in Tour: 3 giorni consecutivi sui regionali a 35 EUR.',
        'Italia in Tour: 5 giorni consecutivi sui regionali a 59 EUR.',
        'Trenitalia Pass per residenti fuori Italia: da 139 EUR.'
      ],
      examples: []
    },
    car: {
      title: 'Auto',
      text: 'L’auto è utile soprattutto per più persone e itinerari tra piccoli centri, mare e montagna.',
      official: [
        'I prezzi carburante variano e sono monitorati nel Weekly Oil Bulletin della Commissione Europea.',
        'Nelle grandi città considera sempre le zone ZTL.'
      ],
      examples: []
    },
    bus: {
      title: 'Autobus',
      text: 'Spesso è la soluzione più economica sulle tratte lunghe, ma generalmente più lenta e meno comoda.',
      official: [
        'FlixBus comunica offerte da circa 5 EUR.',
        'Itabus comunica offerte da circa 1,59 EUR.',
        'Nei trasporti urbani, il biglietto singolo bus è spesso tra 1,50 e 3 EUR (in base alla città).'
      ],
      examples: []
    },
    flight: {
      title: 'Quando Conviene il Volo',
      text: 'Sulle tratte lunghe interne in Italia, il volo può essere la scelta più rapida, ma va incluso il transfer aeroportuale.',
      examples: [
        'Milano-Catania: circa 45-120 EUR',
        'Bologna-Napoli: circa 35-110 EUR',
        'Genova-Bari: circa 55-150 EUR'
      ]
    },
    watchoutsTitle: 'Dove si Spende Più del Necessario',
    watchouts: ['Prenotazioni tardive in alta stagione.', 'Sottostima di pedaggi, parcheggi e transfer.', 'Confronto basato solo su una tariffa.'],
    strategyTitle: 'Strategia Rapida per Tipo di Viaggio',
    strategy: ['City break: treno + trasporto urbano.', 'Road trip: auto o treno + noleggio.', 'Budget ridotto: autobus con anticipo.', 'Viaggio breve: volo + trasporti regionali.'],
    partnerMid: {
      title: 'Vuoi confrontare trasporti e alloggi?',
      text: 'Prenota in modo intelligente e controlla meglio le spese.',
      booking: 'Trova alloggio',
      gyg: 'Trova attività'
    },
    sourcesTitle: 'Fonti Utilizzate',
    sources: ['Trenitalia (Italia in Tour, Trenitalia Pass).', 'European Commission Weekly Oil Bulletin.', 'Comunicazione promo ufficiale FlixBus e Itabus.'],
    bridge: {
      title: 'Molti cechi scoprono l’Italia prima da viaggiatori.',
      paragraphs: ['Poi scelgono regioni in cui vogliono passare più tempo.', 'Se una zona ti ha colpito, consulta le nostre panoramiche regionali.'],
      button: 'Regioni d’Italia'
    },
    conclusion: {
      title: 'Conclusione',
      paragraphs: [
        'Viaggiare in Italia con budget controllato nel 2026 è possibile con una buona combinazione dei mezzi.',
        'Le scelte che incidono di più sono anticipo di prenotazione e valutazione del costo totale della tratta.'
      ]
    }
  }
}

function formatDate(language, value) {
  const locale = language === 'cs' ? 'cs-CZ' : language === 'it' ? 'it-IT' : 'en-US'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString(locale, { day: '2-digit', month: 'short', year: 'numeric' })
}

function TravelPartnerCta({ title, text, bookingLabel, gygLabel }) {
  return (
    <Card className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-xl rounded-2xl overflow-hidden">
      <CardContent className="p-6 md:p-8">
        <h3 className="text-2xl font-bold mb-3 text-slate-800">{title}</h3>
        <p className="text-gray-600 mb-5 leading-relaxed">{text}</p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <Button asChild className="bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white font-semibold px-6 py-5 text-sm transition-all duration-300 hover:scale-[1.02] shadow-lg w-full sm:w-auto">
            <a href={TRAVEL_PARTNER_LINKS.booking} target="_blank" rel="nofollow sponsored noopener noreferrer">
              {bookingLabel}
            </a>
          </Button>
          <Button asChild className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white font-semibold px-6 py-5 text-sm transition-all duration-300 hover:scale-[1.02] shadow-lg w-full sm:w-auto">
            <a href={TRAVEL_PARTNER_LINKS.getYourGuide} target="_blank" rel="nofollow sponsored noopener noreferrer">
              {gygLabel}
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function TransportCard({ icon, title, text, official, examples, cta }) {
  const points = [...(official || []), ...(examples || [])]

  return (
    <Card className="bg-white border border-slate-200">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-3">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-slate-700 leading-relaxed">
        <p>{text}</p>
        {cta ? (
          <div className="rounded-lg border border-sky-200 bg-sky-50/70 p-3">
            <p className="text-xs text-slate-700 mb-2">{cta.miniText}</p>
            <Button asChild size="sm" className="bg-sky-700 hover:bg-sky-600 text-white">
              <a href={cta.href} target="_top" rel="nofollow sponsored noopener noreferrer">
                {cta.button}
              </a>
            </Button>
            {cta.trackingPixel ? (
              <img src={cta.trackingPixel} width="1" height="1" alt="" className="sr-only" />
            ) : null}
          </div>
        ) : null}
        {points.length ? (
          <ul className="list-disc pl-6 space-y-1 text-slate-700">
            {points.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : null}
      </CardContent>
    </Card>
  )
}

export default function CheapTravelItalyArticlePage() {
  const [language, setLanguage] = useState('cs')

  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferred-language')
    if (savedLanguage) {
      setLanguage(savedLanguage)
      document.documentElement.lang = savedLanguage
    }

    const handleLanguageChange = (event) => {
      if (!event?.detail) return
      setLanguage(event.detail)
      document.documentElement.lang = event.detail
    }

    window.addEventListener('languageChange', handleLanguageChange)
    return () => window.removeEventListener('languageChange', handleLanguageChange)
  }, [])

  const t = CONTENT[language] || CONTENT.cs
  const sidebarTitle =
    language === 'cs'
      ? 'Doporucena nabidka partnera'
      : language === 'it'
        ? 'Offerta partner consigliata'
        : 'Recommended Partner Offer'
  const sidebarText =
    language === 'cs'
      ? 'Overene rezervace a cestovni nabidky.'
      : language === 'it'
        ? 'Prenotazioni verificate e in sicurezza.'
        : 'Verified booking and travel deal.'
  const carCta =
    language === 'cs'
      ? { miniText: 'Hledate pronajem auta pro cestu po Italii?', button: 'Najit pronajem auta' }
      : language === 'it'
        ? { miniText: "Cerchi un'auto a noleggio per il viaggio?", button: 'Cerca auto a noleggio' }
        : { miniText: 'Looking for a rental car for your route?', button: 'Find Car Rental' }
  const flightCta =
    language === 'cs'
      ? { miniText: 'Hledate lety na vase terminy?', button: 'Hledat lety' }
      : language === 'it'
        ? { miniText: 'Cerchi voli per le tue date?', button: 'Cerca voli' }
        : { miniText: 'Looking for flights for your dates?', button: 'Search Flights' }

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <Navigation />

      <main className="pt-28 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-[1200px] mx-auto lg:grid lg:grid-cols-[minmax(0,1fr)_200px] lg:gap-8 xl:gap-12">
            <article className="max-w-4xl lg:max-w-none space-y-8">
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-100">
                <Link href="/clanky/pruvodce-italii">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t.navGuide}
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-100">
                <Link href="/blog">{t.navArticles}</Link>
              </Button>
            </div>

            <header className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide bg-slate-100 border border-slate-200 text-slate-700 mb-4">
                <Route className="h-3.5 w-3.5" />
                {t.badge}
              </div>

              <h1 className="text-3xl md:text-5xl font-bold text-slate-900 leading-tight mb-4">{t.title}</h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-6">
                <span className="inline-flex items-center">
                  <Calendar className="h-4 w-4 mr-1.5" />
                  {formatDate(language, PUBLISHED_AT)}
                </span>
                <span className="inline-flex items-center">
                  <Clock className="h-4 w-4 mr-1.5" />
                  {t.readTime}
                </span>
              </div>

              <div className="space-y-4 text-slate-700 leading-relaxed">
                {t.intro.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                <ul className="list-disc pl-6 space-y-1">
                  {t.intro.bullets.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <p>{t.intro.outro}</p>
              </div>
            </header>

            <TravelPartnerCta title={t.partnerTop.title} text={t.partnerTop.text} bookingLabel={t.partnerTop.booking} gygLabel={t.partnerTop.gyg} />

            <Card className="bg-white border border-slate-200">
              <CardHeader>
                <CardTitle className="text-2xl">{t.factorsTitle}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-6 space-y-2 text-slate-700">
                  {t.factors.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <TransportCard icon={<Train className="h-6 w-6" />} title={t.train.title} text={t.train.text} official={t.train.official} examples={t.train.examples} />
            <TransportCard
              icon={<Car className="h-6 w-6" />}
              title={t.car.title}
              text={t.car.text}
              official={t.car.official}
              examples={t.car.examples}
              cta={{ ...carCta, href: CAR_RENT_PARTNER_LINKS.homepage, trackingPixel: CAR_RENT_PARTNER_LINKS.trackingPixel }}
            />
            <TransportCard icon={<Bus className="h-6 w-6" />} title={t.bus.title} text={t.bus.text} official={t.bus.official} examples={t.bus.examples} />
            <TransportCard
              icon={<Plane className="h-6 w-6" />}
              title={t.flight.title}
              text={t.flight.text}
              official={null}
              examples={t.flight.examples}
              cta={{ ...flightCta, href: FLIGHTS_PARTNER_LINKS.homepage, trackingPixel: FLIGHTS_PARTNER_LINKS.trackingPixel }}
            />

            <Card className="bg-white border border-slate-200">
              <CardHeader>
                <CardTitle className="text-2xl">{t.watchoutsTitle}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-6 space-y-2 text-slate-700">
                  {t.watchouts.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white border border-slate-200">
              <CardHeader>
                <CardTitle className="text-2xl">{t.strategyTitle}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-6 space-y-2 text-slate-700">
                  {t.strategy.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <TravelPartnerCta title={t.partnerMid.title} text={t.partnerMid.text} bookingLabel={t.partnerMid.booking} gygLabel={t.partnerMid.gyg} />

            <Card className="bg-slate-50 border-slate-200">
              <CardHeader>
                <CardTitle className="text-2xl">{t.sourcesTitle}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-6 space-y-2 text-slate-700">
                  {t.sources.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="p-6 md:p-8">
                <h2 className="text-2xl font-semibold text-amber-950 mb-3">{t.bridge.title}</h2>
                <div className="space-y-3 text-amber-950 leading-relaxed mb-5">
                  {t.bridge.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
                <Button asChild className="bg-slate-800 hover:bg-slate-700 text-white">
                  <Link href="/regiony">{t.bridge.button}</Link>
                </Button>
              </CardContent>
            </Card>

              <Card className="bg-white border border-slate-200">
                <CardHeader>
                  <CardTitle className="text-2xl">{t.conclusion.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-slate-700 leading-relaxed">
                  {t.conclusion.paragraphs.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </CardContent>
              </Card>
            </article>

            <aside className="hidden lg:block">
              <div className="sticky top-28 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-900 mb-1">{sidebarTitle}</h3>
                <p className="text-xs text-slate-600 mb-3">{sidebarText}</p>
                <a href={SIDEBAR_TRAVEL_WIDGET.href} target="_top" rel="sponsored noopener noreferrer" className="block">
                  <img
                    src={SIDEBAR_TRAVEL_WIDGET.image}
                    width="160"
                    height="600"
                    alt=""
                    border="0"
                    className="w-full h-auto rounded-md"
                  />
                </a>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Footer language={language} />
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Calendar, Clock, Home } from 'lucide-react'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const PUBLISHED_AT = '2026-03-12'

const TRAVEL_PARTNER_LINKS = {
  booking: 'https://www.dpbolvw.net/click-101629596-15735418',
  getYourGuide: 'https://gyg.me/O0X6ZC2R'
}

const CONTENT = {
  cs: {
    navGuide: 'Průvodce Itálií',
    navArticles: 'Články',
    badge: 'Průvodce Itálií',
    title: 'Kde se ubytovat v Itálii levně: hotely, B&B a cenově dostupné agriturismo',
    readTime: '12 min',
    intro: [
      'Najít v Itálii dobré ubytování za rozumnou cenu je v roce 2026 možné, ale vyžaduje správnou strategii.',
      'Největší rozdíl v ceně obvykle nedělá jen typ ubytování, ale hlavně termín, lokalita a načasování rezervace.',
      'V tomto článku najdete praktické orientační ceny hotelů, B&B a agriturismo a také tipy, kde se nejčastěji zbytečně přeplácí.'
    ],
    partnerTop: {
      title: 'Začněte porovnáním ověřených nabídek',
      text: 'Ubytování i lokální program se vyplatí řešit společně, ideálně s předstihem.',
      booking: 'Porovnat ubytování (Booking.com)',
      gyg: 'Najít aktivity (GetYourGuide)'
    },
    marketTitle: 'Co říká trh v roce 2026',
    market: [
      'KAYAK (stav k březnu 2026) ukazuje pro Itálii výraznou sezónnost: nejlevněji vychází obvykle listopad, nejdražší bývá srpen.',
      'ISTAT potvrzuje vysokou turistickou poptávku: v roce 2024 bylo evidováno 466,2 milionu přenocování a ve 4. čtvrtletí 2025 pokračoval růst.',
      'Eurostat uvádí pro rok 2025 rekordní turistické přenocování v EU, což dále tlačí na ceny v hlavních destinacích.'
    ],
    typesTitle: 'Orientační ceny podle typu ubytování (za pokoj / noc)',
    typesNote:
      'Níže uvedené částky jsou orientační rámec pro běžné cestování v roce 2026. Nejde o fixní tarify a mohou se lišit podle regionu, sezóny a kvality.',
    types: [
      {
        label: 'Hotel (2-3*)',
        value: 'cca 70-140 EUR',
        note: 'V top městech a v hlavní sezóně je běžný i vyšší rozsah.'
      },
      {
        label: 'Hotel (4*)',
        value: 'cca 120-230 EUR',
        note: 'KAYAK uvádí 4* segment jako citlivý na sezónu a lokalitu.'
      },
      {
        label: 'B&B',
        value: 'cca 65-150 EUR',
        note: 'Mimo centra velkých měst bývá poměr ceny a kvality často nejlepší.'
      },
      {
        label: 'Agriturismo',
        value: 'cca 80-170 EUR',
        note: 'Cena se mění podle regionu, sezóny, vybavení a zahrnutých služeb.'
      }
    ],
    hotelTitle: 'Kdy dává smysl hotel',
    hotel: [
      'Hotel bývá praktický pro city break, krátké pobyty a cesty bez auta.',
      'Ve velkých městech se vyplatí hledat lokalitu s dobrým vlakovým nebo metro spojením místo absolutního centra.',
      'Důležité je porovnat celkovou cenu: snídaně, parkování, storno podmínky a místní taxa.'
    ],
    bnbTitle: 'Kdy se vyplatí B&B',
    bnb: [
      'B&B často nabízí lepší osobní přístup a nižší cenu než hotel stejné lokality.',
      'Pro páry a individuální cestovatele je B&B často nejlepší kompromis cena/poloha.',
      'Před rezervací ověřte check-in čas, dostupnost výtahu, klimatizaci a reálnou docházkovou vzdálenost.'
    ],
    partnerMid: {
      title: 'Chcete rychle najít ubytování podle rozpočtu?',
      text: 'Nejprve vyberte správnou lokalitu, teprve potom filtrujte podle ceny.',
      booking: 'Najít ubytování',
      gyg: 'Najít výlety poblíž ubytování'
    },
    agroTitle: 'Agriturismo: silná volba mimo města',
    agroIntro:
      'ISTAT za rok 2024 eviduje 26 360 agrituristických podniků a meziroční růst hostů i přenocování. Pro cestovatele to znamená širokou nabídku mimo velká města.',
    agro: [
      'Agriturismo je vhodné pro klidnější dovolenou, gastronomii a poznávání venkovských regionů.',
      'Často získáte více prostoru a autentičtější prostředí než v městském hotelu stejné cenové hladiny.',
      'U odlehlejších lokalit je praktické mít auto a předem řešit logistiku výletů.'
    ],
    mistakesTitle: 'Kde lidé při rezervaci nejčastěji přeplácí',
    mistakes: [
      'Rezervace příliš pozdě v letních měsících.',
      'Výběr pouze podle nejnižší ceny bez kontroly lokality.',
      'Ignorování doplňkových nákladů (taxa, parkování, úklid, storno podmínky).',
      'Nadměrná orientace na centrum města, i když hlavní program je mimo centrum.'
    ],
    saveTitle: 'Jak ubytování v Itálii zlevnit bez ztráty kvality',
    save: [
      'Cestujte ideálně v květnu, červnu, září nebo říjnu.',
      'U velkých měst hledejte čtvrti s dobrým spojením místo nejdražšího centra.',
      'Rezervujte s předstihem a porovnávejte cenu se storno podmínkami.',
      'Při road tripu kombinujte město (hotel/B&B) a venkov (agriturismo).',
      'Kontrolujte celkovou cenu pobytu, ne jen cenu za noc.'
    ],
    sourcesTitle: 'Použité zdroje',
    sources: [
      'KAYAK (březen 2026): trend cen hotelů v Itálii a sezónnost.',
      'ISTAT (prosinec 2025): I flussi turistici v roce 2024.',
      'ISTAT (únor 2026): Flussi turistici - IV. čtvrtletí 2025.',
      'ISTAT (listopad 2025): Le aziende agrituristiche in Italia 2024.',
      'Eurostat (březen 2026): EU tourism in 2025.'
    ],
    bridge: {
      title: 'Našli jste region, kde byste chtěli trávit více času?',
      text: 'Mnoho Čechů začíná krátkými pobyty a později hledá vlastní dlouhodobou základnu v Itálii.',
      button: 'Prohlédnout regiony Itálie'
    },
    conclusionTitle: 'Závěr',
    conclusion: [
      'Levné ubytování v Itálii v roce 2026 je reálné, pokud správně zkombinujete termín, lokalitu a typ pobytu.',
      'Nejlepší výsledky obvykle přináší včasná rezervace, práce s celkovými náklady a flexibilita mezi hotel, B&B a agriturismo.',
      'Tak získáte lepší kvalitu pobytu bez zbytečných přeplatků.'
    ]
  },
  en: {
    navGuide: 'Italy Travel Guide',
    navArticles: 'Articles',
    badge: 'Italy Travel Guide',
    title: 'Where to Stay in Italy on a Budget: affordable hotels, B&Bs, and agriturismo',
    readTime: '12 min',
    intro: [
      'Finding good-value accommodation in Italy in 2026 is possible, but it requires the right booking strategy.',
      'The biggest price differences usually come from timing and location, not only from accommodation category.',
      'This article gives practical ranges for hotels, B&Bs, and agriturismo, plus the most common mistakes that increase costs.'
    ],
    partnerTop: {
      title: 'Start by comparing trusted options',
      text: 'It usually works best to plan accommodation and local activities together, with advance booking.',
      booking: 'Compare Accommodation (Booking.com)',
      gyg: 'Find Activities (GetYourGuide)'
    },
    marketTitle: 'What market signals show in 2026',
    market: [
      'KAYAK (March 2026 snapshot) shows strong seasonality for Italy: November is typically cheaper, while August is often the most expensive period.',
      'ISTAT confirms high tourism demand: 466.2 million overnight stays in 2024, with continued growth in Q4 2025.',
      'Eurostat reports record EU tourism nights in 2025, supporting sustained pressure on prices in top destinations.'
    ],
    typesTitle: 'Indicative prices by accommodation type (per room / night)',
    typesNote:
      'These are orientation ranges for standard travel in 2026. They are not fixed tariffs and can vary by region, season, and property quality.',
    types: [
      {
        label: 'Hotel (2-3*)',
        value: 'approx. EUR 70-140',
        note: 'In top cities and peak months, upper values are common.'
      },
      {
        label: 'Hotel (4*)',
        value: 'approx. EUR 120-230',
        note: 'KAYAK indicates strong season and location sensitivity in this segment.'
      },
      {
        label: 'B&B',
        value: 'approx. EUR 65-150',
        note: 'Outside major city centers, value for money is often stronger.'
      },
      {
        label: 'Agriturismo',
        value: 'approx. EUR 80-170',
        note: 'Rates depend on region, season, services included, and property profile.'
      }
    ],
    hotelTitle: 'When a hotel is the right fit',
    hotel: [
      'Hotels are usually practical for city breaks and short stays without a car.',
      'In major cities, areas with strong rail/metro access are often better value than absolute city center.',
      'Compare total cost: breakfast, parking, cancellation terms, and local taxes.'
    ],
    bnbTitle: 'When B&Bs are often better value',
    bnb: [
      'B&Bs often provide better personal service and lower pricing versus similarly located hotels.',
      'For couples and solo travelers, B&Bs are often the best location/price compromise.',
      'Before booking, verify check-in windows, elevator access, air conditioning, and walking distances.'
    ],
    partnerMid: {
      title: 'Want to shortlist stays quickly by budget?',
      text: 'Pick the right area first, then apply price filters.',
      booking: 'Find Accommodation',
      gyg: 'Find Activities Near Your Stay'
    },
    agroTitle: 'Agriturismo: a strong choice outside major cities',
    agroIntro:
      'ISTAT reports 26,360 agriturismo businesses in 2024, with year-on-year growth in guests and overnight stays. That means broad supply beyond urban hotspots.',
    agro: [
      'Agriturismo is ideal for slower travel, food-focused itineraries, and countryside regions.',
      'You often get more space and a more authentic setting than an urban hotel in a similar price band.',
      'For remote areas, having a car and planning logistics in advance is usually important.'
    ],
    mistakesTitle: 'Where travelers most often overspend on accommodation',
    mistakes: [
      'Booking too late for summer dates.',
      'Choosing only by lowest nightly rate without checking area quality.',
      'Ignoring extras (tourist tax, parking, cleaning fee, cancellation policy).',
      'Paying for prime center locations even when most activities are outside center.'
    ],
    saveTitle: 'How to reduce accommodation cost without losing quality',
    save: [
      'Travel in May, June, September, or October when possible.',
      'In major cities, target well-connected neighborhoods rather than the most expensive center.',
      'Book early and compare both price and cancellation flexibility.',
      'On road trips, combine city stays (hotel/B&B) with countryside nights (agriturismo).',
      'Track total stay cost, not only the headline nightly rate.'
    ],
    sourcesTitle: 'Sources Used',
    sources: [
      'KAYAK (Mar 2026): Italy hotel pricing trends and seasonality.',
      'ISTAT (Dec 2025): tourism flows in 2024.',
      'ISTAT (Feb 2026): tourism flows - Q4 2025.',
      'ISTAT (Nov 2025): agriturismo businesses in Italy, 2024.',
      'Eurostat (Mar 2026): EU tourism in 2025.'
    ],
    bridge: {
      title: 'Did you find a region where you would like to stay longer?',
      text: 'Many Czech travelers start with short stays and later look for a long-term base in Italy.',
      button: 'Explore Italian Regions'
    },
    conclusionTitle: 'Conclusion',
    conclusion: [
      'Affordable accommodation in Italy in 2026 is realistic if you combine timing, location, and stay type strategically.',
      'Best results usually come from early booking, total-cost comparison, and flexibility between hotel, B&B, and agriturismo.',
      'That approach improves quality while keeping overspending under control.'
    ]
  },
  it: {
    navGuide: 'Guida all’Italia',
    navArticles: 'Articoli',
    badge: 'Guida all’Italia',
    title: 'Dove dormire in Italia spendendo poco: hotel, B&B e agriturismi economici',
    readTime: '12 min',
    intro: [
      'Trovare un alloggio conveniente in Italia nel 2026 è possibile, ma serve una strategia chiara.',
      'La differenza di prezzo più grande dipende spesso da periodo e zona, non solo dalla categoria della struttura.',
      'Qui trovi prezzi orientativi realistici per hotel, B&B e agriturismi, con indicazioni pratiche per evitare spese inutili.'
    ],
    partnerTop: {
      title: 'Parti dal confronto di offerte affidabili',
      text: 'Alloggio e attività locali funzionano meglio se pianificati insieme e con anticipo.',
      booking: 'Confronta alloggi (Booking.com)',
      gyg: 'Trova attività (GetYourGuide)'
    },
    marketTitle: 'Cosa indicano i segnali di mercato nel 2026',
    market: [
      'KAYAK (snapshot marzo 2026) evidenzia una forte stagionalità in Italia: novembre tende a essere più economico, agosto più caro.',
      'ISTAT conferma domanda turistica elevata: 466,2 milioni di presenze nel 2024 e ulteriore crescita nel IV trimestre 2025.',
      'Eurostat riporta un record di pernottamenti turistici UE nel 2025, con pressione ulteriore sulle principali destinazioni italiane.'
    ],
    typesTitle: 'Prezzi orientativi per tipologia di alloggio (camera / notte)',
    typesNote:
      'Valori orientativi per viaggi standard nel 2026. Non sono tariffe fisse e cambiano in base a regione, stagione e qualità della struttura.',
    types: [
      {
        label: 'Hotel (2-3*)',
        value: 'circa 70-140 EUR',
        note: 'Nelle città top e in alta stagione è comune superare questa fascia.'
      },
      {
        label: 'Hotel (4*)',
        value: 'circa 120-230 EUR',
        note: 'KAYAK segnala forte sensibilità a stagionalità e posizione.'
      },
      {
        label: 'B&B',
        value: 'circa 65-150 EUR',
        note: 'Fuori dai centri più turistici il rapporto qualità/prezzo è spesso più favorevole.'
      },
      {
        label: 'Agriturismo',
        value: 'circa 80-170 EUR',
        note: 'Il prezzo dipende da area, periodo, servizi inclusi e tipologia della struttura.'
      }
    ],
    hotelTitle: 'Quando conviene l’hotel',
    hotel: [
      'L’hotel è spesso la scelta più pratica per city break e soggiorni brevi senza auto.',
      'Nelle grandi città conviene valutare quartieri ben collegati invece del centro storico più costoso.',
      'Confronta sempre il costo totale: colazione, parcheggio, politiche di cancellazione e tassa di soggiorno.'
    ],
    bnbTitle: 'Quando conviene il B&B',
    bnb: [
      'Il B&B offre spesso un buon equilibrio tra posizione, prezzo e approccio più personale.',
      'Per coppie e viaggiatori singoli è spesso uno dei compromessi migliori.',
      'Prima di prenotare controlla orari di check-in, presenza ascensore, aria condizionata e distanza reale dai punti d’interesse.'
    ],
    partnerMid: {
      title: 'Vuoi selezionare alloggi in base al budget in pochi minuti?',
      text: 'Prima scegli la zona giusta, poi applica filtri prezzo e servizi.',
      booking: 'Trova alloggio',
      gyg: 'Trova attività vicino all’alloggio'
    },
    agroTitle: 'Agriturismo: scelta forte fuori dai grandi centri',
    agroIntro:
      'ISTAT rileva 26.360 aziende agrituristiche nel 2024, con crescita di ospiti e presenze. Per il viaggiatore significa ampia offerta fuori dalle aree urbane più care.',
    agro: [
      'L’agriturismo è ideale per viaggi più lenti, territori rurali e percorsi legati a cibo e natura.',
      'Spesso offre più spazio e atmosfera autentica rispetto a un hotel urbano nella stessa fascia prezzo.',
      'Nelle zone più isolate è utile prevedere auto e logistica degli spostamenti.'
    ],
    mistakesTitle: 'Dove si spende più del necessario nella prenotazione',
    mistakes: [
      'Prenotare troppo tardi nei mesi estivi.',
      'Scegliere solo in base al prezzo più basso senza valutare la zona.',
      'Sottovalutare costi extra (tassa di soggiorno, parcheggio, pulizie, condizioni di cancellazione).',
      'Pagare un premium per il pieno centro quando il programma è fuori centro.'
    ],
    saveTitle: 'Come ridurre il costo alloggio senza perdere qualità',
    save: [
      'Quando possibile, viaggia in maggio, giugno, settembre o ottobre.',
      'Nelle città grandi cerca quartieri ben collegati invece della zona più cara.',
      'Prenota in anticipo e confronta prezzo totale e flessibilità di cancellazione.',
      'Nei road trip alterna città (hotel/B&B) e zone rurali (agriturismo).',
      'Valuta sempre il costo complessivo soggiorno, non solo la tariffa notte.'
    ],
    sourcesTitle: 'Fonti utilizzate',
    sources: [
      'KAYAK (marzo 2026): andamento prezzi hotel e stagionalità in Italia.',
      'ISTAT (dicembre 2025): i flussi turistici nel 2024.',
      'ISTAT (febbraio 2026): flussi turistici - IV trimestre 2025.',
      'ISTAT (novembre 2025): le aziende agrituristiche in Italia nel 2024.',
      'Eurostat (marzo 2026): turismo UE nel 2025.'
    ],
    bridge: {
      title: 'Hai trovato una regione dove vorresti fermarti più a lungo?',
      text: 'Molti cechi iniziano con soggiorni brevi e poi scelgono una base più stabile in Italia.',
      button: 'Scopri le regioni d’Italia'
    },
    conclusionTitle: 'Conclusione',
    conclusion: [
      'Dormire in Italia spendendo poco nel 2026 è possibile con la combinazione giusta di periodo, zona e tipo di struttura.',
      'I risultati migliori arrivano in genere da prenotazione anticipata, confronto del costo totale e flessibilità tra hotel, B&B e agriturismo.',
      'Così migliori qualità del soggiorno e controllo del budget.'
    ]
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

export default function StayCheapItalyArticlePage() {
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

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <Navigation />

      <main className="pt-28 pb-16">
        <div className="container mx-auto px-4">
          <article className="max-w-4xl mx-auto space-y-8">
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
                <Home className="h-3.5 w-3.5" />
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

              <div className="space-y-3 text-slate-700 leading-relaxed">
                {t.intro.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            </header>

            <TravelPartnerCta
              title={t.partnerTop.title}
              text={t.partnerTop.text}
              bookingLabel={t.partnerTop.booking}
              gygLabel={t.partnerTop.gyg}
            />

            <Card className="bg-white border border-slate-200">
              <CardHeader>
                <CardTitle className="text-2xl">{t.marketTitle}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-6 space-y-2 text-slate-700">
                  {t.market.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white border border-slate-200">
              <CardHeader>
                <CardTitle className="text-2xl">{t.typesTitle}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-500">{t.typesNote}</p>
                <div className="space-y-3">
                  {t.types.map((item) => (
                    <div key={item.label} className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                        <h3 className="font-semibold text-slate-900">{item.label}</h3>
                        <span className="text-sm font-bold text-slate-800">{item.value}</span>
                      </div>
                      <p className="text-slate-600 text-sm leading-relaxed">{item.note}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-slate-200">
              <CardHeader>
                <CardTitle className="text-2xl">{t.hotelTitle}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-6 space-y-2 text-slate-700">
                  {t.hotel.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white border border-slate-200">
              <CardHeader>
                <CardTitle className="text-2xl">{t.bnbTitle}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-6 space-y-2 text-slate-700">
                  {t.bnb.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <TravelPartnerCta
              title={t.partnerMid.title}
              text={t.partnerMid.text}
              bookingLabel={t.partnerMid.booking}
              gygLabel={t.partnerMid.gyg}
            />

            <Card className="bg-white border border-slate-200">
              <CardHeader>
                <CardTitle className="text-2xl">{t.agroTitle}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 leading-relaxed mb-4">{t.agroIntro}</p>
                <ul className="list-disc pl-6 space-y-2 text-slate-700">
                  {t.agro.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white border border-slate-200">
              <CardHeader>
                <CardTitle className="text-2xl">{t.mistakesTitle}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-6 space-y-2 text-slate-700">
                  {t.mistakes.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white border border-slate-200">
              <CardHeader>
                <CardTitle className="text-2xl">{t.saveTitle}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-6 space-y-2 text-slate-700">
                  {t.save.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

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
                <p className="text-amber-950 leading-relaxed mb-5">{t.bridge.text}</p>
                <Button asChild className="bg-slate-800 hover:bg-slate-700 text-white">
                  <Link href="/regiony">{t.bridge.button}</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white border border-slate-200">
              <CardHeader>
                <CardTitle className="text-2xl">{t.conclusionTitle}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-slate-700 leading-relaxed">
                {t.conclusion.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </CardContent>
            </Card>
          </article>
        </div>
      </main>

      <Footer language={language} />
    </div>
  )
}

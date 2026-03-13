'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Calendar, Clock, Euro } from 'lucide-react'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const PUBLISHED_AT = '2026-03-12'

const TRAVEL_PARTNER_LINKS = {
  booking: 'https://www.booking.com/searchresults.cs.html?ss=Italia&order=early_year_deals_upsorter&label=gen173rf-10Eg5kZWFscy1jYW1wYWlnbiiCAjjoB0gFWANoOogBAZgBM7gBF8gBDNgBA-gBAfgBAYgCAaICDm1lbWJlcnMuY2ouY29tqAIBuAKpjMzNBsACAdICJGQzM2IxZGFiLWM0NjUtNGRlMS04Zjc1LTEwNWQyNjJkZTAyM9gCAeACAQ&aid=304142&lang=cs&sb=1&src_elem=sb&dest_id=104&dest_type=country&ac_position=0&ac_click_type=b&ac_langcode=it&ac_suggestion_list_length=5&search_selected=true&search_pageview_id=fd70821489bb0dca&ac_meta=GhBmZDcwODIxNDg5YmIwZGNhIAAoATICaXQ6Bkl0YWxpYQ%3D%3D&checkin=2026-03-13&checkout=2026-03-14&group_adults=2&no_rooms=1&group_children=0&lpsrc=sb',
  getYourGuide: 'https://gyg.me/fnMmh4S3'
}

const CONTENT = {
  cs: {
    navGuide: 'Průvodce Itálií',
    navArticles: 'Články',
    badge: 'Průvodce Itálií',
    title: 'Kolik stojí jídlo v Itálii v roce 2026? Reálné ceny restaurací, pizzerií a supermarketů',
    readTime: '11 min',
    intro: [
      'Náklady na jídlo v Itálii v roce 2026 se mohou výrazně lišit podle regionu, sezóny a typu podniku.',
      'Jiné ceny uvidíte v historickém centru Říma nebo Benátek, jiné v menších městech a mimo hlavní turistické zóny.',
      'V tomto přehledu najdete praktické orientační ceny restaurací, pizzerií a supermarketů pro české cestovatele, kteří chtějí plánovat realisticky.'
    ],
    partnerTop: {
      title: 'Plánujte pobyt i zážitky dopředu',
      text: 'Lepší poměr cena/výkon obvykle získáte při včasné rezervaci ubytování a aktivit.',
      booking: 'Najít ubytování (Booking.com)',
      gyg: 'Najít aktivity (GetYourGuide)'
    },
    quickTitle: 'Rychlý přehled cen jídla v Itálii (2026)',
    quickNote:
      'Orientační rozmezí pro běžné cestování. Skutečná cena závisí na lokalitě, sezóně, denní době a typu podniku.',
    quickItems: [
      {
        label: 'Běžné jídlo v levnější restauraci',
        value: 'cca 12-22 EUR / osoba',
        note: 'Ve větších turistických centrech bývá horní hranice častější.'
      },
      {
        label: 'Večeře pro 2 ve střední restauraci (3 chody)',
        value: 'cca 50-95 EUR / 2 osoby',
        note: 'Numbeo uvádí orientační střed kolem 70 EUR.'
      },
      {
        label: 'Pizza Margherita v pizzerii',
        value: 'cca 7-14 EUR',
        note: 'V top lokalitách nebo s premium surovinami může být cena vyšší.'
      },
      {
        label: 'Espresso na baru',
        value: 'cca 1,20-1,80 EUR',
        note: 'Při obsluze u stolu bývá cena vyšší než na baru.'
      },
      {
        label: 'Cappuccino',
        value: 'cca 1,50-2,50 EUR',
        note: 'Numbeo uvádí orientační průměr kolem 1,74 EUR.'
      }
    ],
    restaurantsTitle: 'Restaurace a pizzerie: kde se přeplácí nejčastěji',
    restaurantsIntro:
      'Samotné jídlo nebývá hlavní problém. Rozpočet často roste kvůli lokaci, doplňkům na účtu a špatnému načasování.',
    restaurants: [
      'Historická centra a nejvíce exponované ulice mívají vyšší ceny i nižší poměr kvality k ceně.',
      'Na účtu se může objevit coperto (krytý servis/stolné), někdy i servizio.',
      'Nápoje (voda, víno, koktejly) často tvoří výraznou část finální útraty.',
      'V turistických zónách bývá běžné, že podobné menu stojí o desítky procent více než o pár ulic dál.'
    ],
    supermarketTitle: 'Supermarket v roce 2026: orientační ceny základního nákupu',
    supermarketIntro:
      'Pokud chcete držet rozpočet pod kontrolou, kombinace restaurací a nákupů v supermarketu funguje velmi dobře, hlavně u delších pobytů.',
    supermarketItems: [
      'Mléko 1 l: cca 1,10-1,50 EUR',
      'Chléb 500 g: cca 1,50-3,00 EUR',
      'Vejce (12 ks): cca 2,80-4,20 EUR',
      'Kuřecí prsa 1 kg: cca 8,50-13,50 EUR',
      'Rajčata 1 kg: cca 1,80-3,80 EUR',
      'Voda 1,5 l v obchodě: cca 0,30-0,90 EUR'
    ],
    supermarketNote:
      'Hodnoty vycházejí z orientačních spotřebitelských dat (Numbeo, stav k březnu 2026) a mohou se lišit podle řetězce i regionu.',
    partnerMid: {
      title: 'Chcete mít jídlo, ubytování i program na jednom místě?',
      text: 'Vyberte si ubytování podle lokality a doplňte ho o lokální zážitky.',
      booking: 'Najít ubytování',
      gyg: 'Najít gastronomické a lokální aktivity'
    },
    hiddenTitle: 'Skryté náklady, na které se často zapomíná',
    hidden: [
      'Coperto nebo servisní poplatek v některých podnicích.',
      'Rozdíl mezi cenou na baru a cenou při obsluze u stolu.',
      'Nápoje a dezerty, které výrazně zvednou finální účet.',
      'Turistická taxa u ubytování, která nepřímo ovlivní denní rozpočet na jídlo.'
    ],
    saveTitle: 'Jak jíst v Itálii dobře a zároveň rozumně',
    save: [
      'Hledejte podniky mimo hlavní turistické tahy.',
      'Využívejte polední menu ve všední dny.',
      'Kombinujte restaurace s nákupy v supermarketu.',
      'U kávy preferujte konzumaci na baru, pokud chcete nižší cenu.',
      'Rezervujte oblíbené podniky dopředu, abyste se vyhnuli nouzové volbě dražších míst.'
    ],
    sourcesTitle: 'Použité zdroje',
    sources: [
      'ISTAT (březen 2026): Prezzi al consumo - únor 2026.',
      'Eurostat (březen 2026): rekordní turistické přenocování v EU za rok 2025.',
      'Numbeo (stav k březnu 2026): Cost of Living in Italy - restaurace a potraviny.',
      'ISTAT: flussi turistici 2024 a IV. čtvrtletí 2025 (tlak poptávky v cestovním ruchu).'
    ],
    bridge: {
      title: 'Zaujala vás některá část Itálie i mimo dovolenou?',
      text: 'Mnoho Čechů poznává Itálii nejprve přes jídlo, cestování a atmosféru jednotlivých regionů.',
      button: 'Prohlédnout regiony Itálie'
    },
    conclusionTitle: 'Závěr',
    conclusion: [
      'Jídlo v Itálii v roce 2026 nemusí být drahé, pokud plánujete podle lokality a stylu cesty.',
      'Největší rozdíl obvykle dělá výběr podniku, práce s denním rozpočtem a kombinace restaurací se supermarketem.',
      'Díky tomu můžete jíst kvalitně, autenticky a bez zbytečných přeplatků.'
    ]
  },
  en: {
    navGuide: 'Italy Travel Guide',
    navArticles: 'Articles',
    badge: 'Italy Travel Guide',
    title: 'How Much Does Food Cost in Italy in 2026? Real Prices for Restaurants, Pizzerias, and Supermarkets',
    readTime: '11 min',
    intro: [
      'Food spending in Italy in 2026 can vary significantly by region, season, and venue type.',
      'Prices in central Rome, Milan, or Venice are usually different from smaller towns and less touristy districts.',
      'This guide gives Czech travelers a practical and realistic overview of restaurant, pizzeria, and supermarket costs.'
    ],
    partnerTop: {
      title: 'Plan stay and experiences in advance',
      text: 'You usually get a better price/quality ratio when accommodation and activities are booked early.',
      booking: 'Find Accommodation (Booking.com)',
      gyg: 'Find Activities (GetYourGuide)'
    },
    quickTitle: 'Quick Food Price Snapshot in Italy (2026)',
    quickNote:
      'Indicative ranges for standard travel. Real prices depend on location, season, time slot, and venue positioning.',
    quickItems: [
      {
        label: 'Meal in an inexpensive restaurant',
        value: 'approx. EUR 12-22 / person',
        note: 'Upper values are more common in top tourist zones.'
      },
      {
        label: 'Dinner for 2 in a mid-range restaurant (3 courses)',
        value: 'approx. EUR 50-95 / 2 people',
        note: 'Numbeo reports an indicative midpoint around EUR 70.'
      },
      {
        label: 'Margherita pizza in a pizzeria',
        value: 'approx. EUR 7-14',
        note: 'Premium ingredients and prime locations can push prices higher.'
      },
      {
        label: 'Espresso at the bar',
        value: 'approx. EUR 1.20-1.80',
        note: 'Table service is often priced higher than standing at the bar.'
      },
      {
        label: 'Cappuccino',
        value: 'approx. EUR 1.50-2.50',
        note: 'Numbeo indicates an average near EUR 1.74.'
      }
    ],
    restaurantsTitle: 'Restaurants and Pizzerias: where overspending happens most',
    restaurantsIntro:
      'The dish itself is rarely the problem. Overspending often comes from location premium, extra charges, and timing choices.',
    restaurants: [
      'Historic centers and high-footfall streets often come with a significant price premium.',
      'Bills may include coperto and, in some places, servizio.',
      'Drinks (water, wine, cocktails) can represent a large share of total spend.',
      'In tourist zones, similar menus can cost much more than a few streets away.'
    ],
    supermarketTitle: 'Supermarket in 2026: indicative prices for a basic grocery basket',
    supermarketIntro:
      'If you want better budget control, mixing restaurants with supermarket shopping works very well, especially for longer stays.',
    supermarketItems: [
      'Milk 1 l: approx. EUR 1.10-1.50',
      'Bread 500 g: approx. EUR 1.50-3.00',
      'Eggs (12): approx. EUR 2.80-4.20',
      'Chicken breast 1 kg: approx. EUR 8.50-13.50',
      'Tomatoes 1 kg: approx. EUR 1.80-3.80',
      'Water 1.5 l (store price): approx. EUR 0.30-0.90'
    ],
    supermarketNote:
      'Values are based on indicative consumer data (Numbeo, March 2026 snapshot) and can vary by chain and region.',
    partnerMid: {
      title: 'Want food, stay, and activities aligned in one plan?',
      text: 'Choose accommodation by location and add local experiences smartly.',
      booking: 'Find Accommodation',
      gyg: 'Find Food & Local Activities'
    },
    hiddenTitle: 'Hidden costs travelers often overlook',
    hidden: [
      'Coperto or service charge in some venues.',
      'Price differences between bar counter service and table service.',
      'Drinks and desserts increasing the final bill more than expected.',
      'Tourist tax at accommodation level, indirectly affecting daily food budget.'
    ],
    saveTitle: 'How to eat well in Italy and still stay budget-aware',
    save: [
      'Prefer places slightly outside the main tourist streets.',
      'Use weekday lunch menus when available.',
      'Combine restaurant meals with supermarket shopping.',
      'For coffee, bar counter service is usually cheaper.',
      'Book popular places in advance to avoid expensive last-minute options.'
    ],
    sourcesTitle: 'Sources Used',
    sources: [
      'ISTAT (Mar 2026): Consumer Prices - February 2026.',
      'Eurostat (Mar 2026): record EU tourism nights in 2025.',
      'Numbeo (Mar 2026 snapshot): Cost of Living in Italy - restaurant and grocery benchmarks.',
      'ISTAT: tourism flows 2024 and Q4 2025 demand context.'
    ],
    bridge: {
      title: 'Did a region in Italy interest you beyond a short trip?',
      text: 'Many Czech travelers first connect with Italy through food, travel rhythm, and regional lifestyle.',
      button: 'Explore Italian Regions'
    },
    conclusionTitle: 'Conclusion',
    conclusion: [
      'Food costs in Italy in 2026 can stay manageable if you plan by location and travel style.',
      'The biggest difference usually comes from venue choice, budget discipline, and mixing restaurants with groceries.',
      'That way, you can eat authentically and well without unnecessary overspending.'
    ]
  },
  it: {
    navGuide: 'Guida all’Italia',
    navArticles: 'Articoli',
    badge: 'Guida all’Italia',
    title: 'Quanto costa mangiare in Italia nel 2026? Prezzi reali di ristoranti, pizzerie e supermercati',
    readTime: '11 min',
    intro: [
      'Nel 2026 la spesa per mangiare in Italia cambia molto in base a regione, stagione e tipo di locale.',
      'I prezzi nel centro storico di Roma, Milano o Venezia non sono gli stessi delle città minori o delle zone meno turistiche.',
      'In questa guida trovi un quadro pratico e credibile dei costi di ristoranti, pizzerie e supermercati, pensato per viaggiatori cechi.'
    ],
    partnerTop: {
      title: 'Pianifica in anticipo alloggio ed esperienze',
      text: 'Il miglior rapporto qualità/prezzo arriva spesso con prenotazione anticipata.',
      booking: 'Trova alloggio (Booking.com)',
      gyg: 'Trova attività (GetYourGuide)'
    },
    quickTitle: 'Panoramica rapida prezzi cibo in Italia (2026)',
    quickNote:
      'Intervalli orientativi per viaggi standard. I prezzi reali dipendono da zona, stagione, orario e posizionamento del locale.',
    quickItems: [
      {
        label: 'Pasto in ristorante economico',
        value: 'circa 12-22 EUR / persona',
        note: 'Nelle aree turistiche principali è più frequente la fascia alta.'
      },
      {
        label: 'Cena per 2 in ristorante medio (3 portate)',
        value: 'circa 50-95 EUR / 2 persone',
        note: 'Numbeo indica un valore orientativo centrale vicino a 70 EUR.'
      },
      {
        label: 'Pizza Margherita in pizzeria',
        value: 'circa 7-14 EUR',
        note: 'Nelle location premium o con ingredienti speciali i prezzi possono salire.'
      },
      {
        label: 'Espresso al banco',
        value: 'circa 1,20-1,80 EUR',
        note: 'Al tavolo il prezzo è spesso più alto rispetto al banco.'
      },
      {
        label: 'Cappuccino',
        value: 'circa 1,50-2,50 EUR',
        note: 'Numbeo indica una media orientativa vicino a 1,74 EUR.'
      }
    ],
    restaurantsTitle: 'Ristoranti e pizzerie: dove si spende più del necessario',
    restaurantsIntro:
      'Il problema raramente è il singolo piatto. Le spese extra nascono più spesso da posizione, supplementi e scelte di timing.',
    restaurants: [
      'Centri storici e vie ad altissimo passaggio hanno spesso un premium di prezzo rilevante.',
      'Nel conto possono comparire coperto e, in alcuni casi, servizio.',
      'Le bevande incidono molto sul totale finale.',
      'Nelle aree turistiche, menu simili possono costare molto di più rispetto a zone vicine.'
    ],
    supermarketTitle: 'Supermercato nel 2026: prezzi orientativi per una spesa base',
    supermarketIntro:
      'Per tenere sotto controllo il budget, la combinazione ristorante + supermercato funziona molto bene, soprattutto nei soggiorni più lunghi.',
    supermarketItems: [
      'Latte 1 l: circa 1,10-1,50 EUR',
      'Pane 500 g: circa 1,50-3,00 EUR',
      'Uova (12): circa 2,80-4,20 EUR',
      'Petto di pollo 1 kg: circa 8,50-13,50 EUR',
      'Pomodori 1 kg: circa 1,80-3,80 EUR',
      'Acqua 1,5 l (prezzo supermercato): circa 0,30-0,90 EUR'
    ],
    supermarketNote:
      'Valori basati su benchmark orientativi (Numbeo, snapshot marzo 2026); possono variare per insegna e area.',
    partnerMid: {
      title: 'Vuoi coordinare cibo, alloggio e attività in modo semplice?',
      text: 'Scegli la base giusta e aggiungi esperienze locali senza perdere controllo del budget.',
      booking: 'Trova alloggio',
      gyg: 'Trova attività locali e food'
    },
    hiddenTitle: 'Costi nascosti che spesso sfuggono',
    hidden: [
      'Coperto o servizio in alcuni locali.',
      'Differenza di prezzo tra consumazione al banco e servizio al tavolo.',
      'Bevande e dessert che fanno salire il conto più del previsto.',
      'Tassa di soggiorno sull’alloggio, che incide indirettamente sul budget giornaliero.'
    ],
    saveTitle: 'Come mangiare bene in Italia senza rinunciare al controllo costi',
    save: [
      'Preferisci locali leggermente fuori dai flussi turistici principali.',
      'Sfrutta i menu pranzo nei giorni feriali quando disponibili.',
      'Alterna ristoranti e spesa al supermercato.',
      'Per il caffè, il banco è spesso la scelta più conveniente.',
      'Prenota i locali più richiesti per evitare scelte last minute più costose.'
    ],
    sourcesTitle: 'Fonti utilizzate',
    sources: [
      'ISTAT (marzo 2026): Prezzi al consumo - febbraio 2026.',
      'Eurostat (marzo 2026): record pernottamenti turistici UE nel 2025.',
      'Numbeo (snapshot marzo 2026): Cost of Living in Italy - benchmark ristorazione e spesa.',
      'ISTAT: flussi turistici 2024 e IV trimestre 2025 (contesto domanda turistica).'
    ],
    bridge: {
      title: 'Ti ha colpito una zona d’Italia più di una semplice vacanza?',
      text: 'Molti cechi iniziano dall’esperienza gastronomica e dal viaggio, poi approfondiscono i singoli territori.',
      button: 'Scopri le regioni d’Italia'
    },
    conclusionTitle: 'Conclusione',
    conclusion: [
      'Nel 2026 mangiare bene in Italia può restare gestibile se pianifichi in base alla località e allo stile di viaggio.',
      'La differenza principale la fanno scelta dei locali, gestione del budget e combinazione ristoranti + supermercato.',
      'Così puoi vivere un’esperienza autentica, con qualità alta e senza spese superflue.'
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

export default function FoodCostsItaly2026Page() {
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
  const articleImage =
    language === 'cs'
      ? {
          src: '/Sicilia.jpg',
          alt: 'Jidlo v Italii a mistni restaurace',
          caption: 'Nejlepsi ceny jidla obvykle najdete mimo hlavni turisticke zony a pri kombinaci supermarketu s lokalnimi podniky.'
        }
      : language === 'it'
        ? {
            src: '/Sicilia.jpg',
            alt: 'Cibo in Italia tra ristoranti e mercati locali',
            caption: 'I prezzi migliori si trovano spesso fuori dalle aree piu turistiche, alternando supermercati e locali del posto.'
          }
        : {
            src: '/Sicilia.jpg',
            alt: 'Food costs in Italy in local areas',
            caption: 'The best food prices are often found outside the busiest tourist zones by mixing supermarkets with local spots.'
          }

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
                <Euro className="h-3.5 w-3.5" />
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

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
              <img src={articleImage.src} alt={articleImage.alt} className="w-full h-64 md:h-80 object-cover" loading="lazy" />
              <p className="text-sm text-slate-600 px-4 py-3">{articleImage.caption}</p>
            </div>

            <TravelPartnerCta
              title={t.partnerTop.title}
              text={t.partnerTop.text}
              bookingLabel={t.partnerTop.booking}
              gygLabel={t.partnerTop.gyg}
            />

            <Card className="bg-white border border-slate-200">
              <CardHeader>
                <CardTitle className="text-2xl">{t.quickTitle}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-500">{t.quickNote}</p>
                <div className="space-y-3">
                  {t.quickItems.map((item) => (
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
                <CardTitle className="text-2xl">{t.restaurantsTitle}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 leading-relaxed mb-4">{t.restaurantsIntro}</p>
                <ul className="list-disc pl-6 space-y-2 text-slate-700">
                  {t.restaurants.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white border border-slate-200">
              <CardHeader>
                <CardTitle className="text-2xl">{t.supermarketTitle}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 leading-relaxed mb-4">{t.supermarketIntro}</p>
                <ul className="list-disc pl-6 space-y-2 text-slate-700 mb-4">
                  {t.supermarketItems.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
                <p className="text-sm text-slate-500">{t.supermarketNote}</p>
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
                <CardTitle className="text-2xl">{t.hiddenTitle}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-6 space-y-2 text-slate-700">
                  {t.hidden.map((line) => (
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

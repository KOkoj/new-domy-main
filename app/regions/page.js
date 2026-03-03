'use client'

import { useState, useEffect } from 'react'
import { MapPin, TrendingUp, Home, ChevronRight, Star, CheckCircle, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { REGION_DATA_OVERRIDES } from './regionContent'

const SAMPLE_REGIONS = [
  {
    _id: '1',
    name: {
      en: 'Tuscany - tradition, prestige and rental income',
      it: 'Toscana - tradizione, prestigio e reddito da affitto',
      cs: 'Toskansko - tradice, prestiz a prijem z pronajmu'
    },
    slug: { current: 'toscana' },
    country: 'Italy',
    description: {
      en: 'Iconic region for foreign buyers. Higher prices than the south, but a strong rental market and stable long-term value.',
      it: 'Regione iconica per acquirenti stranieri. Prezzi piu alti rispetto al sud, ma forte mercato affitti e valore stabile nel tempo.',
      cs: 'Ikonicky region pro zahraničně kupujíc?. Vyssi ceny nez na jihu, ale silny trh kratkodobych pronajmu a stabilni hodnota v case.'
    },
    image: '/Toscana.png',
    propertyCount: 1250,
    averagePrice: 850000,
    priceRange: { min: 200000, max: 5000000 },
    topCities: ['Florence', 'Siena', 'Pisa', 'Lucca', 'Arezzo'],
    highlights: ['Wine regions', 'Historic cities', 'Art & culture', 'Countryside villas'],
    popularity: 5
  },
  {
    _id: '2', 
    name: { en: 'Lombardy', it: 'Lombardia', cs: 'Lombardie' },
    slug: { current: 'lombardy' },
    country: 'Italy',
    description: { 
      en: 'Economic powerhouse of Italy with Milan as its capital. Modern properties, business opportunities, and alpine retreats.',
      it: 'Potenza economica d\'Italia con Milano come capitale.',
      cs: 'Ekonomicka mocnost Itálie s Milanem jako hlavnim mestem.'
    },
    image: '/Lombardia.jpg',
    propertyCount: 2100,
    averagePrice: 1200000,
    priceRange: { min: 180000, max: 2500000 },
    priceNotes: {
      en: [
        '\u20AC180,000 - \u20AC2,500,000',
        '- Milan city: often \u20AC350k-\u20AC1.5M+',
        '- Lake Como: often above \u20AC1M',
        '- Luxury properties: \u20AC2M-\u20AC5M+'
      ],
      it: [
        '\u20AC180,000 - \u20AC2,500,000',
        '- Milano citta: spesso 350k-1.5M+',
        '- Lago di Como: facilmente oltre 1M',
        '- Immobili luxury: 2-5M+'
      ],
      cs: [
        '\u20AC180,000 - \u20AC2,500,000',
        '- Mesto Milan: ?asto \u20AC350k-\u20AC1.5M+',
        '- Lago di Como: bě?ně nad \u20AC1M',
        '- Luxusni nemovitosti: \u20AC2M-\u20AC5M+'
      ]
    },
    warning: {
      en: 'In Lombardy, choosing the micro-area is decisive. Coordinating technical and legal checks before making an offer is essential.',
      it: 'In Lombardia la scelta della micro-zona e decisiva. Coordinare verifiche tecniche e legali prima dell\'offerta e fondamentale.',
      cs: 'V Lombardii je volba mikro-lokality rozhodující. Koordinace technických a právních kontrol před podáním nabídky je zásadní.'
    },
    topCities: ['Milan', 'Bergamo', 'Brescia', 'Como'],
    highlights: ['Business hub', 'Modern apartments', 'Lake properties', 'Alps access'],
    popularity: 5
  },
  {
    _id: '3',
    name: { en: 'Veneto', it: 'Veneto', cs: 'Veneto' },
    slug: { current: 'veneto' },
    country: 'Italy',
    description: { 
      en: 'Home to Venice, Verona, and Lake Garda. Rich history, romantic cities, and diverse landscapes from mountains to coast.',
      it: 'Casa di Venezia, Verona e del Lago di Garda. Storia ricca, citta romantiche e paesaggi diversi.',
      cs: 'Domov Benátek, Verony a Lago di Garda s bohatou historii.'
    },
    image: '/Veneto.webp',
    propertyCount: 520,
    averagePrice: 680000,
    priceRange: { min: 200000, max: 4000000 },
    topCities: ['Venice', 'Verona', 'Padua', 'Vicenza'],
    highlights: ['Romantic cities', 'Lake Garda', 'Rich history', 'Diverse landscapes'],
    popularity: 5
  },
  {
    _id: '4',
    name: { en: 'Lazio', it: 'Lazio', cs: 'Lazio' },
    slug: { current: 'lazio' },
    country: 'Italy',
    description: { 
      en: 'Home to Rome, the Eternal City. Rich history, ancient monuments, and vibrant modern life in Italy\'s capital region.',
      it: 'Casa di Roma, la Citta Eterna. Storia ricca, monumenti antichi e vita moderna vibrante.',
      cs: 'Domov Rima, vecneho města, s bohatou historii a antickymi pamatkami.'
    },
    image: '/Lazio.webp',
    propertyCount: 680,
    averagePrice: 750000,
    priceRange: { min: 250000, max: 5000000 },
    topCities: ['Rome', 'Viterbo', 'Latina', 'Frosinone'],
    highlights: ['Ancient history', 'Capital city', 'Cultural sites', 'Modern amenities'],
    popularity: 5
  },
  {
    _id: '5',
    name: { en: 'Sicily', it: 'Sicilia', cs: 'Sicilie' },
    slug: { current: 'sicilia' },
    country: 'Italy',
    description: { 
      en: 'Italy\'s largest island offering diverse landscapes from beaches to mountains, rich history, and excellent value properties.',
      it: 'La piu grande isola d\'Italia che offre paesaggi diversi dalle spiagge alle montagne.',
      cs: 'Nejvetsi ostrov Itálie nabizejici rozmanite krajiny od plazi po hory.'
    },
    image: '/Sicilia.jpg',
    propertyCount: 890,
    averagePrice: 420000,
    priceRange: { min: 80000, max: 3000000 },
    topCities: ['Palermo', 'Catania', 'Taormina', 'Syracuse'],
    highlights: ['Affordable prices', 'Beach properties', 'Historic sites', 'Island lifestyle'],
    popularity: 4
  },
  {
    _id: '6',
    name: { en: 'Liguria', it: 'Liguria', cs: 'Ligurie' },
    slug: { current: 'liguria' },
    country: 'Italy',
    description: { 
      en: 'Italian Riviera with Cinque Terre, coastal charm, and colorful seaside villages. Perfect for coastal living enthusiasts.',
      it: 'Riviera italiana con le Cinque Terre, fascino costiero e villaggi colorati.',
      cs: 'Italská riviéra s Cinque Terre, pobřežní kouzlo a barevné přímořské vesnice.'
    },
    image: '/Liguria.webp',
    propertyCount: 420,
    averagePrice: 950000,
    priceRange: { min: 250000, max: 4500000 },
    topCities: ['Genoa', 'Portofino', 'Cinque Terre', 'Sanremo'],
    highlights: ['Coastal living', 'Cinque Terre', 'Seaside villas', 'Italian Riviera'],
    popularity: 4
  },
  {
    _id: '7',
    name: { en: 'Campania', it: 'Campania', cs: 'Kampanie' },
    slug: { current: 'campania' },
    country: 'Italy',
    description: { 
      en: 'Home to Naples, Pompeii, and the Amalfi Coast. Rich history, vibrant culture, and stunning coastal beauty.',
      it: 'Casa di Napoli, Pompei e la Costiera Amalfitana. Storia ricca, cultura vibrante e bellezza costiera mozzafiato.',
      cs: 'Domov Neapole, Pompejí a Amalfského pobřeží s bohatou historií.'
    },
    image: '/campania.avif',
    propertyCount: 450,
    averagePrice: 680000,
    priceRange: { min: 200000, max: 4000000 },
    topCities: ['Naples', 'Salerno', 'Caserta', 'Avellino'],
    highlights: ['Historic sites', 'Coastal beauty', 'Vibrant culture', 'UNESCO heritage'],
    popularity: 4
  },
  {
    _id: '8',
    name: { en: 'Piedmont', it: 'Piemonte', cs: 'Piemont' },
    slug: { current: 'piemonte' },
    country: 'Italy',
    description: { 
      en: 'Alpine beauty, world-class wines, and elegant cities. Home to Turin and the Langhe wine region.',
      it: 'Bellezza alpina, vini di classe mondiale e citta eleganti.',
      cs: 'Alpska krasa, vina svetove urovne a elegantni města.'
    },
    image: '/Piemonte.jpg',
    propertyCount: 320,
    averagePrice: 580000,
    priceRange: { min: 200000, max: 3000000 },
    topCities: ['Turin', 'Alessandria', 'Asti', 'Cuneo'],
    highlights: ['Alpine beauty', 'Wine regions', 'Elegant cities', 'Cultural heritage'],
    popularity: 4
  },
  {
    _id: '9',
    name: { en: 'Sardinia', it: 'Sardegna', cs: 'Sardinie' },
    slug: { current: 'sardegna' },
    country: 'Italy',
    description: { 
      en: 'Mediterranean island paradise with pristine beaches, ancient nuraghe towers, and unique culture.',
      it: 'Paradiso dell\'isola mediterranea con spiagge incontaminate e torri nuragiche antiche.',
      cs: 'Stredomorsky ostrovni raj s nedotcenymi plazemi a prastarymi nuragskymi vezemi.'
    },
    image: '/Sardegna.jpg',
    propertyCount: 340,
    averagePrice: 480000,
    priceRange: { min: 150000, max: 2500000 },
    topCities: ['Cagliari', 'Sassari', 'Olbia', 'Alghero'],
    highlights: ['Pristine beaches', 'Ancient towers', 'Island culture', 'Mediterranean paradise'],
    popularity: 4
  },
  {
    _id: '10',
    name: { en: 'Emilia-Romagna', it: 'Emilia-Romagna', cs: 'Emilia-Romagna' },
    slug: { current: 'emilia-romagna' },
    country: 'Italy',
    description: { 
      en: 'Culinary capital of Italy with Bologna, Parma, and Modena. Rich food culture, historic cities, and excellent quality of life.',
      it: 'Capitale culinaria d\'Italia con Bologna, Parma e Modena. Ricca cultura alimentare e qualita di vita eccellente.',
      cs: 'Kulinarske hlavni město Itálie s bohatou potravinovou kulturou.'
    },
    image: '/Emilia-Romagna.jpg',
    propertyCount: 380,
    averagePrice: 520000,
    priceRange: { min: 180000, max: 2500000 },
    topCities: ['Bologna', 'Parma', 'Modena', 'Ravenna'],
    highlights: ['Food culture', 'Historic cities', 'Quality of life', 'Economic stability'],
    popularity: 4
  },
  {
    _id: '11',
    name: { en: 'Puglia', it: 'Puglia', cs: 'Puglia' },
    slug: { current: 'puglia' },
    country: 'Italy',
    description: { 
      en: 'Heel of Italy with whitewashed trulli houses, olive groves, and stunning Adriatic coastline. Authentic southern charm.',
      it: 'Tallone d\'Italia con trulli imbiancati, uliveti e costa adriatica mozzafiato.',
      cs: 'Pata Itálie s bilymi trulli domy a uchvatnym Jadranskym pobrezim.'
    },
    image: '/Puglia.webp',
    propertyCount: 280,
    averagePrice: 350000,
    priceRange: { min: 100000, max: 2000000 },
    topCities: ['Bari', 'Lecce', 'Taranto', 'Foggia'],
    highlights: ['Trulli houses', 'Olive groves', 'Adriatic coast', 'Southern charm'],
    popularity: 4
  },
  {
    _id: '12',
    name: { en: 'Umbria', it: 'Umbria', cs: 'Umbrie' },
    slug: { current: 'umbria' },
    country: 'Italy',
    description: { 
      en: 'Green heart of Italy with medieval hill towns, spiritual heritage, and peaceful countryside. Perfect for authentic Italian living.',
      it: 'Cuore verde d\'Italia con borghi medievali, patrimonio spirituale e campagna pacifica.',
      cs: 'Zelene srdce Itálie se stredovekymi mestecky a klidnym venkovem.'
    },
    image: '/Umbria.webp',
    propertyCount: 165,
    averagePrice: 420000,
    priceRange: { min: 150000, max: 1800000 },
    topCities: ['Perugia', 'Assisi', 'Terni', 'Spoleto'],
    highlights: ['Hill towns', 'Spiritual heritage', 'Green landscapes', 'Peaceful living'],
    popularity: 3
  },
  {
    _id: '13',
    name: { en: 'Friuli Venezia Giulia', it: 'Friuli Venezia Giulia', cs: 'Friuli Venezia Giulia' },
    slug: { current: 'friuli-venezia-giulia' },
    country: 'Italy',
    description: { 
      en: 'Where the Alps meet the Adriatic - close to Austria and Slovenia. Excellent accessibility from Czech Republic with diverse landscapes.',
      it: 'Dove le Alpi incontrano l\'Adriatico - vicino ad Austria e Slovenia. Eccellente accessibilita dalla Repubblica Ceca.',
      cs: 'Kde se Alpy setkavaji s Jadranem - blizko Rakouska a Slovinska. Vynikajici dostupnost z CR.'
    },
    image: '/Friuli-Venezia Giulia.avif',
    propertyCount: 180,
    averagePrice: 280000,
    priceRange: { min: 50000, max: 500000 },
    topCities: ['Trieste', 'Udine', 'Gorizia', 'Pordenone'],
    highlights: ['Close to CZ', 'Alps & sea', 'Wine culture', 'Affordable'],
    popularity: 5
  },
  {
    _id: '14',
    name: { en: 'Calabria', it: 'Calabria', cs: 'Kalabrie' },
    slug: { current: 'calabria' },
    country: 'Italy',
    description: { 
      en: 'The toe of Italy\'s boot with stunning coastlines and remarkably affordable real estate. Beautiful beaches and authentic southern culture.',
      it: 'La punta dello stivale italiano con coste mozzafiato e immobili sorprendentemente accessibili.',
      cs: 'Spicka italské boty s uchvatnym pobrezim a pozoruhodne dostupnymi nemovitostmi.'
    },
    image: '/calabria.jpg',
    propertyCount: 220,
    averagePrice: 150000,
    priceRange: { min: 20000, max: 250000 },
    topCities: ['Tropea', 'Cosenza', 'Reggio Calabria', 'Catanzaro'],
    highlights: ['Very affordable', 'Beautiful coast', 'Mild winters', 'Authentic culture'],
    popularity: 4
  },
  {
    _id: '15',
    name: { en: 'Abruzzo', it: 'Abruzzo', cs: 'Abruzzo' },
    slug: { current: 'abruzzo' },
    country: 'Italy',
    description: { 
      en: 'The greenest region in Europe with national parks, mountains, and Adriatic coastline. Remarkably affordable property prices.',
      it: 'La regione piu verde d\'Europa con parchi nazionali, montagne e costa adriatica. Prezzi immobiliari sorprendentemente accessibili.',
      cs: 'Nejzelenejsi region Evropy s narodnimi parky, horami a jadranskym pobrezim. Pozoruhodne dostupné ceny nemovitosti.'
    },
    image: '/abruzzo.jpg',
    propertyCount: 150,
    averagePrice: 120000,
    priceRange: { min: 25000, max: 300000 },
    topCities: ['L\'Aquila', 'Pescara', 'Chieti', 'Teramo'],
    highlights: ['National parks', 'Very affordable', 'Mountains & sea', 'Quiet life'],
    popularity: 4
  },
  {
    _id: '16',
    name: { en: 'Trentino-Alto Adige', it: 'Trentino-Alto Adige', cs: 'Trentino-Alto Adige' },
    slug: { current: 'trentino-alto-adige' },
    country: 'Italy',
    description: { 
      en: 'Italian Alps at their finest - skiing, hiking, and year-round mountain activities. Austrian and Italian culture blend beautifully.',
      it: 'Le Alpi italiane al meglio - sci, escursionismo e attivita montane tutto l anno. Cultura austriaca e italiana si fondono splendidamente.',
      cs: 'Italske Alpy v nejlepsim - lyzovani, turistika a celoročně horske aktivity. Rakouska a italské kultura se krasne prolina.'
    },
    image: '/Trentino-Alto Adige.jpg',
    propertyCount: 240,
    averagePrice: 450000,
    priceRange: { min: 100000, max: 1500000 },
    topCities: ['Bolzano', 'Trento', 'Merano', 'Cortina'],
    highlights: ['Skiing & hiking', 'Year-round use', 'Alpine lifestyle', 'High quality of life'],
    popularity: 4
  }
]

const REGION_OVERRIDE_SLUGS = {
  lombardy: 'lombardia'
}

const REGION_CARD_WARNINGS = {
  toscana: {
    en: 'Historic and rural assets often need strict urban planning and technical checks before offer.',
    it: 'Immobili storici e rurali richiedono spesso verifiche urbanistiche e tecniche rigorose prima dell offerta.',
    cs: 'Historicke a venkovske nemovitosti ?asto vyzaduji prisnou urbanistickou i technickou kontrolu před nabídkou.'
  },
  lombardia: {
    en: 'Micro-location drives value in Lombardy: transport links, condo costs, and building condition are decisive.',
    it: 'In Lombardia il valore dipende dalla micro-zona: collegamenti, costi condominiali e stato tecnico sono decisivi.',
    cs: 'V Lombardii rozhoduje mikro-lokalita: dopravni dostupnost, naklady na kondominium a technicky stav.'
  },
  veneto: {
    en: 'In historic and lagoon-linked areas, flood exposure and local rental regulation must be checked early.',
    it: 'Nelle aree storiche e lagunari vanno verificati presto rischio acqua alta e regolamenti locali sugli affitti.',
    cs: 'V historickych a lagunovych oblastech je nutne vcas proverit riziko zaplav a mistni pravidla pronajmu.'
  },
  lazio: {
    en: 'Rome and provincial markets behave differently; old buildings require careful legal and condo due diligence.',
    it: 'Roma e province hanno dinamiche diverse; sugli edifici datati serve una due diligence legale e condominiale accurata.',
    cs: '?Řím a provincie maji odlisnou dynamiku; u starsich domu je nutna pecliva právně i kondominialni kontrola.'
  },
  sicilia: {
    en: 'Sicily is highly micro-market based: cadastral compliance and exact location matter more than island averages.',
    it: 'In Sicilia conta la micro-zona: conformita catastale e posizione precisa pesano piu delle medie regionali.',
    cs: 'Na Sicilii rozhoduje mikro-lokalita: katastrálně soulad a presna poloha jsou dulezitejsi nez regionalni prumery.'
  },
  liguria: {
    en: 'Sea-view premiums are high, but access, parking, and slope exposure can strongly impact usability and resale.',
    it: 'Le vista mare hanno premium elevato, ma accesso, parcheggio e pendenza incidono molto su uso e rivendita.',
    cs: 'Vyhled na moře ma vysoké premium, ale př?stup, parkovani a sklon terenu silne ovlivnuji uzivani i prodejnost.'
  },
  campania: {
    en: 'Neighborhood selection is critical: logistics, urban compliance, and rental rules vary sharply by municipality.',
    it: 'La scelta del quartiere e decisiva: logistica, conformita urbanistica e regole affitti cambiano molto per comune.',
    cs: 'Vyber ctvrti je klicovy: logistika, urbanisticka shoda i pravidla pronajmu se výrazně lisi podle obce.'
  },
  piemonte: {
    en: 'City and countryside profiles differ: check heating efficiency and legal status carefully in older rural stock.',
    it: 'Citta e campagna hanno profili diversi: su immobili rurali datati vanno verificati bene efficienza e stato legale.',
    cs: 'Mestske a venkovske trhy jsou odlisne: u starsich venkovskych nemovitosti proverujte efektivitu vytapeni i právně stav.'
  },
  'emilia-romagna': {
    en: 'Stable demand is a strength, but plain-area hydro risk and building efficiency checks remain essential.',
    it: 'La domanda stabile e un punto forte, ma restano essenziali verifiche su rischio idraulico ed efficienza edilizia.',
    cs: 'Stabilni poptavka je vyhoda, ale zasadni jsou kontroly hydraulickeho rizika a energeticke efektivity budov.'
  },
  puglia: {
    en: 'Trulli and masserie can require complex compliance checks; seasonal rental assumptions must be realistic.',
    it: 'Trulli e masserie possono richiedere controlli complessi di conformita; stime affitto stagionale vanno fatte con prudenza.',
    cs: 'Trulli a masserie mohou vyzadovat slozite kontroly souladu; odhady sezonniho pronajmu je treba nastavit realisticky.'
  },
  umbria: {
    en: 'Rural charm is strong, but resale timing can be longer and technical condition varies greatly by property.',
    it: 'Il fascino rurale e forte, ma i tempi di rivendita possono essere piu lunghi e le condizioni tecniche molto variabili.',
    cs: 'Venkovsky charakter je silny, ale doba dalsiho prodeje muze byt delsi a technicky stav se hodne lisi dum od domu.'
  },
  'friuli-venezia-giulia': {
    en: 'Border accessibility is excellent, but coastal weather exposure and micro-area dynamics must be assessed precisely.',
    it: 'L accessibilita di confine e ottima, ma esposizione climatica costiera e dinamiche di micro-zona vanno valutate con precisione.',
    cs: 'Hraniční dostupnost je výborná, ale klimatická expozice na pobřeží a mikro-lokální dynamika vyžadují přesné vyhodnocení.'
  },
  calabria: {
    en: 'Entry prices are attractive, but market liquidity is lower; budget for technical upgrades before purchase.',
    it: 'I prezzi d ingresso sono interessanti, ma la liquidita e inferiore; prevedete budget per adeguamenti tecnici.',
    cs: 'Vstupni ceny jsou atraktivni, ale likvidita trhu je nizsi; pocitejte s rozpoctem na technické upravy.'
  },
  abruzzo: {
    en: 'Great value profile, but seismic context and distance to services should be verified property by property.',
    it: 'Profilo prezzo/valore molto buono, ma contesto sismico e distanza dai servizi vanno verificati immobile per immobile.',
    cs: 'Pomerny vykon/cena je vyborny, ale seismicky kontext a vzdalenost sluzeb je nutne proverit u kazde nemovitosti.'
  },
  sardegna: {
    en: 'Seasonality, transport links, and management setup are key factors for both personal use and rental yield.',
    it: 'Stagionalita, collegamenti e modello di gestione sono fattori chiave sia per uso personale sia per rendimento.',
    cs: 'Sezonnost, dopravni spojeni a model spravy jsou klicove faktory pro vlastni uzivani i výnos z pronajmu.'
  },
  'trentino-alto-adige': {
    en: 'Mountain quality is high, but local rules, condo bylaws, and winter operating costs require careful planning.',
    it: 'La qualita montana e alta, ma regole locali, regolamenti condominiali e costi invernali richiedono pianificazione accurata.',
    cs: 'Horska kvalita je vysoké, ale mistni pravidla, kondominialni rad a zimni provozni naklady vyzaduji peclive planovani.'
  },
  'valle-d-aosta': {
    en: 'Inventory is limited in top resorts; technical checks and quick decision readiness are critical.',
    it: 'Nelle localita top lo stock e limitato: verifiche tecniche e rapidita decisionale sono fondamentali.',
    cs: 'V top strediscich je nabídka omezena; technické kontroly a rychla pripravenost rozhodnout jsou zasadni.'
  },
  'lago-di-garda': {
    en: 'Pricing changes sharply by shoreline micro-zone; verify local short-rental rules before committing.',
    it: 'I prezzi cambiano molto per micro-zona sul lago; verificate le regole locali sugli affitti brevi prima di impegnarvi.',
    cs: 'Ceny se silne lisi podle mikro-lokality u jezera; před zavazkem proverujte mistni pravidla kratkodobeho pronajmu.'
  },
  alpy: {
    en: 'Each valley has different demand and regulation; winter access and heating standards are central.',
    it: 'Ogni valle ha domanda e regole diverse; accessibilita invernale e standard di riscaldamento sono centrali.',
    cs: 'Kazde udoli ma jinou poptavku i pravidla; zimni dostupnost a standard vytapeni jsou klicove.'
  }
}

function getRegionOverrideSlug(slug = '') {
  if (!slug) return ''
  return REGION_OVERRIDE_SLUGS[slug] || slug
}

function RegionCard({ region, language = 'en' }) {
  const formatPrice = (price) => {
    if (typeof price !== 'number' || Number.isNaN(price)) {
      return 'N/A'
    }
    if (price >= 1000000) {
      const millions = price / 1000000
      return `\u20AC${millions.toFixed(millions % 1 === 0 ? 0 : 1)}M`
    } else if (price >= 1000) {
      const thousands = price / 1000
      return `\u20AC${thousands.toFixed(thousands % 1 === 0 ? 0 : 0)}k`
    }
    return `\u20AC${price.toLocaleString()}`
  }

  const formatPriceRange = (min, max) => {
    return `${formatPrice(min)} - ${formatPrice(max)}`
  }

  const renderStars = (popularity) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${
          i < popularity ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ))
  }

  const regionSlug = region.slug?.current || ''
  const overrideSlug = getRegionOverrideSlug(regionSlug)
  const overrideRegion = REGION_DATA_OVERRIDES?.[overrideSlug] || null
  const overridePriceNotesByLang = language === 'cs' ? null : overrideRegion?.priceNotes?.[language]
  const regionPriceNotesByLang = region.priceNotes?.[language]
  const noteCandidates =
    Array.isArray(overridePriceNotesByLang) && overridePriceNotesByLang.length > 0
      ? overridePriceNotesByLang
      : Array.isArray(regionPriceNotesByLang) && regionPriceNotesByLang.length > 0
        ? regionPriceNotesByLang
        : []
  const rangeLine = `${formatPriceRange(region.priceRange.min, region.priceRange.max)}`
  const noteDetails = noteCandidates.slice(0, 2)
  const priceLines = noteDetails.length === 2
    ? [rangeLine, ...noteDetails]
    : [
        rangeLine,
        language === 'cs'
          ? `Průměrná cena: ${formatPrice(region.averagePrice)}`
          : language === 'it'
            ? `Prezzo medio: ${formatPrice(region.averagePrice)}`
            : `Average price: ${formatPrice(region.averagePrice)}`
      ]
  const warningBySlug = REGION_CARD_WARNINGS[overrideSlug] || REGION_CARD_WARNINGS[regionSlug]
  const warningText = language === 'cs'
    ? 'Před podáním nabídky vždy proveďte technickou a právní due diligence.'
    : (region.warning?.[language] || warningBySlug?.[language] || (
        language === 'it'
          ? 'Prima di fare un\'offerta, eseguite sempre una due diligence tecnica e legale.'
          : 'Before making an offer, always complete technical and legal due diligence.'
      ))

  return (
    <Card className="group cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden border border-gray-200 shadow-lg bg-white rounded-2xl h-full flex flex-col">
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img 
          src={region.image} 
          alt={region.name[language]}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        
        {/* Popularity Stars */}
        <div className="absolute top-3 right-3 flex gap-0.5">
          {renderStars(region.popularity)}
        </div>
      </div>
      
      {/* Content */}
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-slate-700 transition-colors duration-300">
          {region.name[language]}
        </CardTitle>
        <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
          {region.description[language]}
        </p>
      </CardHeader>
      
      <CardContent className="flex-1 space-y-4">
        {/* Price Info */}
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">
              {language === 'cs' ? 'Orientační ceny:' :
               language === 'it' ? 'Prezzi indicativi:' :
               'Indicative prices:'}
            </h4>
            <div className="space-y-1">
              {priceLines.map((line, index) => (
                <p key={index} className="text-sm text-gray-600">
                  {line}
                </p>
              ))}
            </div>
          </div>
        </div>
        
        {/* Top Cities */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            {language === 'cs' ? 'Hlavn\u00ed m\u011bsta' :
             language === 'it' ? 'Citta principali' :
             'Main Cities'}
          </h4>
          <div className="flex flex-wrap gap-1">
            {region.topCities.slice(0, 5).map((city, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="text-xs px-2 py-0.5 bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
              >
                {city}
              </Badge>
            ))}
          </div>
        </div>
        
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
          <p className="text-sm text-amber-900">
            <strong>{language === 'cs' ? 'Pozor:' : language === 'it' ? 'Attenzione:' : 'Attention:'}</strong>{' '}
            {warningText}
          </p>
        </div>
      </CardContent>
      
      <CardFooter className="pt-0 flex flex-col gap-2">
        {(() => {
          const regionDetailSlugs = {
            'lombardy': 'lombardia',
            'friuli-venezia-giulia': 'friuli-venezia-giulia',
            'puglia': 'puglia',
            'calabria': 'calabria',
            'sicilia': 'sicilia',
            'toscana': 'toscana',
            'liguria': 'liguria',
            'veneto': 'veneto',
            'lazio': 'lazio',
            'campania': 'campania',
            'piemonte': 'piemonte',
            'emilia-romagna': 'emilia-romagna',
            'umbria': 'umbria',
            'sardegna': 'sardegna',
            'abruzzo': 'abruzzo',
            'trentino-alto-adige': 'trentino-alto-adige',
            'valle-d-aosta': 'valle-d-aosta'
          }
          const detailSlug = regionDetailSlugs[region.slug.current] || region.slug.current
          return (
            <Link href={`/regions/${detailSlug}`} className="w-full">
              <Button 
                variant="outline"
                className="w-full border-2 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 font-semibold py-3 transition-all duration-300 hover:scale-105"
              >
                {language === 'cs' ? 'Podrobn\u00fd pr\u016fvodce' :
                 language === 'it' ? 'Guida dettagliata' : 
                 'Detailed Guide'}
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          )
        })()}
        <Button
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-semibold py-3 transition-all duration-300 hover:scale-105"
          onClick={() => window.open('https://wa.me/420731450001', '_blank')}
        >
          {language === 'cs' ? 'Mluvte s námi' :
           language === 'it' ? 'Parla con noi' :
           'Talk to Us'}
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
        <Link 
          href={`/properties?region=${region.slug.current}`} 
          className="w-full"
          onClick={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
          }}
        >
          <Button 
            className="w-full bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white font-semibold py-3 transition-all duration-300 hover:scale-105"
          >
            {language === 'cs' ? 'Zobrazit nemovitosti' : 
             language === 'it' ? 'Visualizza proprieta' :
             'View Properties'}
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}

export default function RegionsPage() {
  const [language, setLanguage] = useState('en')
  const [regionsData, setRegionsData] = useState(SAMPLE_REGIONS)

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

  useEffect(() => {
    let active = true

    const normalizeRegion = (region, index) => ({
      _id: region._id || `region-${index + 1}`,
      name: {
        en: region.name?.en || '',
        cs: region.name?.cs || '',
        it: region.name?.it || ''
      },
      slug: {
        _type: 'slug',
        current: region.slug?.current || `region-${index + 1}`
      },
      country: region.country || 'Italy',
      description: {
        en: region.description?.en || '',
        cs: region.description?.cs || '',
        it: region.description?.it || ''
      },
      image: region.image || '/Toscana.png',
      propertyCount: Number(region.propertyCount || 0),
      averagePrice: Number(region.averagePrice || 0),
      priceRange: {
        min: Number(region.priceRange?.min || 0),
        max: Number(region.priceRange?.max || 0)
      },
      topCities: Array.isArray(region.topCities) ? region.topCities : [],
      highlights: Array.isArray(region.highlights) ? region.highlights : [],
      popularity: Number(region.popularity || 0),
      priceNotes: region.priceNotes || null,
      warning: region.warning || null
    })

    const loadRegions = async () => {
      try {
        const response = await fetch('/api/content?type=regions', { cache: 'no-store' })
        const result = await response.json()

        if (!active) return

        if (response.ok && Array.isArray(result.regions) && result.regions.length > 0) {
          setRegionsData(result.regions.map(normalizeRegion))
        }
      } catch (error) {
        console.error('Failed to load regions content:', error)
      }
    }

    loadRegions()

    return () => {
      active = false
    }
  }, [])

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <Navigation />

      <div className="pt-32 pb-12">
        <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm mb-8">
          <div className="container mx-auto px-4 py-12">
            <div className="text-center">
              

<h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent px-2">
  {language === 'cs' ? 'Koup\u011b domu v It\u00e1lii: kter\u00fd region zvolit?' :
   language === 'it' ? 'Comprare casa in Italia: quale regione scegliere?' :
   'Buying a House in Italy: Which Region Should You Choose?'}
</h1>
<p className="text-lg md:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed whitespace-pre-line px-4">
  {language === 'cs' ? 'It\u00e1lie nab\u00edz\u00ed 20 velmi odli\u0161n\u00fdch region\u016f: mo\u0159e, hory, historick\u00e1 m\u011bsta, venkovsk\u00e9 oblasti a z\u00f3ny s vysok\u00fdm investi\u010dn\u00edm potenci\u00e1lem.\nV\u00fdb\u011br spr\u00e1vn\u00e9ho regionu je \u010dasto d\u016fle\u017eit\u011bj\u0161\u00ed ne\u017e samotn\u00fd d\u016fm.\nKa\u017ed\u00e1 oblast m\u00e1 odli\u0161n\u00e1 pravidla, ceny, zdan\u011bn\u00ed a dynamiku trhu.' :
   language === 'it' ? 'L\'Italia offre 20 regioni molto diverse tra loro: mare, montagna, citta storiche, aree rurali e zone ad alto potenziale d\'investimento.\nScegliere la regione giusta e spesso piu importante della casa stessa.\nOgni area ha regole, prezzi, fiscalita e dinamiche di mercato differenti.' :
   'Italy offers 20 very different regions: sea, mountains, historic cities, rural areas and zones with high investment potential.\nChoosing the right region is often more important than the house itself.\nEach area has different rules, prices, taxation and market dynamics.'}
</p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4">
          <h2 className="text-lg md:text-xl font-semibold text-blue-600/80 mb-6 text-center">
            {language === 'cs' ? 'Koup\u011b domu v It\u00e1lii - Ceny, regiony a dostupn\u00e9 nemovitosti' :
             language === 'it' ? 'Comprare casa in Italia - Prezzi, regioni e immobili disponibili' :
             'Buying a House in Italy - Prices, Regions, and Available Properties'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <Card className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
              <CardContent className="p-6 text-center">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-700 to-slate-600 bg-clip-text text-transparent mb-2">20</div>
                <div className="text-xs md:text-sm text-blue-600/80 font-medium">
                  {language === 'cs' ? 'Italsk? regiony' : language === 'it' ? 'Regioni italiane' : 'Italian regions'}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
              <CardContent className="p-6 text-center">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-700 to-slate-600 bg-clip-text text-transparent mb-2">
                  {language === 'cs' ? '\u20AC2 150 / m\u00B2' : language === 'it' ? '\u20AC2.150 / m\u00B2' : '\u20AC2,150 / m\u00B2'}
                </div>
                <div className="text-xs md:text-sm text-blue-600/80 font-medium">
                  {language === 'cs' ? 'Pr\u016fm\u011brn\u00e1 n\u00e1rodn\u00ed cena' : language === 'it' ? 'Prezzo medio nazionale' : 'National average price'}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
              <CardContent className="p-6 text-center">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-700 to-slate-600 bg-clip-text text-transparent mb-2">
                  {language === 'cs' ? '\u20AC30 000+' : language === 'it' ? '\u20AC30.000+' : '\u20AC30,000+'}
                </div>
                <div className="text-xs md:text-sm text-blue-600/80 font-medium">
                  {language === 'cs' ? 'Reálná vstupní hranice' : language === 'it' ? 'Fascia di ingresso reale' : 'Real entry range'}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
              <CardContent className="p-6 text-center">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-700 to-slate-600 bg-clip-text text-transparent mb-2">
                  {language === 'cs' ? '+800 000' : language === 'it' ? '+800.000' : '+800,000'}
                </div>
                <div className="text-xs md:text-sm text-blue-600/80 font-medium">
                  {language === 'cs' ? 'Nemovitosti na italském trhu' : language === 'it' ? 'Immobili sul mercato italiano' : 'Properties on the Italian market'}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mb-12">
            <Card className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-xl rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-br from-slate-50 to-white border-b border-gray-100">
                <CardTitle className="text-2xl font-bold text-slate-800">
                  {language === 'cs' ? 'Jak si vybrat region v Itálii?' :
                   language === 'it' ? 'Come scegliere la regione giusta in Italia per comprare casa?' :
                   'How to Choose a Region in Italy?'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <p className="text-gray-600 mb-6 leading-relaxed whitespace-pre-line text-lg">
                  {language === 'cs' ? 'Při výběru lokality doporučujeme zvážit zejména:' :
                   language === 'it' ? 'La scelta della regione e una decisione strategica.\nNon tutte le zone sono adatte allo stesso obiettivo:\ncasa vacanze, investimento, trasferimento permanente o affitto turistico.' :
                   'When choosing a location, we recommend considering especially:'}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center"><MapPin className="h-5 w-5 text-slate-600" /></div>
                    <div><h4 className="font-semibold text-slate-800 mb-2">{language === 'cs' ? 'Bydlen\u00ed u mo\u0159e, v hor\u00e1ch nebo ve m\u011bst\u011b?' : language === 'it' ? 'Volete abitare al mare, in montagna o in citta?' : 'Do you want to live by the sea, in the mountains, or in the city?'}</h4></div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center"><Home className="h-5 w-5 text-slate-600" /></div>
                    <div><h4 className="font-semibold text-slate-800 mb-2">{language === 'cs' ? 'D\u016fm na dovolenou, investice, nebo nov\u00e1 \u017eivotn\u00ed etapa?' : language === 'it' ? 'Casa vacanze, investimento o nuova vita?' : 'Vacation home, investment, or a new life?'}</h4></div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center"><TrendingUp className="h-5 w-5 text-slate-600" /></div>
                    <div><h4 className="font-semibold text-slate-800 mb-2">{language === 'cs' ? 'Dostupnost z \u010cR a infrastruktura' : language === 'it' ? 'Accessibilita dalla Repubblica Ceca e infrastruttura locale' : 'Accessibility from the Czech Republic and local infrastructure'}</h4></div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center"><Star className="h-5 w-5 text-slate-600" /></div>
                    <div><h4 className="font-semibold text-slate-800 mb-2">{language === 'cs' ? 'Rozpo\u010det v\u010detn\u011b dan\u00ed a poplatk\u016f' : language === 'it' ? 'Budget con tasse e costi inclusi' : 'Budget including taxes and fees'}</h4></div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center"><CheckCircle className="h-5 w-5 text-slate-600" /></div>
                    <div><h4 className="font-semibold text-slate-800 mb-2">{language === 'cs' ? 'Vlastn\u00ed u\u017e\u00edv\u00e1n\u00ed nebo pron\u00e1jem' : language === 'it' ? 'Uso personale o affitto' : 'Personal use or rental income'}</h4></div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center"><Shield className="h-5 w-5 text-slate-600" /></div>
                    <div><h4 className="font-semibold text-slate-800 mb-2">{language === 'cs' ? 'Ka\u017ed\u00fd region m\u00e1 jin\u00e1 pravidla a \u017eivotn\u00ed styl' : language === 'it' ? 'Ogni regione ha regole e dinamiche diverse' : 'Each region has different legal and market dynamics'}</h4></div>
                  </div>
                </div>

                <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-xl">
                  <p className="text-blue-800 leading-relaxed whitespace-pre-line">
                    <strong>{language === 'cs' ? 'Nev\u00edte, kter\u00fd region vybrat?' : language === 'it' ? 'Non sapete quale regione scegliere?' : 'Not sure which region is most suitable for you?'}</strong>
                    <br />
                    {language === 'cs' ? 'Pom\u016f\u017eeme v\u00e1m analyzovat:\n\u2714 re\u00e1ln\u00fd rozpo\u010det\n\u2714 c\u00edl (dovolen\u00e1 / investice / stabiln\u00ed bydlen\u00ed)\n\u2714 m\u00edstn\u00ed dan\u011b\n\u2714 potenci\u00e1l pron\u00e1jmu\n\u2714 spr\u00e1vu na d\u00e1lku\n\nNapi\u0161te n\u00e1m na WhatsApp nebo si vy\u017e\u00e1dejte \u00fAvodn\u00ed konzultaci.' :
                     language === 'it' ? 'Vi aiutiamo ad analizzare:\n\u2714 budget reale\n\u2714 obiettivo (vacanza / investimento / vita stabile)\n\u2714 tassazione locale\n\u2714 potenziale affitto\n\u2714 gestione a distanza\n\nScriveteci su WhatsApp o richiedete una consulenza iniziale.' :
                     'We help you analyze:\n\u2714 real budget\n\u2714 goal (holiday / investment / stable living)\n\u2714 local taxation\n\u2714 rental potential\n\u2714 remote management\n\nMessage us on WhatsApp or request an initial consultation.'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
            {regionsData.map(region => (
              <RegionCard key={region._id} region={region} language={language} />
            ))}
          </div>

          <div className="text-center">
            <Card className="max-w-3xl mx-auto bg-white/90 backdrop-blur-sm border border-gray-200 shadow-xl rounded-2xl overflow-hidden">
              <CardContent className="p-12">
                <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  {language === 'cs' ? 'Chcete region nejdrive poznat osobne?' : language === 'it' ? 'Volete conoscere prima la regione di persona?' : 'Want to Get to Know the Region Personally First?'}
                </h3>
                <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                  {language === 'cs' ? 'Mnoho klientu před koupi region nejdrive navstivi osobne. Pro kratke pobyty muzete vyuzit Booking.com.' : language === 'it' ? "Molti clienti prima dell'acquisto visitano personalmente la regione. Per soggiorni brevi potete usare Booking.com." : 'Many clients visit the region in person before buying. For short stays, you can use Booking.com.'}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold px-8 py-6 text-base transition-all duration-300 hover:scale-105 shadow-lg"
                    onClick={() => window.open('https://www.dpbolvw.net/click-101629596-15735418', '_blank')}
                  >
                    {language === 'cs' ? 'Najit ubytovani (Booking.com)' : language === 'it' ? 'Trova alloggio (Booking.com)' : 'Find Accommodation (Booking.com)'}
                  </Button>
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white font-semibold px-8 py-6 text-base transition-all duration-300 hover:scale-105 shadow-lg"
                    onClick={() => window.open('https://gyg.me/O0X6ZC2R', '_blank')}
                  >
                    {language === 'cs' ? 'V\u00fdlety a pr\u016fvodce (GetYourGuide)' : language === 'it' ? 'Escursioni e guide (GetYourGuide)' : 'Tours & Guides (GetYourGuide)'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer language={language} />
    </div>
  )
}

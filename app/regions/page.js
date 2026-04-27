import RegionsListingClient from './RegionsListingClient'

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
      it: 'Regione iconica per acquirenti stranieri. Prezzi più alti rispetto al sud, ma forte mercato affitti e valore stabile nel tempo.',
      cs: 'Ikonicky region pro zahraničně kupujíc?. Vyssi ceny nez na jihu, ale silný trh kratkodobych pronajmu a stabilní hodnota v case.'
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
        '- Milano città: spesso 350k-1.5M+',
        '- Lago di Como: facilmente oltre 1M',
        '- Immobili luxury: 2-5M+'
      ],
      cs: [
        '\u20AC180,000 - \u20AC2,500,000',
        '- Mesto Milan: ?asto \u20AC350k-\u20AC1.5M+',
        '- Lago di Como: bě?ně nad \u20AC1M',
        '- Luxusni nemovitostí: \u20AC2M-\u20AC5M+'
      ]
    },
    warning: {
      en: 'In Lombardy, choosing the micro-area is decisive. Coordinating technical and legal checks before making an offer is essential.',
      it: "In Lombardia la scelta della micro-zona è decisiva. Coordinare verifiche tecniche e legali prima dell'offerta è fondamentale.",
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
      it: 'Casa di Venezia, Verona e del Lago di Garda. Storia ricca, città romantiche e paesaggi diversi.',
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
      it: 'Casa di Roma, la Città Eterna. Storia ricca, monumenti antichi e vita moderna vibrante.',
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
      it: "La più grande isola d'Italia che offre paesaggi diversi dalle spiagge alle montagne.",
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
      it: 'Bellezza alpina, vini di classe mondiale e città eleganti.',
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
      it: 'Capitale culinaria d\'Italia con Bologna, Parma e Modena. Ricca cultura alimentare e qualità di vita eccellente.',
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
      it: "Dove le Alpi incontrano l'Adriatico, vicino ad Austria e Slovenia. Eccellente accessibilità dalla Repubblica Ceca.",
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
      it: "La regione più verde d'Europa con parchi nazionali, montagne e costa adriatica. Prezzi immobiliari sorprendentemente accessibili.",
      cs: 'Nejzelenejsi region Evropy s narodnimi parky, horami a jadranskym pobrezim. Pozoruhodne dostupné ceny nemovitostí.'
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
      it: "Le Alpi italiane al meglio: sci, escursionismo e attività montane tutto l'anno. Cultura austriaca e italiana si fondono splendidamente.",
      cs: 'Italské Alpy v nejlepsim - lyzovani, turistika a celoročně horské aktivity. Rakouska a italské kultura se krasne prolina.'
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

const CLEAN_REGION_CARD_COPY = {
  toscana: {
    name: { cs: 'Toskánsko - tradice, prestiž a příjem z pronájmu' },
    description: {
      it: 'Regione iconica per acquirenti stranieri. Prezzi più alti rispetto al sud, ma forte mercato degli affitti e valore stabile nel tempo.',
      cs: 'Ikonický region pro zahraniční kupující. Vyšší ceny než na jihu, ale silný trh krátkodobých pronájmů a stabilní hodnota v čase.'
    }
  },
  lombardy: {
    description: {
      cs: 'Ekonomická mocnost Itálie s Milánem jako hlavním městem.'
    },
    priceNotes: {
      cs: [
        '€180,000 - €2,500,000',
        '- Město Milán: často €350k-€1.5M+',
        '- Lago di Como: běžně nad €1M',
        '- Luxusní nemovitostí: €2M-€5M+'
      ]
    },
    warning: {
      it: "In Lombardia la scelta della micro-zona è decisiva. Coordinare verifiche tecniche e legali prima dell'offerta è fondamentale.",
      cs: 'V Lombardii je volba mikro-lokality rozhodující. Koordinace technických a právních kontrol před podáním nabídky je zásadní.'
    }
  },
  veneto: {
    description: {
      it: 'Casa di Venezia, Verona e del Lago di Garda. Storia ricca, città romantiche e paesaggi molto diversi.',
      cs: 'Domov Benátek, Verony a Lago di Garda s bohatou historií.'
    }
  },
  lazio: {
    description: {
      it: 'Casa di Roma, la Città Eterna. Storia ricca, monumenti antichi e vita moderna vibrante.',
      cs: 'Domov Říma, věčného města, s bohatou historií a antickými památkami.'
    }
  },
  sicilia: {
    description: {
      it: "La più grande isola d'Italia, con paesaggi che vanno dalle spiagge alle montagne.",
      cs: 'Největší ostrov Itálie nabízející rozmanitou krajinu od pláží po hory.'
    }
  },
  liguria: {
    description: {
      cs: 'Italská riviéra s Cinque Terre, pobřežním kouzlem a barevnými přímořskými vesnicemi.'
    }
  },
  campania: {
    description: {
      cs: 'Domov Neapole, Pompejí a Amalfského pobřeží s bohatou historií.'
    }
  },
  piemonte: {
    description: {
      it: 'Bellezza alpina, vini di livello mondiale e città eleganti.',
      cs: 'Alpská krása, vína světové úrovně a elegantní města.'
    }
  },
  'emilia-romagna': {
    description: {
      it: "Capitale culinaria d'Italia con Bologna, Parma e Modena. Ricca cultura gastronomica e ottima qualità della vita.",
      cs: 'Kulinářské srdce Itálie s bohatou gastronomickou kulturou.'
    }
  },
  puglia: {
    description: {
      cs: 'Pata Itálie s bílými domy trulli, olivovníky a nádherným jadranským pobřežím.'
    }
  },
  umbria: {
    description: {
      cs: 'Zelené srdce Itálie se středověkými městečky a klidným venkovem.'
    }
  },
  'friuli-venezia-giulia': {
    description: {
      it: "Dove le Alpi incontrano l'Adriatico, vicino ad Austria e Slovenia. Eccellente accessibilità dalla Repubblica Ceca.",
      cs: 'Kde se Alpy setkávají s Jadranem, blízko Rakouska a Slovinska. Výborná dostupnost z ČR.'
    }
  },
  calabria: {
    description: {
      cs: 'Špička italské boty s nádherným pobřežím a pozoruhodně dostupnými nemovitostmi.'
    }
  },
  abruzzo: {
    description: {
      it: "La regione più verde d'Europa con parchi nazionali, montagne e costa adriatica. Prezzi immobiliari sorprendentemente accessibili.",
      cs: 'Nejzelenější region Evropy s národními parky, horami a jadranským pobřežím. Pozoruhodně dostupné ceny nemovitostí.'
    }
  },
  'trentino-alto-adige': {
    description: {
      it: 'Le Alpi italiane al meglio: sci, escursionismo e attività montane tutto l’anno. Cultura austriaca e italiana si fondono splendidamente.',
      cs: 'Italské Alpy v nejlepší podobě: lyžování, turistika a celoroční horské aktivity. Rakouská a italská kultura se krásně prolínají.'
    }
  }
}

const NORMALIZED_SAMPLE_REGIONS = SAMPLE_REGIONS.map((region) => {
  const slug = region.slug?.current
  const clean = CLEAN_REGION_CARD_COPY[slug]
  if (!clean) return region

  return {
    ...region,
    name: { ...region.name, ...(clean.name || {}) },
    description: { ...region.description, ...(clean.description || {}) },
    priceNotes: clean.priceNotes ? { ...region.priceNotes, ...clean.priceNotes } : region.priceNotes,
    warning: clean.warning ? { ...region.warning, ...clean.warning } : region.warning
  }
})

export default function RegionsPage() {
  return <RegionsListingClient initialRegions={NORMALIZED_SAMPLE_REGIONS} />
}

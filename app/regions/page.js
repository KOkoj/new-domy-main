'use client'

import { useState, useEffect } from 'react'
import { MapPin, TrendingUp, Home, ChevronRight, Star, CheckCircle, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

const SAMPLE_REGIONS = [
  {
    _id: '1',
    name: { en: 'Tuscany', it: 'Toscana', cs: 'Toskánsko' },
    slug: { current: 'toscana' },
    country: 'Italy',
    description: { 
      en: 'Rolling hills, medieval towns, and world-class wines define this iconic Italian region. Home to Florence, Siena, and countless vineyards.',
      it: 'Colline ondulate, città medievali e vini di classe mondiale definiscono questa iconica regione italiana.',
      cs: 'Zvlněné kopce, středověká města a vína světové úrovně definují tuto ikonickou italskou oblast.'
    },
    image: '/Toscana.png',
    propertyCount: 1250,
    averagePrice: 850000,
    priceRange: { min: 200000, max: 5000000 },
    topCities: ['Florence', 'Siena', 'Pisa', 'Lucca'],
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
      cs: 'Ekonomická mocnost Itálie s Milánem jako hlavním městem.'
    },
    image: '/Lombardia.jpg',
    propertyCount: 2100,
    averagePrice: 1200000,
    priceRange: { min: 300000, max: 10000000 },
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
      it: 'Casa di Venezia, Verona e il Lago di Garda. Storia ricca, città romantiche e paesaggi diversi.',
      cs: 'Domov Benátek, Verony a Lago di Garda s bohatou historií.'
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
      cs: 'Domov Říma, věčného města, s bohatou historií a antickými památkami.'
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
    name: { en: 'Sicily', it: 'Sicilia', cs: 'Sicílie' },
    slug: { current: 'sicilia' },
    country: 'Italy',
    description: { 
      en: 'Italy\'s largest island offering diverse landscapes from beaches to mountains, rich history, and excellent value properties.',
      it: 'La più grande isola d\'Italia che offre paesaggi diversi dalle spiagge alle montagne.',
      cs: 'Největší ostrov Itálie nabízející rozmanité krajiny od pláží po hory.'
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
    name: { en: 'Campania', it: 'Campania', cs: 'Kampánie' },
    slug: { current: 'campania' },
    country: 'Italy',
    description: { 
      en: 'Home to Naples, Pompeii, and the Amalfi Coast. Rich history, vibrant culture, and stunning coastal beauty.',
      it: 'Casa di Napoli, Pompei e la Costiera Amalfitana. Storia ricca, cultura vibrante e bellezza costiera mozzafiato.',
      cs: 'Domov Neapole, Pompejí a Amalfitského pobřeží s bohatou historií.'
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
      cs: 'Alpská krása, vína světové úrovně a elegantní města.'
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
      cs: 'Středomořský ostrovní ráj s nedotčenými plážemi a prastarými nuragskými věžemi.'
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
      cs: 'Kulinářské hlavní město Itálie s bohatou potravinovou kulturou.'
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
      cs: 'Pata Itálie s bílými trulli domy a úchvatným Jadranským pobřežím.'
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
      cs: 'Zelené srdce Itálie se středověkými městečky a klidným venkovem.'
    },
    image: '/Umbria.webp',
    propertyCount: 165,
    averagePrice: 420000,
    priceRange: { min: 150000, max: 1800000 },
    topCities: ['Perugia', 'Assisi', 'Terni', 'Spoleto'],
    highlights: ['Hill towns', 'Spiritual heritage', 'Green landscapes', 'Peaceful living'],
    popularity: 3
  }
]

function RegionCard({ region, language = 'en' }) {
  const formatPrice = (price) => {
    if (price >= 1000000) {
      const millions = price / 1000000
      return `€${millions.toFixed(millions % 1 === 0 ? 0 : 1)}M`
    } else if (price >= 1000) {
      const thousands = price / 1000
      return `€${thousands.toFixed(thousands % 1 === 0 ? 0 : 0)}k`
    }
    return `€${price.toLocaleString()}`
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
        
        {/* Property Count Badge */}
        <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1">
          <div className="flex items-center gap-1 text-xs font-semibold text-gray-800">
            <Home className="h-3 w-3" />
            {region.propertyCount.toLocaleString()}
          </div>
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
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {language === 'cs' ? 'Průměrná cena' : 
               language === 'it' ? 'Prezzo medio' : 
               'Average Price'}
            </span>
            <span className="font-bold text-lg text-slate-700">
              {formatPrice(region.averagePrice)}
            </span>
          </div>
          <div className="text-xs text-gray-500">
            {formatPriceRange(region.priceRange.min, region.priceRange.max)}
          </div>
        </div>
        
        {/* Top Cities */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            {language === 'cs' ? 'Hlavní města' : 
             language === 'it' ? 'Città principali' : 
             'Main Cities'}
          </h4>
          <div className="flex flex-wrap gap-1">
            {region.topCities.slice(0, 3).map((city, index) => (
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
        
        {/* Highlights */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            {language === 'cs' ? 'Výhody' : 
             language === 'it' ? 'Vantaggi' : 
             'Highlights'}
          </h4>
          <div className="flex flex-wrap gap-1">
            {region.highlights.slice(0, 2).map((highlight, index) => (
              <Badge 
                key={index} 
                className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200"
              >
                {highlight}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-0">
        <Link 
          href={`/properties?region=${region.slug.current}`} 
          className="w-full"
          onClick={() => {
            // Scroll to top before navigation
            window.scrollTo({ top: 0, behavior: 'smooth' });
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
          }}
        >
          <Button 
            className="w-full bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white font-semibold py-3 transition-all duration-300 hover:scale-105"
          >
            {language === 'cs' ? 'Zobrazit nemovitosti' : 
             language === 'it' ? 'Visualizza proprietà' : 
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

  useEffect(() => {
    // Load saved language preference
    const savedLanguage = localStorage.getItem('preferred-language')
    if (savedLanguage) {
      setLanguage(savedLanguage)
      document.documentElement.lang = savedLanguage
    }

    // Listen for language changes
    const handleLanguageChange = (event) => {
      setLanguage(event.detail)
      document.documentElement.lang = event.detail
    }

    window.addEventListener('languageChange', handleLanguageChange)
    return () => window.removeEventListener('languageChange', handleLanguageChange)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f7f4ed] via-amber-50/20 to-slate-50 home-page-custom-border">
      {/* Modern Navigation */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navigation />
      </div>

      <div className="pt-32 pb-12">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm mb-8">
          <div className="container mx-auto px-4 py-12">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent px-2">
                {language === 'cs' ? 'Regiony Itálie – kde dává koupě domu největší smysl' : 
                 language === 'it' ? 'Regioni d\'Italia - dove l\'acquisto di una casa ha più senso' : 
                 'Italian Regions - Where Buying a House Makes the Most Sense'}
              </h1>
              <p className="text-lg md:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-6 px-4">
                {language === 'cs' ? 'Itálie nabízí velmi rozdílné regiony – od moře přes hory až po historická města a klidný venkov. Výběr správné lokality je často stejně důležitý jako výběr samotné nemovitosti.' :
                 language === 'it' ? 'L\'Italia offre regioni molto diverse - dal mare alle montagne, dalle città storiche alla campagna tranquilla. Scegliere la giusta località è spesso importante quanto scegliere la proprietà stessa.' :
                 'Italy offers very diverse regions - from the sea through mountains to historic cities and quiet countryside. Choosing the right location is often as important as choosing the property itself.'}
            </p>
            <p className="text-base md:text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed px-4">
                {language === 'cs' ? 'Každý region má jiná pravidla, ceny, možnosti využití i životní styl. Níže najdete přehled regionů a oblastí, které jsou pro české kupující nejčastěji zajímavé.' :
                 language === 'it' ? 'Ogni regione ha regole, prezzi, possibilità di utilizzo e stile di vita diversi. Di seguito troverete una panoramica delle regioni e delle aree più interessanti per gli acquirenti cechi.' :
                 'Each region has different rules, prices, usage possibilities and lifestyle. Below you will find an overview of regions and areas that are most interesting for Czech buyers.'}
            </p>
          </div>
        </div>
      </div>

        <div className="container mx-auto px-4">
        {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <Card className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
            <CardContent className="p-6 text-center">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-700 to-slate-600 bg-clip-text text-transparent mb-2">
                {SAMPLE_REGIONS.reduce((acc, region) => acc + region.propertyCount, 0).toLocaleString()}
              </div>
                <div className="text-sm text-gray-600 font-medium">
                  {language === 'cs' ? 'Celkem nemovitostí' : 
                   language === 'it' ? 'Proprietà totali' : 
                   'Total Properties'}
                </div>
            </CardContent>
          </Card>
            <Card className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
            <CardContent className="p-6 text-center">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-700 to-slate-600 bg-clip-text text-transparent mb-2">
                {SAMPLE_REGIONS.length}
              </div>
                <div className="text-sm text-gray-600 font-medium">
                  {language === 'cs' ? 'Dostupné regiony' : 
                   language === 'it' ? 'Regioni disponibili' : 
                   'Regions Available'}
                </div>
            </CardContent>
          </Card>
            <Card className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
            <CardContent className="p-6 text-center">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-700 to-slate-600 bg-clip-text text-transparent mb-2">
                €{Math.round(SAMPLE_REGIONS.reduce((acc, region) => acc + region.averagePrice, 0) / SAMPLE_REGIONS.length / 1000)}K
              </div>
                <div className="text-sm text-gray-600 font-medium">
                  {language === 'cs' ? 'Průměrná cena' : 
                   language === 'it' ? 'Prezzo medio' : 
                   'Avg. Price'}
                </div>
            </CardContent>
          </Card>
            <Card className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
            <CardContent className="p-6 text-center">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-700 to-slate-600 bg-clip-text text-transparent mb-2">
                €{Math.min(...SAMPLE_REGIONS.map(r => r.priceRange.min)) / 1000}K+
              </div>
                <div className="text-sm text-gray-600 font-medium">
                  {language === 'cs' ? 'Od' : 
                   language === 'it' ? 'A partire da' : 
                   'Starting From'}
                </div>
            </CardContent>
          </Card>
        </div>

        {/* How to Choose a Region */}
        <div className="mb-12">
          <Card className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-xl rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-br from-slate-50 to-white border-b border-gray-100">
              <CardTitle className="text-2xl font-bold text-slate-800">
                {language === 'cs' ? 'Jak si vybrat region v Itálii?' :
                 language === 'it' ? 'Come scegliere una regione in Italia?' :
                 'How to Choose a Region in Italy?'}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <p className="text-gray-600 mb-6 leading-relaxed text-lg">
                {language === 'cs' ? 'Při výběru lokality doporučujeme zvážit zejména:' :
                 language === 'it' ? 'Nella scelta della località, raccomandiamo di considerare soprattutto:' :
                 'When choosing a location, we recommend considering especially:'}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-slate-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800 mb-2">
                      {language === 'cs' ? 'Chcete bydlení u moře, v horách nebo ve městě?' :
                       language === 'it' ? 'Volete abitare al mare, in montagna o in città?' :
                       'Do you want to live by the sea, in the mountains, or in the city?'}
                    </h4>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                    <Home className="h-5 w-5 text-slate-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800 mb-2">
                      {language === 'cs' ? 'Hledáte rekreační dům, investici nebo místo pro nový život?' :
                       language === 'it' ? 'Cercate una casa per vacanze, un investimento o un posto per una nuova vita?' :
                       'Are you looking for a vacation home, investment, or place for a new life?'}
                    </h4>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-slate-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800 mb-2">
                      {language === 'cs' ? 'Jaká je dostupnost z ČR a místní infrastruktura?' :
                       language === 'it' ? 'Qual è l\'accessibilità dalla Repubblica Ceca e l\'infrastruttura locale?' :
                       'What is the accessibility from Czech Republic and local infrastructure?'}
                    </h4>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                    <Star className="h-5 w-5 text-slate-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800 mb-2">
                      {language === 'cs' ? 'Jaký je váš rozpočet včetně daní a poplatků?' :
                       language === 'it' ? 'Qual è il vostro budget incluse tasse e spese?' :
                       'What is your budget including taxes and fees?'}
                    </h4>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-slate-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800 mb-2">
                      {language === 'cs' ? 'Plánujete nemovitost využívat sami, nebo ji pronajímat?' :
                       language === 'it' ? 'Prevedete di utilizzare la proprietà voi stessi o affittarla?' :
                       'Do you plan to use the property yourself or rent it out?'}
                    </h4>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                    <Shield className="h-5 w-5 text-slate-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800 mb-2">
                      {language === 'cs' ? 'Každý region má svá právní, cenová i životní specifika' :
                       language === 'it' ? 'Ogni regione ha le sue specificità legali, di prezzo e di vita' :
                       'Each region has its own legal, price, and lifestyle specifics'}
                    </h4>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-blue-800 leading-relaxed">
                  <strong>
                    {language === 'cs' ? 'Nejste si jisti, který region je pro vás nejvhodnější?' :
                     language === 'it' ? 'Non siete sicuri di quale regione sia più adatta a voi?' :
                     'Not sure which region is most suitable for you?'}
                  </strong>
                  <br />
                  {language === 'cs' ? 'Doporučíme vám region podle rozpočtu, cíle a způsobu využití nemovitosti. Kontaktujte nás přes WhatsApp nebo na info@domyvitalii.cz' :
                   language === 'it' ? 'Vi raccomanderemo una regione in base al budget, all\'obiettivo e al tipo di utilizzo della proprietà. Contattateci via WhatsApp o a info@domyvitalii.cz' :
                   'We\'ll recommend a region based on budget, goal, and property usage. Contact us via WhatsApp or at info@domyvitalii.cz'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Region Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {SAMPLE_REGIONS.map(region => (
              <RegionCard key={region._id} region={region} language={language} />
          ))}
        </div>

        {/* Call to Action */}
          <div className="text-center">
            <Card className="max-w-3xl mx-auto bg-white/90 backdrop-blur-sm border border-gray-200 shadow-xl rounded-2xl overflow-hidden">
              <CardContent className="p-12">
                <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  {language === 'cs' ? 'Chcete region nejdříve poznat osobně?' : 
                   language === 'it' ? 'Volete conoscere prima la regione di persona?' : 
                   'Want to Get to Know the Region Personally First?'}
                </h3>
                <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                  {language === 'cs' ? 'Mnoho klientů si před koupí vybírá region tak, že ho nejprve navštíví osobně – projde okolí, porovná lokality a atmosféru. Pro krátkodobé pobyty a orientační cesty můžete využít Booking.com.' :
                   language === 'it' ? 'Molti clienti prima dell\'acquisto scelgono la regione visitandola di persona - esplorano i dintorni, confrontano le località e l\'atmosfera. Per soggiorni brevi e viaggi esplorativi potete utilizzare Booking.com.' :
                   'Many clients choose their region before buying by visiting it personally first - exploring the surroundings, comparing locations and atmosphere. For short stays and exploratory trips, you can use Booking.com.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/process" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white font-semibold px-8 py-6 text-base transition-all duration-300 hover:scale-105 shadow-lg">
                      {language === 'cs' ? 'Průvodce koupí domu' : 
                       language === 'it' ? 'Guida all\'acquisto' : 
                       'House Buying Guide'}
                  </Button>
                </Link>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="w-full sm:w-auto border-2 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 font-semibold px-8 py-6 text-base transition-all duration-300 hover:scale-105"
                    onClick={() => window.open('#', '_blank')} 
                  >
                    {language === 'cs' ? 'Najít ubytování (Booking.com)' : 
                     language === 'it' ? 'Trova alloggio (Booking.com)' : 
                     'Find Accommodation (Booking.com)'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>

      {/* Footer */}
      <Footer language={language} />
    </div>
  )
}
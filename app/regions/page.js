'use client'

import { useState, useEffect } from 'react'
import { MapPin, TrendingUp, Home, ChevronRight, Star, Menu, X, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'
import AuthModal from '../../components/AuthModal'

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
  const [user, setUser] = useState(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [language, setLanguage] = useState('en')

  useEffect(() => {
    // Load saved language preference
    const savedLanguage = localStorage.getItem('preferred-language')
    if (savedLanguage) {
      setLanguage(savedLanguage)
      document.documentElement.lang = savedLanguage
    }
  }, [])

  useEffect(() => {
    // Check if user is authenticated
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    checkUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (!error) {
      setUser(null)
    }
  }

  const handleAuthSuccess = (user) => {
    setUser(user)
    setIsAuthModalOpen(false)
  }

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage)
    document.documentElement.lang = newLanguage
    localStorage.setItem('preferred-language', newLanguage)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f7f4ed] via-amber-50/20 to-slate-50 home-page-custom-border">
      {/* Modern Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md shadow-lg overflow-visible border-b border-white/20" style={{ backgroundColor: 'rgba(14, 21, 46, 0.9)' }}>
        <div className="container mx-auto px-4 pt-4 pb-3 overflow-visible">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <Link href="/" className="relative overflow-visible">
                <img 
                  src="/logo domy.svg" 
                  alt="Domy v Itálii"
                  className="h-12 w-auto cursor-pointer" 
                  style={{ filter: 'drop-shadow(0 2px 6px rgba(0, 0, 0, 0.4))' }}
                />
              </Link>
              <div className="hidden md:flex space-x-6">
                <Link href="/" className="text-gray-200 hover:text-copper-400 transition-colors">
                  {language === 'cs' ? 'Domů' : language === 'it' ? 'Casa' : 'Home'}
                </Link>
                <Link href="/properties" className="text-gray-200 hover:text-copper-400 transition-colors">
                  {language === 'cs' ? 'Nemovitosti' : language === 'it' ? 'Proprietà' : 'Properties'}
                </Link>
                <Link href="/regions" className="text-gray-200 hover:text-copper-400 transition-colors border-b-2 border-white pb-1">
                  {language === 'cs' ? 'Regiony' : language === 'it' ? 'Regioni' : 'Regions'}
                </Link>
                <Link href="/about" className="text-gray-200 hover:text-copper-400 transition-colors">
                  {language === 'cs' ? 'O nás' : language === 'it' ? 'Chi siamo' : 'About'}
                </Link>
                <Link href="/process" className="text-gray-200 hover:text-copper-400 transition-colors">
                  {language === 'cs' ? 'Proces' : language === 'it' ? 'Processo' : 'Process'}
                </Link>
                <Link href="/contact" className="text-gray-200 hover:text-copper-400 transition-colors">
                  {language === 'cs' ? 'Kontakt' : language === 'it' ? 'Contatto' : 'Contact'}
                </Link>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Language Selector */}
              <div className="group flex items-center bg-white/10 backdrop-blur-md rounded-full px-3 py-2 shadow-lg border border-white/20 transition-all duration-300 hover:shadow-xl hover:bg-white/20 hover:px-6 w-auto gap-2">
                <button
                  onClick={() => handleLanguageChange('en')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ease-in-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-400 ${
                    language === 'en' 
                      ? 'bg-white/20 text-white shadow-md backdrop-blur-sm' 
                      : 'text-white/60 hover:text-white/90 hover:bg-white/5 opacity-0 group-hover:opacity-100 absolute group-hover:relative group-hover:mx-1'
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => handleLanguageChange('cs')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ease-in-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-400 ${
                    language === 'cs' 
                      ? 'bg-white/20 text-white shadow-md backdrop-blur-sm' 
                      : 'text-white/60 hover:text-white/90 hover:bg-white/5 opacity-0 group-hover:opacity-100 absolute group-hover:relative group-hover:mx-1'
                  }`}
                >
                  CS
                </button>
                <button
                  onClick={() => handleLanguageChange('it')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ease-in-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-400 ${
                    language === 'it' 
                      ? 'bg-white/20 text-white shadow-md backdrop-blur-sm' 
                      : 'text-white/60 hover:text-white/90 hover:bg-white/5 opacity-0 group-hover:opacity-100 absolute group-hover:relative group-hover:mx-1'
                  }`}
                >
                  IT
                </button>
              </div>

              {/* User Authentication */}
              {user ? (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-200" />
                    <span className="text-sm text-gray-200">
                      {user.user_metadata?.name || user.email}
                    </span>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={handleLogout} 
                    className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/50 transition-all duration-200"
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="bg-white/10 backdrop-blur-md rounded-full px-4 py-2 shadow-lg border border-white/20 transition-all duration-300 hover:shadow-xl hover:bg-white/20">
                  <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="text-sm font-medium text-white/90 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 rounded-full px-2 py-1 hover:bg-white/5"
                  >
                    {language === 'cs' ? 'Přihlásit' : (language === 'it' ? 'Accedi' : 'Login')}
                  </button>
                  <span className="text-white/40 mx-1">/</span>
                  <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="text-sm font-medium text-white/90 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 rounded-full px-2 py-1 hover:bg-white/5"
                  >
                    {language === 'cs' ? 'Registrovat' : (language === 'it' ? 'Registrati' : 'Register')}
                  </button>
                </div>
              )}
              
              {/* Mobile menu button */}
              <button
                className="md:hidden"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="h-6 w-6 text-gray-200" /> : <Menu className="h-6 w-6 text-gray-200" />}
              </button>
            </div>
          </div>
          
          {/* Mobile menu */}
          {isMenuOpen && (
            <div className="md:hidden mt-4 pt-4 border-t border-[#0e152e]">
              <div className="flex flex-col space-y-4">
                <Link 
                  href="/properties" 
                  className="text-gray-200 hover:text-white transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {language === 'cs' ? 'Nemovitosti' : language === 'it' ? 'Proprietà' : 'Properties'}
                </Link>
                <Link 
                  href="/regions" 
                  className="text-gray-200 hover:text-white transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {language === 'cs' ? 'Regiony' : language === 'it' ? 'Regioni' : 'Regions'}
                </Link>
                <Link 
                  href="/about" 
                  className="text-gray-200 hover:text-white transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {language === 'cs' ? 'O nás' : language === 'it' ? 'Chi siamo' : 'About'}
                </Link>
                <Link 
                  href="/process" 
                  className="text-gray-200 hover:text-white transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {language === 'cs' ? 'Proces' : language === 'it' ? 'Processo' : 'Process'}
                </Link>
                <Link 
                  href="/contact" 
                  className="text-gray-200 hover:text-white transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {language === 'cs' ? 'Kontakt' : language === 'it' ? 'Contatto' : 'Contact'}
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      <div className="pt-28 pb-12">
      {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm mb-8">
          <div className="container mx-auto px-4 py-12">
          <div className="text-center">
              <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                {language === 'cs' ? 'Italské regiony' : 
                 language === 'it' ? 'Regioni Italiane' : 
                 'Italian Regions'}
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                {language === 'cs' ? 'Objevte rozmanitost italských regionů - od alpských vrcholů po středomořské pobřeží. Každý region nabízí jedinečnou kulturu, krajinu a příležitosti k investicím.' :
                 language === 'it' ? 'Scopri la diversità delle regioni italiane - dalle vette alpine alle coste mediterranee. Ogni regione offre cultura, paesaggio e opportunità di investimento uniche.' :
                 'Discover the diversity of Italian regions - from Alpine peaks to Mediterranean coasts. Each region offers unique culture, landscape, and investment opportunities.'}
            </p>
          </div>
        </div>
      </div>

        <div className="container mx-auto px-4">
        {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <Card className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
            <CardContent className="p-6 text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-slate-700 to-slate-600 bg-clip-text text-transparent mb-2">
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
                <div className="text-4xl font-bold bg-gradient-to-r from-slate-700 to-slate-600 bg-clip-text text-transparent mb-2">
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
                <div className="text-4xl font-bold bg-gradient-to-r from-slate-700 to-slate-600 bg-clip-text text-transparent mb-2">
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
                <div className="text-4xl font-bold bg-gradient-to-r from-slate-700 to-slate-600 bg-clip-text text-transparent mb-2">
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
                  {language === 'cs' ? 'Připraveni najít svůj italský sen?' : 
                   language === 'it' ? 'Pronto a trovare il tuo sogno italiano?' : 
                   'Ready to Find Your Italian Dream Home?'}
                </h3>
                <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                  {language === 'cs' ? 'Náš tým odborníků vám pomůže orientovat se na italském trhu nemovitostí a najít perfektní domov v jakémkoli regionu.' :
                   language === 'it' ? 'Il nostro team di esperti può aiutarti a orientarti nel mercato immobiliare italiano e trovare la casa perfetta in qualsiasi regione.' :
                   'Our expert team can help you navigate the Italian property market and find the perfect home in any region.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/properties">
                    <Button size="lg" className="bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white font-semibold px-8 py-6 text-base transition-all duration-300 hover:scale-105 shadow-lg">
                      {language === 'cs' ? 'Procházet všechny nemovitosti' : 
                       language === 'it' ? 'Sfoglia tutte le proprietà' : 
                       'Browse All Properties'}
                  </Button>
                </Link>
                  <Button variant="outline" size="lg" className="border-2 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 font-semibold px-8 py-6 text-base transition-all duration-300 hover:scale-105">
                    {language === 'cs' ? 'Kontaktovat naše experty' : 
                     language === 'it' ? 'Contatta i nostri esperti' : 
                     'Contact Our Experts'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, Users, Globe, Award, Heart, Mail, Phone, Menu, X, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'
import AuthModal from '../../components/AuthModal'

const TEAM_MEMBERS = [
  {
    name: 'Marco Rossi',
    role: 'Founder & CEO',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
    bio: 'Expert in Italian real estate with 15+ years of experience helping international clients find their dream properties.',
    languages: ['Italian', 'English', 'Czech']
  },
  {
    name: 'Elena Bianchi',
    role: 'Senior Property Consultant',
    image: 'https://images.unsplash.com/photo-1494790108755-2616b2db9622?w=400&h=400&fit=crop&crop=face',
    bio: 'Specializes in luxury properties across Tuscany and Lake Como regions with deep local market knowledge.',
    languages: ['Italian', 'English', 'German']
  },
  {
    name: 'Pavel Novák',
    role: 'Czech Market Specialist',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
    bio: 'Native Czech speaker helping Czech clients navigate Italian property purchases and legal processes.',
    languages: ['Czech', 'Italian', 'English']
  }
]

const SERVICES = [
  {
    title: {
      en: 'Property Search & Selection',
      cs: 'Vyhledávání a výběr nemovitostí',
      it: 'Ricerca e Selezione Immobili'
    },
    description: {
      en: 'Curated property listings matching your specific requirements and budget.',
      cs: 'Kurátorované nabídky nemovitostí odpovídající vašim specifickým požadavkům a rozpočtu.',
      it: 'Listini immobiliari curati che corrispondono alle vostre esigenze specifiche e al vostro budget.'
    },
    icon: <Globe className="h-8 w-8 text-slate-600" />
  },
  {
    title: {
      en: 'Legal & Financial Guidance',
      cs: 'Právní a finanční poradenství',
      it: 'Consulenza Legale e Finanziaria'
    },
    description: {
      en: 'Expert assistance with Italian property law, taxes, and financing options.',
      cs: 'Odborná pomoc s italským právem nemovitostí, daněmi a možnostmi financování.',
      it: 'Assistenza esperta con la legge immobiliare italiana, tasse e opzioni di finanziamento.'
    },
    icon: <CheckCircle className="h-8 w-8 text-slate-600" />
  },
  {
    title: {
      en: 'Property Management',
      cs: 'Správa nemovitostí',
      it: 'Gestione Immobiliare'
    },
    description: {
      en: 'Complete property management services for your Italian investment.',
      cs: 'Kompletní služby správy nemovitostí pro vaši italskou investici.',
      it: 'Servizi completi di gestione immobiliare per il vostro investimento italiano.'
    },
    icon: <Users className="h-8 w-8 text-slate-600" />
  },
  {
    title: {
      en: 'Relocation Support',
      cs: 'Podpora při stěhování',
      it: 'Supporto per il Trasferimento'
    },
    description: {
      en: 'Comprehensive support for relocating to Italy, from residency to local services.',
      cs: 'Komplexní podpora při stěhování do Itálie, od pobytu po místní služby.',
      it: 'Supporto completo per il trasferimento in Italia, dalla residenza ai servizi locali.'
    },
    icon: <Heart className="h-8 w-8 text-slate-600" />
  }
]

const STATS = [
  { 
    label: { en: 'Properties Sold', cs: 'Prodané nemovitosti', it: 'Proprietà Vendute' }, 
    value: '500+' 
  },
  { 
    label: { en: 'Happy Clients', cs: 'Spokojení klienti', it: 'Clienti Felici' }, 
    value: '300+' 
  },
  { 
    label: { en: 'Years Experience', cs: 'Let zkušeností', it: 'Anni di Esperienza' }, 
    value: '15+' 
  },
  { 
    label: { en: 'Italian Regions', cs: 'Italské regiony', it: 'Regioni Italiane' }, 
    value: '12' 
  }
]

export default function AboutPage() {
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
                <Link href="/regions" className="text-gray-200 hover:text-copper-400 transition-colors">
                  {language === 'cs' ? 'Regiony' : language === 'it' ? 'Regioni' : 'Regions'}
                </Link>
                <Link href="/about" className="text-gray-200 hover:text-copper-400 transition-colors border-b-2 border-white pb-1">
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
                    className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/50 transition-all duration-200 rounded-full px-6 py-4 text-sm font-medium"
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
      {/* Hero Section */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm mb-8">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                {language === 'cs' ? 'Váš důvěryhodný partner pro italské nemovitosti' :
                 language === 'it' ? 'Il vostro partner di fiducia per gli immobili italiani' :
                 'Your Trusted Partner for Italian Real Estate'}
            </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                {language === 'cs' ? 'Od roku 2009 pomáháme českým a mezinárodním klientům objevovat a kupovat jejich vysněné nemovitosti v nejkrásnějších italských regionech.' :
                 language === 'it' ? 'Dal 2009, aiutiamo i clienti cechi e internazionali a scoprire e acquistare le loro proprietà da sogno nelle più belle regioni d\'Italia.' :
                 'Since 2009, we\'ve been helping Czech and international clients discover and purchase their dream properties across Italy\'s most beautiful regions.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/properties">
                  <Button size="lg" className="bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white font-semibold px-8 py-6 text-base transition-all duration-300 hover:scale-105 shadow-lg">
                    {language === 'cs' ? 'Procházet nemovitosti' : 
                     language === 'it' ? 'Sfoglia proprietà' : 
                     'Browse Properties'}
                </Button>
              </Link>
                <Button variant="outline" size="lg" className="border-2 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 font-semibold px-8 py-6 text-base transition-all duration-300 hover:scale-105">
                <Mail className="h-4 w-4 mr-2" />
                  {language === 'cs' ? 'Kontaktujte nás' : 
                   language === 'it' ? 'Contattaci' : 
                   'Contact Us'}
              </Button>
            </div>
          </div>
        </div>
      </div>


      <div className="container mx-auto px-4 py-16">
        {/* Our Story */}
        <div className="max-w-1400 mx-auto mb-16">
          <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                {language === 'cs' ? 'Náš příběh' : 
                 language === 'it' ? 'La nostra storia' : 
                 'Our Story'}
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-slate-600 to-slate-500 mx-auto mb-6 rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <img 
                src="https://images.unsplash.com/photo-1533554030380-20991a0f9c9e" 
                alt="Italian villa" 
                  className="w-full h-80 object-cover rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300"
              />
            </div>
            <div className="space-y-6">
                <p className="text-gray-700 leading-relaxed text-lg">
                  {language === 'cs' ? 'Založeno v roce 2009 Marcem Rossim, Domy v Itálii začalo jako vášnivý projekt pomoci českým rodinám objevit krásu a příležitosti italských nemovitostí. Po životě v České republice i Itálii, Marco rozuměl jedinečným výzvám a příležitostem, kterým mezinárodní kupci čelí.' :
                   language === 'it' ? 'Fondata nel 2009 da Marco Rossi, Domy v Itálii è iniziata come un progetto appassionato per aiutare le famiglie ceche a scoprire la bellezza e le opportunità degli immobili italiani. Avendo vissuto sia nella Repubblica Ceca che in Italia, Marco ha compreso le sfide e le opportunità uniche che gli acquirenti internazionali devono affrontare.' :
                   'Founded in 2009 by Marco Rossi, Domy v Itálii began as a passion project to help Czech families discover the beauty and opportunity of Italian real estate. Having lived in both Czech Republic and Italy, Marco understood the unique challenges and opportunities that international buyers face.'}
                </p>
                <p className="text-gray-700 leading-relaxed text-lg">
                  {language === 'cs' ? 'V průběhu let jsme vyrostli v důvěryhodný tým místních expertů, právních poradců a specialistů na nemovitosti, ale naše poslání zůstává stejné: učinit vlastnictví italských nemovitostí dostupné, příjemné a ziskové pro naše klienty.' :
                   language === 'it' ? 'Nel corso degli anni, siamo cresciuti in un team fidato di esperti locali, consulenti legali e specialisti immobiliari, ma la nostra missione rimane la stessa: rendere la proprietà immobiliare italiana accessibile, piacevole e redditizia per i nostri clienti.' :
                   'Over the years, we\'ve grown into a trusted team of local experts, legal advisors, and property specialists, but our mission remains the same: to make Italian property ownership accessible, enjoyable, and profitable for our clients.'}
                </p>
                <p className="text-gray-700 leading-relaxed text-lg">
                  {language === 'cs' ? 'Dnes jsme hrdí, že jsme pomohli více než 300 rodinám najít jejich kousek italského ráje, od útulných bytů v historické Florencii po luxusní vily s výhledem na Lago di Como.' :
                   language === 'it' ? 'Oggi siamo orgogliosi di aver aiutato oltre 300 famiglie a trovare il loro pezzo di paradiso italiano, da appartamenti accoglienti nella storica Firenze a ville di lusso con vista sul Lago di Como.' :
                   'Today, we\'re proud to have helped over 300 families find their piece of Italian paradise, from cozy apartments in historic Florence to luxury villas overlooking Lake Como.'}
              </p>
            </div>
          </div>
        </div>

        {/* Our Services */}
        <div className="mb-16">
          <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                {language === 'cs' ? 'Naše služby' : 
                 language === 'it' ? 'I nostri servizi' : 
                 'Our Services'}
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-slate-600 to-slate-500 mx-auto mb-6 rounded-full"></div>
              <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                {language === 'cs' ? 'Poskytujeme komplexní podporu během celé vaší cesty s italskými nemovitostmi, od počátečního vyhledávání až po finální koupi a dále.' :
                 language === 'it' ? 'Forniamo supporto completo durante tutto il vostro percorso immobiliare italiano, dalla ricerca iniziale all\'acquisto finale e oltre.' :
                 'We provide comprehensive support throughout your Italian property journey, from initial search to final purchase and beyond.'}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {SERVICES.map((service, index) => (
                <Card key={index} className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden group">
                  <CardHeader className="bg-gradient-to-br from-slate-50 to-white">
                  <div className="flex items-center space-x-4">
                      <div className="p-3 bg-slate-100 rounded-xl group-hover:bg-slate-200 transition-colors duration-300">
                    {service.icon}
                      </div>
                      <CardTitle className="text-xl font-bold text-slate-800">{service.title[language]}</CardTitle>
                  </div>
                </CardHeader>
                  <CardContent className="p-6">
                    <p className="text-gray-600 leading-relaxed">{service.description[language]}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Our Team */}
        <div className="mb-16">
          <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                {language === 'cs' ? 'Seznamte se s naším týmem' : 
                 language === 'it' ? 'Incontra il nostro team' : 
                 'Meet Our Team'}
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-slate-600 to-slate-500 mx-auto mb-6 rounded-full"></div>
              <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                {language === 'cs' ? 'Náš vícejazyčný tým kombinuje hluboké místní znalosti s mezinárodními zkušenostmi, aby sloužil klientům z celého světa.' :
                 language === 'it' ? 'Il nostro team multilingue combina profonde conoscenze locali con esperienza internazionale per servire clienti da tutto il mondo.' :
                 'Our multilingual team combines deep local knowledge with international experience to serve clients from around the world.'}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TEAM_MEMBERS.map((member, index) => (
                <Card key={index} className="text-center bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden group">
                  <CardContent className="p-8">
                    <div className="relative mb-6">
                  <img 
                    src={member.image} 
                    alt={member.name}
                        className="w-32 h-32 rounded-full mx-auto object-cover shadow-lg group-hover:shadow-xl transition-all duration-300"
                      />
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-slate-600 to-slate-700 rounded-full flex items-center justify-center">
                        <Heart className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold mb-2 text-slate-800">{member.name}</h3>
                    <p className="text-slate-600 font-semibold mb-4 text-lg">{member.role}</p>
                    <p className="text-gray-600 mb-6 leading-relaxed">{member.bio}</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                      {member.languages.map((lang, langIndex) => (
                        <Badge key={langIndex} className="text-xs px-3 py-1 bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">
                          {lang}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="mb-16">
          <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                {language === 'cs' ? 'Proč si vybrat Domy v Itálii?' : 
                 language === 'it' ? 'Perché scegliere Domy v Itálii?' : 
                 'Why Choose Domy v Itálii?'}
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-slate-600 to-slate-500 mx-auto mb-6 rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="text-center group">
                <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:from-slate-200 group-hover:to-slate-300 transition-all duration-300 shadow-lg">
                  <Award className="h-10 w-10 text-slate-600" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-800">
                  {language === 'cs' ? 'Odborné znalosti' : 
                   language === 'it' ? 'Conoscenza esperta' : 
                   'Expert Knowledge'}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {language === 'cs' ? '15+ let zkušeností na italském trhu nemovitostí s hlubokými místními znalostmi.' :
                   language === 'it' ? '15+ anni di esperienza nel mercato immobiliare italiano con profonde conoscenze locali.' :
                   '15+ years of experience in Italian real estate market with deep local insights.'}
                </p>
              </div>
              
              <div className="text-center group">
                <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:from-slate-200 group-hover:to-slate-300 transition-all duration-300 shadow-lg">
                  <Globe className="h-10 w-10 text-slate-600" />
            </div>
                <h3 className="text-xl font-bold mb-3 text-slate-800">
                  {language === 'cs' ? 'Vícejazyčný servis' : 
                   language === 'it' ? 'Servizio multilingue' : 
                   'Multilingual Service'}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {language === 'cs' ? 'Plynulá podpora v češtině, italštině, angličtině a němčině pro bezproblémovou komunikaci.' :
                   language === 'it' ? 'Supporto fluente in ceco, italiano, inglese e tedesco per una comunicazione senza problemi.' :
                   'Fluent support in Czech, Italian, English, and German for seamless communication.'}
                </p>
              </div>
              
              <div className="text-center group">
                <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:from-slate-200 group-hover:to-slate-300 transition-all duration-300 shadow-lg">
                  <Heart className="h-10 w-10 text-slate-600" />
            </div>
                <h3 className="text-xl font-bold mb-3 text-slate-800">
                  {language === 'cs' ? 'Osobní přístup' : 
                   language === 'it' ? 'Tocco personale' : 
                   'Personal Touch'}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {language === 'cs' ? 'Dedikovaný osobní servis s pozorností k vašim jedinečným potřebám a preferencím.' :
                   language === 'it' ? 'Servizio personale dedicato con attenzione alle vostre esigenze e preferenze uniche.' :
                   'Dedicated personal service with attention to your unique needs and preferences.'}
                </p>
            </div>
          </div>
        </div>

        {/* Contact CTA */}
        <div className="text-center">
            <Card className="max-w-3xl mx-auto bg-white/90 backdrop-blur-sm border border-gray-200 shadow-xl rounded-2xl overflow-hidden">
              <CardContent className="p-12">
                <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  {language === 'cs' ? 'Připraveni začít svou italskou cestu?' : 
                   language === 'it' ? 'Pronti a iniziare il vostro viaggio italiano?' : 
                   'Ready to Start Your Italian Journey?'}
                </h3>
                <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                  {language === 'cs' ? 'Kontaktujte nás ještě dnes pro bezplatnou konzultaci o vašich snech o italských nemovitostech. Jsme tu, abychom vás provázeli každým krokem.' :
                   language === 'it' ? 'Contattateci oggi per una consulenza gratuita sui vostri sogni immobiliari italiani. Siamo qui per guidarvi ad ogni passo.' :
                   'Contact us today for a free consultation about your Italian property dreams. We\'re here to guide you every step of the way.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" className="bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white font-semibold px-8 py-6 text-base transition-all duration-300 hover:scale-105 shadow-lg">
                  <Phone className="h-4 w-4 mr-2" />
                    {language === 'cs' ? 'Naplánovat konzultaci' : 
                     language === 'it' ? 'Pianifica consultazione' : 
                     'Schedule Consultation'}
                </Button>
                <Link href="/properties">
                    <Button variant="outline" size="lg" className="border-2 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 font-semibold px-8 py-6 text-base transition-all duration-300 hover:scale-105">
                      {language === 'cs' ? 'Procházet nemovitosti' : 
                       language === 'it' ? 'Sfoglia proprietà' : 
                       'Browse Properties'}
                  </Button>
                </Link>
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
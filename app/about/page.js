'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, Users, Globe, Award, Heart, Mail, Phone, Menu, X, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'
import AuthModal from '../../components/AuthModal'

const TEAM_MEMBERS = []

const SERVICES = [
  {
    title: {
      en: 'Understanding the Process',
      cs: 'Vysvětlíme celý proces',
      it: 'Spiegheremo l\'intero processo'
    },
    description: {
      en: 'We explain the entire process of buying property in Italy step by step.',
      cs: 'Vysvětlíme celý proces koupě nemovitosti v Itálii krok za krokem.',
      it: 'Spieghiamo l\'intero processo di acquisto di un immobile in Italia passo dopo passo.'
    },
    icon: <Globe className="h-8 w-8 text-slate-600" />
  },
  {
    title: {
      en: 'Avoiding Mistakes',
      cs: 'Předejdeme chybám',
      it: 'Eviteremo errori'
    },
    description: {
      en: 'We alert you to mistakes that cost Czechs time and money.',
      cs: 'Upozorníme na chyby, které Čechy stojí čas i peníze.',
      it: 'Vi avvisiamo sugli errori che costano tempo e denaro ai cechi.'
    },
    icon: <CheckCircle className="h-8 w-8 text-slate-600" />
  },
  {
    title: {
      en: 'Region Selection',
      cs: 'Výběr regionu',
      it: 'Selezione della regione'
    },
    description: {
      en: 'We help you choose the region and type of property that suits you.',
      cs: 'Pomůžeme s výběrem regionu a typu nemovitosti, která vám vyhovuje.',
      it: 'Ti aiutiamo a scegliere la regione e il tipo di proprietà adatto a te.'
    },
    icon: <Users className="h-8 w-8 text-slate-600" />
  },
  {
    title: {
      en: 'Step-by-Step Guidance',
      cs: 'Vedení krok za krokem',
      it: 'Guida passo dopo passo'
    },
    description: {
      en: 'We guide you step by step to a safe purchase.',
      cs: 'Provedeme vás krok za krokem až k bezpečné koupi.',
      it: 'Ti guidiamo passo dopo passo verso un acquisto sicuro.'
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

const STATS = [
  { 
    label: { en: 'Individual Approach', cs: 'Individuální přístup', it: 'Approccio Individuale' }, 
    value: '100%' 
  },
  { 
    label: { en: 'Local Knowledge', cs: 'Místní znalosti', it: 'Conoscenza Locale' }, 
    value: '✓' 
  },
  { 
    label: { en: 'Step by Step', cs: 'Krok za krokem', it: 'Passo dopo Passo' }, 
    value: '✓' 
  },
  { 
    label: { en: 'Your Interests First', cs: 'Vaše zájmy na prvním místě', it: 'I Vostri Interessi Prima' }, 
    value: '✓' 
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
                {language === 'cs' ? 'Průvodce koupí domu v Itálii' :
                 language === 'it' ? 'Guida all\'acquisto di una casa in Italia' :
                 'Guide to Buying a House in Italy'}
            </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                {language === 'cs' ? 'Jasně, prakticky a bez stresu. Pomáháme Čechům porozumět tomu, jak koupě nemovitosti v Itálii skutečně funguje – ještě předtím, než udělají první krok.' :
                 language === 'it' ? 'Chiaro, pratico e senza stress. Aiutiamo i cechi a capire come funziona realmente l\'acquisto di un immobile in Italia - prima ancora di fare il primo passo.' :
                 'Clear, practical and stress-free. We help Czechs understand how buying property in Italy really works - before they take the first step.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/process">
                  <Button size="lg" className="bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white font-semibold px-8 py-6 text-base transition-all duration-300 hover:scale-105 shadow-lg">
                    {language === 'cs' ? 'Stáhnout bezplatný PDF průvodce' : 
                     language === 'it' ? 'Scarica la guida PDF gratuita' : 
                     'Download Free PDF Guide'}
                </Button>
              </Link>
                <Button variant="outline" size="lg" className="border-2 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 font-semibold px-8 py-6 text-base transition-all duration-300 hover:scale-105" onClick={() => window.location.href = 'mailto:info@domyvitalii.cz'}>
                <Mail className="h-4 w-4 mr-2" />
                  {language === 'cs' ? 'info@domyvitalii.cz' : 
                   language === 'it' ? 'info@domyvitalii.cz' : 
                   'info@domyvitalii.cz'}
              </Button>
            </div>
          </div>
        </div>
      </div>


      <div className="container mx-auto px-4 py-16">
        {/* Our Approach */}
        <div className="max-w-1400 mx-auto mb-16">
          <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                {language === 'cs' ? 'Náš přístup' : 
                 language === 'it' ? 'Il nostro approccio' : 
                 'Our Approach'}
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-slate-600 to-slate-500 mx-auto mb-6 rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <img 
                src="https://images.unsplash.com/photo-1523906834658-6e24ef2386f9" 
                alt="Italian landscape" 
                  className="w-full h-80 object-cover rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300"
              />
            </div>
            <div className="space-y-6">
                <p className="text-gray-700 leading-relaxed text-lg">
                  {language === 'cs' ? 'Ať už vás láká jih nebo sever Itálie, moře nebo hory, klidná vesnice nebo historické město, pomůžeme vám zorientovat se a rozhodnout správně.' :
                   language === 'it' ? 'Che tu sia attratto dal sud o dal nord Italia, dal mare o dalle montagne, da un tranquillo villaggio o da una città storica, ti aiuteremo a orientarti e decidere correttamente.' :
                   'Whether you\'re drawn to southern or northern Italy, sea or mountains, quiet village or historic city, we\'ll help you navigate and decide correctly.'}
                </p>
                <p className="text-gray-700 leading-relaxed text-lg font-semibold">
                  {language === 'cs' ? 'Naše práce stojí na:' :
                   language === 'it' ? 'Il nostro lavoro si basa su:' :
                   'Our work is based on:'}
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 leading-relaxed text-lg">
                      {language === 'cs' ? 'Individuálním přístupu' :
                       language === 'it' ? 'Approccio individuale' :
                       'Individual approach'}
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 leading-relaxed text-lg">
                      {language === 'cs' ? 'Znalosti italského prostředí' :
                       language === 'it' ? 'Conoscenza dell\'ambiente italiano' :
                       'Knowledge of Italian environment'}
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 leading-relaxed text-lg">
                      {language === 'cs' ? 'Srozumitelném vysvětlení celého procesu krok za krokem' :
                       language === 'it' ? 'Spiegazione chiara dell\'intero processo passo dopo passo' :
                       'Clear explanation of the entire process step by step'}
                    </span>
                  </li>
                </ul>
                <p className="text-gray-700 leading-relaxed text-lg font-semibold pt-4">
                  {language === 'cs' ? 'Jsme tady proto, abychom hájili vaše zájmy a předešli zbytečným chybám.' :
                   language === 'it' ? 'Siamo qui per difendere i vostri interessi ed evitare errori inutili.' :
                   'We are here to protect your interests and prevent unnecessary mistakes.'}
              </p>
            </div>
          </div>
        </div>

        {/* Our Services */}
        <div className="mb-16">
          <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                {language === 'cs' ? 'Jak vám můžeme pomoci' : 
                 language === 'it' ? 'Come possiamo aiutarvi' : 
                 'How We Can Help You'}
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-slate-600 to-slate-500 mx-auto mb-6 rounded-full"></div>
              <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                {language === 'cs' ? 'Nabízíme komplexní podporu, která vám pomůže orientovat se v celém procesu koupě nemovitosti v Itálii.' :
                 language === 'it' ? 'Offriamo supporto completo per aiutarvi a orientarvi nell\'intero processo di acquisto di un immobile in Italia.' :
                 'We provide comprehensive support to help you navigate the entire process of buying property in Italy.'}
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

        {/* Why Choose Us */}
        <div className="mb-16">
          <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                {language === 'cs' ? 'Pro koho je služba Domy v Itálii určena' : 
                 language === 'it' ? 'Per chi è destinato il servizio Domy v Itálii' : 
                 'Who Is Domy v Itálii Service For?'}
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-slate-600 to-slate-500 mx-auto mb-6 rounded-full"></div>
              <p className="text-gray-600 max-w-3xl mx-auto text-lg leading-relaxed">
                {language === 'cs' ? 'Pomáháme lidem, kteří o koupi domu v Itálii uvažují vážně a chtějí se rozhodnout s klidem a dostatkem informací.' :
                 language === 'it' ? 'Aiutiamo persone che stanno considerando seriamente l\'acquisto di una casa in Italia e vogliono decidere con calma e informazioni sufficienti.' :
                 'We help people who are seriously considering buying a house in Italy and want to decide with peace of mind and sufficient information.'}
              </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center group">
                <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:from-slate-200 group-hover:to-slate-300 transition-all duration-300 shadow-lg">
                  <Heart className="h-10 w-10 text-slate-600" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-800">
                  {language === 'cs' ? 'Rekreační dům' : 
                   language === 'it' ? 'Casa per vacanze' : 
                   'Vacation Home'}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {language === 'cs' ? 'Hledáte místo pro odpočinek a dovolenou v Itálii.' :
                   language === 'it' ? 'Cercate un posto per riposare e vacanze in Italia.' :
                   'Looking for a place to rest and vacation in Italy.'}
                </p>
              </div>
              
              <div className="text-center group">
                <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:from-slate-200 group-hover:to-slate-300 transition-all duration-300 shadow-lg">
                  <Award className="h-10 w-10 text-slate-600" />
            </div>
                <h3 className="text-xl font-bold mb-3 text-slate-800">
                  {language === 'cs' ? 'Investice' : 
                   language === 'it' ? 'Investimento' : 
                   'Investment'}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {language === 'cs' ? 'Chcete investovat do nemovitosti v Itálii.' :
                   language === 'it' ? 'Volete investire in un immobile in Italia.' :
                   'Want to invest in Italian property.'}
                </p>
              </div>
              
              <div className="text-center group">
                <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:from-slate-200 group-hover:to-slate-300 transition-all duration-300 shadow-lg">
                  <Globe className="h-10 w-10 text-slate-600" />
            </div>
                <h3 className="text-xl font-bold mb-3 text-slate-800">
                  {language === 'cs' ? 'Místo pro nový život' : 
                   language === 'it' ? 'Posto per una nuova vita' : 
                   'Place for New Life'}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {language === 'cs' ? 'Plánujete přestěhování a nový začátek v Itálii.' :
                   language === 'it' ? 'State pianificando un trasferimento e un nuovo inizio in Italia.' :
                   'Planning to relocate and start anew in Italy.'}
                </p>
            </div>
          </div>
        </div>

        {/* Contact CTA */}
        <div className="text-center">
            <Card className="max-w-3xl mx-auto bg-white/90 backdrop-blur-sm border border-gray-200 shadow-xl rounded-2xl overflow-hidden">
              <CardContent className="p-12">
                <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  {language === 'cs' ? 'Začněte správně' : 
                   language === 'it' ? 'Inizia correttamente' : 
                   'Start Correctly'}
                </h3>
                <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                  {language === 'cs' ? 'Pokud jste na začátku, doporučujeme nejprve porozumět základům a reálným nákladům koupě domu v Itálii.' :
                   language === 'it' ? 'Se siete all\'inizio, raccomandiamo prima di comprendere le basi e i costi reali dell\'acquisto di una casa in Italia.' :
                   'If you\'re at the beginning, we recommend first understanding the basics and real costs of buying a house in Italy.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/process">
                    <Button size="lg" className="text-white font-semibold px-8 py-6 text-base transition-all duration-300 hover:scale-105 shadow-lg" style={{ background: 'linear-gradient(to right, rgba(199, 137, 91), rgb(153, 105, 69))' }}>
                    {language === 'cs' ? 'Průvodce a zdroje' : 
                     language === 'it' ? 'Guida e risorse' : 
                     'Guide & Resources'}
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-2 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 font-semibold px-8 py-6 text-base transition-all duration-300 hover:scale-105"
                  onClick={() => window.location.href = 'mailto:info@domyvitalii.cz'}
                >
                  <Mail className="h-4 w-4 mr-2" />
                    {language === 'cs' ? 'info@domyvitalii.cz' : 
                     language === 'it' ? 'info@domyvitalii.cz' : 
                     'info@domyvitalii.cz'}
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
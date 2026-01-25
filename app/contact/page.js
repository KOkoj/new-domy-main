'use client'

import { useState, useEffect } from 'react'
import { Mail, Phone, MapPin, Clock, Send, MessageSquare, User as UserIcon, Menu, X, User, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'
import AuthModal from '../../components/AuthModal'

const CONTACT_INFO = [
  {
    icon: <Mail className="h-6 w-6" />,
    title: {
      en: 'Email',
      cs: 'Email',
      it: 'Email'
    },
    value: 'info@domyvitalii.cz',
    link: 'mailto:info@domyvitalii.cz'
  },
  {
    icon: <Phone className="h-6 w-6" />,
    title: {
      en: 'WhatsApp',
      cs: 'WhatsApp',
      it: 'WhatsApp'
    },
    value: {
      en: 'Message us on WhatsApp',
      cs: 'Napište nám na WhatsApp',
      it: 'Scrivici su WhatsApp'
    },
    link: '#' // TODO: Add WhatsApp link when provided
  },
  {
    icon: <MapPin className="h-6 w-6" />,
    title: {
      en: 'Office',
      cs: 'Kancelář',
      it: 'Ufficio'
    },
    value: {
      en: 'Prague, Czech Republic',
      cs: 'Praha, Česká republika',
      it: 'Praga, Repubblica Ceca'
    },
    link: null
  },
  {
    icon: <Clock className="h-6 w-6" />,
    title: {
      en: 'Response Time',
      cs: 'Doba odpovědi',
      it: 'Tempo di risposta'
    },
    value: {
      en: 'Within 24 hours',
      cs: 'Do 24 hodin',
      it: 'Entro 24 ore'
    },
    link: null
  }
]

const INQUIRY_TYPES = [
  {
    en: 'General Inquiry',
    cs: 'Obecný dotaz',
    it: 'Richiesta generale'
  },
  {
    en: 'Property Viewing',
    cs: 'Prohlídka nemovitosti',
    it: 'Visita immobiliare'
  },
  {
    en: 'Purchase Consultation',
    cs: 'Konzultace o koupi',
    it: 'Consulenza acquisto'
  },
  {
    en: 'Legal Assistance',
    cs: 'Právní pomoc',
    it: 'Assistenza legale'
  },
  {
    en: 'Property Management',
    cs: 'Správa nemovitostí',
    it: 'Gestione immobiliare'
  },
  {
    en: 'Other',
    cs: 'Jiné',
    it: 'Altro'
  }
]

export default function ContactPage() {
  const [user, setUser] = useState(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [language, setLanguage] = useState('en')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    inquiryType: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null)

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus(null)

    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          type: 'general',
          propertyTitle: 'General Contact Inquiry'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      setSubmitStatus('success')
      setFormData({
        name: '',
        email: '',
        phone: '',
        inquiryType: '',
        message: ''
      })
    } catch (error) {
      console.error('Error sending message:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
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
                <Link href="/about" className="text-gray-200 hover:text-copper-400 transition-colors">
                  {language === 'cs' ? 'O nás' : language === 'it' ? 'Chi siamo' : 'About'}
                </Link>
                <Link href="/process" className="text-gray-200 hover:text-copper-400 transition-colors">
                  {language === 'cs' ? 'Proces' : language === 'it' ? 'Processo' : 'Process'}
                </Link>
                <Link href="/contact" className="text-gray-200 hover:text-copper-400 transition-colors border-b-2 border-white pb-1">
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

      {/* Main Content */}
      <main className="pt-28 pb-12">
        {/* Hero Section */}
        <section className="bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm mb-8">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-1400 mx-auto text-center">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                {language === 'cs' ? 'Kontaktujte nás' :
                 language === 'it' ? 'Contattaci' :
                 'Contact Us'}
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                {language === 'cs' ? 'Přemýšlíte o koupi domu v Itálii? Napište nám – ozveme se vám s praktickými informacemi a navrhneme další krok.' :
                 language === 'it' ? 'Stai pensando di acquistare una casa in Italia? Scrivici - ti contatteremo con informazioni pratiche e suggeriremo il prossimo passo.' :
                 'Thinking about buying a house in Italy? Write to us - we\'ll get back to you with practical information and suggest the next step.'}
              </p>
            </div>
          </div>
        </section>

        {/* Contact Content */}
        <section className="container mx-auto px-4">
          {/* Contact Information and Form Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Contact Information Sidebar */}
            <aside className="lg:col-span-1 space-y-6">
              {/* Contact Info Card */}
              <Card className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-br from-slate-50 to-white border-b border-gray-100">
                  <CardTitle className="text-2xl font-bold text-slate-800">
                    {language === 'cs' ? 'Kontaktní informace' :
                     language === 'it' ? 'Informazioni di contatto' :
                     'Contact Information'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {CONTACT_INFO.map((info, index) => (
                    <div key={index} className="flex items-start space-x-4 group">
                      <div className="p-3 bg-slate-100 rounded-xl group-hover:bg-slate-200 transition-colors duration-300">
                        <div className="text-slate-600">
                          {info.icon}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-800 mb-1">
                          {typeof info.title === 'string' ? info.title : info.title[language]}
                        </h3>
                        {info.link ? (
                          <a 
                            href={info.link}
                            className="text-gray-600 hover:text-slate-700 transition-colors"
                          >
                            {typeof info.value === 'string' ? info.value : info.value[language]}
                          </a>
                        ) : (
                          <p className="text-gray-600">
                            {typeof info.value === 'string' ? info.value : info.value[language]}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Quick Response Info Card */}
              <Card className="bg-gradient-to-br from-slate-700 to-slate-800 text-white shadow-lg rounded-2xl overflow-hidden">
                <CardContent className="p-6">
                  <MessageSquare className="h-12 w-12 mb-4 opacity-90" />
                  <h3 className="text-xl font-bold mb-2">
                    {language === 'cs' ? 'Rychlá odpověď' :
                     language === 'it' ? 'Risposta veloce' :
                     'Quick Response'}
                  </h3>
                  <p className="text-slate-200 text-sm leading-relaxed">
                    {language === 'cs' ? 'Odpovídáme na všechny dotazy během pracovních dnů. Pro první konzultaci nám napište na email nebo WhatsApp.' :
                     language === 'it' ? 'Rispondiamo a tutte le richieste nei giorni lavorativi. Per la prima consulenza, scriveteci via email o WhatsApp.' :
                     'We respond to all inquiries on business days. For the first consultation, write to us by email or WhatsApp.'}
                  </p>
                </CardContent>
              </Card>
            </aside>

            {/* Contact Form Section */}
            <div className="lg:col-span-2">
              <Card className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-br from-slate-50 to-white border-b border-gray-100">
                  <CardTitle className="text-2xl font-bold text-slate-800">
                    {language === 'cs' ? 'Pošlete nám zprávu' :
                     language === 'it' ? 'Inviaci un messaggio' :
                     'Send Us a Message'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  {/* Success Message */}
                  {submitStatus === 'success' && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-green-800">
                          {language === 'cs' ? 'Zpráva odeslána!' :
                           language === 'it' ? 'Messaggio inviato!' :
                           'Message Sent!'}
                        </h4>
                        <p className="text-sm text-green-700">
                          {language === 'cs' ? 'Děkujeme za vaši zprávu. Brzy vás budeme kontaktovat.' :
                           language === 'it' ? 'Grazie per il messaggio. Ti contatteremo presto.' :
                           'Thank you for your message. We\'ll contact you soon.'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Contact Form */}
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name and Email Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-800">
                          {language === 'cs' ? 'Jméno' :
                           language === 'it' ? 'Nome' :
                           'Name'} *
                        </label>
                        <Input
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          placeholder={language === 'cs' ? 'Vaše jméno' : language === 'it' ? 'Il tuo nome' : 'Your name'}
                          className="border-gray-300 focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-800">
                          {language === 'cs' ? 'Email' :
                           language === 'it' ? 'Email' :
                           'Email'} *
                        </label>
                        <Input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          placeholder={language === 'cs' ? 'vas@email.cz' : language === 'it' ? 'tuo@email.it' : 'your@email.com'}
                          className="border-gray-300 focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                        />
                      </div>
                    </div>

                    {/* Phone and Inquiry Type Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-800">
                          {language === 'cs' ? 'Telefon' :
                           language === 'it' ? 'Telefono' :
                           'Phone'}
                        </label>
                        <Input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="+420 123 456 789"
                          className="border-gray-300 focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-800">
                          {language === 'cs' ? 'Typ dotazu' :
                           language === 'it' ? 'Tipo di richiesta' :
                           'Inquiry Type'} *
                        </label>
                        <select
                          name="inquiryType"
                          value={formData.inquiryType}
                          onChange={handleInputChange}
                          required
                          className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                        >
                          <option value="">
                            {language === 'cs' ? 'Vyberte typ' : language === 'it' ? 'Seleziona tipo' : 'Select type'}
                          </option>
                          {INQUIRY_TYPES.map((type, index) => (
                            <option key={index} value={type.en}>
                              {type[language]}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Message Field */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-800">
                        {language === 'cs' ? 'Zpráva' :
                         language === 'it' ? 'Messaggio' :
                         'Message'} *
                      </label>
                      <Textarea
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                        rows={6}
                        placeholder={language === 'cs' ? 'Napište nám svou zprávu...' : language === 'it' ? 'Scrivi il tuo messaggio...' : 'Write your message...'}
                        className="border-gray-300 focus:ring-2 focus:ring-slate-500 focus:border-slate-500 resize-none"
                      />
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      size="lg"
                      className="w-full bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white font-semibold py-6 text-base transition-all duration-300 hover:scale-105 shadow-lg"
                    >
                      {isSubmitting ? (
                        <span className="animate-pulse">
                          {language === 'cs' ? 'Odesílání...' : language === 'it' ? 'Invio...' : 'Sending...'}
                        </span>
                      ) : (
                        <>
                          <Send className="h-5 w-5 mr-2" />
                          {language === 'cs' ? 'Odeslat zprávu' : language === 'it' ? 'Invia messaggio' : 'Send Message'}
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Call-to-Action Section */}
          <section className="text-center">
            <Card className="max-w-3xl mx-auto bg-white/90 backdrop-blur-sm border border-gray-200 shadow-xl rounded-2xl overflow-hidden">
              <CardContent className="p-12">
                <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  {language === 'cs' ? 'Prozkoumejte naše nemovitosti' :
                   language === 'it' ? 'Esplora le nostre proprietà' :
                   'Explore Our Properties'}
                </h3>
                <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                  {language === 'cs' ? 'Prohlédněte si naši rozsáhlou sbírku italských nemovitostí, od útulných bytů po luxusní vily.' :
                   language === 'it' ? 'Sfoglia la nostra vasta collezione di proprietà italiane, da appartamenti accoglienti a ville di lusso.' :
                   'Browse our extensive collection of Italian properties, from cozy apartments to luxury villas.'}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/properties">
                    <Button size="lg" className="bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white font-semibold px-8 py-6 text-base transition-all duration-300 hover:scale-105 shadow-lg">
                      {language === 'cs' ? 'Zobrazit nemovitosti' :
                       language === 'it' ? 'Visualizza proprietà' :
                       'View Properties'}
                    </Button>
                  </Link>
                  <Link href="/regions">
                    <Button variant="outline" size="lg" className="border-2 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 font-semibold px-8 py-6 text-base transition-all duration-300 hover:scale-105">
                      {language === 'cs' ? 'Procházet regiony' :
                       language === 'it' ? 'Sfoglia regioni' :
                       'Browse Regions'}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </section>
        </section>
      </main>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  )
}


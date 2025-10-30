'use client'

import { useState, useEffect } from 'react'
import { Heart, MapPin, Bed, Bath, Square, Car, Wifi, Utensils, Tv, ArrowLeft, Share2, Calendar, Phone, Mail, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import Link from 'next/link'
import { supabase } from '../../../lib/supabase'

const SAMPLE_PROPERTIES = {
  'luxury-villa-lake-como': {
    _id: '1',
    title: { en: 'Luxury Villa with Lake Como Views', it: 'Villa di Lusso con Vista sul Lago di Como' },
    slug: { current: 'luxury-villa-lake-como' },
    propertyType: 'villa',
    price: { amount: 2500000, currency: 'EUR' },
    description: { 
      en: 'This stunning lakefront villa offers panoramic views of Lake Como and the surrounding Alps. Built in the 18th century and completely renovated in 2020, it combines historical charm with modern luxury. The property features elegant interiors with original frescoes, private gardens extending to the lake, and direct water access with a private dock. Perfect for those seeking tranquility and sophistication in one of Italy\'s most prestigious locations.',
      it: 'Questa splendida villa fronte lago offre viste panoramiche sul Lago di Como e sulle Alpi circostanti.' 
    },
    specifications: { 
      bedrooms: 4, 
      bathrooms: 3, 
      squareFootage: 350,
      yearBuilt: 1750,
      renovated: 2020,
      lotSize: 2000,
      parking: 2
    },
    location: {
      city: {
        name: { en: 'Como', it: 'Como' },
        region: { name: { en: 'Lombardy', it: 'Lombardia' }, country: 'Italy' }
      },
      address: { en: 'Via del Lago 123, Como, Italy' },
      coordinates: { lat: 45.8081, lng: 9.0852 }
    },
    images: [
      '/house_como.jpg',
      '/house_como.jpg',
      '/house_como.jpg',
      '/house_como.jpg'
    ],
    amenities: [
      { name: { en: 'Private Dock' }, category: 'exterior' },
      { name: { en: 'Garden' }, category: 'exterior' },
      { name: { en: 'Swimming Pool' }, category: 'exterior' },
      { name: { en: 'Fireplace' }, category: 'interior' },
      { name: { en: 'Wine Cellar' }, category: 'interior' },
      { name: { en: 'Modern Kitchen' }, category: 'interior' },
      { name: { en: 'Air Conditioning' }, category: 'interior' },
      { name: { en: 'WiFi' }, category: 'services' }
    ],
    developer: {
      name: 'Como Luxury Properties',
      contact: {
        email: 'info@comoluxury.it',
        phone: '+39 031 123 4567',
        website: 'https://comoluxury.it'
      }
    },
    status: 'available',
    featured: true
  },
  'tuscan-farmhouse-vineyards': {
    _id: '2',
    title: { en: 'Tuscan Farmhouse with Vineyards', it: 'Casa Colonica Toscana con Vigneti' },
    slug: { current: 'tuscan-farmhouse-vineyards' },
    propertyType: 'house',
    price: { amount: 1200000, currency: 'EUR' },
    description: { 
      en: 'Authentic Tuscan farmhouse surrounded by rolling hills and vineyards. This beautifully restored 16th-century property offers the perfect blend of rustic charm and modern comfort. Set on 5 hectares of land including productive vineyards, olive groves, and traditional Italian gardens. The property includes original stone walls, terracotta floors, and wooden beam ceilings throughout.',
      it: 'Autentica casa colonica toscana circondata da colline e vigneti.' 
    },
    specifications: { 
      bedrooms: 3, 
      bathrooms: 2, 
      squareFootage: 280,
      yearBuilt: 1580,
      renovated: 2018,
      lotSize: 50000,
      parking: 3
    },
    location: {
      city: {
        name: { en: 'Chianti', it: 'Chianti' },
        region: { name: { en: 'Tuscany', it: 'Toscana' }, country: 'Italy' }
      },
      address: { en: 'Via dei Vigneti 45, Chianti, Tuscany' },
      coordinates: { lat: 43.4643, lng: 11.2558 }
    },
    images: [
      '/house_tuscany_vineyards.jpg',
      '/house_tuscany_vineyards.jpg',
      '/house_tuscany_vineyards.jpg'
    ],
    amenities: [
      { name: { en: 'Vineyard' }, category: 'exterior' },
      { name: { en: 'Olive Grove' }, category: 'exterior' },
      { name: { en: 'Stone Terrace' }, category: 'exterior' },
      { name: { en: 'Traditional Oven' }, category: 'interior' },
      { name: { en: 'Wine Cellar' }, category: 'interior' },
      { name: { en: 'Exposed Beams' }, category: 'interior' }
    ],
    developer: {
      name: 'Tuscany Heritage Properties',
      contact: {
        email: 'info@tuscanyheritage.it',
        phone: '+39 055 987 6543'
      }
    },
    status: 'available',
    featured: true
  }
}

function ImageGallery({ images, title }) {
  const [selectedImage, setSelectedImage] = useState(0)

  return (
    <div className="space-y-4">
      <div className="relative h-96 overflow-hidden rounded-lg">
        <img 
          src={images[selectedImage]} 
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(index)}
              className={`relative h-20 overflow-hidden rounded border-2 transition-colors ${
                selectedImage === index ? 'border-blue-500' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <img 
                src={image} 
                alt={`${title} - Image ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function InquiryForm({ propertyId, propertyTitle, language = 'en' }) {
  const getDefaultMessage = (lang, title) => {
    if (lang === 'cs') return `Dobrý den, mám zájem o ${title}. Můžete mi prosím poskytnout více informací?`
    if (lang === 'it') return `Salve, sono interessato a ${title}. Potrebbe fornirmi maggiori informazioni?`
    return `Hi, I'm interested in ${title}. Could you please provide more information?`
  }

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: getDefaultMessage(language, propertyTitle)
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId: propertyId,
          ...formData
        })
      })

      if (response.ok) {
        setSubmitted(true)
      } else {
        throw new Error('Failed to submit inquiry')
      }
    } catch (error) {
      console.error('Error submitting inquiry:', error)
      const errorMsg = language === 'cs' ? 'Nepodařilo se odeslat dotaz. Zkuste to prosím znovu.' :
                       language === 'it' ? 'Impossibile inviare la richiesta. Per favore riprova.' :
                       'Failed to submit inquiry. Please try again.'
      alert(errorMsg)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="text-slate-800 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">
            {language === 'cs' ? 'Dotaz odeslán!' : language === 'it' ? 'Richiesta Inviata!' : 'Inquiry Sent!'}
          </h3>
          <p className="text-gray-600">
            {language === 'cs' ? 'Děkujeme za váš zájem. Brzy se vám ozveme.' :
             language === 'it' ? 'Grazie per il vostro interesse. Vi risponderemo presto.' :
             'Thank you for your interest. We\'ll get back to you soon.'}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {language === 'cs' ? 'Kontaktovat agenta' : language === 'it' ? 'Contatta Agente' : 'Contact Agent'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">
              {language === 'cs' ? 'Jméno' : language === 'it' ? 'Nome' : 'Name'}
            </label>
            <Input
              required
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder={language === 'cs' ? 'Vaše celé jméno' : language === 'it' ? 'Il tuo nome completo' : 'Your full name'}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Email</label>
            <Input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="your.email@example.com"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">
              {language === 'cs' ? 'Zpráva' : language === 'it' ? 'Messaggio' : 'Message'}
            </label>
            <Textarea
              required
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              placeholder={language === 'cs' ? 'Vaše zpráva...' : language === 'it' ? 'Il tuo messaggio...' : 'Your message...'}
              rows={4}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting 
              ? (language === 'cs' ? 'Odesílání...' : language === 'it' ? 'Invio...' : 'Sending...')
              : (language === 'cs' ? 'Odeslat dotaz' : language === 'it' ? 'Invia Richiesta' : 'Send Inquiry')
            }
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export default function PropertyDetailPage({ params }) {
  const [property, setProperty] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isFavorited, setIsFavorited] = useState(false)
  const [user, setUser] = useState(null)
  const [language, setLanguage] = useState('en')

  useEffect(() => {
    loadProperty()

    // Load saved language preference
    const savedLanguage = localStorage.getItem('preferred-language')
    if (savedLanguage) {
      setLanguage(savedLanguage)
      document.documentElement.lang = savedLanguage
    }

    // Check if user is authenticated
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    checkUser()

    // Listen for language changes from Navigation component
    const handleLanguageChange = (e) => {
      setLanguage(e.detail)
      document.documentElement.lang = e.detail
    }
    
    const handleStorageChange = (e) => {
      if (e.key === 'preferred-language' && e.newValue) {
        setLanguage(e.newValue)
      }
    }
    
    window.addEventListener('languageChange', handleLanguageChange)
    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      window.removeEventListener('languageChange', handleLanguageChange)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [params.slug])

  const loadProperty = async () => {
    try {
      setLoading(true)
      const slug = params.slug
      
      // Try to fetch from Sanity API first
      try {
        const response = await fetch(`/api/properties/${slug}`)
        if (response.ok) {
          const sanityProperty = await response.json()
          
          // Transform Sanity property to match expected format
          const transformedProperty = {
            _id: sanityProperty._id,
            title: sanityProperty.title,
            slug: sanityProperty.slug,
            propertyType: sanityProperty.propertyType,
            price: sanityProperty.price,
            description: sanityProperty.description,
            specifications: sanityProperty.specifications,
            location: sanityProperty.location,
            images: sanityProperty.images?.map(img => {
              // Handle different image structures
              if (typeof img === 'string') return img
              if (img.url) return img.url
              if (img.asset?.url) return img.asset.url
              return null
            }).filter(Boolean) || [],
            amenities: sanityProperty.amenities || [],
            developer: sanityProperty.developer,
            status: sanityProperty.status || 'available',
            featured: sanityProperty.featured || false
          }
          
          setProperty(transformedProperty)
          
          // Check favorite status if user is logged in
          if (user) {
            checkFavoriteStatus(transformedProperty._id)
          }
          
          setLoading(false)
          return
        }
      } catch (apiError) {
        console.log('Sanity API not available, trying sample data:', apiError)
      }
      
      // Fallback to sample data
      const foundProperty = SAMPLE_PROPERTIES[slug]
      if (foundProperty) {
        setProperty(foundProperty)
        if (user) {
          checkFavoriteStatus(foundProperty._id)
        }
      }
    } catch (error) {
      console.error('Error loading property:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user && property) {
      checkFavoriteStatus(property._id)
    }
  }, [user, property])

  const checkFavoriteStatus = async (propertyId) => {
    try {
      const response = await fetch('/api/favorites')
      if (response.ok) {
        const favorites = await response.json()
        setIsFavorited(favorites.some(f => f.listingId === propertyId))
      }
    } catch (error) {
      console.error('Error checking favorite status:', error)
    }
  }

  const handleFavorite = async () => {
    if (!user) {
      alert('Please login to save favorites')
      return
    }

    try {
      const response = await fetch('/api/favorites/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId: property._id })
      })
      
      if (response.ok) {
        const result = await response.json()
        setIsFavorited(result.favorited)
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: price.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price.amount)
  }

  // Helper function to get localized text
  const getLocalizedText = (field, fallback = 'Not specified') => {
    if (!field) return fallback
    if (typeof field === 'string') return field
    return field[language] || field['en'] || field['it'] || field['cs'] || Object.values(field)[0] || fallback
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {language === 'cs' ? 'Načítání nemovitosti...' : language === 'it' ? 'Caricamento proprietà...' : 'Loading property...'}
          </p>
        </div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">
            {language === 'cs' ? 'Nemovitost nenalezena' : language === 'it' ? 'Proprietà non trovata' : 'Property Not Found'}
          </h1>
          <p className="text-gray-600 mb-4">
            {language === 'cs' ? 'Nemovitost, kterou hledáte, neexistuje.' : 
             language === 'it' ? 'La proprietà che stai cercando non esiste.' : 
             'The property you\'re looking for doesn\'t exist.'}
          </p>
          <Link href="/properties">
            <Button>
              {language === 'cs' ? 'Procházet všechny nemovitosti' : 
               language === 'it' ? 'Sfoglia tutte le proprietà' : 
               'Browse All Properties'}
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modern Navigation - Fixed with smaller inline logo like About/Process pages */}
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
                <Link href="/properties" className="text-gray-200 hover:text-copper-400 transition-colors border-b-2 border-white pb-1">
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
                <Link href="/contact" className="text-gray-200 hover:text-copper-400 transition-colors">
                  {language === 'cs' ? 'Kontakt' : language === 'it' ? 'Contatto' : 'Contact'}
                </Link>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Language Selector */}
              <div className="group flex items-center bg-white/10 backdrop-blur-md rounded-full px-3 py-2 shadow-lg border border-white/20 transition-all duration-300 hover:shadow-xl hover:bg-white/20 hover:px-6 w-auto gap-2">
                <button
                  onClick={() => {
                    setLanguage('en')
                    document.documentElement.lang = 'en'
                    localStorage.setItem('preferred-language', 'en')
                    window.dispatchEvent(new CustomEvent('languageChange', { detail: 'en' }))
                  }}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ease-in-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-400 ${
                    language === 'en' 
                      ? 'bg-white/20 text-white shadow-md backdrop-blur-sm' 
                      : 'text-white/60 hover:text-white/90 hover:bg-white/5 opacity-0 group-hover:opacity-100 absolute group-hover:relative group-hover:mx-1'
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => {
                    setLanguage('cs')
                    document.documentElement.lang = 'cs'
                    localStorage.setItem('preferred-language', 'cs')
                    window.dispatchEvent(new CustomEvent('languageChange', { detail: 'cs' }))
                  }}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ease-in-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-400 ${
                    language === 'cs' 
                      ? 'bg-white/20 text-white shadow-md backdrop-blur-sm' 
                      : 'text-white/60 hover:text-white/90 hover:bg-white/5 opacity-0 group-hover:opacity-100 absolute group-hover:relative group-hover:mx-1'
                  }`}
                >
                  CS
                </button>
                <button
                  onClick={() => {
                    setLanguage('it')
                    document.documentElement.lang = 'it'
                    localStorage.setItem('preferred-language', 'it')
                    window.dispatchEvent(new CustomEvent('languageChange', { detail: 'it' }))
                  }}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ease-in-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-400 ${
                    language === 'it' 
                      ? 'bg-white/20 text-white shadow-md backdrop-blur-sm' 
                      : 'text-white/60 hover:text-white/90 hover:bg-white/5 opacity-0 group-hover:opacity-100 absolute group-hover:relative group-hover:mx-1'
                  }`}
                >
                  IT
                </button>
              </div>

              {user ? (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-200" />
                    <span className="text-sm text-gray-200 hidden md:inline">
                      {user.user_metadata?.name || user.email}
                    </span>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={async () => {
                      await supabase.auth.signOut()
                      setUser(null)
                    }}
                    className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/50 transition-all duration-200 rounded-full px-4 py-2 text-sm"
                  >
                    {language === 'cs' ? 'Odhlásit' : language === 'it' ? 'Esci' : 'Logout'}
                  </Button>
                </div>
              ) : (
                <div className="bg-white/10 backdrop-blur-md rounded-full px-4 py-2 shadow-lg border border-white/20">
                  <Link href="/login" className="text-sm font-medium text-white/90 hover:text-white transition-colors">
                    {language === 'cs' ? 'Přihlásit' : language === 'it' ? 'Accedi' : 'Login'}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Spacing for fixed navbar */}
      <div className="h-20"></div>
      
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/properties">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {language === 'cs' ? 'Zpět na nemovitosti' : language === 'it' ? 'Torna alle proprietà' : 'Back to Properties'}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Property Header */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge variant="secondary" className="capitalize">
                      {property.propertyType}
                    </Badge>
                    {property.featured && (
                      <Badge className="bg-yellow-500 hover:bg-yellow-600">
                        {language === 'cs' ? 'Doporučeno' : language === 'it' ? 'In evidenza' : 'Featured'}
                      </Badge>
                    )}
                    <Badge variant="outline" className="capitalize">
                      {property.status === 'available' 
                        ? (language === 'cs' ? 'Dostupné' : language === 'it' ? 'Disponibile' : 'Available')
                        : property.status === 'reserved'
                        ? (language === 'cs' ? 'Rezervováno' : language === 'it' ? 'Riservato' : 'Reserved')
                        : property.status === 'sold'
                        ? (language === 'cs' ? 'Prodáno' : language === 'it' ? 'Venduto' : 'Sold')
                        : property.status
                      }
                    </Badge>
                  </div>
                  <h1 className="text-3xl font-bold mb-2">
                    {getLocalizedText(property.title, 'Untitled Property')}
                  </h1>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-4 w-4 mr-1" />
                    {getLocalizedText(property.location?.address) || 
                     getLocalizedText(property.location?.city?.name) || 
                     'Location not specified'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {formatPrice(property.price)}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Share2 className="h-4 w-4 mr-1" />
                      {language === 'cs' ? 'Sdílet' : language === 'it' ? 'Condividi' : 'Share'}
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleFavorite}>
                      <Heart className={`h-4 w-4 mr-1 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
                      {isFavorited 
                        ? (language === 'cs' ? 'Uloženo' : language === 'it' ? 'Salvato' : 'Saved')
                        : (language === 'cs' ? 'Uložit' : language === 'it' ? 'Salva' : 'Save')
                      }
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Image Gallery */}
            <ImageGallery 
              images={property.images || []} 
              title={getLocalizedText(property.title, 'Property')} 
            />

            {/* Property Details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-white rounded-lg border">
                <Bed className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl font-bold">{property.specifications.bedrooms}</div>
                <div className="text-sm text-gray-600">
                  {language === 'cs' ? 'Ložnice' : language === 'it' ? 'Camere' : 'Bedrooms'}
                </div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border">
                <Bath className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl font-bold">{property.specifications.bathrooms}</div>
                <div className="text-sm text-gray-600">
                  {language === 'cs' ? 'Koupelny' : language === 'it' ? 'Bagni' : 'Bathrooms'}
                </div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border">
                <Square className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl font-bold">{property.specifications.squareFootage}</div>
                <div className="text-sm text-gray-600">m²</div>
              </div>
              {property.specifications.parking && (
                <div className="text-center p-4 bg-white rounded-lg border">
                  <Car className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <div className="text-2xl font-bold">{property.specifications.parking}</div>
                  <div className="text-sm text-gray-600">
                    {language === 'cs' ? 'Parkování' : language === 'it' ? 'Parcheggio' : 'Parking'}
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {language === 'cs' ? 'Popis' : language === 'it' ? 'Descrizione' : 'Description'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {getLocalizedText(property.description, 'No description available.')}
                </p>
              </CardContent>
            </Card>

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    {language === 'cs' ? 'Vybavení a vlastnosti' : language === 'it' ? 'Servizi e Caratteristiche' : 'Amenities & Features'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {property.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        <span className="text-sm">{getLocalizedText(amenity.name)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Property Details */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {language === 'cs' ? 'Detail nemovitosti' : language === 'it' ? 'Dettagli Proprietà' : 'Property Details'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {property.specifications.yearBuilt && (
                    <div>
                      <span className="text-sm text-gray-600">
                        {language === 'cs' ? 'Rok výstavby:' : language === 'it' ? 'Anno di costruzione:' : 'Year Built:'}
                      </span>
                      <span className="ml-2 font-medium">{property.specifications.yearBuilt}</span>
                    </div>
                  )}
                  {property.specifications.renovated && (
                    <div>
                      <span className="text-sm text-gray-600">
                        {language === 'cs' ? 'Rekonstrukce:' : language === 'it' ? 'Ristrutturato:' : 'Renovated:'}
                      </span>
                      <span className="ml-2 font-medium">{property.specifications.renovated}</span>
                    </div>
                  )}
                  {property.specifications.lotSize && (
                    <div>
                      <span className="text-sm text-gray-600">
                        {language === 'cs' ? 'Velikost pozemku:' : language === 'it' ? 'Dimensione lotto:' : 'Lot Size:'}
                      </span>
                      <span className="ml-2 font-medium">{property.specifications.lotSize.toLocaleString()} m²</span>
                    </div>
                  )}
                  <div>
                    <span className="text-sm text-gray-600">
                      {language === 'cs' ? 'Typ nemovitosti:' : language === 'it' ? 'Tipo di proprietà:' : 'Property Type:'}
                    </span>
                    <span className="ml-2 font-medium capitalize">{property.propertyType}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Inquiry Form */}
            <InquiryForm 
              propertyId={property._id} 
              propertyTitle={getLocalizedText(property.title)}
              language={language}
            />

            {/* Developer Info */}
            {property.developer && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    {language === 'cs' ? 'Nabízí' : language === 'it' ? 'Offerto da' : 'Listed By'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <h4 className="font-semibold">{property.developer.name}</h4>
                    {property.developer.contact && (
                      <div className="space-y-2">
                        {property.developer.contact.phone && (
                          <div className="flex items-center space-x-2 text-sm">
                            <Phone className="h-4 w-4 text-gray-600" />
                            <span>{property.developer.contact.phone}</span>
                          </div>
                        )}
                        {property.developer.contact.email && (
                          <div className="flex items-center space-x-2 text-sm">
                            <Mail className="h-4 w-4 text-gray-600" />
                            <span>{property.developer.contact.email}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {language === 'cs' ? 'Rychlé akce' : language === 'it' ? 'Azioni Rapide' : 'Quick Actions'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full">
                  <Calendar className="h-4 w-4 mr-2" />
                  {language === 'cs' ? 'Naplánovat prohlídku' : language === 'it' ? 'Pianifica Visita' : 'Schedule Viewing'}
                </Button>
                <Button variant="outline" className="w-full">
                  {language === 'cs' ? 'Požádat o virtuální prohlídku' : language === 'it' ? 'Richiedi Tour Virtuale' : 'Request Virtual Tour'}
                </Button>
                <Button variant="outline" className="w-full">
                  {language === 'cs' ? 'Vypočítat hypotéku' : language === 'it' ? 'Calcola Mutuo' : 'Calculate Mortgage'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
'use client'

import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { Heart, MapPin, Home, Bed, Bath, Square, Car, Wifi, Utensils, Tv, ArrowLeft, Share2, Calendar, Phone, Mail, User, X, ChevronLeft, ChevronRight, ZoomIn, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import Link from 'next/link'
import { supabase } from '../../../lib/supabase'
import { urlForImage } from '../../../lib/sanity'
import { formatPrice as formatPriceUtil } from '../../../lib/currency'
import FormPrivacyNotice from '@/components/legal/FormPrivacyNotice'
import AuthModal from '../../../components/AuthModal'
import Footer from '@/components/Footer'

function getPropertyStatusLabel(status, language) {
  if (status === 'sold') {
    return language === 'cs' ? 'Prodano' : language === 'it' ? 'Venduto' : 'Sold'
  }

  if (status === 'reserved') {
    return language === 'cs' ? 'Rezervovano' : language === 'it' ? 'Riservato' : 'Reserved'
  }

  return null
}

const PROPERTY_TYPE_LABELS = {
  apartment: { cs: 'Byt', it: 'Appartamento', en: 'Apartment' },
  house: { cs: 'Dům', it: 'Casa', en: 'House' },
  villa: { cs: 'Vila', it: 'Villa', en: 'Villa' },
  rustic: { cs: 'Rustikální dům', it: 'Rustico', en: 'Rustic property' },
  land: { cs: 'Pozemek', it: 'Terreno', en: 'Land' },
}

function getPropertyTypeLabel(propertyType, language) {
  const key = String(propertyType || '').toLowerCase()
  return PROPERTY_TYPE_LABELS[key]?.[language] || PROPERTY_TYPE_LABELS[key]?.en || propertyType || '-'
}

function ImageGallery({ images, title, status, language }) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [mounted, setMounted] = useState(false)
  const statusLabel = getPropertyStatusLabel(status, language)

  useEffect(() => { setMounted(true) }, [])

  const openLightbox = (index) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }

  const closeLightbox = () => setLightboxOpen(false)

  const prevImage = useCallback(() => {
    setLightboxIndex((i) => (i - 1 + images.length) % images.length)
  }, [images.length])

  const nextImage = useCallback(() => {
    setLightboxIndex((i) => (i + 1) % images.length)
  }, [images.length])

  useEffect(() => {
    if (!lightboxOpen) return
    const onKey = (e) => {
      if (e.key === 'ArrowLeft') prevImage()
      else if (e.key === 'ArrowRight') nextImage()
      else if (e.key === 'Escape') closeLightbox()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightboxOpen, prevImage, nextImage])

  useEffect(() => {
    if (lightboxOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [lightboxOpen])

  if (!images || images.length === 0) {
    return (
      <div className="aspect-[4/3] w-full bg-gray-200 rounded-xl flex items-center justify-center">
        <span className="text-gray-400">No images available</span>
      </div>
    )
  }

  return (
    <>
      {/* Gallery mosaic */}
      <div className="relative">
        {images.length === 1 ? (
          /* Single image — full width */
          <div
            className="relative aspect-[4/3] overflow-hidden rounded-xl cursor-zoom-in group"
            onClick={() => openLightbox(0)}
          >
            <Image
              src={images[0]}
              alt={title}
              fill
              sizes="(min-width: 1024px) 66vw, 100vw"
              priority
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
            {statusLabel && (
              <div className="absolute left-4 top-4 z-10">
                <span className={`inline-flex items-center rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-white shadow-lg ${status === 'sold' ? 'bg-red-600/95' : 'bg-amber-600/95'}`}>
                  {statusLabel}
                </span>
              </div>
            )}
          </div>
        ) : (
          /* Multi-image mosaic: hero left + grid right */
          <div className="grid grid-cols-[3fr_2fr] gap-2 rounded-xl overflow-hidden h-[260px] sm:h-[480px]">
            {/* Hero */}
            <div
              className="relative overflow-hidden cursor-zoom-in group h-full"
              onClick={() => openLightbox(0)}
            >
              <Image
                src={images[0]}
                alt={title}
                fill
                sizes="(min-width: 640px) 58vw, 75vw"
                priority
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
              {statusLabel && (
                <div className="absolute left-4 top-4 z-10">
                  <span className={`inline-flex items-center rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-white shadow-lg ${status === 'sold' ? 'bg-red-600/95' : 'bg-amber-600/95'}`}>
                    {statusLabel}
                  </span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
            </div>

            {/* Right column: 2 stacked on mobile, 2×2 grid on sm+ */}
            <div className="grid grid-cols-1 grid-rows-2 sm:grid-cols-2 sm:grid-rows-2 gap-2 h-full">
              {[1, 2, 3, 4].map((slot) => {
                const img = images[slot]
                const mobileHide = slot >= 3 ? 'hidden sm:block' : ''
                if (!img) {
                  return <div key={slot} className={`bg-gray-100 ${mobileHide}`} />
                }
                const showOverlay = slot === 4 && images.length > 5
                return (
                  <div
                    key={slot}
                    className={`relative overflow-hidden cursor-zoom-in group ${mobileHide}`}
                    onClick={() => openLightbox(slot)}
                  >
                    <Image
                      src={img}
                      alt={`${title} - ${slot + 1}`}
                      fill
                      sizes="(min-width: 640px) 20vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors duration-300" />
                    {showOverlay && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center pointer-events-none">
                        <span className="text-white text-lg font-semibold">+{images.length - 5}</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* "Show all photos" button */}
        {images.length > 1 && (
          <button
            onClick={() => openLightbox(0)}
            className="absolute bottom-4 right-4 z-10 flex items-center gap-2 rounded-lg bg-white/95 border border-gray-200 px-4 py-2 text-sm font-medium text-gray-800 shadow-md hover:bg-white hover:shadow-lg transition-all duration-200"
          >
            <ZoomIn className="h-4 w-4" />
            {language === 'cs'
              ? `Všechny fotky (${images.length})`
              : language === 'it'
              ? `Tutte le foto (${images.length})`
              : `All ${images.length} photos`}
          </button>
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && mounted && createPortal(
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 9999 }}
          className="flex items-center justify-center bg-black/90"
          onClick={closeLightbox}
        >
          {/* Close */}
          <button
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/25 transition-colors"
            onClick={closeLightbox}
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Counter */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 rounded-full bg-black/50 px-4 py-1.5 text-sm text-white">
            {lightboxIndex + 1} / {images.length}
          </div>

          {/* Prev */}
          {images.length > 1 && (
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white text-gray-900 shadow-xl hover:bg-gray-100 active:scale-95 transition-all"
              onClick={(e) => { e.stopPropagation(); prevImage() }}
              aria-label="Previous image"
            >
              <ChevronLeft className="h-7 w-7" />
            </button>
          )}

          {/* Image */}
          <div
            className="relative max-h-[80vh] max-w-[90vw] w-full h-full flex items-center justify-center pb-20"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              key={lightboxIndex}
              src={images[lightboxIndex]}
              alt={`${title} - Image ${lightboxIndex + 1}`}
              fill
              sizes="90vw"
              className="object-contain"
              priority
            />
          </div>

          {/* Next */}
          {images.length > 1 && (
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white text-gray-900 shadow-xl hover:bg-gray-100 active:scale-95 transition-all"
              onClick={(e) => { e.stopPropagation(); nextImage() }}
              aria-label="Next image"
            >
              <ChevronRight className="h-7 w-7" />
            </button>
          )}

          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div
              className="absolute bottom-0 left-0 right-0 z-10 bg-black/60 px-4 py-3"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex gap-2 overflow-x-auto pb-1 justify-center">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setLightboxIndex(idx)}
                    className={`relative flex-shrink-0 h-14 w-20 overflow-hidden rounded-sm transition-all duration-200 ${
                      idx === lightboxIndex
                        ? 'ring-2 ring-white scale-105 opacity-100'
                        : 'opacity-40 hover:opacity-70'
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${title} - ${idx + 1}`}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      , document.body)}
    </>
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
          {language === 'cs' ? 'Kontaktovat nás' : language === 'it' ? 'Contatta Agente' : 'Contact Agent'}
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
          <FormPrivacyNotice language={language} purpose="property" />
        </form>
      </CardContent>
    </Card>
  )
}

export default function PropertyDetailPage() {
  const routeParams = useParams()
  const slugParam = Array.isArray(routeParams?.slug) ? routeParams.slug[0] : routeParams?.slug
  const [property, setProperty] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isFavorited, setIsFavorited] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [language, setLanguage] = useState('en')
  const [currency, setCurrency] = useState('EUR')
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    if (slugParam) {
      loadProperty(slugParam)
    }

    // Load saved language preference
    const savedLanguage = localStorage.getItem('preferred-language')
    if (savedLanguage) {
      setLanguage(savedLanguage)
      document.documentElement.lang = savedLanguage
    }

    // Load saved currency preference
    const savedCurrency = localStorage.getItem('preferred-currency')
    if (savedCurrency) {
      setCurrency(savedCurrency)
    }

    // Check if user is authenticated
    const checkUser = async () => {
      if (!supabase) return
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    checkUser()

    // Listen for language and currency changes from Navigation component
    const handleLanguageChange = (e) => {
      setLanguage(e.detail)
      document.documentElement.lang = e.detail
    }
    
    const handleStorageChange = (e) => {
      if (e.key === 'preferred-language' && e.newValue) {
        setLanguage(e.newValue)
      }
      if (e.key === 'preferred-currency' && e.newValue) {
        setCurrency(e.newValue)
      }
    }
    
    window.addEventListener('languageChange', handleLanguageChange)
    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      window.removeEventListener('languageChange', handleLanguageChange)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [slugParam])

  const loadProperty = async (slug) => {
    try {
      setLoading(true)
      
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
              
              // Try using Sanity image builder
              try {
                const url = urlForImage(img)?.url()
                if (url) return url
              } catch (e) {
                console.error('Error generating image URL:', e)
              }
              
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
        console.log('Sanity API not available:', apiError)
      }
      
      // Property not found - setProperty remains null
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
      setIsAuthModalOpen(true)
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
    return formatPriceUtil(price, currency, language)
  }

  const handleAuthSuccess = (authUser) => {
    setUser(authUser)
    setIsAuthModalOpen(false)
    if (property?._id) {
      checkFavoriteStatus(property._id)
    }
  }

  const handleCurrencyChange = (newCurrency) => {
    setCurrency(newCurrency)
    localStorage.setItem('preferred-currency', newCurrency)
  }

  // Helper function to get localized text
  const getLocalizedText = (field, fallback = 'Not specified') => {
    if (!field) return fallback
    if (typeof field === 'string') return field
    return field[language] || field['en'] || field['it'] || field['cs'] || Object.values(field)[0] || fallback
  }

  if (loading) {
    return (
    <div className="min-h-screen bg-[#f7f6f3] flex items-center justify-center">
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
    <div className="min-h-screen bg-[#f7f6f3] flex items-center justify-center">
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

  const specifications = property.specifications || {}
  const localizedAddress = getLocalizedText(property.location?.address, '')
  const localizedCity = getLocalizedText(property.location?.city?.name, '')
  const fallbackLocation = language === 'cs'
    ? 'Lokalita neuvedena'
    : language === 'it'
    ? 'Posizione non specificata'
    : 'Location not specified'
  const locationText = localizedAddress || localizedCity || fallbackLocation
  const hasLocation = Boolean(localizedAddress || localizedCity)
  const mapsQuery = hasLocation
    ? [localizedAddress, localizedCity, 'Italy']
        .filter((value, index, array) => value && array.indexOf(value) === index)
        .join(', ')
    : ''
  const googleMapsUrl = mapsQuery
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery)}`
    : ''

  return (
    <div className="min-h-screen bg-[#f7f6f3]">
      {/* Modern Navigation - Fixed with smaller inline logo like About/Process pages */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md shadow-lg overflow-visible border-b border-white/20" style={{ backgroundColor: 'rgba(14, 21, 46, 0.9)' }}>
        <div className="container mx-auto px-4 sm:px-6 pt-4 pb-3 overflow-visible" style={{ maxWidth: '1200px' }}>
          <div className="flex items-center justify-between">
            {/* Logo + desktop nav links */}
            <div className="flex items-center space-x-8">
              <Link href="/" className="relative overflow-visible">
                <Image
                  src="/logo domy.svg"
                  alt="Domy v Itálii"
                  width={48}
                  height={46}
                  priority
                  className="h-12 w-auto cursor-pointer"
                  style={{ filter: 'drop-shadow(0 2px 6px rgba(0, 0, 0, 0.4))' }}
                />
              </Link>
              <div className="hidden md:flex space-x-6">
                <Link href="/" className="text-gray-200 hover:text-white transition-colors text-sm">
                  {language === 'cs' ? 'Domů' : language === 'it' ? 'Casa' : 'Home'}
                </Link>
                <Link href="/properties" className="text-white transition-colors border-b-2 border-white pb-1 text-sm">
                  {language === 'cs' ? 'Nemovitosti' : language === 'it' ? 'Proprietà' : 'Properties'}
                </Link>
                <Link href="/regions" className="text-gray-200 hover:text-white transition-colors text-sm">
                  {language === 'cs' ? 'Regiony' : language === 'it' ? 'Regioni' : 'Regions'}
                </Link>
                <Link href="/about" className="text-gray-200 hover:text-white transition-colors text-sm">
                  {language === 'cs' ? 'O nás' : language === 'it' ? 'Chi siamo' : 'About'}
                </Link>
                <Link href="/process" className="text-gray-200 hover:text-white transition-colors text-sm">
                  {language === 'cs' ? 'Proces' : language === 'it' ? 'Processo' : 'Process'}
                </Link>
                <Link href="/contact" className="text-gray-200 hover:text-white transition-colors text-sm">
                  {language === 'cs' ? 'Kontakt' : language === 'it' ? 'Contatto' : 'Contact'}
                </Link>
              </div>
            </div>

            {/* Desktop right-side controls */}
            <div className="flex items-center gap-2">
              {/* Language Selector — desktop only */}
              <div className="hidden sm:flex items-center bg-white/10 rounded-full px-1 py-1 border border-white/15 gap-0.5">
                {['en', 'cs', 'it'].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => {
                      setLanguage(lang)
                      document.documentElement.lang = lang
                      localStorage.setItem('preferred-language', lang)
                      window.dispatchEvent(new CustomEvent('languageChange', { detail: lang }))
                    }}
                    className={`cursor-pointer px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                      language === lang
                        ? 'bg-white/20 text-white shadow-sm'
                        : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                    }`}
                  >
                    {lang.toUpperCase()}
                  </button>
                ))}
              </div>

              {/* Currency Selector — desktop only */}
              <div className="hidden sm:flex items-center bg-white/10 rounded-full px-1 py-1 border border-white/15 gap-0.5">
                {['EUR', 'CZK'].map((cur) => (
                  <button
                    key={cur}
                    onClick={() => handleCurrencyChange(cur)}
                    className={`cursor-pointer px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                      currency === cur
                        ? 'bg-white/20 text-white shadow-sm'
                        : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                    }`}
                  >
                    {cur}
                  </button>
                ))}
              </div>

              {/* Login / user — desktop only */}
              {user ? (
                <div className="hidden sm:flex items-center gap-2">
                  <span className="text-xs text-gray-300 hidden md:inline truncate max-w-[100px]">
                    {user.user_metadata?.name || user.email}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      if (!supabase) return
                      await supabase.auth.signOut()
                      setUser(null)
                    }}
                    className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/50 rounded-full text-xs px-3 py-1.5"
                  >
                    {language === 'cs' ? 'Odhlásit' : language === 'it' ? 'Esci' : 'Logout'}
                  </Button>
                </div>
              ) : (
                <div className="hidden sm:block bg-white/10 backdrop-blur-md rounded-full px-4 py-1.5 border border-white/20">
                  <Link href="/login" className="text-xs font-medium text-white/90 hover:text-white transition-colors">
                    {language === 'cs' ? 'Přihlásit' : language === 'it' ? 'Accedi' : 'Login'}
                  </Link>
                </div>
              )}

              {/* Hamburger — mobile only */}
              <button
                className="md:hidden p-2 rounded-lg cursor-pointer text-gray-200 hover:text-white hover:bg-white/10 transition-colors"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile drawer */}
          <div className={`md:hidden overflow-hidden transition-all duration-200 ease-out ${isMenuOpen ? 'max-h-[80dvh] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="flex flex-col space-y-1 pt-4 pb-6 mt-3 border-t border-white/10 overflow-y-auto">
              {[
                { href: '/', label: language === 'cs' ? 'Domů' : language === 'it' ? 'Casa' : 'Home' },
                { href: '/properties', label: language === 'cs' ? 'Nemovitosti' : language === 'it' ? 'Proprietà' : 'Properties' },
                { href: '/regions', label: language === 'cs' ? 'Regiony' : language === 'it' ? 'Regioni' : 'Regions' },
                { href: '/about', label: language === 'cs' ? 'O nás' : language === 'it' ? 'Chi siamo' : 'About' },
                { href: '/process', label: language === 'cs' ? 'Proces' : language === 'it' ? 'Processo' : 'Process' },
                { href: '/contact', label: language === 'cs' ? 'Kontakt' : language === 'it' ? 'Contatto' : 'Contact' },
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setIsMenuOpen(false)}
                  className="px-3 py-2.5 rounded-lg text-base text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                >
                  {label}
                </Link>
              ))}

              {/* Language + Currency in mobile menu */}
              <div className="flex flex-wrap gap-3 pt-3 mt-2 border-t border-white/10 px-1">
                <div className="flex items-center gap-1 bg-white/10 rounded-full px-1 py-1 border border-white/15">
                  {['en', 'cs', 'it'].map((lang) => (
                    <button
                      key={lang}
                      onClick={() => {
                        setLanguage(lang)
                        document.documentElement.lang = lang
                        localStorage.setItem('preferred-language', lang)
                        window.dispatchEvent(new CustomEvent('languageChange', { detail: lang }))
                      }}
                      className={`cursor-pointer px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                        language === lang
                          ? 'bg-white/20 text-white'
                          : 'text-white/50 hover:text-white/80'
                      }`}
                    >
                      {lang.toUpperCase()}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-1 bg-white/10 rounded-full px-1 py-1 border border-white/15">
                  {['EUR', 'CZK'].map((cur) => (
                    <button
                      key={cur}
                      onClick={() => handleCurrencyChange(cur)}
                      className={`cursor-pointer px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                        currency === cur
                          ? 'bg-white/20 text-white'
                          : 'text-white/50 hover:text-white/80'
                      }`}
                    >
                      {cur}
                    </button>
                  ))}
                </div>
              </div>

              {/* Login in mobile menu */}
              {user ? (
                <button
                  onClick={async () => {
                    if (!supabase) return
                    await supabase.auth.signOut()
                    setUser(null)
                    setIsMenuOpen(false)
                  }}
                  className="px-3 py-2.5 rounded-lg text-base text-red-400 hover:text-red-300 hover:bg-white/5 transition-colors text-left"
                >
                  {language === 'cs' ? 'Odhlásit' : language === 'it' ? 'Esci' : 'Logout'}
                </button>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="px-3 py-2.5 rounded-lg text-base text-amber-300 hover:text-amber-200 hover:bg-white/5 transition-colors font-medium"
                >
                  {language === 'cs' ? 'Přihlásit / Registrovat' : language === 'it' ? 'Accedi / Registrati' : 'Login / Register'}
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Spacing for fixed navbar */}
      <div className="h-20"></div>
      
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-6 py-4" style={{ maxWidth: '1200px' }}>
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

      <div className="container mx-auto px-4 sm:px-6 py-8 md:py-16 lg:py-24" style={{ maxWidth: '1200px' }}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Property Header */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <Badge variant="secondary" className="capitalize">
                      {getPropertyTypeLabel(property.propertyType, language)}
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
                  <h1 className="font-bold mb-2 text-2xl sm:text-3xl leading-tight">
                    {getLocalizedText(property.title, 'Untitled Property')}
                  </h1>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-4 w-4 mr-1 shrink-0" />
                    {googleMapsUrl ? (
                      <a
                        href={googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline decoration-dotted underline-offset-2 hover:text-blue-600 transition-colors"
                      >
                        {locationText}
                      </a>
                    ) : (
                      <span>{locationText}</span>
                    )}
                  </div>
                </div>
                <div className="sm:text-right shrink-0">
                  <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-2">
                    {formatPrice(property.price)}
                  </div>
                  <div className="flex items-center sm:justify-end gap-2 flex-wrap">
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
              status={property.status}
              language={language}
            />

            {/* Property Details */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              <div className="text-center p-4 bg-white rounded-lg border">
                <Home className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl font-bold">{specifications.rooms || specifications.bedrooms || 0}</div>
                <div className="text-sm text-gray-600">
                  {language === 'cs' ? 'Mistnosti' : language === 'it' ? 'Locali' : 'Rooms'}
                </div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border">
                <Bed className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl font-bold">{specifications.bedrooms || 0}</div>
                <div className="text-sm text-gray-600">
                  {language === 'cs' ? 'Ložnice' : language === 'it' ? 'Camere' : 'Bedrooms'}
                </div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border">
                <Bath className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl font-bold">{specifications.bathrooms || 0}</div>
                <div className="text-sm text-gray-600">
                  {language === 'cs' ? 'Koupelny' : language === 'it' ? 'Bagni' : 'Bathrooms'}
                </div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border">
                <Square className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl font-bold">{specifications.squareFootage || 0}</div>
                <div className="text-sm text-gray-600">m²</div>
              </div>
              {specifications.parking && (
                <div className="text-center p-4 bg-white rounded-lg border">
                  <Car className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <div className="text-2xl font-bold">{specifications.parking}</div>
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
                <div className="grid grid-cols-2 gap-6">
                  {specifications.yearBuilt && (
                    <div>
                      <span className="text-sm text-gray-600">
                        {language === 'cs' ? 'Rok výstavby:' : language === 'it' ? 'Anno di costruzione:' : 'Year Built:'}
                      </span>
                      <span className="ml-2 font-medium">{specifications.yearBuilt}</span>
                    </div>
                  )}
                  {specifications.renovated && (
                    <div>
                      <span className="text-sm text-gray-600">
                        {language === 'cs' ? 'Rekonstrukce:' : language === 'it' ? 'Ristrutturato:' : 'Renovated:'}
                      </span>
                      <span className="ml-2 font-medium">{specifications.renovated}</span>
                    </div>
                  )}
                  {specifications.lotSize && (
                    <div>
                      <span className="text-sm text-gray-600">
                        {language === 'cs' ? 'Velikost pozemku:' : language === 'it' ? 'Dimensione lotto:' : 'Lot Size:'}
                      </span>
                      <span className="ml-2 font-medium">{Number(specifications.lotSize).toLocaleString()} m²</span>
                    </div>
                  )}
                  <div>
                    <span className="text-sm text-gray-600">
                      {language === 'cs' ? 'Typ nemovitosti:' : language === 'it' ? 'Tipo di proprietà:' : 'Property Type:'}
                    </span>
                    <span className="ml-2 font-medium">{getPropertyTypeLabel(property.propertyType, language)}</span>
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

            {/* Quick Actions - Hidden for now
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
            */}
          </div>
        </div>
      </div>

      <Footer language={language} />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        language={language}
        title={language === 'cs' ? 'Přihlášení vyžadováno' : language === 'it' ? 'Accesso richiesto' : 'Login required'}
        message={language === 'cs' ? 'Pro uložení nemovitosti do oblíbených se prosím přihlaste nebo si vytvořte bezplatný účet.' : language === 'it' ? 'Per salvare una proprietà nei preferiti devi accedere o creare un account gratuito.' : 'To save a property to your favorites, please log in or create a free account.'}
      />
    </div>
  )
}

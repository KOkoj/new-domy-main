'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Lenis from 'lenis'
import { Heart, Search, MapPin, ChevronRight, ChevronDown, Eye, Bed, Bath, Square, Car, Phone, Crown, Gem, Target, Shield, Check, Scale, Globe, Lock, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DualRangeSlider } from '@/components/ui/dual-range-slider'
import ImageReveal from '@/components/ui/image-tiles'
import { GlareCard } from '@/components/ui/premium-card'
import BackgroundImageTransition from '@/components/BackgroundImageTransition'
import AuthModal from '@/components/AuthModal'
import Footer from '@/components/Footer'
import Navigation from '../components/Navigation'
import { supabase } from '../lib/supabase'
import { t } from '../lib/translations'
import { CURRENCY_RATES, CURRENCY_SYMBOLS, formatPrice as formatPriceUtil } from '../lib/currency'
import { urlForImage } from '../lib/sanity'

// Property of the Day Data
const PROPERTY_OF_THE_DAY = {
  id: "featured-property-1",
  title: {
    en: "Luxury Tuscan Villa with Panoramic Views",
    cs: "Luxusní toskánská vila s panoramatickými výhledy",
    it: "Lussuosa Villa Toscana con Viste Panoramiche"
  },
  location: {
    city: "Florence",
    region: "Tuscany", 
    country: "Italy"
  },
  price: {
    amount: 2500000,
    currency: "EUR"
  },
  specifications: {
    bedrooms: 5,
    bathrooms: 4,
    area: 450,
    parking: 2,
    yearBuilt: 2018
  },
  featuredAmenities: [
    {
      en: "Swimming Pool",
      cs: "Bazén",
      it: "Piscina"
    },
    {
      en: "Wine Cellar",
      cs: "Vinný sklep",
      it: "Cantina"
    },
    {
      en: "Garden Terrace",
      cs: "Zahradní terasa",
      it: "Terrazza Giardino"
    },
    {
      en: "Mountain Views",
      cs: "Výhled na hory",
      it: "Vista Montagne"
    },
    {
      en: "Fireplace",
      cs: "Krb",
      it: "Caminetto"
    },
    {
      en: "Air Conditioning",
      cs: "Klimatizace",
      it: "Aria Condizionata"
    }
  ],
  description: {
    en: "This stunning Tuscan villa offers breathtaking panoramic views of the rolling hills and vineyards. The property features a modern open-plan design with traditional Italian architectural elements, creating the perfect blend of contemporary luxury and timeless charm.",
    cs: "Tato úchvatná toskánská vila nabízí dechberoucí panoramatické výhledy na zvlněné kopce a vinice. Nemovitost má moderní otevřený design s tradičními italskými architektonickými prvky, vytvářející dokonalou kombinaci současného luxusu a nadčasového kouzla.",
    it: "Questa splendida villa toscana offre viste panoramiche mozzafiato sulle dolci colline e vigneti. La proprietà presenta un design moderno open-space con elementi architettonici italiani tradizionali, creando la perfetta fusione tra lusso contemporaneo e fascino senza tempo."
  },
  images: [
    "/house_tuscany_vineyards.jpg",
    "/house_tuscany_vineyards.jpg", 
    "/house_tuscany_vineyards.jpg"
  ],
  status: "featured",
  views: 1247,
  agent: {
    name: "Marco Rossi",
    phone: "+39 123 456 789"
  }
}

// Italian regions for location dropdown
const ITALIAN_REGIONS = [
  'Abruzzo', 'Basilicata', 'Calabria', 'Campania', 'Emilia-Romagna',
  'Friuli-Venezia Giulia', 'Lazio', 'Liguria', 'Lombardia', 'Marche',
  'Molise', 'Piemonte', 'Puglia', 'Sardegna', 'Sicilia', 'Toscana',
  'Trentino-Alto Adige', 'Umbria', 'Valle d\'Aosta', 'Veneto'
]

// Custom Dropdown Component
function CustomDropdown({ value, options, onChange, placeholder, className = "", testId }) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedLabel, setSelectedLabel] = useState('')

  useEffect(() => {
    const selected = options.find(opt => opt.value === value)
    setSelectedLabel(selected ? selected.label : placeholder)
  }, [value, options, placeholder])

  const handleSelect = (optionValue, optionLabel) => {
    onChange(optionValue)
    setSelectedLabel(optionLabel)
    setIsOpen(false)
  }

  return (
    <div className={`relative ${className}`} data-testid={testId}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-3 py-2 text-base bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
        data-testid={`${testId}-trigger`}
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div 
            className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-96 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
            data-testid={`${testId}-content`}
            style={{ 
              scrollbarWidth: 'thin',
              scrollbarColor: '#d1d5db transparent'
            }}
          >
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value, option.label)}
                className="w-full px-3 py-2 text-base text-left hover:bg-gray-100 focus:outline-none focus:bg-gray-100 first:rounded-t-md last:rounded-b-md truncate"
                data-testid={`${testId}-option-${option.value}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}


function PropertyCard({ property, onFavorite, isFavorited, language, currency }) {
  const formatPrice = (price) => {
    return formatPriceUtil(price, currency, language)
  }

  const handleFavoriteClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    onFavorite(property._id)
  }

  // Construct the href with slug safeguard
  const propertyHref = property.slug?.current 
    ? `/properties/${property.slug.current}` 
    : property.slug 
    ? `/properties/${property.slug}` 
    : '#'

  return (
    <Card 
      className="group relative cursor-pointer hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden border border-gray-100 shadow-lg bg-white rounded-2xl flex flex-col h-full hover:border-blue-200/50"
      data-testid="property-card"
      data-property-id={property._id}
      data-property-type={property.propertyType}
      data-property-featured={property.featured}
    >
      <Link 
        href={propertyHref}
        className="absolute inset-0 z-10"
        data-testid="property-card-link"
      >
        <span className="sr-only">View property details</span>
      </Link>

      <div className="relative overflow-hidden" data-testid="property-image-container">
        <img 
          src={(typeof property.images?.[0] === 'string' ? property.images[0] : property.images?.[0]?.url) || '/placeholder-property.jpg'} 
          alt={typeof property.title === 'object' ? (property.title?.[language] || property.title?.en) : property.title}
          className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          data-testid="property-image"
        />
        
        {/* Gradient overlay for better contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-800/30 via-transparent to-transparent group-hover:from-slate-800/40 transition-all duration-300" />
        
        {/* Featured badge - subtle top center */}
        {property.featured && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
            <Badge 
              className="bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white hover:scale-105 transition-all duration-300 px-3 py-1.5 text-xs font-medium shadow-lg rounded-lg backdrop-blur-sm border border-white/20 pointer-events-none"
              data-testid="featured-badge"
            >
              ⭐ {t('property.featured', language)}
          </Badge>
          </div>
        )}

        {/* Top badges and favorite button */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-20">
          <Badge 
            className="bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white hover:scale-105 transition-all duration-300 px-3 py-1.5 text-xs font-medium shadow-lg rounded-lg capitalize backdrop-blur-sm border border-white/20 group-hover:shadow-xl pointer-events-none"
            data-testid="property-type-badge"
          >
            {property.propertyType}
          </Badge>
          
          <Button
            variant="ghost"
            size="icon"
            className={`p-2.5 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 shadow-lg backdrop-blur-sm border border-white/20 relative z-30 ${
              isFavorited 
                ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white hover:shadow-red-500/25' 
                : 'bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white hover:shadow-slate-500/25'
            }`}
            onClick={handleFavoriteClick}
            data-testid="favorite-button"
            data-property-id={property._id}
            data-favorited={isFavorited}
          >
            <Heart className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
          </Button>
        </div>
        
        {/* Price overlay */}
        <div className="absolute bottom-4 left-4">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-2.5 shadow-lg hover:bg-white/20 hover:scale-105 transition-all duration-300 group-hover:shadow-xl group-hover:bg-white/15">
            <span 
              className="text-2xl font-bold text-white"
              data-testid="property-price"
              data-price={typeof property.price === 'object' ? property.price.amount : property.price}
              data-currency={typeof property.price === 'object' ? property.price.currency : 'EUR'}
            >
            {formatPrice(typeof property.price === 'number' ? { amount: property.price, currency: 'EUR' } : property.price)}
          </span>
        </div>
        </div>
      </div>
      
            <CardContent className="p-6 flex flex-col flex-1">
              {/* Content area that grows */}
              <div className="flex-1 space-y-3">
          {/* Title and location */}
          <div className="space-y-2">
            <h3 
              className="font-bold text-lg leading-tight line-clamp-2 group-hover:text-slate-800 transition-colors duration-300 group-hover:tracking-wide"
              data-testid="property-title"
            >
              {typeof property.title === 'object' ? (property.title?.[language] || property.title?.en || 'Property Title') : (property.title || 'Property Title')}
            </h3>
            
            <div className="flex items-center text-gray-500 text-base group-hover:text-gray-600 transition-colors duration-300" data-testid="property-location">
              <div className="p-1 bg-slate-100 rounded-lg mr-2 group-hover:bg-slate-200 transition-colors duration-300">
                <MapPin className="h-4 w-4 text-slate-600 group-hover:text-slate-700 transition-colors duration-300" />
              </div>
              <span className="font-medium" data-testid="property-city">{property.location?.city?.name?.[language] || property.location?.city?.name?.en}</span>
              <span data-testid="property-region">, {property.location?.city?.region?.name?.[language] || property.location?.city?.region?.name?.en}</span>
            </div>
          </div>
          
          
          {/* Specifications - simplified text only */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-base text-gray-600 group-hover:text-gray-700 transition-colors duration-300" data-testid="property-specifications">
            {property.specifications.bedrooms && (
              <span className="font-semibold" data-testid="bedrooms-count">{property.specifications.bedrooms} {t('property.beds', language)}</span>
            )}
            
          {property.specifications.bathrooms && (
              <span className="font-semibold" data-testid="bathrooms-count">{property.specifications.bathrooms} {t('property.baths', language)}</span>
          )}
            
          {property.specifications.squareFootage && (
              <span className="font-semibold" data-testid="square-footage-count">{property.specifications.squareFootage} m²</span>
            )}
          </div>
            </div>
        
        {/* Enhanced CTA button - always at bottom */}
        <div className="pt-4 mt-auto" data-testid="property-footer">
          <div 
            className="w-full text-white font-semibold py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 group border-0 text-base flex items-center justify-center cursor-pointer"
            style={{ background: 'linear-gradient(to right, rgba(199, 137, 91), rgb(153, 105, 69))' }}
          >
            <span data-testid="view-details-text">{t('property.viewDetails', language)}</span>
            <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function PropertyOfTheDay({ property, language, currency }) {
  const formatPrice = (price) => {
    return formatPriceUtil(price, currency, language)
  }

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border-0" data-testid="property-of-the-day">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 min-h-[300px] sm:min-h-[400px] lg:min-h-[500px]">
        {/* Left Side - Enhanced Image */}
        <div className="relative group overflow-hidden h-full">
          <div className="relative h-full min-h-[250px] sm:min-h-[300px] lg:min-h-[400px]">
            <img 
              src={(typeof property.images?.[0] === 'string' ? property.images[0] : property.images?.[0]?.url) || '/placeholder-property.jpg'}  
              alt={property.title[language] || property.title.en}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              data-testid="property-of-day-image"
            />
            
            {/* Gradient overlay for better text contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            {/* Property of the Day Badge */}
            <div className="absolute top-6 left-6">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 hover:scale-105 transition-all duration-300 px-4 py-2 text-base font-semibold shadow-lg rounded-lg">
                <span className="flex items-center">
                  <span className="text-yellow-300 mr-2">⭐</span>
                  {t('property.propertyOfTheDay', language)}
                </span>
              </div>
            </div>
            
            {/* Views Counter */}
            <div className="absolute top-6 right-6">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 hover:scale-105 transition-all duration-300 px-3 py-2 text-xs font-medium shadow-lg rounded-lg">
                <Eye className="h-4 w-4 inline mr-1" />
                {property.views}
              </div>
            </div>
            
            {/* Property Title Overlay */}
            <div className="absolute bottom-6 left-6 max-w-md">
              <h2 className="text-2xl lg:text-3xl font-bold text-white leading-tight drop-shadow-lg" data-testid="property-of-day-title">
                {property.title[language] || property.title.en}
              </h2>
            </div>
            
            {/* Price Overlay */}
            <div className="absolute top-6 right-6">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 hover:scale-105 transition-all duration-300 px-4 py-3 text-2xl font-bold shadow-lg rounded-lg">
                {formatPrice(property.price)}
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Side - Detailed Content */}
        <div className="p-4 lg:p-6 flex flex-col justify-between">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-base text-gray-600">
              <MapPin className="h-4 w-4 text-slate-700" />
              <span>{property.location.city}, {property.location.region}</span>
            </div>
            
            
            {/* Specifications */}
            <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-100">
              <div className="flex items-center space-x-2">
                <Bed className="h-5 w-5 text-slate-700" />
                <span className="font-semibold text-gray-700">{property.specifications.bedrooms} {t('property.beds', language)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Bath className="h-5 w-5 text-slate-700" />
                <span className="font-semibold text-gray-700">{property.specifications.bathrooms} {t('property.baths', language)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Square className="h-5 w-5 text-slate-700" />
                <span className="font-semibold text-gray-700">{property.specifications.area} m²</span>
              </div>
              <div className="flex items-center space-x-2">
                <Car className="h-5 w-5 text-slate-700" />
                <span className="font-semibold text-gray-700">{property.specifications.parking} {t('property.parking', language)}</span>
              </div>
            </div>
            
            {/* Featured Amenities */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">
                {t('property.featuredAmenities', language)}
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {property.featuredAmenities.map((amenity, index) => (
                  <div key={index} className="flex items-center space-x-2 text-base text-gray-600">
                    <span className="text-slate-700">•</span>
                    <span>{amenity[language] || amenity.en}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Description */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">
                {t('property.propertyDescription', language)}
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {property.description[language] || property.description.en}
              </p>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <Button className="flex-1 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 group" style={{ background: 'linear-gradient(to right, rgba(199, 137, 91), rgb(153, 105, 69))' }}>
              <Eye className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform duration-200" />
              {t('property.viewFullDetails', language)}
            </Button>
            <Button variant="outline" className="flex-1 border-slate-600 text-slate-700 hover:bg-slate-700 hover:text-white font-semibold py-3 rounded-lg transition-all duration-300 hover:scale-105 active:scale-95 group">
              <Phone className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform duration-200" />
              {t('property.contactAgent', language)}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function SearchFilters({ filters, onFilterChange, language }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100" data-testid="search-filters-card">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto] gap-6" data-testid="search-filters-grid">
          <div className="flex items-center gap-3" data-testid="location-filter-container">
            <label className="text-base font-medium text-slate-700 whitespace-nowrap min-w-0 flex-shrink-0" data-testid="location-filter-label">{t('filters.location', language)}:</label>
            <div className="flex-1">
              <CustomDropdown
                value={filters.location || 'all'}
                options={[
                  { value: 'all', label: t('filters.anyType', language) },
                  ...ITALIAN_REGIONS.map(region => ({ value: region, label: region }))
                ]}
                onChange={(value) => onFilterChange('location', value === 'all' ? '' : value)}
                placeholder={t('filters.location', language)}
                testId="location-filter"
              />
            </div>
          </div>
          <div className="flex items-center gap-3" data-testid="property-type-filter-container">
            <label className="text-base font-medium text-slate-700 whitespace-nowrap min-w-0 flex-shrink-0" data-testid="property-type-filter-label">{t('filters.propertyType', language)}:</label>
            <div className="flex-1">
              <CustomDropdown
                value={filters.type || 'all'}
                options={[
                  { value: 'all', label: t('filters.anyType', language) },
                  { value: 'villa', label: t('filters.villa', language) },
                  { value: 'house', label: t('filters.house', language) },
                  { value: 'apartment', label: t('filters.apartment', language) },
                  { value: 'commercial', label: t('filters.commercial', language) }
                ]}
                onChange={(value) => onFilterChange('type', value === 'all' ? undefined : value)}
                placeholder={t('filters.anyType', language)}
                testId="property-type-select"
              />
            </div>
        </div>
            <div className="flex items-center gap-3" data-testid="price-range-filter-container">
             <label className="text-base font-medium text-slate-700 whitespace-nowrap min-w-0 flex-shrink-0" data-testid="price-range-filter-label">
               Price Range:
             </label>
             <div className="flex-1">
               <DualRangeSlider
                 value={[filters.minPrice || 50000, filters.maxPrice || 2000000]}
                 onValueChange={(values) => {
                   onFilterChange('minPrice', values[0])
                   onFilterChange('maxPrice', values[1])
                 }}
                 min={50000}
                 max={2000000}
                 step={10000}
                 className="w-full"
                 data-testid="price-range-slider"
               />
             </div>
             <div className="text-xs text-gray-600 whitespace-nowrap">
               €{(filters.minPrice || 50000).toLocaleString()} - €{(filters.maxPrice || 2000000).toLocaleString()}
             </div>
           </div>
           <div className="flex items-center" data-testid="filter-actions-container">
             <Button 
               className="bg-slate-700 hover:bg-slate-600 text-white text-base py-2 px-4 rounded-lg transition-colors duration-200"
               onClick={() => {
                 const hasActiveFilters = 
                   (filters.location && filters.location !== '' && filters.location !== null) || 
                   (filters.type && filters.type !== 'all' && filters.type !== null) || 
                   (filters.minPrice && filters.minPrice !== null) || 
                   (filters.maxPrice && filters.maxPrice !== null)
                 
                 if (hasActiveFilters) {
                   // Clear filters
                   onFilterChange('location', null)
                   onFilterChange('type', null)
                   onFilterChange('minPrice', null)
                   onFilterChange('maxPrice', null)
                 } else {
                   // Apply filters logic - you can replace this with actual filter application
                   console.log('Applying filters:', filters)
                 }
               }}
               data-testid="filter-action-button"
             >
               {(() => {
                 const hasActiveFilters = 
                   (filters.location && filters.location !== '' && filters.location !== null) || 
                   (filters.type && filters.type !== 'all' && filters.type !== null) || 
                   (filters.minPrice && filters.minPrice !== null) || 
                   (filters.maxPrice && filters.maxPrice !== null)
                 return hasActiveFilters ? 'Clear Filters' : 'Apply Filters'
               })()}
             </Button>
           </div>
      </div>
    </div>
  )
}

export default function HomePage() {
  const [properties, setProperties] = useState([])
  
  // Background images for hero section
  const heroBackgroundImages = [
    { src: "/hero bg/hero-background.jpg", alt: "Hero background image" },
    { src: "/hero bg/pexels-catalin-todosia-876894548-34149286.jpg", alt: "Colorful street with umbrellas" },
    { src: "/hero bg/pexels-maegan-white-363530-981686.jpg", alt: "Beautiful Italian landscape" },
    { src: "/hero bg/pexels-pixabay-51947.jpg", alt: "Italian countryside view" }
  ]
  const [filteredProperties, setFilteredProperties] = useState([])
  const [favorites, setFavorites] = useState(new Set())
  const [filters, setFilters] = useState({})
  const [user, setUser] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [language, setLanguage] = useState('en')
  const [currency, setCurrency] = useState('EUR')

  // Dynamic content data
  const [selectedRegion, setSelectedRegion] = useState(null)
  const [selectedPropertyType, setSelectedPropertyType] = useState(null)
  const [regionProperties, setRegionProperties] = useState([])
  const [propertyTypeProperties, setPropertyTypeProperties] = useState([])
  
  // FAQ accordion state
  const [openFaqIndex, setOpenFaqIndex] = useState(null)
  
  // Loading state
  const [isLoading, setIsLoading] = useState(true)
  const [startAnimations, setStartAnimations] = useState(false)
  
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  useEffect(() => {
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

    // Listen for language changes from Navigation
    const handleLanguageChange = (event) => {
      setLanguage(event.detail)
      document.documentElement.lang = event.detail
    }

    window.addEventListener('languageChange', handleLanguageChange)
    return () => window.removeEventListener('languageChange', handleLanguageChange)
  }, [])

  const loadProperties = async () => {
    try {
      console.log('Fetching properties in Homepage...')
      const response = await fetch('/api/properties')
      if (response.ok) {
        const sanityProperties = await response.json()
        console.log('Homepage received properties:', sanityProperties?.length || 0)
        if (sanityProperties && Array.isArray(sanityProperties) && sanityProperties.length > 0) {
          setProperties(sanityProperties)
          setFilteredProperties(sanityProperties)
        } else {
          console.warn('Homepage received empty or invalid properties list')
        }
      } else {
        console.error('Homepage fetch failed:', response.status, response.statusText)
      }
    } catch (error) {
      console.log('Could not load properties from Sanity:', error)
      // Properties will remain empty array if fetch fails
    }
  }

  // Load properties on mount
  useEffect(() => {
    loadProperties()
  }, [])

  // Initialize Lenis smooth scroll
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    })

    // Make Lenis available globally for scroll indicator
    window.lenis = lenis

    function raf(time) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    // Cleanup
    return () => {
      lenis.destroy()
      delete window.lenis
    }
  }, [])

  // Handle loading state
  useEffect(() => {
    // Simulate loading time for smooth transition
    const timer = setTimeout(() => {
      setIsLoading(false)
      // Start animations after a short delay to ensure loading screen is gone
      setTimeout(() => {
        setStartAnimations(true)
      }, 300)
    }, 1500) // 1.5 seconds loading time

    return () => clearTimeout(timer)
  }, [])

  // Scroll-triggered animations using Intersection Observer
  useEffect(() => {
    if (!startAnimations) return

    // Keep track of animated elements
    const animatedElements = new Set()

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const element = entry.target
          
          // Only animate if: intersecting, not already animated, and not in the set
          if (entry.isIntersecting && !animatedElements.has(element)) {
            // Mark as animated immediately to prevent double-triggering
            animatedElements.add(element)
            
            // Use RAF for smooth rendering
            requestAnimationFrame(() => {
              element.classList.add('animate-in')
            })
            
            // Stop observing this element
            observer.unobserve(element)
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -80px 0px',
        // Add root for better performance
        root: null
      }
    )

    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      const animateElements = document.querySelectorAll('.animate-on-scroll')
      animateElements.forEach((el) => {
        // Skip if already has animate-in class
        if (!el.classList.contains('animate-in')) {
          observer.observe(el)
        }
      })
    }, 100)

    return () => {
      clearTimeout(timeoutId)
      observer.disconnect()
      animatedElements.clear()
    }
  }, [startAnimations])

  useEffect(() => {
    if (!supabase) return
    // Check if user is authenticated
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      if (user) {
        // Load user's favorites
        loadFavorites()
      }
    }
    checkUser()
  }, [])

  // Dynamic content data
  const regionData = [
    {
      name: 'Abruzzo',
      title: {
        en: 'Complete Guide to Buying in Abruzzo',
        cs: 'Kompletní průvodce nákupem v Abruzzu',
        it: 'Guida Completa all\'Acquisto in Abruzzo'
      },
      description: {
        en: 'Discover the mountains, coastlines, and medieval villages of Abruzzo. Learn about property prices, legal requirements, and the best areas to invest.',
        cs: 'Objevte hory, pobřeží a středověké vesnice Abruzza. Zjistěte o cenách nemovitostí, právních požadavcích a nejlepších oblastech k investici.',
        it: 'Scopri le montagne, le coste e i villaggi medievali dell\'Abruzzo. Impara sui prezzi immobiliari, requisiti legali e le migliori aree in cui investire.'
      },
      image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    },
    {
      name: 'Basilicata',
      title: {
        en: 'Complete Guide to Buying in Basilicata',
        cs: 'Kompletní průvodce nákupem v Basilicatě',
        it: 'Guida Completa all\'Acquisto in Basilicata'
      },
      description: {
        en: 'Explore the ancient landscapes and historic towns of Basilicata. Learn about property prices, legal requirements, and the best areas to invest.',
        cs: 'Prozkoumejte starobylé krajiny a historická města Basilicaty. Zjistěte o cenách nemovitostí, právních požadavcích a nejlepších oblastech k investici.',
        it: 'Esplora i paesaggi antichi e le città storiche della Basilicata. Impara sui prezzi immobiliari, requisiti legali e le migliori aree in cui investire.'
      },
      image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    },
    {
      name: 'Calabria',
      title: {
        en: 'Complete Guide to Buying in Calabria',
        cs: 'Kompletní průvodce nákupem v Kalábrii',
        it: 'Guida Completa all\'Acquisto in Calabria'
      },
      description: {
        en: 'Discover the pristine beaches and mountain villages of Calabria. Learn about property prices, legal requirements, and the best areas to invest.',
        cs: 'Objevte nedotčené pláže a horské vesnice Kalábrie. Zjistěte o cenách nemovitostí, právních požadavcích a nejlepších oblastech k investici.',
        it: 'Scopri le spiagge incontaminate e i villaggi montani della Calabria. Impara sui prezzi immobiliari, requisiti legali e le migliori aree in cui investire.'
      },
      image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    },
    {
      name: 'Campania',
      title: {
        en: 'Complete Guide to Buying in Campania',
        cs: 'Kompletní průvodce nákupem v Kampánii',
        it: 'Guida Completa all\'Acquisto in Campania'
      },
      description: {
        en: 'Explore the Amalfi Coast, Naples, and historic sites of Campania. Learn about property prices, legal requirements, and the best areas to invest.',
        cs: 'Prozkoumejte pobřeží Amalfi, Neapol a historická místa Kampánie. Zjistěte o cenách nemovitostí, právních požadavcích a nejlepších oblastech k investici.',
        it: 'Esplora la Costiera Amalfitana, Napoli e i siti storici della Campania. Impara sui prezzi immobiliari, requisiti legali e le migliori aree in cui investire.'
      },
      image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    },
    {
      name: 'Emilia-Romagna',
      title: {
        en: 'Complete Guide to Buying in Emilia-Romagna',
        cs: 'Kompletní průvodce nákupem v Emilia-Romagna',
        it: 'Guida Completa all\'Acquisto in Emilia-Romagna'
      },
      description: {
        en: 'Discover the culinary capital, historic cities, and rolling hills of Emilia-Romagna. Learn about property prices, legal requirements, and the best areas to invest.',
        cs: 'Objevte kulinářské hlavní město, historická města a zvlněné kopce Emilia-Romagna. Zjistěte o cenách nemovitostí, právních požadavcích a nejlepších oblastech k investici.',
        it: 'Scopri la capitale culinaria, le città storiche e le dolci colline dell\'Emilia-Romagna. Impara sui prezzi immobiliari, requisiti legali e le migliori aree in cui investire.'
      },
      image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    },
    {
      name: 'Friuli-Venezia Giulia',
      title: {
        en: 'Complete Guide to Buying in Friuli-Venezia Giulia',
        cs: 'Kompletní průvodce nákupem v Friuli-Venezia Giulia',
        it: 'Guida Completa all\'Acquisto in Friuli-Venezia Giulia'
      },
      description: {
        en: 'Explore the crossroads of cultures, mountains, and coastline in Friuli-Venezia Giulia. Learn about property prices, legal requirements, and the best areas to invest.',
        cs: 'Prozkoumejte křižovatku kultur, hor a pobřeží ve Friuli-Venezia Giulia. Zjistěte o cenách nemovitostí, právních požadavcích a nejlepších oblastech k investici.',
        it: 'Esplora il crocevia di culture, montagne e costa nel Friuli-Venezia Giulia. Impara sui prezzi immobiliari, requisiti legali e le migliori aree in cui investire.'
      },
      image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    },
    {
      name: 'Lazio',
      title: {
        en: 'Complete Guide to Buying in Lazio',
        cs: 'Kompletní průvodce nákupem v Laziu',
        it: 'Guida Completa all\'Acquisto nel Lazio'
      },
      description: {
        en: 'Discover Rome, ancient history, and beautiful countryside in Lazio. Learn about property prices, legal requirements, and the best areas to invest.',
        cs: 'Objevte Řím, starověkou historii a krásný venkov v Laziu. Zjistěte o cenách nemovitostí, právních požadavcích a nejlepších oblastech k investici.',
        it: 'Scopri Roma, la storia antica e la bellissima campagna nel Lazio. Impara sui prezzi immobiliari, requisiti legali e le migliori aree in cui investire.'
      },
      image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    },
    {
      name: 'Liguria',
      title: {
        en: 'Complete Guide to Buying in Liguria',
        cs: 'Kompletní průvodce nákupem v Ligurii',
        it: 'Guida Completa all\'Acquisto in Liguria'
      },
      description: {
        en: 'Explore the Italian Riviera, colorful villages, and Mediterranean coastline in Liguria. Learn about property prices, legal requirements, and the best areas to invest.',
        cs: 'Prozkoumejte italskou riviéru, barevné vesnice a středomořské pobřeží v Ligurii. Zjistěte o cenách nemovitostí, právních požadavcích a nejlepších oblastech k investici.',
        it: 'Esplora la Riviera Italiana, i villaggi colorati e la costa mediterranea in Liguria. Impara sui prezzi immobiliari, requisiti legali e le migliori aree in cui investire.'
      },
      image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    },
    {
      name: 'Lombardia',
      title: {
        en: 'Complete Guide to Buying in Lombardy',
        cs: 'Kompletní průvodce nákupem v Lombardii',
        it: 'Guida Completa all\'Acquisto in Lombardia'
      },
      description: {
        en: 'Discover Milan, Lake Como, and the economic heart of Italy in Lombardy. Learn about property prices, legal requirements, and the best areas to invest.',
        cs: 'Objevte Milán, Lago di Como a ekonomické srdce Itálie v Lombardii. Zjistěte o cenách nemovitostí, právních požadavcích a nejlepších oblastech k investici.',
        it: 'Scopri Milano, il Lago di Como e il cuore economico dell\'Italia in Lombardia. Impara sui prezzi immobiliari, requisiti legali e le migliori aree in cui investire.'
      },
      image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    },
    {
      name: 'Marche',
      title: {
        en: 'Complete Guide to Buying in Marche',
        cs: 'Kompletní průvodce nákupem v Marche',
        it: 'Guida Completa all\'Acquisto nelle Marche'
      },
      description: {
        en: 'Explore the hidden gem with Adriatic coast and medieval towns in Marche. Learn about property prices, legal requirements, and the best areas to invest.',
        cs: 'Prozkoumejte skrytý klenot s pobřežím Jaderského moře a středověkými městy v Marche. Zjistěte o cenách nemovitostí, právních požadavcích a nejlepších oblastech k investici.',
        it: 'Esplora la gemma nascosta con costa adriatica e città medievali nelle Marche. Impara sui prezzi immobiliari, requisiti legali e le migliori aree in cui investire.'
      },
      image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    },
    {
      name: 'Molise',
      title: {
        en: 'Complete Guide to Buying in Molise',
        cs: 'Kompletní průvodce nákupem v Molise',
        it: 'Guida Completa all\'Acquisto in Molise'
      },
      description: {
        en: 'Discover the smallest region with authentic Italian charm in Molise. Learn about property prices, legal requirements, and the best areas to invest.',
        cs: 'Objevte nejmenší region s autentickým italským kouzlem v Molise. Zjistěte o cenách nemovitostí, právních požadavcích a nejlepších oblastech k investici.',
        it: 'Scopri la regione più piccola con il fascino italiano autentico in Molise. Impara sui prezzi immobiliari, requisiti legali e le migliori aree in cui investire.'
      },
      image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    },
    {
      name: 'Piemonte',
      title: {
        en: 'Complete Guide to Buying in Piedmont',
        cs: 'Kompletní průvodce nákupem v Piemontu',
        it: 'Guida Completa all\'Acquisto in Piemonte'
      },
      description: {
        en: 'Explore the wine country, Alps, and elegant Turin in Piedmont. Learn about property prices, legal requirements, and the best areas to invest.',
        cs: 'Prozkoumejte vinařskou oblast, Alpy a elegantní Turín v Piemontu. Zjistěte o cenách nemovitostí, právních požadavcích a nejlepších oblastech k investici.',
        it: 'Esplora la terra del vino, le Alpi e l\'elegante Torino in Piemonte. Impara sui prezzi immobiliari, requisiti legali e le migliori aree in cui investire.'
      },
      image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    },
    {
      name: 'Puglia',
      title: {
        en: 'Complete Guide to Buying in Puglia',
        cs: 'Kompletní průvodce nákupem v Puglii',
        it: 'Guida Completa all\'Acquisto in Puglia'
      },
      description: {
        en: 'Discover the heel of Italy with trulli houses and stunning coastline in Puglia. Learn about property prices, legal requirements, and the best areas to invest.',
        cs: 'Objevte patu Itálie s domy trulli a úžasným pobřežím v Puglii. Zjistěte o cenách nemovitostí, právních požadavcích a nejlepších oblastech k investici.',
        it: 'Scopri il tallone d\'Italia con le case trulli e la costa mozzafiato in Puglia. Impara sui prezzi immobiliari, requisiti legali e le migliori aree in cui investire.'
      },
      image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    },
    {
      name: 'Sardegna',
      title: {
        en: 'Complete Guide to Buying in Sardinia',
        cs: 'Kompletní průvodce nákupem na Sardinii',
        it: 'Guida Completa all\'Acquisto in Sardegna'
      },
      description: {
        en: 'Explore the Mediterranean island with pristine beaches and unique culture in Sardinia. Learn about property prices, legal requirements, and the best areas to invest.',
        cs: 'Prozkoumejte středomořský ostrov s nedotčenými plážemi a jedinečnou kulturou na Sardinii. Zjistěte o cenách nemovitostí, právních požadavcích a nejlepších oblastech k investici.',
        it: 'Esplora l\'isola mediterranea con spiagge incontaminate e cultura unica in Sardegna. Impara sui prezzi immobiliari, requisiti legali e le migliori aree in cui investire.'
      },
      image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    },
    {
      name: 'Sicilia',
      title: {
        en: 'Complete Guide to Buying in Sicily',
        cs: 'Kompletní průvodce nákupem na Sicílii',
        it: 'Guida Completa all\'Acquisto in Sicilia'
      },
      description: {
        en: 'Discover the largest Mediterranean island with Mount Etna and ancient history in Sicily. Learn about property prices, legal requirements, and the best areas to invest.',
        cs: 'Objevte největší středomořský ostrov s Etnou a starověkou historií na Sicílii. Zjistěte o cenách nemovitostí, právních požadavcích a nejlepších oblastech k investici.',
        it: 'Scopri la più grande isola mediterranea con l\'Etna e la storia antica in Sicilia. Impara sui prezzi immobiliari, requisiti legali e le migliori aree in cui investire.'
      },
      image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    },
    {
      name: 'Toscana',
      title: {
        en: 'Complete Guide to Buying in Tuscany',
        cs: 'Kompletní průvodce nákupem v Toskánsku',
        it: 'Guida Completa all\'Acquisto in Toscana'
      },
      description: {
        en: 'Discover the rolling hills, vineyards, and historic cities of Tuscany. Learn about property prices, legal requirements, and the best areas to invest.',
        cs: 'Objevte zvlněné kopce, vinice a historická města Toskánska. Zjistěte o cenách nemovitostí, právních požadavcích a nejlepších oblastech k investici.',
        it: 'Scopri le dolci colline, i vigneti e le città storiche della Toscana. Impara sui prezzi immobiliari, requisiti legali e le migliori aree in cui investire.'
      },
      image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    },
    {
      name: 'Trentino-Alto Adige',
      title: {
        en: 'Complete Guide to Buying in Trentino-Alto Adige',
        cs: 'Kompletní průvodce nákupem v Trentino-Alto Adige',
        it: 'Guida Completa all\'Acquisto in Trentino-Alto Adige'
      },
      description: {
        en: 'Explore the Dolomites, alpine lakes, and unique dual culture in Trentino-Alto Adige. Learn about property prices, legal requirements, and the best areas to invest.',
        cs: 'Prozkoumejte Dolomity, alpská jezera a jedinečnou dvojí kulturu v Trentino-Alto Adige. Zjistěte o cenách nemovitostí, právních požadavcích a nejlepších oblastech k investici.',
        it: 'Esplora le Dolomiti, i laghi alpini e la cultura duale unica in Trentino-Alto Adige. Impara sui prezzi immobiliari, requisiti legali e le migliori aree in cui investire.'
      },
      image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    },
    {
      name: 'Umbria',
      title: {
        en: 'Complete Guide to Buying in Umbria',
        cs: 'Kompletní průvodce nákupem v Umbrii',
        it: 'Guida Completa all\'Acquisto in Umbria'
      },
      description: {
        en: 'Discover the green heart of Italy with medieval hill towns in Umbria. Learn about property prices, legal requirements, and the best areas to invest.',
        cs: 'Objevte zelené srdce Itálie se středověkými městy na kopcích v Umbrii. Zjistěte o cenách nemovitostí, právních požadavcích a nejlepších oblastech k investici.',
        it: 'Scopri il cuore verde d\'Italia con le città medievali sui colli in Umbria. Impara sui prezzi immobiliari, requisiti legali e le migliori aree in cui investire.'
      },
      image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    },
    {
      name: 'Valle d\'Aosta',
      title: {
        en: 'Complete Guide to Buying in Valle d\'Aosta',
        cs: 'Kompletní průvodce nákupem v Valle d\'Aosta',
        it: 'Guida Completa all\'Acquisto in Valle d\'Aosta'
      },
      description: {
        en: 'Explore the smallest region with highest peaks and alpine charm in Valle d\'Aosta. Learn about property prices, legal requirements, and the best areas to invest.',
        cs: 'Prozkoumejte nejmenší region s nejvyššími vrcholy a alpským kouzlem v Valle d\'Aosta. Zjistěte o cenách nemovitostí, právních požadavcích a nejlepších oblastech k investici.',
        it: 'Esplora la regione più piccola con le vette più alte e il fascino alpino in Valle d\'Aosta. Impara sui prezzi immobiliari, requisiti legali e le migliori aree in cui investire.'
      },
      image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    },
    {
      name: 'Veneto',
      title: {
        en: 'Complete Guide to Buying in Veneto',
        cs: 'Kompletní průvodce nákupem v Benátsku',
        it: 'Guida Completa all\'Acquisto in Veneto'
      },
      description: {
        en: 'Discover Venice, Verona, and the diverse landscapes of Veneto. Learn about property prices, legal requirements, and the best areas to invest.',
        cs: 'Objevte Benátky, Veronu a rozmanité krajiny Benátska. Zjistěte o cenách nemovitostí, právních požadavcích a nejlepších oblastech k investici.',
        it: 'Scopri Venezia, Verona e i paesaggi diversi del Veneto. Impara sui prezzi immobiliari, requisiti legali e le migliori aree in cui investire.'
      },
      image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    }
  ]

  const propertyTypeData = [
    {
      name: 'Villa',
      title: {
        en: 'Villa vs House: Which is Right for You?',
        cs: 'Vila vs dům: Co je pro vás to pravé?',
        it: 'Villa vs Casa: Quale è Giusto per Te?'
      },
      description: {
        en: 'Learn the key differences between Italian villas and houses. From architectural styles to investment potential, make an informed decision.',
        cs: 'Poznejte klíčové rozdíly mezi italskými vilami a domy. Od architektonických stylů po investiční potenciál, učinit informované rozhodnutí.',
        it: 'Impara le principali differenze tra ville e case italiane. Dagli stili architettonici al potenziale di investimento, prendi una decisione informata.'
      },
      image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    },
    {
      name: 'Farmhouse',
      title: {
        en: 'Restoring Italian Farmhouses: A Complete Guide',
        cs: 'Obnova italských statků: Kompletní průvodce',
        it: 'Ristrutturare le Masserie Italiane: Una Guida Completa'
      },
      description: {
        en: 'Transform a traditional farmhouse into your dream home. Learn about restoration costs, permits, and the charm of rural Italian living.',
        cs: 'Proměňte tradiční statek ve svůj vysněný domov. Zjistěte o nákladech na rekonstrukci, povoleních a kouzlu venkovského italského života.',
        it: 'Trasforma una masseria tradizionale nella casa dei tuoi sogni. Impara sui costi di ristrutturazione, permessi e il fascino della vita rurale italiana.'
      },
      image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    },
    {
      name: 'Apartment',
      title: {
        en: 'Apartment Living in Italian Cities',
        cs: 'Bydlení v bytech v italských městech',
        it: 'Vita in Appartamento nelle Città Italiane'
      },
      description: {
        en: 'Discover the benefits of city living in Italy. From Milan to Florence, explore modern apartments and historic palazzos.',
        cs: 'Objevte výhody městského života v Itálii. Od Milána po Florencii prozkoumejte moderní byty a historické paláce.',
        it: 'Scopri i benefici della vita in città in Italia. Da Milano a Firenze, esplora appartamenti moderni e palazzi storici.'
      },
      image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    },
    {
      name: 'Commercial',
      title: {
        en: 'Commercial Property in Italy: Investment Guide',
        cs: 'Komerční nemovitosti v Itálii: Investiční průvodce',
        it: 'Immobili Commerciali in Italia: Guida agli Investimenti'
      },
      description: {
        en: 'Explore commercial real estate opportunities. From restaurants to retail spaces, learn about Italy\'s business property market.',
        cs: 'Prozkoumejte příležitosti komerčních nemovitostí. Od restaurací po maloobchodní prostory, zjistěte o italském trhu s obchodními nemovitostmi.',
        it: 'Esplora le opportunità immobiliari commerciali. Dai ristoranti agli spazi retail, impara sul mercato immobiliare commerciale italiano.'
      },
      image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    }
  ]

  // Initialize dynamic content on component mount
  useEffect(() => {
    // Select random region
    const randomRegion = regionData[Math.floor(Math.random() * regionData.length)]
    setSelectedRegion(randomRegion)
    
    // Select random property type
    const randomPropertyType = propertyTypeData[Math.floor(Math.random() * propertyTypeData.length)]
    setSelectedPropertyType(randomPropertyType)
  }, [])

  // Filter properties based on selected region and property type
  // TEMPORARY: Hardcoded to always show 7 properties for full rows during development
  useEffect(() => {
    if (selectedRegion) {
      const regionProps = properties.filter(property => {
        const regionName = property.location?.city?.region?.name
        // Handle both localized object and string name
        const nameToCheck = typeof regionName === 'object' ? regionName?.en : regionName
        return nameToCheck === selectedRegion.name
      })
      // Ensure we always have at least 3 properties by filling with other properties
      const minProperties = 3
      if (regionProps.length < minProperties) {
        const additionalProps = properties.filter(p => !regionProps.includes(p))
        const filledProps = [...regionProps, ...additionalProps].slice(0, minProperties)
        setRegionProperties(filledProps)
      } else {
        setRegionProperties(regionProps)
      }
    }
  }, [selectedRegion, properties])

  useEffect(() => {
    if (selectedPropertyType) {
      const typeProps = properties.filter(property => 
        property.propertyType.toLowerCase() === selectedPropertyType.name.toLowerCase()
      )
      // Ensure we always have at least 3 properties by filling with other properties
      const minProperties = 3
      if (typeProps.length < minProperties) {
        const additionalProps = properties.filter(p => !typeProps.includes(p))
        const filledProps = [...typeProps, ...additionalProps].slice(0, minProperties)
        setPropertyTypeProperties(filledProps)
      } else {
        setPropertyTypeProperties(typeProps)
      }
    }
  }, [selectedPropertyType, properties])

  useEffect(() => {
    // Apply filters
    let filtered = properties
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(p => {
        const titleEn = typeof p.title === 'object' ? p.title.en : p.title
        const cityName = typeof p.location?.city?.name === 'object' ? p.location?.city?.name?.en : p.location?.city?.name
        const descEn = typeof p.description === 'object' ? p.description.en : p.description

        return (
          titleEn?.toLowerCase().includes(query) ||
          cityName?.toLowerCase().includes(query) ||
          descEn?.toLowerCase().includes(query)
        )
      })
    }
    
    if (filters.type) {
      filtered = filtered.filter(p => p.propertyType === filters.type)
    }
    
    if (filters.location) {
      const location = filters.location.toLowerCase()
      filtered = filtered.filter(p => 
        p.location?.city?.name?.en?.toLowerCase().includes(location)
      )
    }
    
    if (filters.minPrice) {
      filtered = filtered.filter(p => p.price.amount >= parseInt(filters.minPrice))
    }
    
    if (filters.maxPrice) {
      filtered = filtered.filter(p => p.price.amount <= parseInt(filters.maxPrice))
    }
    
    setFilteredProperties(filtered)
  }, [properties, filters, searchQuery])

  const loadFavorites = async () => {
    try {
      const response = await fetch('/api/favorites')
      if (response.ok) {
        const userFavorites = await response.json()
        setFavorites(new Set(userFavorites.map(f => f.listingId)))
      }
    } catch (error) {
      console.error('Error loading favorites:', error)
    }
  }

  const handleFavorite = async (propertyId) => {
    if (!user) {
      // Redirect to login or show login modal
      alert('Please login to save favorites')
      return
    }

    try {
      const response = await fetch('/api/favorites/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId: propertyId })
      })
      
      if (response.ok) {
        const result = await response.json()
        const newFavorites = new Set(favorites)
        
        if (result.favorited) {
          newFavorites.add(propertyId)
        } else {
          newFavorites.delete(propertyId)
        }
        
        setFavorites(newFavorites)
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined
    }))
  }

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage)
    console.log(`Language changed to: ${newLanguage}`)
    // Here you would typically:
    // 1. Update the document language
    // 2. Trigger a re-render with new language content
    // 3. Save language preference to localStorage
    document.documentElement.lang = newLanguage
    localStorage.setItem('preferred-language', newLanguage)
  }

  const handleCurrencyChange = (newCurrency) => {
    setCurrency(newCurrency)
    localStorage.setItem('preferred-currency', newCurrency)
    console.log(`Currency changed to: ${newCurrency}`)
  }

  const handleLogout = async () => {
    if (!supabase) return
    const { error } = await supabase.auth.signOut()
    if (!error) {
      setUser(null)
      setFavorites(new Set())
    }
  }

  const handleAuthSuccess = (authUser) => {
    setUser(authUser)
    setIsAuthModalOpen(false)
    loadFavorites()
  }

  return (
    <div className="min-h-screen bg-[#f7f4ed] home-page-custom-border overflow-x-hidden" data-testid="homepage-container">
      {/* Loading Screen */}
      {isLoading && (
        <div className="fixed inset-0 z-[100] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center transition-opacity duration-1000 ease-in-out">
          <div className="text-center animate-fade-in">
            {/* Logo */}
            <div className="mb-8 animate-pulse">
              <img 
                src="/logo domy.svg" 
                alt="Domy v Itálii" 
                className="w-24 h-24 mx-auto opacity-90"
              />
            </div>
            
            {/* Loading Text */}
            <h2 className="text-2xl font-bold text-white mb-4 tracking-wide">
              {language === 'cs' ? 'Načítání...' : 
               language === 'it' ? 'Caricamento...' : 
               'Loading...'}
            </h2>
            
            {/* Loading Animation */}
            <div className="flex justify-center space-x-2">
              <div className="w-3 h-3 bg-white/80 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-3 h-3 bg-white/80 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-3 h-3 bg-white/80 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        </div>
      )}
      
      {/* Navigation */}
      <Navigation />

      {/* Hero Section */}
      <section 
        className="relative min-h-[100dvh] overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 shadow-inner flex items-center justify-center" 
        data-testid="hero-section"
      >
        {/* Hero Background Image Transition */}
        <BackgroundImageTransition
          images={heroBackgroundImages}
          transitionDuration={6000}
          fadeDuration={1500}
          className="z-0"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 z-10 bg-gradient-to-br from-black/60 via-black/75 to-black/50"></div>
        {/* Golden Accent Overlay - vibrant and noticeable */}
        <div className="absolute inset-0 z-10 bg-gradient-to-br from-copper-500/35 via-copper-400/25 to-copper-300/15 opacity-80"></div>
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
        <div className="container mx-auto px-3 sm:px-4 relative z-20" data-testid="hero-content-container">
          <div className="text-center text-white space-y-4 sm:space-y-8 md:space-y-12" data-testid="hero-content">
            <div className="space-y-3 sm:space-y-6">
              <h2 
                className="font-bold leading-tight tracking-tight text-4xl md:text-6xl lg:text-7xl" 
                style={{ 
                  textShadow: '0 4px 8px rgba(0, 0, 0, 0.6), 0 2px 4px rgba(0, 0, 0, 0.4)',
                  textWrap: 'balance',
                  wordBreak: 'normal',
                  overflowWrap: 'normal',
                  hyphens: 'none'
                }}
                data-testid="hero-title"
              >
                {startAnimations ? (
                  t('hero.title', language).split(' ').map((word, wordIndex, words) => {
                    const charsBefore = words.slice(0, wordIndex).join(' ').length + (wordIndex > 0 ? wordIndex : 0);
                    return (
                      <span key={wordIndex} style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>
                        {word.split('').map((char, charIndex) => (
                          <span
                            key={charIndex}
                            className="inline-block animate-char-fade-in"
                            style={{ 
                              animationDelay: `${(charsBefore + charIndex) * 0.05}s`,
                              opacity: 0,
                              animationFillMode: 'forwards'
                            }}
                          >
                            {char}
                          </span>
                        ))}
                        {wordIndex < words.length - 1 && '\u00A0'}
                      </span>
                    );
                  })
                ) : (
                  <span style={{ opacity: 0 }}>{t('hero.title', language)}</span>
                )}
              </h2>
              <p 
                className={`text-gray-100 max-w-4xl mx-auto leading-relaxed font-light italic transition-all duration-700 text-lg md:text-2xl lg:text-3xl ${startAnimations ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                style={{ 
                  marginTop: '5px',
                  textShadow: '0 3px 6px rgba(0, 0, 0, 0.5), 0 1px 3px rgba(0, 0, 0, 0.3)',
                  transitionDelay: startAnimations ? '1s' : '0s'
                }}
                data-testid="hero-subtitle"
              >
                {t('hero.subtitle', language)}
              </p>
            </div>
            
            {/* Enhanced Search Container */}
            <div 
              className={`transition-all duration-700 w-full max-w-md sm:max-w-lg mx-auto mt-4 sm:mt-8 px-2 sm:px-0 ${startAnimations ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}
              style={{
                transitionDelay: startAnimations ? '1.3s' : '0s'
              }}
              data-testid="hero-search-container"
            >
              <div className="bg-white/95 backdrop-blur-sm rounded-full sm:rounded-[99px] p-1 sm:p-1.5 shadow-2xl border border-white/20 hover:shadow-3xl transition-all duration-300 group">
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <div className="flex-1 relative group min-w-0">
                    <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 transition-colors duration-200 group-focus-within:text-blue-600" />
              <input 
                      type="text"
                      placeholder={t('hero.searchPlaceholder', language)} 
                      className="w-full pl-9 sm:pl-11 pr-2 sm:pr-4 py-2 sm:py-2.5 text-sm sm:text-base bg-transparent border-none outline-none text-gray-800 rounded-full placeholder-gray-500 focus:bg-blue-50/30 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 hover:bg-gray-50/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                      data-testid="hero-search-input"
                    />
                  </div>
                  <Button 
                    size="sm" 
                    className="px-3 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white rounded-full font-medium text-sm sm:text-base shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 h-[36px] sm:h-[40px] flex items-center gap-1 sm:gap-2 focus:outline-none focus:ring-0 focus-visible:ring-0 flex-shrink-0" 
                    data-testid="hero-search-button"
                    onClick={() => {
                      const searchParams = new URLSearchParams()
                      if (searchQuery.trim()) {
                        searchParams.set('search', searchQuery.trim())
                      }
                      window.location.href = `/properties?${searchParams.toString()}`
                    }}
                  >
                    <Search className="h-4 w-4" />
                    <span className="hidden sm:inline">{t('hero.searchButton', language)}</span>
              </Button>
                </div>
              </div>
            </div>
            
            {/* Quick Search Keywords - Enhanced Colors & Animations */}
            <div 
              className="w-full max-w-2xl mx-auto mt-3 sm:mt-6 px-2 sm:px-0 hidden sm:block"
            >
              <div className="flex flex-wrap justify-center gap-1 sm:gap-1.5" data-testid="quick-search-keywords">
                {/* Property Types - Luxury Theme */}
                <div className={`bg-white/15 backdrop-blur-lg rounded-full px-2 py-1 shadow-lg border border-white/30 transition-all duration-300 hover:bg-white/20 hover:scale-105 hover:shadow-xl ${startAnimations ? 'animate-keyword-pop' : 'opacity-0 scale-0'}`} style={{ animationDelay: startAnimations ? '1.6s' : '0s', animationFillMode: 'forwards' }}>
                  <button
                    onClick={() => setSearchQuery('villa')}
                    className="text-base font-semibold text-white/90 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 rounded-full px-1 py-0.5"
                  >
                    {language === 'cs' ? 'Vila' : (language === 'it' ? 'Villa' : 'Villa')}
                  </button>
                </div>
                
                <div className={`bg-white/15 backdrop-blur-lg rounded-full px-2 py-1 shadow-lg border border-white/30 transition-all duration-300 hover:bg-white/20 hover:scale-105 hover:shadow-xl ${startAnimations ? 'animate-keyword-pop' : 'opacity-0 scale-0'}`} style={{ animationDelay: startAnimations ? '1.7s' : '0s', animationFillMode: 'forwards' }}>
                  <button
                    onClick={() => setSearchQuery('apartment')}
                    className="text-base font-semibold text-white/90 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 rounded-full px-1 py-0.5"
                  >
                    {language === 'cs' ? 'Byt' : (language === 'it' ? 'Appartamento' : 'Apartment')}
                  </button>
                </div>
                
                <div className={`bg-white/15 backdrop-blur-lg rounded-full px-2 py-1 shadow-lg border border-white/30 transition-all duration-300 hover:bg-white/20 hover:scale-105 hover:shadow-xl ${startAnimations ? 'animate-keyword-pop' : 'opacity-0 scale-0'}`} style={{ animationDelay: startAnimations ? '1.8s' : '0s', animationFillMode: 'forwards' }}>
                  <button
                    onClick={() => setSearchQuery('house')}
                    className="text-base font-semibold text-white/90 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 rounded-full px-1 py-0.5"
                  >
                    {language === 'cs' ? 'Dům' : (language === 'it' ? 'Casa' : 'House')}
                  </button>
                </div>
                
                <div className={`bg-white/15 backdrop-blur-lg rounded-full px-2 py-1 shadow-lg border border-white/30 transition-all duration-300 hover:bg-white/20 hover:scale-105 hover:shadow-xl ${startAnimations ? 'animate-keyword-pop' : 'opacity-0 scale-0'}`} style={{ animationDelay: startAnimations ? '1.9s' : '0s', animationFillMode: 'forwards' }}>
                  <button
                    onClick={() => setSearchQuery('penthouse')}
                    className="text-base font-semibold text-white/90 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 rounded-full px-1 py-0.5"
                  >
                    {language === 'cs' ? 'Penthouse' : (language === 'it' ? 'Attico' : 'Penthouse')}
                  </button>
                </div>
                
                {/* Popular Locations - Luxury Theme */}
                <div className={`bg-white/15 backdrop-blur-lg rounded-full px-2 py-1 shadow-lg border border-white/30 transition-all duration-300 hover:bg-white/20 hover:scale-105 hover:shadow-xl ${startAnimations ? 'animate-keyword-pop' : 'opacity-0 scale-0'}`} style={{ animationDelay: startAnimations ? '2.0s' : '0s', animationFillMode: 'forwards' }}>
                  <button
                    onClick={() => setSearchQuery('Tuscany')}
                    className="text-base font-semibold text-white/90 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 rounded-full px-1 py-0.5"
                  >
                    {language === 'cs' ? 'Toskánsko' : (language === 'it' ? 'Toscana' : 'Tuscany')}
                  </button>
                </div>
                
                <div className={`bg-white/15 backdrop-blur-lg rounded-full px-2 py-1 shadow-lg border border-white/30 transition-all duration-300 hover:bg-white/20 hover:scale-105 hover:shadow-xl ${startAnimations ? 'animate-keyword-pop' : 'opacity-0 scale-0'}`} style={{ animationDelay: startAnimations ? '2.1s' : '0s', animationFillMode: 'forwards' }}>
                  <button
                    onClick={() => setSearchQuery('Liguria')}
                    className="text-base font-semibold text-white/90 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 rounded-full px-1 py-0.5"
                  >
                    {language === 'cs' ? 'Ligurie' : (language === 'it' ? 'Liguria' : 'Liguria')}
                  </button>
                </div>
                
                <div className={`bg-white/15 backdrop-blur-lg rounded-full px-2 py-1 shadow-lg border border-white/30 transition-all duration-300 hover:bg-white/20 hover:scale-105 hover:shadow-xl ${startAnimations ? 'animate-keyword-pop' : 'opacity-0 scale-0'}`} style={{ animationDelay: startAnimations ? '2.2s' : '0s', animationFillMode: 'forwards' }}>
                  <button
                    onClick={() => setSearchQuery('Milan')}
                    className="text-base font-semibold text-white/90 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 rounded-full px-1 py-0.5"
                  >
                    {language === 'cs' ? 'Milán' : (language === 'it' ? 'Milano' : 'Milan')}
                  </button>
                </div>
                
                <div className={`bg-white/15 backdrop-blur-lg rounded-full px-2 py-1 shadow-lg border border-white/30 transition-all duration-300 hover:bg-white/20 hover:scale-105 hover:shadow-xl ${startAnimations ? 'animate-keyword-pop' : 'opacity-0 scale-0'}`} style={{ animationDelay: startAnimations ? '2.3s' : '0s', animationFillMode: 'forwards' }}>
                  <button
                    onClick={() => setSearchQuery('Puglia')}
                    className="text-base font-semibold text-white/90 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 rounded-full px-1 py-0.5"
                  >
                    {language === 'cs' ? 'Puglie' : (language === 'it' ? 'Puglia' : 'Puglia')}
                  </button>
                </div>
                
                <div className={`bg-white/15 backdrop-blur-lg rounded-full px-2 py-1 shadow-lg border border-white/30 transition-all duration-300 hover:bg-white/20 hover:scale-105 hover:shadow-xl ${startAnimations ? 'animate-keyword-pop' : 'opacity-0 scale-0'}`} style={{ animationDelay: startAnimations ? '2.4s' : '0s', animationFillMode: 'forwards' }}>
                  <button
                    onClick={() => setSearchQuery('Sicilia')}
                    className="text-base font-semibold text-white/90 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 rounded-full px-1 py-0.5"
                  >
                    {language === 'cs' ? 'Sicílie' : (language === 'it' ? 'Sicilia' : 'Sicily')}
                  </button>
                </div>
                
                {/* Price & Style - Luxury Theme */}
                <div className={`bg-white/15 backdrop-blur-lg rounded-full px-2 py-1 shadow-lg border border-white/30 transition-all duration-300 hover:bg-white/20 hover:scale-105 hover:shadow-xl ${startAnimations ? 'animate-keyword-pop' : 'opacity-0 scale-0'}`} style={{ animationDelay: startAnimations ? '2.5s' : '0s', animationFillMode: 'forwards' }}>
                  <button
                    onClick={() => setSearchQuery('luxury')}
                    className="text-base font-medium text-white/90 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 rounded-full px-1 py-0.5"
                  >
                    {language === 'cs' ? 'Luxusní' : (language === 'it' ? 'Lusso' : 'Luxury')}
                  </button>
                </div>
                
                <div className={`bg-white/15 backdrop-blur-lg rounded-full px-2 py-1 shadow-lg border border-white/30 transition-all duration-300 hover:bg-white/20 hover:scale-105 hover:shadow-xl ${startAnimations ? 'animate-keyword-pop' : 'opacity-0 scale-0'}`} style={{ animationDelay: startAnimations ? '2.6s' : '0s', animationFillMode: 'forwards' }}>
                  <button
                    onClick={() => setSearchQuery('beachfront')}
                    className="text-base font-medium text-white/90 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 rounded-full px-1 py-0.5"
                  >
                    {language === 'cs' ? 'U moře' : (language === 'it' ? 'Sul mare' : 'Beachfront')}
                  </button>
                </div>
                
                {/* Features - Luxury Theme */}
                <div className={`bg-white/15 backdrop-blur-lg rounded-full px-2 py-1 shadow-lg border border-white/30 transition-all duration-300 hover:bg-white/20 hover:scale-105 hover:shadow-xl ${startAnimations ? 'animate-keyword-pop' : 'opacity-0 scale-0'}`} style={{ animationDelay: startAnimations ? '2.7s' : '0s', animationFillMode: 'forwards' }}>
                  <button
                    onClick={() => setSearchQuery('pool')}
                    className="text-base font-semibold text-white/90 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 rounded-full px-1 py-0.5"
                  >
                    {language === 'cs' ? 'Bazén' : (language === 'it' ? 'Piscina' : 'Pool')}
                  </button>
                </div>
                
                <div className={`bg-white/15 backdrop-blur-lg rounded-full px-2 py-1 shadow-lg border border-white/30 transition-all duration-300 hover:bg-white/20 hover:scale-105 hover:shadow-xl ${startAnimations ? 'animate-keyword-pop' : 'opacity-0 scale-0'}`} style={{ animationDelay: startAnimations ? '2.8s' : '0s', animationFillMode: 'forwards' }}>
                  <button
                    onClick={() => setSearchQuery('garden')}
                    className="text-base font-semibold text-white/90 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 rounded-full px-1 py-0.5"
                  >
                    {language === 'cs' ? 'Zahrada' : (language === 'it' ? 'Giardino' : 'Garden')}
                  </button>
                </div>
              </div>
            </div>
            
            {/* Trust Indicators - Subtle & Elegant */}
            <div 
              className={`transition-all duration-700 w-full max-w-3xl mx-auto mt-6 sm:mt-16 px-2 sm:px-4 ${startAnimations ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
              style={{
                transitionDelay: startAnimations ? '2.9s' : '0s'
              }}
            >
              <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-2 sm:gap-4">
                {/* Legal Partner */}
                <div className="flex items-center gap-2 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 shadow-lg border border-white/20 transition-all duration-300 hover:scale-105 hover:shadow-xl group w-full sm:w-auto" style={{ background: 'linear-gradient(to right, rgba(199, 137, 91), rgb(153, 105, 69))' }}>
                  <Scale className="h-4 w-4 text-white group-hover:text-white transition-colors flex-shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold text-white leading-tight">
                      {language === 'cs' ? 'Právní Partner' :
                       language === 'it' ? 'Partner Legale' :
                       'Legal Partner'}
                    </span>
                    <span className="text-[10px] text-white/90 leading-tight">
                      {language === 'cs' ? 'Certifikovaní Právníci' :
                       language === 'it' ? 'Avvocati Certificati' :
                       'Certified Lawyers'}
                    </span>
                  </div>
                </div>
                
                {/* Tour Partner */}
                <div className="flex items-center gap-2 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 shadow-lg border border-white/20 transition-all duration-300 hover:scale-105 hover:shadow-xl group w-full sm:w-auto" style={{ background: 'linear-gradient(to right, rgba(199, 137, 91), rgb(153, 105, 69))' }}>
                  <Globe className="h-4 w-4 text-white group-hover:text-white transition-colors flex-shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold text-white leading-tight">
                      {language === 'cs' ? 'Turistický Partner' :
                       language === 'it' ? 'Partner Turistico' :
                       'Tour Partner'}
                    </span>
                    <span className="text-[10px] text-white/90 leading-tight">
                      {language === 'cs' ? 'Místní Zkušenosti' :
                       language === 'it' ? 'Esperienza Locale' :
                       'Local Experience'}
                    </span>
                  </div>
                </div>
                
                {/* Data Privacy */}
                <div className="flex items-center gap-2 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 shadow-lg border border-white/20 transition-all duration-300 hover:scale-105 hover:shadow-xl group w-full sm:w-auto" style={{ background: 'linear-gradient(to right, rgba(199, 137, 91), rgb(153, 105, 69))' }}>
                  <Lock className="h-4 w-4 text-white group-hover:text-white transition-colors flex-shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold text-white leading-tight">
                      {language === 'cs' ? 'Ochrana dat' :
                       language === 'it' ? 'Privacy dei Dati' :
                       'Data Privacy'}
                    </span>
                    <span className="text-[10px] text-white/90 leading-tight">
                      {language === 'cs' ? 'Soulad s GDPR' :
                       language === 'it' ? 'Conforme al GDPR' :
                       'GDPR Compliant'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

        {/* Intro Section - Not a Real Estate Agency */}
        <section className="bg-gradient-to-br from-[#f7f4ed] via-amber-50/20 to-orange-50/10 pt-12 sm:pt-16 md:pt-20 pb-12 sm:pb-20 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Left Side - Text Content */}
            <div className="space-y-4 sm:space-y-6 animate-on-scroll slide-left">
                <h2 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  {language === 'cs' ? 'Pomáháme Čechům koupit dům v Itálii. Bez stresu. Bez iluzí. S jasným postupem.' :
                   language === 'it' ? 'Aiutiamo i cechi a comprare casa in Italia. Senza stress. Senza illusioni. Con un percorso chiaro.' :
                   'We help Czechs buy a home in Italy. Stress-free. No illusions. With a clear process.'}
                </h2>
                <p className="text-base sm:text-xl text-gray-700 leading-relaxed">
                  {language === 'cs' ? 'Praktické informace ještě předtím, než uděláte první rozhodnutí.' :
                   language === 'it' ? 'Informazioni pratiche prima ancora di prendere la prima decisione.' :
                   'Practical information before you make your first decision.'}
              </p>
              <div className="pt-2 sm:pt-4">
                  <Link href="/process">
                    <Button 
                      className="bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white hover:scale-105 transition-all duration-300 px-6 sm:px-8 py-2.5 sm:py-3 text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl"
                    >
                      {language === 'cs' ? 'O našem procesu' : 
                       language === 'it' ? 'Sul nostro processo' : 
                       'About Our Process'}
                    </Button>
                  </Link>
              </div>
            </div>

            {/* Right Side - Animated Image Tiles - Hidden on small mobile */}
            <div className="hidden md:flex relative h-[400px] lg:h-[500px] items-center justify-center animate-on-scroll slide-right">
              <ImageReveal
                leftImage="https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=800&q=80"
                middleImage="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80"
                rightImage="https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=800&q=80"
              />
            </div>
          </div>
        </div>
        
        {/* Scroll Down Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30">
          <div 
            className="flex flex-col items-center space-y-2 text-white/80 hover:text-white transition-colors duration-300 cursor-pointer group"
            onClick={() => {
              const nextSection = document.querySelector('[data-testid="main-content-container"]');
              if (nextSection) {
                // Use Lenis for smooth scrolling
                window.lenis?.scrollTo(nextSection, { offset: -80 });
              }
            }}
          >
            <span className="text-base font-medium tracking-wide uppercase">
              {language === 'cs' ? 'Přejděte dolů' : 
               language === 'it' ? 'Scorri per esplorare' : 
               'Scroll to explore'}
            </span>
            <div className="w-6 h-10 border-2 border-white/60 rounded-full flex justify-center group-hover:border-white transition-colors duration-300">
              <div className="w-1 h-3 bg-white/60 rounded-full mt-2 group-hover:bg-white transition-colors duration-300 slow-bounce"></div>
            </div>
          </div>
        </div>
      </section>
      <div className="container mx-auto px-4 pt-12 pb-8 bg-[#f7f4ed]" data-testid="main-content-container">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900" data-testid="section-description">
            {language === 'cs' ? 'Perchè l\'italia è diversa' :
             language === 'it' ? 'Perché l\'Italia è diversa' :
             'Why Italy is different'}
          </h2>
        </div>

        {/* Why Italy is Different - 3 cards */}
        <div className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8" data-testid="why-italy-different-grid">
            {/* Card 1 */}
            <Card className="group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden border border-gray-200 shadow-lg bg-white rounded-2xl flex flex-col h-full">
              <CardContent className="p-6 flex flex-col flex-1">
                <div className="flex-1 space-y-4">
                  <h3 className="font-bold text-2xl leading-tight text-gray-900">
                    {language === 'cs' ? 'Italský systém je jiný' :
                     language === 'it' ? 'Il sistema italiano è diverso' :
                     'The Italian system is different'}
                  </h3>
                  <p className="text-gray-600 text-base leading-relaxed">
                    {language === 'cs' ? 'Pravidla, daně a procesy se liší od České republiky.' :
                     language === 'it' ? 'Regole, tasse e processi differiscono dalla Repubblica Ceca.' :
                     'Rules, taxes and processes differ from the Czech Republic.'}
                  </p>
                </div>
                <div className="pt-4 mt-auto">
                  <Link href="https://new-domy-main-z3ex.vercel.app/process">
                    <Button className="w-full bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white font-semibold py-2.5 rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300 text-base">
                      {language === 'cs' ? 'O našem procesu' : language === 'it' ? 'Sul nostro processo' : 'About Our Process'}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Card 2 (placeholder) */}
            <Card className="group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden border border-gray-200 shadow-lg bg-white rounded-2xl flex flex-col h-full">
              <CardContent className="p-6 flex flex-col flex-1">
                <div className="flex-1 space-y-4">
                  <h3 className="font-bold text-2xl leading-tight text-gray-900">
                    {language === 'cs' ? 'Cena není všechno' : language === 'it' ? 'Il prezzo non è tutto' : 'Price isn’t everything'}
                  </h3>
                  <p className="text-gray-600 text-base leading-relaxed">
                    {language === 'cs' ? 'Skutečné náklady se ukazují až v detailu.' : language === 'it' ? 'I costi reali emergono nei dettagli.' : 'The real costs show up in the details.'}
                  </p>
                <div className="pt-4 mt-auto">
                  <Link href="/guides/costs">
                    <Button className="w-full bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white font-semibold py-2.5 rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300 text-base">
                      {language === 'it' ? 'Scopri di più' : language === 'cs' ? 'Zjistit více' : 'Learn more'}
                    </Button>
                  </Link>
                </div>
                </div>
              </CardContent>
            </Card>

            {/* Card 3 (placeholder) */}
            <Card className="group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden border border-gray-200 shadow-lg bg-white rounded-2xl flex flex-col h-full">
              <CardContent className="p-6 flex flex-col flex-1">
                <div className="flex-1 space-y-4">
                  <h3 className="font-bold text-2xl leading-tight text-gray-900">
                    {language === 'cs' ? 'Třetí karta' : language === 'it' ? 'Terza card' : 'Third card'}
                  </h3>
                  <p className="text-gray-600 text-base leading-relaxed">
                    {language === 'cs' ? 'Obsah doplníme dle instrukcí.' : language === 'it' ? 'Contenuto da definire.' : 'Content to be defined.'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Premium Club Section */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 sm:py-20 overflow-hidden">
        <div className="container mx-auto px-4">
          {/* Main Premium Club Content */}
          <div className="text-center mb-8 sm:mb-16 animate-on-scroll">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6" style={{ color: '#c48759' }}>
              {language === 'cs' ? 'Premium Club' :
               language === 'it' ? 'Club Premium' :
               'Premium Club'}
            </h2>
            <p className="text-base sm:text-xl text-gray-200 max-w-3xl mx-auto mb-6 sm:mb-8 px-2">
              {language === 'cs' ? 'Váš osobní průvodce nemovitostmi a životním stylem v Itálii' :
               language === 'it' ? 'La tua guida personale a proprietà e stile di vita in Italia' :
               'Your Personal Guide to Property & Lifestyle in Italy'}
            </p>
            <Button 
              size="lg"
              className="font-semibold py-3 sm:py-4 px-6 sm:px-8 text-base sm:text-lg rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 text-white"
              style={{ background: 'linear-gradient(to right, rgba(199, 137, 91), rgb(153, 105, 69))' }}
            >
              {language === 'cs' ? 'Připojit se zdarma' :
               language === 'it' ? 'Unisciti gratuitamente' :
               'Join for Free'}
            </Button>
          </div>

          {/* Premium Card and Blogs Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-16">
            {/* Premium Card - Takes 1 column on large screens */}
            <div className="lg:col-span-1">
              <GlareCard 
                className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-slate-900 to-slate-800 h-full"
                onClick={() => {
                  window.location.href = '/dashboard';
                }}
              >
                <div className="text-center space-y-6">
                  <div className="flex items-center justify-center mx-auto">
                    <img src="/logo domy.svg" alt="Logo" className="h-16 w-16" />
                  </div>
                  
                  <div>
                    <h4 className="text-2xl font-bold mb-2" style={{ color: '#c48759' }}>
                      {language === 'cs' ? 'PREMIUM CLUB' :
                       language === 'it' ? 'CLUB PREMIUM' :
                       'PREMIUM CLUB'}
                    </h4>
                    <p className="text-gray-300 text-base">
                      {language === 'cs' ? 'Exkluzivní členství' :
                       language === 'it' ? 'Membri esclusivi' :
                       'Exclusive Membership'}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Check className="h-5 w-5 text-slate-600" />
                      <span className="text-base" style={{ color: '#c48759' }}>
                        {language === 'cs' ? 'Vlastní vyhledávač' :
                         language === 'it' ? 'Ricerca Personalizzata' :
                         'Custom Finder'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Check className="h-5 w-5 text-slate-600" />
                      <span className="text-base" style={{ color: '#c48759' }}>
                        {language === 'cs' ? 'Cestovní výhody' :
                         language === 'it' ? 'Vantaggi di Viaggio' :
                         'Travel Perks'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Check className="h-5 w-5 text-slate-600" />
                      <span className="text-base" style={{ color: '#c48759' }}>
                        {language === 'cs' ? 'Insider blogy' :
                         language === 'it' ? 'Blog Insider' :
                         'Insider Blogs'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Check className="h-5 w-5 text-slate-600" />
                      <span className="text-base" style={{ color: '#c48759' }}>
                        {language === 'cs' ? 'Týdenní webináře' :
                         language === 'it' ? 'Webinar Settimanali' :
                         'Weekly Webinars'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4">
                    <div className="text-3xl font-bold mb-1" style={{ color: '#c48759' }}>
                      {language === 'cs' ? 'ZDARMA' :
                       language === 'it' ? 'GRATIS' :
                       'FREE'}
                    </div>
                    <p className="text-gray-300 text-xs">
                      {language === 'cs' ? 'Bez skrytých poplatků' :
                       language === 'it' ? 'Nessuna commissione nascosta' :
                       'No hidden fees'}
                    </p>
                  </div>
                </div>
              </GlareCard>
            </div>

            {/* Premium Blogs - Takes 2 columns on large screens */}
            <div className="lg:col-span-2">
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold text-white mb-4">
                  {language === 'cs' ? 'Exkluzivní Obsah' :
                   language === 'it' ? 'Contenuto Esclusivo' :
                   'Exclusive Content'}
                </h3>
                <p className="text-lg text-gray-200">
                  {user 
                    ? (language === 'cs' ? 'Vaše prémiové články a průvodci' :
                       language === 'it' ? 'I tuoi articoli e guide premium' :
                       'Your premium articles and guides')
                    : (language === 'cs' ? 'Zaregistrujte se zdarma a získejte přístup k prémiovým článkům' :
                       language === 'it' ? 'Registrati gratis per accedere ai contenuti premium' :
                       'Register for free to unlock premium articles and guides')
                  }
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {[
                  {
                    title: {
                      en: 'How to Buy a House in Italy: Complete Guide',
                      cs: 'Jak koupit dům v Itálii: Kompletní průvodce',
                      it: 'Come Acquistare una Casa in Italia: Guida Completa'
                    },
                    excerpt: {
                      en: 'Everything you need to know about documents, taxes, and procedures for buying property in Italy.',
                      cs: 'Vše, co potřebujete vědět o dokumentech, daních a postupech při koupi nemovitosti v Itálii.',
                      it: 'Tutto quello che devi sapere sui documenti, tasse e procedure per acquistare immobili in Italia.'
                    },
                    category: { en: 'Legal', cs: 'Právo', it: 'Legale' },
                    readTime: { en: '15 min read', cs: '15 min čtení', it: '15 min di lettura' },
                    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=800&auto=format&fit=crop',
                    link: '/guides/costs'
                  },
                  {
                    title: {
                      en: 'Most Common Czech Mistakes When Buying in Italy',
                      cs: 'Nejčastější chyby Čechů při koupi domu v Itálii',
                      it: 'Errori Più Comuni dei Cechi nell\'Acquisto in Italia'
                    },
                    excerpt: {
                      en: 'What to watch out for to avoid losing time and money. Problems arise from unfamiliarity, not carelessness.',
                      cs: 'Na co si dát pozor, abyste neztratili čas a peníze. Problémy vznikají z neznalosti, ne z nepozornosti.',
                      it: 'A cosa fare attenzione per non perdere tempo e denaro. I problemi nascono dalla scarsa conoscenza, non dalla disattenzione.'
                    },
                    category: { en: 'Guide', cs: 'Průvodce', it: 'Guida' },
                    readTime: { en: '12 min read', cs: '12 min čtení', it: '12 min di lettura' },
                    image: 'https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?q=80&w=800&auto=format&fit=crop',
                    link: '/guides/mistakes'
                  },
                  {
                    title: {
                      en: 'Investing in Italian Real Estate: Opportunities and Risks',
                      cs: 'Investice do italských nemovitostí: Příležitosti a rizika',
                      it: 'Investire in Immobili Italiani: Opportunità e Rischi'
                    },
                    excerpt: {
                      en: 'In-depth analysis of the Italian real estate market and investment strategies.',
                      cs: 'Podrobná analýza italského realitního trhu a investičních strategií.',
                      it: 'Analisi approfondita del mercato immobiliare italiano e strategie di investimento.'
                    },
                    category: { en: 'Investment', cs: 'Investice', it: 'Investimento' },
                    readTime: { en: '18 min read', cs: '18 min čtení', it: '18 min di lettura' },
                    image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?q=80&w=800&auto=format&fit=crop',
                    link: '/blog'
                  }
                ].map((article, index) => (
                  <div 
                    key={index} 
                    className={`${index === 2 ? 'sm:col-span-2 lg:col-span-1' : ''} cursor-pointer`}
                    onClick={() => {
                      if (user) {
                        window.location.href = article.link
                      } else {
                        setIsAuthModalOpen(true)
                      }
                    }}
                  >
                    <div className="bg-slate-800 rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-slate-700 h-full relative group">
                      <div className="aspect-video relative overflow-hidden">
                        <img 
                          src={article.image} 
                          alt={article.title[language]} 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        <div className="absolute top-3 sm:top-4 left-3 sm:left-4">
                          <span className="bg-gradient-to-r from-slate-700 to-slate-800 text-white text-xs font-semibold px-2 sm:px-3 py-1 rounded-full">
                            {article.category[language]}
                          </span>
                        </div>
                        {/* Lock badge on image */}
                        {!user && (
                          <div className="absolute top-3 sm:top-4 right-3 sm:right-4">
                            <span className="flex items-center gap-1 bg-black/50 backdrop-blur-sm text-white text-xs font-medium px-2 py-1 rounded-full border border-white/10">
                              <Lock className="h-3 w-3" />
                              Premium
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="p-4 sm:p-6 relative">
                        <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3 line-clamp-2">
                          {article.title[language]}
                        </h3>
                        <p className="text-gray-300 text-sm sm:text-base line-clamp-2">
                          {article.excerpt[language]}
                        </p>
                        
                        {/* Blur overlay + register CTA for non-logged-in users */}
                        {!user && (
                          <div className="mt-2">
                            {/* Fading blur over text */}
                            <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-slate-800 via-slate-800/95 to-transparent pointer-events-none" />
                            {/* Register prompt */}
                            <div className="relative z-10 pt-6 flex items-center justify-center">
                              <span className="flex items-center gap-2 text-sm font-semibold group-hover:scale-105 transition-transform" style={{ color: '#c48759' }}>
                                <Lock className="h-3.5 w-3.5" />
                                {language === 'cs' ? 'Zaregistrujte se pro čtení' :
                                 language === 'it' ? 'Registrati per leggere' :
                                 'Register to read'}
                              </span>
                            </div>
                          </div>
                        )}
                        
                        {/* Normal footer for logged-in users */}
                        {user && (
                          <div className="flex items-center justify-between mt-3">
                            <span className="text-xs text-gray-400">
                              {article.readTime[language]}
                            </span>
                            <span className="text-xs font-semibold text-copper-400">
                              {language === 'cs' ? 'Číst článek' : language === 'it' ? 'Leggi' : 'Read'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Regions Section */}
      <section className="py-12 sm:py-20 bg-[#f7f4ed] overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-16 animate-on-scroll">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6 tracking-tight">
              {language === 'cs' ? 'Prozkoumejte Nejžádanější Regiony Itálie' :
               language === 'it' ? 'Esplora le Regioni Più Ricercate d\'Italia' : 
               'Explore Italy\'s Most Wanted Regions'}
            </h2>
            <p className="text-base sm:text-xl text-gray-600 max-w-3xl mx-auto px-2">
              {language === 'cs' ? 'Ne celá Itálie je stejná. Vyberte si region, který vyhovuje vašemu rozpočtu, životnímu stylu a investičním cílům. Prohlédněte si nemovitosti v oblastech, které milujete.' :
               language === 'it' ? 'Non tutta l\'Italia è uguale. Scegli una regione che si adatti al tuo budget, stile di vita e obiettivi di investimento. Esplora le proprietà nelle aree che ami.' : 
               'Not all of Italy is the same. Choose a region that fits your budget, lifestyle, and investment goals. Explore properties in the areas you love.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8 mb-8 sm:mb-12">
            {/* Sardegna */}
            <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-200">
              <div className="aspect-video relative overflow-hidden">
                <img 
                  src="/Sardegna.jpg" 
                  alt="Sardegna" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {language === 'cs' ? 'Sardinie' :
                     language === 'it' ? 'Sardegna' :
                     'Sardinia'}
                  </h3>
                  <p className="text-white/90 text-base">
                    {language === 'cs' ? 'Křišťálové vody, panenské pláže, luxusní resorty' :
                     language === 'it' ? 'Acque cristalline, spiagge incontaminate, resort di lusso' :
                     'Crystal waters, pristine beaches, luxury resorts'}
                  </p>
                </div>
              </div>
              <div className="p-6">
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="bg-slate-100 text-slate-800 text-xs font-semibold px-3 py-1 rounded-full">
                    €3,500-8,000/m²
                  </span>
                  <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                    5-8% yield
                  </span>
                  <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-3 py-1 rounded-full">
                    EU resident
                  </span>
                </div>
                <Link 
                  href="/properties?region=sardegna"
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    document.documentElement.scrollTop = 0;
                    document.body.scrollTop = 0;
                  }}
                >
                  <button className="w-full bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white font-semibold py-3 px-4 rounded-lg text-base transition-all duration-300 hover:scale-105">
                    {language === 'cs' ? 'Zobrazit nabídky ze Sardinie' :
                     language === 'it' ? 'Visualizza offerte per la Sardegna' :
                     'View offers from Sardinia'}
                  </button>
                </Link>
              </div>
            </div>

            {/* Tuscany */}
            <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-200">
              <div className="aspect-video relative overflow-hidden">
                <img 
                  src="/Toscana.png" 
                  alt="Tuscany" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {language === 'cs' ? 'Toskánsko' :
                     language === 'it' ? 'Toscana' :
                     'Tuscany'}
                  </h3>
                  <p className="text-white/90 text-base">
                    {language === 'cs' ? 'Kamenné statky, vinice, stabilní poptávka po pronájmu' :
                     language === 'it' ? 'Case coloniche in pietra, viste sui vigneti, domanda di affitto stabile' :
                     'Stone farmhouses, vineyard views, stable rental demand'}
                  </p>
                </div>
              </div>
              <div className="p-6">
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="bg-slate-100 text-slate-800 text-xs font-semibold px-3 py-1 rounded-full">
                    €2,500-6,000/m²
                  </span>
                  <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                    {language === 'cs' ? '4-7% výnos' :
                     language === 'it' ? 'Rendimento 4-7%' :
                     '4-7% yield'}
                  </span>
                  <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-3 py-1 rounded-full">
                    {language === 'cs' ? 'Rezident EU' :
                     language === 'it' ? 'Residente UE' :
                     'EU resident'}
                  </span>
                </div>
                <Link 
                  href="/properties?region=toscana"
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    document.documentElement.scrollTop = 0;
                    document.body.scrollTop = 0;
                  }}
                >
                  <button className="w-full bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white font-semibold py-3 px-4 rounded-lg text-base transition-all duration-300 hover:scale-105">
                    {language === 'cs' ? 'Zobrazit nabídky z Toskánska' :
                     language === 'it' ? 'Visualizza offerte per la Toscana' :
                     'View offers from Tuscany'}
                  </button>
                </Link>
              </div>
            </div>

            {/* Emilia-Romagna */}
            <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-200">
              <div className="aspect-video relative overflow-hidden">
                <img 
                  src="/Emilia-Romagna.jpg" 
                  alt="Emilia-Romagna" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {language === 'cs' ? 'Emilia-Romagna' :
                     language === 'it' ? 'Emilia-Romagna' :
                     'Emilia-Romagna'}
                  </h3>
                  <p className="text-white/90 text-base">
                    {language === 'cs' ? 'Kulinářské hlavní město, historická města, zvlněné kopce' :
                     language === 'it' ? 'Capitale culinaria, città storiche, dolci colline' :
                     'Culinary capital, historic cities, rolling hills'}
                  </p>
                </div>
              </div>
              <div className="p-6">
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="bg-slate-100 text-slate-800 text-xs font-semibold px-3 py-1 rounded-full">
                    €2,000-5,000/m²
                  </span>
                  <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                    4-7% yield
                  </span>
                  <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-3 py-1 rounded-full">
                    EU resident
                  </span>
                </div>
                <Link 
                  href="/properties?region=emilia-romagna"
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    document.documentElement.scrollTop = 0;
                    document.body.scrollTop = 0;
                  }}
                >
                  <button className="w-full bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white font-semibold py-3 px-4 rounded-lg text-base transition-all duration-300 hover:scale-105">
                    {language === 'cs' ? 'Zobrazit nabídky z Emilia-Romagna' :
                     language === 'it' ? 'Visualizza offerte per l\'Emilia-Romagna' :
                     'View offers from Emilia-Romagna'}
                  </button>
                </Link>
              </div>
            </div>

            {/* Sicily */}
            <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-200">
              <div className="aspect-video relative overflow-hidden">
                <img 
                  src="/Sicilia.jpg" 
                  alt="Sicily" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {language === 'cs' ? 'Sicílie' :
                     language === 'it' ? 'Sicilia' :
                     'Sicily'}
                  </h3>
                  <p className="text-white/90 text-base">
                    {language === 'cs' ? 'Historické paláce, barokní města, rostoucí trh' :
                     language === 'it' ? 'Palazzi storici, città barocche, mercato emergente' :
                     'Historic palazzi, Baroque towns, emerging market'}
                  </p>
                </div>
              </div>
              <div className="p-6">
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="bg-slate-100 text-slate-800 text-xs font-semibold px-3 py-1 rounded-full">
                    €1,500-4,000/m²
                  </span>
                  <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                    {language === 'cs' ? '6-10% výnos' :
                     language === 'it' ? 'Rendimento 6-10%' :
                     '6-10% yield'}
                  </span>
                  <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-3 py-1 rounded-full">
                    {language === 'cs' ? 'Rezident EU' :
                     language === 'it' ? 'Residente UE' :
                     'EU resident'}
                  </span>
                </div>
                <Link 
                  href="/properties?region=sicilia"
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    document.documentElement.scrollTop = 0;
                    document.body.scrollTop = 0;
                  }}
                >
                  <button className="w-full bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white font-semibold py-3 px-4 rounded-lg text-base transition-all duration-300 hover:scale-105">
                    {language === 'cs' ? 'Zobrazit nabídky ze Sicílie' :
                     language === 'it' ? 'Visualizza offerte per la Sicilia' :
                     'View offers from Sicily'}
                  </button>
                </Link>
              </div>
            </div>

            {/* Trentino-Alto Adige */}
            <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-200">
              <div className="aspect-video relative overflow-hidden">
                <img 
                  src="/Trentino-Alto Adige.jpg" 
                  alt="Trentino-Alto Adige" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {language === 'cs' ? 'Trentino-Alto Adige' :
                     language === 'it' ? 'Trentino-Alto Adige' :
                     'Trentino-Alto Adige'}
                  </h3>
                  <p className="text-white/90 text-base">
                    {language === 'cs' ? 'Dolomity, alpská jezera, jedinečná dvojí kultura' :
                     language === 'it' ? 'Dolomiti, laghi alpini, cultura duale unica' :
                     'Dolomites, alpine lakes, unique dual culture'}
                  </p>
                </div>
              </div>
              <div className="p-6">
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="bg-slate-100 text-slate-800 text-xs font-semibold px-3 py-1 rounded-full">
                    €4,500-12,000/m²
                  </span>
                  <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                    {language === 'cs' ? '3-6% výnos' :
                     language === 'it' ? 'Rendimento 3-6%' :
                     '3-6% yield'}
                  </span>
                  <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-3 py-1 rounded-full">
                    {language === 'cs' ? 'Rezident EU' :
                     language === 'it' ? 'Residente UE' :
                     'EU resident'}
                  </span>
                </div>
                <Link 
                  href="/properties?region=trentino-alto-adige"
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    document.documentElement.scrollTop = 0;
                    document.body.scrollTop = 0;
                  }}
                >
                  <button className="w-full bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white font-semibold py-3 px-4 rounded-lg text-base transition-all duration-300 hover:scale-105">
                    {language === 'cs' ? 'Zobrazit nabídky z Trentino-Alto Adige' :
                     language === 'it' ? 'Visualizza offerte per il Trentino-Alto Adige' :
                     'View offers from Trentino-Alto Adige'}
                  </button>
                </Link>
              </div>
            </div>

            {/* Lazio (Rome) */}
            <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-200">
              <div className="aspect-video relative overflow-hidden">
                <img 
                  src="/Lazio.webp" 
                  alt="Rome" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {language === 'cs' ? 'Lazio (Řím)' :
                     language === 'it' ? 'Lazio (Roma)' :
                     'Lazio (Rome)'}
                  </h3>
                  <p className="text-white/90 text-base">
                    {language === 'cs' ? 'Historické centrum, moderní čtvrti, silný trh s pronájmem' :
                     language === 'it' ? 'Centro storico, quartieri moderni, forte mercato degli affitti' :
                     'Historic center, modern districts, strong rental market'}
                  </p>
                </div>
              </div>
              <div className="p-6">
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="bg-slate-100 text-slate-800 text-xs font-semibold px-3 py-1 rounded-full">
                    €3,000-12,000/m²
                  </span>
                  <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                    {language === 'cs' ? '4-6% výnos' :
                     language === 'it' ? 'Rendimento 4-6%' :
                     '4-6% yield'}
                  </span>
                  <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-3 py-1 rounded-full">
                    {language === 'cs' ? 'Rezident EU' :
                     language === 'it' ? 'Residente UE' :
                     'EU resident'}
                  </span>
                </div>
                <Link 
                  href="/properties?region=lazio"
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    document.documentElement.scrollTop = 0;
                    document.body.scrollTop = 0;
                  }}
                >
                  <button className="w-full bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white font-semibold py-3 px-4 rounded-lg text-base transition-all duration-300 hover:scale-105">
                    {language === 'cs' ? 'Zobrazit nabídky z Lazia' :
                     language === 'it' ? 'Visualizza offerte per il Lazio' :
                     'View offers from Lazio'}
                  </button>
                </Link>
              </div>
            </div>
          </div>

          <div className="text-center">
            <button className="bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white font-semibold py-4 px-8 text-lg rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              {language === 'cs' ? 'Získejte kurátorované nabídky pro tento region' :
               language === 'it' ? 'Ottieni offerte curate per questa regione' :
               'Get curated listings for this region'}
            </button>
          </div>
        </div>
      </section>

        {/* How It Works Section */}
        <section className="py-20 bg-gradient-to-br from-[#f7f4ed] via-amber-50/20 to-orange-50/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-on-scroll">
            <h2 className="text-4xl font-bold text-gray-900 mb-6 tracking-tight">
              {language === 'cs' ? 'Jak to Funguje' :
               language === 'it' ? 'Come Funziona' :
               'How It Works'}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {language === 'cs' ? 'Od prvního briefingu po podepsanou smlouvu — vaše cesta k vlastnictví v Itálii, zjednodušená.' :
               language === 'it' ? 'Dal primo brief all\'atto firmato: il tuo percorso per possedere in Italia, semplificato.' :
               'From first brief to signed deed—your path to owning in Italy, simplified.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Step 1 */}
              <div className="text-center group">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105" style={{ background: 'linear-gradient(to right, rgba(199, 137, 91), rgb(153, 105, 69))' }}>
                  <span className="text-2xl font-bold text-white">1</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                {language === 'cs' ? 'Začněte Hledat' :
                 language === 'it' ? 'Inizia la Ricerca' :
                 'Start Your Search'}
              </h3>
              <p className="text-gray-600 text-base">
                {language === 'cs' ? 'Vyplňte 60sekundový formulář nebo procházejte naše stávající nemovitosti.' :
                 language === 'it' ? 'Compila il form di 60 secondi o sfoglia le nostre proprietà esistenti.' :
                 'Fill out a 60-second form or browse our existing property listings.'}
              </p>
            </div>

            {/* Step 2 */}
              <div className="text-center group">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105" style={{ background: 'linear-gradient(to right, rgba(199, 137, 91), rgb(153, 105, 69))' }}>
                  <span className="text-2xl font-bold text-white">2</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                {language === 'cs' ? 'Prohlédněte Všechny Nemovitosti' :
                 language === 'it' ? 'Sfoglia Tutte le Proprietà' :
                 'Browse All Properties'}
              </h3>
              <p className="text-gray-600 text-base">
                {language === 'cs' ? 'Procházejte naše rozsáhlé portfolio nemovitostí napříč všemi regiony Itálie.' :
                 language === 'it' ? 'Sfoglia il nostro vasto portafoglio di proprietà in tutte le regioni d\'Italia.' :
                 'Browse our extensive portfolio of properties across all Italian regions.'}
              </p>
            </div>

            {/* Step 3 */}
              <div className="text-center group">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105" style={{ background: 'linear-gradient(to right, rgba(199, 137, 91), rgb(153, 105, 69))' }}>
                  <span className="text-2xl font-bold text-white">3</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                {language === 'cs' ? 'Navštivte a Ověřte' :
                 language === 'it' ? 'Visita e Verifica' :
                 'Visit & Verify'}
              </h3>
              <p className="text-gray-600 text-base">
                {language === 'cs' ? 'Zařídíme prohlídky a kontroly na místě za vás.' :
                 language === 'it' ? 'Organizziamo visite e controlli sul posto per te.' :
                 'We arrange viewings and on-site checks.'}
              </p>
            </div>

            {/* Step 4 */}
              <div className="text-center group">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105" style={{ background: 'linear-gradient(to right, rgba(199, 137, 91), rgb(153, 105, 69))' }}>
                  <span className="text-2xl font-bold text-white">4</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                {language === 'cs' ? 'Právní a Dokončení' :
                 language === 'it' ? 'Legale e Chiusura' :
                 'Legal & Close'}
              </h3>
              <p className="text-gray-600 text-base">
                {language === 'cs' ? 'Naši partneři se starají o smlouvy, daně a dodržování předpisů.' :
                 language === 'it' ? 'I nostri partner gestiscono contratti, tasse e conformità.' :
                 'Our partners handle contracts, taxes, and compliance.'}
              </p>
            </div>
          </div>

          <div className="text-center">
            <Link href="/process">
              <button className="bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white font-semibold py-4 px-8 text-lg rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                {language === 'cs' ? 'Zobrazit celý proces' :
                 language === 'it' ? 'Visualizza il processo completo' :
                 'View Full Process'}
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Recent Success Stories Section */}
      <section className="py-20 bg-[#f7f4ed]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-on-scroll">
            <h2 className="text-4xl font-bold text-gray-900 mb-6 tracking-tight">
              {language === 'cs' ? 'Od Vyhledávání po Klíče v Ruce' :
               language === 'it' ? 'Dalla Ricerca alle Chiavi in Mano' :
               'From Search to Keys in Hand'}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {language === 'cs' ? 'Skutečné výsledky od kupujících jako jste vy.' :
               language === 'it' ? 'Risultati reali da acquirenti come te.' :
               'Real results from buyers like you.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {/* Success Story 1 */}
            <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-200 flex flex-col">
              <div className="aspect-video relative overflow-hidden flex-shrink-0">
                <img 
                  src="https://images.unsplash.com/photo-1518780664697-55e3ad937233?q=80&w=1965&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
                  alt="Tuscan farmhouse renovation" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-slate-800 text-white text-xs font-semibold px-2 py-1 rounded">SOLD</span>
                    <span className="text-white/90 text-xs">€280,000</span>
                  </div>
                </div>
              </div>
              <div className="p-6 flex flex-col h-full">
                <div className="flex-grow">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">
                    {language === 'cs' ? 'Obnovený Toskánský Statek' :
                     language === 'it' ? 'Fattoria Toscana Restaurata' :
                     'Restored Tuscan Farmhouse'}
                  </h3>
                  <p className="text-gray-600 text-base mb-4">
                    {language === 'cs' ? '"Tým se postaral o všechno: od počátečního hledání po povolení k rekonstrukci. Za 6 měsíců jsme měli náš dokonalý domov v Toskánsku."' :
                     language === 'it' ? '"Il team ha gestito tutto: dalla ricerca iniziale ai permessi di ristrutturazione. In 6 mesi abbiamo la nostra casa perfetta in Toscana."' :
                     '"The team handled everything: from initial search to renovation permits. In 6 months we had our perfect home in Tuscany."'}
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-xs text-gray-500">
                      <span className="font-semibold">Sarah & Marco</span><br/>
                      {language === 'cs' ? '6 měsíců • Toskánsko' :
                       language === 'it' ? '6 mesi • Toscana' :
                       '6 months • Tuscany'}
                    </div>
                    <span className="bg-slate-100 text-slate-800 text-xs font-semibold px-2 py-1 rounded-full">
                      {language === 'cs' ? 'Dokončeno' :
                       language === 'it' ? 'Completato' :
                       'Completed'}
                    </span>
                  </div>
                  <div className="mb-4">
                    <p className="text-xs text-gray-600 mb-2">
                      <span className="font-semibold">
                        {language === 'cs' ? 'Co jsme vyřešili:' :
                         language === 'it' ? 'Cosa abbiamo risolto:' :
                         'What we solved:'}
                      </span>
                    </p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• {language === 'cs' ? 'Katastrální kontrola' :
                          language === 'it' ? 'Controllo catastale' :
                          'Cadastral check'}</li>
                      <li>• {language === 'cs' ? 'Povolení k rekonstrukci' :
                          language === 'it' ? 'Permessi di ristrutturazione' :
                          'Renovation permits'}</li>
                    </ul>
                  </div>
                </div>
                <button className="w-full bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white font-semibold py-2 px-4 rounded-lg text-base transition-all duration-300 hover:scale-105 mt-auto">
                  {language === 'cs' ? 'Zobrazit podobné nemovitosti' :
                   language === 'it' ? 'Vedi proprietà simili' :
                   'See similar properties'}
                </button>
              </div>
            </div>

            {/* Success Story 2 */}
            <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-200 flex flex-col">
              <div className="aspect-video relative overflow-hidden flex-shrink-0">
                <img 
                  src="https://images.unsplash.com/photo-1520637836862-4d197d17c93a?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
                  alt="Sicilian palazzo" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-slate-800 text-white text-xs font-semibold px-2 py-1 rounded">SOLD</span>
                    <span className="text-white/90 text-xs">€450,000</span>
                  </div>
                </div>
              </div>
              <div className="p-6 flex flex-col h-full">
                <div className="flex-grow">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">
                    {language === 'cs' ? 'Sicilský Barokní Palác' :
                     language === 'it' ? 'Palazzo Barocco Siciliano' :
                     'Sicilian Baroque Palazzo'}
                  </h3>
                  <p className="text-gray-600 text-base mb-4">
                    {language === 'cs' ? '"Perfektní investice. Právní a daňové poradenství bylo klíčové pro dokončení nákupu bez překvapení."' :
                     language === 'it' ? '"Un investimento perfetto. La consulenza legale e fiscale è stata fondamentale per completare l\'acquisto senza sorprese."' :
                     '"Perfect investment. The legal and tax consultation was crucial to complete the purchase without surprises."'}
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-xs text-gray-500">
                      <span className="font-semibold">James & Elena</span><br/>
                      {language === 'cs' ? '4 měsíce • Sicílie' :
                       language === 'it' ? '4 mesi • Sicilia' :
                       '4 months • Sicily'}
                    </div>
                    <span className="bg-slate-100 text-slate-800 text-xs font-semibold px-2 py-1 rounded-full">
                      {language === 'cs' ? 'Dokončeno' :
                       language === 'it' ? 'Completato' :
                       'Completed'}
                    </span>
                  </div>
                  <div className="mb-4">
                    <p className="text-xs text-gray-600 mb-2">
                      <span className="font-semibold">
                        {language === 'cs' ? 'Co jsme vyřešili:' :
                         language === 'it' ? 'Cosa abbiamo risolto:' :
                         'What we solved:'}
                      </span>
                    </p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• {language === 'cs' ? 'Kompletní daňová analýza' :
                          language === 'it' ? 'Analisi fiscale completa' :
                          'Complete tax analysis'}</li>
                      <li>• {language === 'cs' ? 'Mezinárodní právní podpora' :
                          language === 'it' ? 'Supporto legale internazionale' :
                          'International legal support'}</li>
                    </ul>
                  </div>
                </div>
                <button className="w-full bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white font-semibold py-2 px-4 rounded-lg text-base transition-all duration-300 hover:scale-105 mt-auto">
                  {language === 'cs' ? 'Zobrazit podobné nemovitosti' :
                   language === 'it' ? 'Vedi proprietà simili' :
                   'See similar properties'}
                </button>
              </div>
            </div>

            {/* Success Story 3 */}
            <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-200 flex flex-col">
              <div className="aspect-video relative overflow-hidden flex-shrink-0">
                <img 
                  src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
                  alt="Ligurian coastal apartment" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-slate-800 text-white text-xs font-semibold px-2 py-1 rounded">SOLD</span>
                    <span className="text-white/90 text-xs">€320,000</span>
                  </div>
                </div>
              </div>
              <div className="p-6 flex flex-col h-full">
                <div className="flex-grow">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">
                    {language === 'cs' ? 'Pobřežní Apartmán v Ligurii' :
                     language === 'it' ? 'Appartamento Costiero Liguria' :
                     'Ligurian Coastal Apartment'}
                  </h3>
                  <p className="text-gray-600 text-base mb-4">
                    {language === 'cs' ? '"Od prvního kontaktu po klíče v ruce za 3 měsíce. Služba správy pronájmů je výjimečná."' :
                     language === 'it' ? '"Dal primo contatto alle chiavi in mano in 3 mesi. Il servizio di gestione degli affitti è eccezionale."' :
                     '"From first contact to keys in hand in 3 months. The rental management service is exceptional."'}
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-xs text-gray-500">
                      <span className="font-semibold">Anna & David</span><br/>
                      {language === 'cs' ? '3 měsíce • Ligurie' :
                       language === 'it' ? '3 mesi • Liguria' :
                       '3 months • Liguria'}
                    </div>
                    <span className="bg-slate-100 text-slate-800 text-xs font-semibold px-2 py-1 rounded-full">
                      {language === 'cs' ? 'Dokončeno' :
                       language === 'it' ? 'Completato' :
                       'Completed'}
                    </span>
                  </div>
                  <div className="mb-4">
                    <p className="text-xs text-gray-600 mb-2">
                      <span className="font-semibold">
                        {language === 'cs' ? 'Co jsme vyřešili:' :
                         language === 'it' ? 'Cosa abbiamo risolto:' :
                         'What we solved:'}
                      </span>
                    </p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• {language === 'cs' ? 'Správa pronájmů' :
                          language === 'it' ? 'Gestione affitti' :
                          'Rental management'}</li>
                      <li>• {language === 'cs' ? 'Turistická povolení' :
                          language === 'it' ? 'Permessi turistici' :
                          'Tourist permits'}</li>
                    </ul>
                  </div>
                </div>
                <button className="w-full bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white font-semibold py-2 px-4 rounded-lg text-base transition-all duration-300 hover:scale-105 mt-auto">
                  {language === 'cs' ? 'Zobrazit podobné nemovitosti' :
                   language === 'it' ? 'Vedi proprietà simili' :
                   'See similar properties'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Weekly Webinar Section */}
      <section className="py-20 bg-[#f7f4ed]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-on-scroll">
            <h2 className="text-4xl font-bold text-gray-900 mb-6 tracking-tight">
              {language === 'cs' ? 'Kupování v Itálii: Proces, Úskalí a Čísla' :
               language === 'it' ? 'Acquistare in Italia: Il Processo, le Insidie e i Numeri' :
               'Buying in Italy: The Process, the Pitfalls, and the Numbers'}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {language === 'cs' ? 'Kupování v Itálii: proces, úskalí a čísla — živě, každý týden.' :
               language === 'it' ? 'Acquistare in Italia: il processo, le insidie e i numeri — dal vivo, ogni settimana.' :
               'Buying in Italy: the process, the pitfalls, and the numbers—live, every week.'}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Next Date + Agenda */}
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-slate-700 to-slate-800 rounded-full mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {language === 'cs' ? 'Příští Webinář' :
                   language === 'it' ? 'Prossimo Webinar' :
                   'Next Webinar'}
                </h3>
                <p className="text-lg text-gray-600 mb-4">
                  {language === 'cs' ? 'Středa 15. ledna 2025' :
                   language === 'it' ? 'Mercoledì 15 Gennaio 2025' :
                   'Wednesday, January 15, 2025'}
                </p>
                <p className="text-lg font-semibold text-slate-700">
                  {language === 'cs' ? '19:00 - 20:30 CET' :
                   language === 'it' ? '19:00 - 20:30 CET' :
                   '7:00 - 8:30 PM CET'}
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  {language === 'cs' ? 'Program' :
                   language === 'it' ? 'Agenda' :
                   'Agenda'}
                </h4>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 bg-slate-800 rounded-full"></div>
                    </div>
                    <p className="text-gray-700">
                      {language === 'cs' ? 'Přehled procesu nákupu' :
                       language === 'it' ? 'Panoramica del processo di acquisto' :
                       'Process overview'}
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 bg-slate-800 rounded-full"></div>
                    </div>
                    <p className="text-gray-700">
                      {language === 'cs' ? 'Daně a poplatky' :
                       language === 'it' ? 'Tasse e commissioni' :
                       'Taxes & fees'}
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 bg-slate-800 rounded-full"></div>
                    </div>
                    <p className="text-gray-700">
                      {language === 'cs' ? 'Běžná úskalí' :
                       language === 'it' ? 'Insidie comuni' :
                       'Common pitfalls'}
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 bg-slate-800 rounded-full"></div>
                    </div>
                    <p className="text-gray-700">
                      {language === 'cs' ? 'Živé Q&A' :
                       language === 'it' ? 'Q&A dal vivo' :
                       'Live Q&A'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-base text-slate-800 font-medium">
                  {language === 'cs' ? 'Zdarma pro členy Premium Clubu. Omezený počet míst.' :
                   language === 'it' ? 'Gratuito per i membri del Premium Club. Posti limitati.' :
                   'Free for Premium Club members. Limited seats.'}
                </p>
              </div>
            </div>

            {/* Right Side - Signup Form */}
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {language === 'cs' ? 'Rezervujte si Místo' :
                   language === 'it' ? 'Riserva il Tuo Posto' :
                   'Reserve Your Seat'}
                </h3>
                <p className="text-gray-600">
                  {language === 'cs' ? 'Nemůžete se zúčastnit? Získejte nahrávku přes Premium Club.' :
                   language === 'it' ? 'Non riesci a partecipare? Ricevi la registrazione tramite Premium Club.' :
                   'Can\'t make it? Get the recording via Premium Club.'}
                </p>
              </div>

              <form className="space-y-6">
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">
                    {language === 'cs' ? 'Celé jméno' :
                     language === 'it' ? 'Nome completo' :
                     'Full Name'}
                  </label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    placeholder={language === 'cs' ? 'Vaše jméno' :
                                 language === 'it' ? 'Il tuo nome' :
                                 'Your name'}
                  />
                </div>

                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">
                    {language === 'cs' ? 'Email' :
                     language === 'it' ? 'Email' :
                     'Email Address'}
                  </label>
                  <input 
                    type="email" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    placeholder={language === 'cs' ? 'vas-email@priklad.cz' :
                                 language === 'it' ? 'la-tua-email@esempio.com' :
                                 'your-email@example.com'}
                  />
                </div>

                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">
                    {language === 'cs' ? 'Zájem o region' :
                     language === 'it' ? 'Regione di interesse' :
                     'Region of Interest'}
                  </label>
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent">
                    <option value="">
                      {language === 'cs' ? 'Vyberte region' :
                       language === 'it' ? 'Seleziona una regione' :
                       'Select a region'}
                    </option>
                    <option value="abruzzo">
                      {language === 'cs' ? 'Abruzzo' :
                       language === 'it' ? 'Abruzzo' :
                       'Abruzzo'}
                    </option>
                    <option value="basilicata">
                      {language === 'cs' ? 'Basilicata' :
                       language === 'it' ? 'Basilicata' :
                       'Basilicata'}
                    </option>
                    <option value="calabria">
                      {language === 'cs' ? 'Kalábrie' :
                       language === 'it' ? 'Calabria' :
                       'Calabria'}
                    </option>
                    <option value="campania">
                      {language === 'cs' ? 'Kampánie' :
                       language === 'it' ? 'Campania' :
                       'Campania'}
                    </option>
                    <option value="emilia-romagna">
                      {language === 'cs' ? 'Emilia-Romagna' :
                       language === 'it' ? 'Emilia-Romagna' :
                       'Emilia-Romagna'}
                    </option>
                    <option value="friuli-venezia-giulia">
                      {language === 'cs' ? 'Friuli-Venezia Giulia' :
                       language === 'it' ? 'Friuli-Venezia Giulia' :
                       'Friuli-Venezia Giulia'}
                    </option>
                    <option value="lazio">
                      {language === 'cs' ? 'Lazio' :
                       language === 'it' ? 'Lazio' :
                       'Lazio'}
                    </option>
                    <option value="liguria">
                      {language === 'cs' ? 'Ligurie' :
                       language === 'it' ? 'Liguria' :
                       'Liguria'}
                    </option>
                    <option value="lombardia">
                      {language === 'cs' ? 'Lombardie' :
                       language === 'it' ? 'Lombardia' :
                       'Lombardy'}
                    </option>
                    <option value="marche">
                      {language === 'cs' ? 'Marche' :
                       language === 'it' ? 'Marche' :
                       'Marche'}
                    </option>
                    <option value="molise">
                      {language === 'cs' ? 'Molise' :
                       language === 'it' ? 'Molise' :
                       'Molise'}
                    </option>
                    <option value="piemonte">
                      {language === 'cs' ? 'Piemont' :
                       language === 'it' ? 'Piemonte' :
                       'Piedmont'}
                    </option>
                    <option value="puglia">
                      {language === 'cs' ? 'Puglie' :
                       language === 'it' ? 'Puglia' :
                       'Puglia'}
                    </option>
                    <option value="sardegna">
                      {language === 'cs' ? 'Sardinie' :
                       language === 'it' ? 'Sardegna' :
                       'Sardinia'}
                    </option>
                    <option value="sicilia">
                      {language === 'cs' ? 'Sicílie' :
                       language === 'it' ? 'Sicilia' :
                       'Sicily'}
                    </option>
                    <option value="toscana">
                      {language === 'cs' ? 'Toskánsko' :
                       language === 'it' ? 'Toscana' :
                       'Tuscany'}
                    </option>
                    <option value="trentino-alto-adige">
                      {language === 'cs' ? 'Trentino-Alto Adige' :
                       language === 'it' ? 'Trentino-Alto Adige' :
                       'Trentino-Alto Adige'}
                    </option>
                    <option value="umbria">
                      {language === 'cs' ? 'Umbrie' :
                       language === 'it' ? 'Umbria' :
                       'Umbria'}
                    </option>
                    <option value="valle-daosta">
                      {language === 'cs' ? 'Valle d\'Aosta' :
                       language === 'it' ? 'Valle d\'Aosta' :
                       'Valle d\'Aosta'}
                    </option>
                    <option value="veneto">
                      {language === 'cs' ? 'Benátsko' :
                       language === 'it' ? 'Veneto' :
                       'Veneto'}
                    </option>
                  </select>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white font-semibold py-4 px-6 rounded-lg text-lg transition-all duration-300 hover:scale-105 shadow-lg"
                >
                  {language === 'cs' ? 'Rezervovat Místo' :
                   language === 'it' ? 'Riserva il Posto' :
                   'Reserve a Seat'}
                </button>

                <p className="text-xs text-gray-500 text-center">
                  {language === 'cs' ? 'Registrací souhlasíte s přijímáním e-mailových aktualizací.' :
                   language === 'it' ? 'Iscrivendoti, accetti di ricevere aggiornamenti via email.' :
                   'By signing up, you agree to receive email updates.'}
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

        {/* FAQ Section */}
        <section className="py-20 bg-gradient-to-br from-[#f7f4ed] via-amber-50/20 to-orange-50/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-on-scroll">
            <h2 className="text-4xl font-bold text-gray-900 mb-6 tracking-tight">
              {language === 'cs' ? 'Často Kladené Otázky' :
               language === 'it' ? 'Domande Frequenti' :
               'Frequently Asked Questions'}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {language === 'cs' ? 'Odpovědi, které potřebujete před rozhodnutím.' :
               language === 'it' ? 'Le risposte di cui hai bisogno prima di decidere.' :
               'The answers you need before you decide.'}
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-4">
            {[
              {
                question: {
                  cs: 'Jaké daně a poplatky mohu očekávat při koupi v Itálii?',
                  en: 'What taxes and fees should I expect when buying in Italy?',
                  it: 'Quali tasse e commissioni devo aspettarmi quando acquisto in Italia?'
                },
                answer: {
                  cs: 'Daně zahrnují registrační daň (2-9% v závislosti na kategorii), DPH (4-10% pro novostavby), notářské poplatky (1-2%), právní poplatky (1-2%) a katastrální poplatky. Celkem se může pohybovat od 10% do 15% z kupní ceny.',
                  en: 'Taxes include registration tax (2-9% depending on category), VAT (4-10% for new builds), notary fees (1-2%), legal fees (1-2%), and cadastral fees. Total can range from 10% to 15% of the purchase price.',
                  it: 'Le tasse includono l\'imposta di registro (2-9% a seconda della categoria), l\'IVA (4-10% per nuove costruzioni), le spese notarili (1-2%), le spese legali (1-2%) e le spese catastali. Il totale può variare dal 10% al 15% del prezzo di acquisto.'
                }
              },
              {
                question: {
                  cs: 'Mohou cizinci kupovat nemovitosti v Itálii?',
                  en: 'Can foreigners buy property in Italy?',
                  it: 'Gli stranieri possono acquistare proprietà in Italia?'
                },
                answer: {
                  cs: 'Ano, cizinci mohou kupovat nemovitosti v Itálii bez omezení. Budete potřebovat Codice Fiscale (daňové identifikační číslo) a italský bankovní účet. Občané mimo EU mohou potřebovat dodatečnou dokumentaci.',
                  en: 'Yes, foreigners can buy property in Italy without restrictions. You\'ll need a Codice Fiscale (tax ID number) and an Italian bank account. Non-EU citizens may need additional documentation.',
                  it: 'Sì, gli stranieri possono acquistare proprietà in Italia senza restrizioni. Avrai bisogno di un Codice Fiscale (numero di identificazione fiscale) e di un conto bancario italiano. I cittadini non UE potrebbero aver bisogno di documentazione aggiuntiva.'
                }
              },
              {
                question: {
                  cs: 'Potřebuji Codice Fiscale?',
                  en: 'Do I need a Codice Fiscale?',
                  it: 'Ho bisogno di un Codice Fiscale?'
                },
                answer: {
                  cs: 'Ano, Codice Fiscale je povinné pro jakoukoliv transakci s nemovitostmi v Itálii. Je zdarma a lze jej získat na kterémkoliv italském konzulátu nebo místním daňovém úřadě v Itálii. Můžeme vám pomoci s procesem.',
                  en: 'Yes, a Codice Fiscale is mandatory for any property transaction in Italy. It\'s free and can be obtained from any Italian consulate or local tax office in Italy. We can help you with the process.',
                  it: 'Sì, un Codice Fiscale è obbligatorio per qualsiasi transazione immobiliare in Italia. È gratuito e può essere ottenuto presso qualsiasi consolato italiano o ufficio delle entrate locale in Italia. Possiamo aiutarti nel processo.'
                }
              },
              {
                question: {
                  cs: 'Jak dlouho trvá proces od nabídky po klíče?',
                  en: 'How long does the process take from offer to keys?',
                  it: 'Quanto tempo ci vuole dall\'offerta alle chiavi?'
                },
                answer: {
                  cs: 'Typicky 3-6 měsíců. Po přijetí nabídky podepíšete předběžnou smlouvu (compromesso), poté finální kupní smlouvu (rogito) u notáře. Načasování závisí na právních kontrolách, hypotékách a dostupnosti stran.',
                  en: 'Typically 3-6 months. After accepted offer, you sign the preliminary contract (compromesso), then the final deed (rogito) with a notary. Timing depends on legal checks, mortgages, and party availability.',
                  it: 'Tipicamente 3-6 mesi. Dopo l\'offerta accettata, firmi il contratto preliminare (compromesso), poi il rogito finale (atto di compravendita) davanti al notaio. I tempi dipendono dai controlli legali, dai mutui e dalla disponibilità delle parti.'
                }
              },
              {
                question: {
                  cs: 'Možnosti hypotéky pro nerezidenty?',
                  en: 'Mortgage options for non-residents?',
                  it: 'Opzioni di mutuo per non residenti?'
                },
                answer: {
                  cs: 'Italské banky poskytují hypotéky nerezidentům, typicky až 50-60% hodnoty nemovitosti. Budete potřebovat doklad o příjmech, bankovní výpisy a dobrý kreditní skóre. Úrokové sazby jsou konkurenceschopné pro občany EU.',
                  en: 'Italian banks offer mortgages to non-residents, typically up to 50-60% of property value. You\'ll need proof of income, bank statements, and good credit score. Interest rates are competitive for EU citizens.',
                  it: 'Le banche italiane offrono mutui ai non residenti, tipicamente fino al 50-60% del valore della proprietà. Avrai bisogno di prova di reddito, estratti conto bancari e un buon punteggio di credito. I tassi di interesse sono competitivi per i cittadini UE.'
                }
              },
              {
                question: {
                  cs: 'Rozdíl mezi předběžnou smlouvou a rogito?',
                  en: 'Difference between preliminary contract and rogito?',
                  it: 'Differenza tra contratto preliminare e rogito?'
                },
                answer: {
                  cs: 'Předběžná smlouva (compromesso) je počáteční dohoda s zálohou (10-20%). Rogito je finální kupní smlouva u notáře, kde dochází k převodu vlastnictví a zaplatíte zbytek. Obě jsou právně závazné.',
                  en: 'The preliminary contract (compromesso) is the initial agreement with a deposit (10-20%). The rogito is the final deed of sale with a notary where ownership transfers and you pay the balance. Both are legally binding.',
                  it: 'Il contratto preliminare (compromesso) è l\'accordo iniziale con un deposito (10-20%). Il rogito è l\'atto di vendita finale davanti al notaio dove avviene il trasferimento di proprietà e paghi il saldo. Entrambi sono legalmente vincolanti.'
                }
              },
              {
                question: {
                  cs: 'Průběžné náklady (IMU, TARI, poplatky za bytové družstvo)?',
                  en: 'Ongoing costs (IMU, TARI, condo fees)?',
                  it: 'Costi correnti (IMU, TARI, spese condominiali)?'
                },
                answer: {
                  cs: 'Roční náklady zahrnují: IMU (obecní daň z nemovitosti, 0,4-1,06% katastrální hodnoty), TARI (daň z odpadu, €200-600/rok), poplatky za bytové družstvo (pokud se vztahují, €50-200/měsíc), energie a pojištění. Počítejte s 1-2% hodnoty nemovitosti ročně.',
                  en: 'Annual costs include: IMU (municipal property tax, 0.4-1.06% of cadastral value), TARI (waste tax, €200-600/year), condo fees (if applicable, €50-200/month), utilities, and insurance. Budget 1-2% of property value per year.',
                  it: 'I costi annuali includono: IMU (imposta municipale, 0,4-1,06% del valore catastale), TARI (tassa rifiuti, €200-600/anno), spese condominiali (se applicabili, €50-200/mese), utenze e assicurazione. Budget 1-2% del valore della proprietà all\'anno.'
                }
              },
              {
                question: {
                  cs: 'Jak fungují pronájmy a povolení pro krátkodobé pobyty?',
                  en: 'How do rentals and permits work for short-term stays?',
                  it: 'Come funzionano gli affitti e i permessi per soggiorni brevi?'
                },
                answer: {
                  cs: 'Krátkodobé pronájmy vyžadují registraci u místní obce a regionální identifikační kód (CIR/CIN). Musíte platit turistickou daň a dodržovat místní předpisy. Některé oblasti mají omezení. Provádíme vás procesem dodržování předpisů.',
                  en: 'Short-term rentals require registration with local municipality and regional ID code (CIR/CIN). You must pay tourist tax and comply with local regulations. Some areas have restrictions. We guide you through compliance.',
                  it: 'Gli affitti brevi richiedono registrazione con il comune locale e codice identificativo regionale (CIR/CIN). Devi pagare l\'imposta di soggiorno (tassa turistica) e rispettare le normative locali. Alcune zone hanno restrizioni. Ti guidiamo attraverso la conformità.'
                }
              },
              {
                question: {
                  cs: 'Potřebuji právníka nebo notáře—jaký je rozdíl?',
                  en: 'Do I need a lawyer or notary—what\'s the difference?',
                  it: 'Ho bisogno di un avvocato o notaio—qual è la differenza?'
                },
                answer: {
                  cs: 'Notář je povinný (jmenován prodávajícím nebo kupujícím) a řídí právní převod. Právník je volitelný, ale doporučuje se pro prověrky due diligence, přezkoumání smluv a ochranu vašich zájmů. Vždy doporučujeme oba.',
                  en: 'A notary is mandatory (appointed by seller or buyer) and handles the legal transfer. A lawyer is optional but recommended for due diligence checks, contract review, and protecting your interests. We always recommend both.',
                  it: 'Il notaio è obbligatorio (nominato dal venditore o acquirente) e gestisce il trasferimento legale. Un avvocato è facoltativo ma consigliato per i controlli di due diligence, la revisione dei contratti e la tutela dei tuoi interessi. Noi raccomandiamo sempre entrambi.'
                }
              },
              {
                question: {
                  cs: 'Můžete pomoci s rekonstrukcemi a povoleními?',
                  en: 'Can you help with renovations and permits?',
                  it: 'Potete aiutarmi con ristrutturazioni e permessi?'
                },
                answer: {
                  cs: 'Ano, spolupracujeme s důvěryhodnými místními architekty a dodavateli. Pomáháme vám získat potřebná povolení (CILA, SCIA, stavební povolení), řídit nabídky a dohlížet na práce. Rekonstrukce se mohou kvalifikovat pro daňové pobídky až do 110% (Superbonus).',
                  en: 'Yes, we work with trusted local architects and contractors. We help you obtain necessary permits (CILA, SCIA, building permit), manage quotes, and oversee work. Renovations may qualify for tax incentives up to 110% (Superbonus).',
                  it: 'Sì, lavoriamo con architetti e appaltatori locali fidati. Ti aiutiamo a ottenere i permessi necessari (CILA, SCIA, permesso di costruire), gestire preventivi e supervisionare i lavori. Le ristrutturazioni possono qualificarsi per incentivi fiscali fino al 110% (Superbonus).'
                }
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white rounded-xl border border-gray-200 shadow-md overflow-hidden hover:shadow-lg hover:border-blue-200/50 transition-all duration-300 group">
                <button 
                  onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                  className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/30 transition-all duration-300 group-hover:border-blue-200/30"
                >
                  <span className="text-lg font-semibold text-gray-900">
                    {faq.question[language] || faq.question.en}
                  </span>
                  <svg 
                    className={`w-6 h-6 text-blue-600 flex-shrink-0 ml-4 transition-all duration-300 ${openFaqIndex === index ? 'rotate-180 text-blue-800' : 'group-hover:text-blue-700'}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openFaqIndex === index && (
                  <div className="px-8 py-6 bg-gradient-to-r from-blue-50/30 to-indigo-50/20 border-t border-blue-200/30">
                    <p className="text-gray-700 leading-relaxed">
                      {faq.answer[language] || faq.answer.en}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* CTA at end */}
          <div className="text-center mt-16">
            <p className="text-xl text-gray-700 mb-6">
              {language === 'cs' ? 'Máte ještě otázku?' :
               language === 'it' ? 'Hai ancora una domanda?' :
               'Still have a question?'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white hover:bg-gray-100 text-slate-700 font-semibold py-4 px-8 rounded-lg text-lg transition-all duration-300 hover:scale-105 shadow-lg">
                {language === 'cs' ? 'Připojte se k Webináři' :
                 language === 'it' ? 'Partecipa al Webinar' :
                 'Join the Webinar'}
              </button>
              <button className="text-white font-semibold py-4 px-8 rounded-lg text-lg transition-all duration-300 hover:scale-105 shadow-lg" style={{ background: 'linear-gradient(to right, rgba(199, 137, 91), rgb(153, 105, 69))' }}>
                {language === 'cs' ? 'Rezervovat Hovor' :
                 language === 'it' ? 'Prenota una Chiamata' :
                 'Book a Call'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Contact / Book a Call Section */}
      <section className="py-20 bg-[#f7f4ed]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-on-scroll">
            <h2 className="text-4xl font-bold text-gray-900 mb-6 tracking-tight">
              {language === 'cs' ? 'Začněte Svou Cestu' :
               language === 'it' ? 'Inizia il Tuo Viaggio' :
               'Start Your Journey'}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {language === 'cs' ? 'Vyberte si, jak chcete pokračovat. Jsme tu, abychom vás provedli každým krokem procesu.' :
               language === 'it' ? 'Scegli come vuoi procedere. Siamo qui per guidarti in ogni fase del processo.' :
               'Choose how you want to proceed. We\'re here to guide you through every step of the process.'}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto mb-16">
            {/* Book a Free Consultation */}
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-slate-700 to-slate-800 rounded-full mb-6">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {language === 'cs' ? 'Rezervujte si Bezplatnou Konzultaci' :
                   language === 'it' ? 'Prenota una Consulenza Gratuita' :
                   'Book a Free Consultation'}
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {language === 'cs' 
                    ? 'Promluvte si s jedním z našich expertů na 15-20 minut. Prodiskutujte své potřeby, rozpočet a získejte osobní rady ohledně regionů a typů nemovitostí.'
                    : language === 'it' 
                    ? 'Parla con uno dei nostri esperti per 15-20 minuti. Discuti le tue esigenze, il budget e ottieni consigli personalizzati su regioni e tipi di proprietà.'
                    : 'Speak with one of our experts for 15-20 minutes. Discuss your needs, budget, and get personalized advice on regions and property types.'}
                </p>
                <ul className="text-left space-y-3 mb-8">
                  <li className="flex items-start">
                    <svg className="w-6 h-6 text-slate-800 flex-shrink-0 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">
                      {language === 'cs' ? 'Žádné náklady, žádný závazek' :
                       language === 'it' ? 'Nessun costo, nessun impegno' :
                       'No cost, no commitment'}
                    </span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-6 h-6 text-slate-800 flex-shrink-0 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">
                      {language === 'cs' ? 'Expertí, kteří mluví česky, anglicky a italsky' :
                       language === 'it' ? 'Esperti che parlano ceco, inglese e italiano' :
                       'Experts who speak Czech, English, and Italian'}
                    </span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-6 h-6 text-slate-800 flex-shrink-0 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">
                      {language === 'cs' ? 'Osobní rady na základě vašeho profilu' :
                       language === 'it' ? 'Consigli personalizzati in base al tuo profilo' :
                       'Personalized advice based on your profile'}
                    </span>
                  </li>
                </ul>
                <button className="w-full text-white font-semibold py-4 px-8 rounded-lg text-lg transition-all duration-300 hover:scale-105 shadow-lg" style={{ background: 'linear-gradient(to right, rgba(199, 137, 91), rgb(153, 105, 69))' }}>
                  {language === 'cs' ? 'Rezervovat Hovor' :
                   language === 'it' ? 'Prenota una Chiamata' :
                   'Book a Call'}
                </button>
                <p className="text-xs text-gray-500 mt-4">
                  {language === 'cs' ? 'Dostupné pondělí-pátek, 9:00-18:00 CET' :
                   language === 'it' ? 'Disponibile dal lunedì al venerdì, 9:00-18:00 CET' :
                   'Available Monday-Friday, 9:00-18:00 CET'}
                </p>
              </div>
            </div>

            {/* Start the Personal Property Finder */}
            <div className="bg-gradient-to-br from-slate-700 via-slate-800 to-slate-600 rounded-2xl p-8 shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-md rounded-full mb-6 border border-white/20">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  {language === 'cs' ? 'Spustit Osobní Vyhledávač Nemovitostí' :
                   language === 'it' ? 'Avvia il Personal Property Finder' :
                   'Start the Personal Property Finder'}
                </h3>
                <p className="text-gray-300 mb-6 leading-relaxed">
                  {language === 'cs' 
                    ? 'Vyplňte náš 60sekundový formulář a získejte kurátorované nabídky nemovitostí přímo do vaší schránky, přizpůsobené vašemu rozpočtu, regionu a účelu.'
                    : language === 'it' 
                    ? 'Completa il nostro modulo di 60 secondi e ricevi annunci immobiliari curati direttamente nella tua casella di posta, adattati al tuo budget, regione e scopo.'
                    : 'Complete our 60-second form and get curated property listings delivered straight to your inbox, tailored to your budget, region, and purpose.'}
                </p>
                <ul className="text-left space-y-3 mb-8">
                  <li className="flex items-start">
                    <svg className="w-6 h-6 text-slate-600 flex-shrink-0 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-200">
                      {language === 'cs' ? 'Ručně vybrané nabídky jen pro vás' :
                       language === 'it' ? 'Annunci selezionati manualmente per te' :
                       'Hand-picked listings just for you'}
                    </span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-6 h-6 text-slate-600 flex-shrink-0 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-200">
                      {language === 'cs' ? 'Vyberte si frekvenci doručování' :
                       language === 'it' ? 'Scegli la tua frequenza di invio' :
                       'Choose your delivery frequency'}
                    </span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-6 h-6 text-slate-600 flex-shrink-0 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-200">
                      {language === 'cs' ? 'Bezplatný přístup k Premium Clubu' :
                       language === 'it' ? 'Accesso gratuito al Premium Club' :
                       'Free Premium Club access included'}
                    </span>
                  </li>
                </ul>
                <button className="w-full bg-white hover:bg-gray-100 text-slate-700 font-semibold py-4 px-8 rounded-lg text-lg transition-all duration-300 hover:scale-105 shadow-lg">
                  {language === 'cs' ? 'Spustit Vyhledávač' :
                   language === 'it' ? 'Avvia il Finder' :
                   'Start the Finder'}
                </button>
                <p className="text-xs text-gray-300 mt-4">
                  {language === 'cs' ? 'Není vyžadována kreditní karta' :
                   language === 'it' ? 'Nessuna carta di credito richiesta' :
                   'No credit card required'}
                </p>
              </div>
            </div>
          </div>

          {/* Trust Row */}
          <div className="border-t border-gray-300 pt-12">
            <div className="text-center mb-8">
              <p className="text-gray-600 text-base font-medium mb-6">
                {language === 'cs' ? 'Důvěryhodní Partneři' :
                 language === 'it' ? 'Partner di Fiducia' :
                 'Trusted Partners'}
              </p>
            </div>
            <div className="flex flex-wrap justify-center items-center gap-8">
              <div className="flex items-center space-x-3 bg-white rounded-lg px-6 py-3 shadow-md border border-gray-200">
                <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
                <div className="text-left">
                  <p className="text-base font-semibold text-gray-900">
                    {language === 'cs' ? 'Právní Partner' :
                     language === 'it' ? 'Partner Legale' :
                     'Legal Partner'}
                  </p>
                  <p className="text-xs text-gray-600">
                    {language === 'cs' ? 'Certifikovaní Právníci' :
                     language === 'it' ? 'Avvocati Certificati' :
                     'Certified Lawyers'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 bg-white rounded-lg px-6 py-3 shadow-md border border-gray-200">
                <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-left">
                  <p className="text-base font-semibold text-gray-900">
                    {language === 'cs' ? 'Turistický Partner' :
                     language === 'it' ? 'Partner Turistico' :
                     'Tour Partner'}
                  </p>
                  <p className="text-xs text-gray-600">
                    {language === 'cs' ? 'Místní Zkušenosti' :
                     language === 'it' ? 'Esperienza Locale' :
                     'Local Experience'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 bg-white rounded-lg px-6 py-3 shadow-md border border-gray-200">
                <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <div className="text-left">
                  <p className="text-base font-semibold text-gray-900">
                    {language === 'cs' ? 'Ochrana dat' :
                     language === 'it' ? 'Privacy dei Dati' :
                     'Data Privacy'}
                  </p>
                  <p className="text-xs text-gray-600">
                    {language === 'cs' ? 'Soulad s GDPR' :
                     language === 'it' ? 'Conforme al GDPR' :
                     'GDPR Compliant'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer language={language} />
      
      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  )
}




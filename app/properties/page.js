'use client';

import React, { useState, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { 
  Search, 
  Home, 
  Building, 
  Castle, 
  Building2,
  X,
  Eye,
  Bed,
  Bath,
  Square,
  Mountain,
  Waves,
  Car,
  Thermometer,
  MapPin,
  Trees,
  Flame,
  Wind,
  Menu,
  User,
  Map as MapIcon,
  Grid3x3,
  List,
  SlidersHorizontal,
  Heart,
  ChevronRight,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '../../lib/supabase';
import AuthModal from '../../components/AuthModal';
import RegionBanner from '../../components/RegionBanner';
import { t } from '../../lib/translations';
import { CURRENCY_RATES, CURRENCY_SYMBOLS, formatPriceCompact } from '../../lib/currency';

// Format price with compact symbols (k, M) using shared currency utility
const formatPrice = (price, currency = 'EUR') => {
  return formatPriceCompact(price, currency)
}

// PropertyCard component matching homepage design
function PropertyCard({ property, onFavorite, isFavorited, language, currency, onClick }) {
  const handleFavoriteClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    onFavorite(property.id)
  }

  // Construct the href with slug safeguard
  const propertyHref = property.slug?.current 
    ? `/properties/${property.slug.current}` 
    : property.slug 
    ? `/properties/${property.slug}` 
    : property.sanityId 
    ? `/properties/${property.sanityId}`
    : '#'

  return (
    <Card 
      className="group relative cursor-pointer hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden border border-gray-100 shadow-lg bg-white rounded-2xl flex flex-col h-full hover:border-slate-200/50"
      data-testid="property-card"
      data-property-id={property.id}
      data-property-type={property.type}
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
          src={property.image} 
          alt={property.title}
          className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          data-testid="property-image"
        />
        
        {/* Gradient overlay for better contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-800/30 via-transparent to-transparent group-hover:from-slate-800/40 transition-all duration-300" />
        
        {/* Top badges and favorite button */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-20">
          <Badge 
            className="bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white hover:scale-105 transition-all duration-300 px-3 py-1.5 text-xs font-medium shadow-lg rounded-lg capitalize backdrop-blur-sm border border-white/20 group-hover:shadow-xl pointer-events-none"
            data-testid="property-type-badge"
          >
            {property.type}
          </Badge>
          
          <Button
            variant="ghost"
            size="icon"
            className={`p-2.5 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 shadow-lg backdrop-blur-sm border border-white/20 ${
              isFavorited 
                ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white hover:shadow-red-500/25' 
                : 'bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white hover:shadow-slate-500/25'
            }`}
            onClick={handleFavoriteClick}
            data-testid="favorite-button"
            data-property-id={property.id}
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
              data-price={property.price}
            >
              {formatPrice(property.price, currency)}
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
              {property.title}
            </h3>
            
            <div className="flex items-center text-gray-500 text-sm group-hover:text-gray-600 transition-colors duration-300" data-testid="property-location">
              <div className="p-1 bg-slate-100 rounded-lg mr-2 group-hover:bg-slate-200 transition-colors duration-300">
                <MapPin className="h-4 w-4 text-slate-600 group-hover:text-slate-700 transition-colors duration-300" />
              </div>
              <span className="font-medium" data-testid="property-region">{property.region}</span>
            </div>
          </div>
          
          {/* Specifications */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-300" data-testid="property-specifications">
            <span className="font-semibold" data-testid="bedrooms-count">{property.rooms} pokoje</span>
            <span className="font-semibold" data-testid="bathrooms-count">{property.bathrooms} koup.</span>
            <span className="font-semibold" data-testid="square-footage-count">{property.area} m²</span>
          </div>
        </div>
        
        {/* Enhanced CTA button - always at bottom */}
        <div className="pt-4 mt-auto" data-testid="property-footer">
          <div 
            className="w-full bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white font-semibold py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 group border-0 text-sm flex items-center justify-center cursor-pointer"
          >
            <span data-testid="view-details-text">Zobrazit detail</span>
            <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Dynamically import map components to avoid SSR issues
const MapComponent = dynamic(() => import('../../components/PropertyMap'), {
  loading: () => (
    <div className="h-full bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <MapPin className="h-12 w-12 text-slate-800 mx-auto mb-2 animate-pulse" />
        <p className="text-slate-800">Načítám mapu...</p>
      </div>
    </div>
  ),
  ssr: false
});

// Italian regions data
const italianRegions = {
  "Tuscany": { temp: "23°C", price: 4, distance: "1,250 km" },
  "Lombardy": { temp: "20°C", price: 4, distance: "950 km" },
  "Veneto": { temp: "22°C", price: 3, distance: "890 km" },
  "Emilia-Romagna": { temp: "24°C", price: 3, distance: "1,100 km" },
  "Liguria": { temp: "25°C", price: 4, distance: "1,200 km" },
  "Piedmont": { temp: "19°C", price: 3, distance: "1,050 km" },
  "Campania": { temp: "26°C", price: 2, distance: "1,450 km" },
  "Sicily": { temp: "27°C", price: 2, distance: "1,750 km" }
};

const propertyTypes = [
  { id: 'apartment', name: 'Byt', icon: Building },
  { id: 'house', name: 'Dům', icon: Home },
  { id: 'villa', name: 'Vila', icon: Castle },
  { id: 'commercial', name: 'Komerční', icon: Building2 }
];

const amenities = [
  { id: 'pool', name: 'Bazén' },
  { id: 'garden', name: 'Zahrada' },
  { id: 'parking', name: 'Parkování' },
  { id: 'sea_view', name: 'Výhled na moře' },
  { id: 'balcony', name: 'Balkon' },
  { id: 'terrace', name: 'Terasa' },
  { id: 'fireplace', name: 'Krb' },
  { id: 'aircon', name: 'Klimatizace' }
];

// Map placeholder component
function MapPlaceholder({ properties, selectedProperty }) {
  return (
    <div className="h-full bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <MapPin className="h-16 w-16 text-slate-800 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-800 mb-2">Interaktivní mapa</h3>
        <p className="text-sm text-slate-800 mb-2">
          {properties?.length || 0} nemovitostí na mapě
        </p>
        {selectedProperty && (
          <div className="bg-white p-3 rounded-lg shadow-sm border max-w-sm mx-auto">
            <h4 className="font-semibold text-sm text-gray-900">{selectedProperty.title}</h4>
            <p className="text-xs text-gray-600 mt-1">{selectedProperty.description}</p>
            <div className="flex justify-between mt-2 text-xs">
              <span className="text-slate-800 font-bold">{formatPrice(selectedProperty.price)}</span>
              <span className="text-gray-500">{selectedProperty.area}m²</span>
            </div>
          </div>
        )}
        <p className="text-xs text-gray-500 mt-4">Leaflet mapa bude připojena</p>
      </div>
    </div>
  );
}

export default function PropertiesPage() {
  const [filters, setFilters] = useState({
    search: '',
    propertyType: '',
    region: '',
    rooms: '',
    priceFrom: '',
    priceTo: '',
    amenities: []
  });
  
  const [selectedRegion, setSelectedRegion] = useState('Tuscany');
  const [showRegionBanner, setShowRegionBanner] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [mapCenter, setMapCenter] = useState([42.8333, 12.8333]);
  const [showMap, setShowMap] = useState(false);
  
  // Navigation state
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [language, setLanguage] = useState('cs');
  const [currency, setCurrency] = useState('EUR');

  // Properties state
  const [properties, setProperties] = useState([]);
  const [loadingProperties, setLoadingProperties] = useState(true);
  const [useSanity, setUseSanity] = useState(false);
  
  // Pagination state
  const [displayedCount, setDisplayedCount] = useState(12); // Show 12 properties initially
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const ITEMS_PER_PAGE = 9; // Load 9 more each time

  // Authentication effects
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Language effect
  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferred-language');
    if (savedLanguage) {
      setLanguage(savedLanguage);
      document.documentElement.lang = savedLanguage;
    }
    
    const savedCurrency = localStorage.getItem('preferred-currency');
    if (savedCurrency) {
      setCurrency(savedCurrency);
    }
  }, []);

  // Scroll detection for "Back to Top" button
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 800);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Reset displayed count when filters change
  useEffect(() => {
    setDisplayedCount(12);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [filters, sortBy]);

  // Load properties from Sanity API
  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      setLoadingProperties(true);
      // Try to fetch from Sanity API
      const response = await fetch('/api/properties');
      
      if (response.ok) {
        const sanityProperties = await response.json();
        
        if (sanityProperties && Array.isArray(sanityProperties) && sanityProperties.length > 0) {
          // Transform Sanity data to match our property card format
          const transformedProperties = sanityProperties.map((prop, index) => ({
            id: prop._id || `sanity-${index}`,
            title: prop.title?.en || prop.title?.it || prop.title || 'Untitled Property',
            type: prop.propertyType ? prop.propertyType.charAt(0).toUpperCase() + prop.propertyType.slice(1) : 'Property',
            region: prop.location?.city?.region?.name?.en || prop.location?.city?.name?.it || prop.location?.city?.name || 'Italy',
            price: prop.price?.amount || 0,
            rooms: prop.specifications?.bedrooms || 0,
            bathrooms: prop.specifications?.bathrooms || 0,
            area: prop.specifications?.squareFootage || 0,
            image: prop.images?.[0]?.asset?.url || prop.images?.[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop',
            location: prop.location?.coordinates 
              ? [prop.location.coordinates.lat || prop.location.coordinates[1], prop.location.coordinates.lng || prop.location.coordinates[0]]
              : [42.8333, 12.8333],
            views: 0,
            terrain: 'mountains',
            amenities: prop.amenities?.map(a => a.name?.en?.toLowerCase().replace(/\s+/g, '_')) || [],
            description: prop.description?.en || prop.description?.it || prop.description || '',
            slug: prop.slug?.current || prop.slug || '',
            sanityId: prop._id
          }));

          setProperties(transformedProperties);
          setUseSanity(true);
          setLoadingProperties(false);
          return;
        }
      }
      
      // If Sanity fails or returns no properties, leave empty
      setProperties([]);
      setUseSanity(false);
    } catch (error) {
      console.log('Sanity API not available or not configured:', error);
      // Properties will remain empty if fetch fails
      setProperties([]);
      setUseSanity(false);
    } finally {
      setLoadingProperties(false);
    }
  };

  // Check for region parameter in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const regionParam = urlParams.get('region');
    
    if (regionParam) {
      setFilters(prev => ({ ...prev, region: regionParam }));
      setShowRegionBanner(true);
    }
  }, []);

  // Scroll to top when region banner appears
  useEffect(() => {
    if (showRegionBanner) {
      // Multiple attempts to ensure scroll works
      const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      };
      
      // Immediate scroll
      scrollToTop();
      
      // Delayed scroll to ensure it works
      setTimeout(scrollToTop, 50);
      setTimeout(scrollToTop, 200);
    }
  }, [showRegionBanner]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setUser(null);
    }
  };

  const handleAuthSuccess = (user) => {
    setUser(user);
    setIsAuthModalOpen(false);
  };

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    document.documentElement.lang = newLanguage;
    localStorage.setItem('preferred-language', newLanguage);
  };

  const handleCurrencyChange = (newCurrency) => {
    setCurrency(newCurrency);
    localStorage.setItem('preferred-currency', newCurrency);
  };

  // Load more properties
  const handleLoadMore = () => {
    setIsLoadingMore(true);
    
    // Simulate loading delay for smooth UX
    setTimeout(() => {
      setDisplayedCount(prev => prev + ITEMS_PER_PAGE);
      setIsLoadingMore(false);
    }, 600);
  };

  // Scroll to top smoothly
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Update map center when selected property changes
  useEffect(() => {
    if (selectedProperty) {
      setMapCenter(selectedProperty.location);
    }
  }, [selectedProperty]);

  // Filter properties
  const filteredProperties = useMemo(() => {
    return properties.filter(property => {
      if (filters.search && !property.title.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      if (filters.propertyType && property.type.toLowerCase() !== filters.propertyType) {
        return false;
      }
      if (filters.region && property.region !== filters.region) {
        return false;
      }
      if (filters.rooms && property.rooms < parseInt(filters.rooms)) {
        return false;
      }
      if (filters.priceFrom && property.price < parseInt(filters.priceFrom)) {
        return false;
      }
      if (filters.priceTo && property.price > parseInt(filters.priceTo)) {
        return false;
      }
      if (filters.amenities.length > 0) {
        const hasAllAmenities = filters.amenities.every(amenity => 
          property.amenities.includes(amenity)
        );
        if (!hasAllAmenities) return false;
      }
      return true;
    });
  }, [filters]);

  // Sort properties
  const sortedProperties = useMemo(() => {
    const sorted = [...filteredProperties];
    switch (sortBy) {
      case 'cheapest':
        return sorted.sort((a, b) => a.price - b.price);
      case 'expensive':
        return sorted.sort((a, b) => b.price - a.price);
      case 'newest':
      default:
        return sorted.sort((a, b) => b.id - a.id);
    }
  }, [filteredProperties, sortBy]);

  // Get displayed properties (for pagination)
  const displayedProperties = useMemo(() => {
    return sortedProperties.slice(0, displayedCount);
  }, [sortedProperties, displayedCount]);

  // Check if there are more properties to load
  const hasMoreProperties = sortedProperties.length > displayedCount;

  const clearFilters = () => {
    setFilters({
      search: '',
      propertyType: '',
      region: '',
      rooms: '',
      priceFrom: '',
      priceTo: '',
      amenities: []
    });
  };

  const toggleAmenity = (amenityId) => {
    setFilters(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenityId)
        ? prev.amenities.filter(id => id !== amenityId)
        : [...prev.amenities, amenityId]
    }));
  };

  const handleCardClick = (property) => {
    setSelectedProperty(property);
    // Navigate to property detail page if slug is available
    if (property.slug) {
      window.location.href = `/properties/${property.slug}`;
    } else if (property.sanityId) {
      // For Sanity properties, try to use slug or _id
      window.location.href = `/properties/${property.slug || property.sanityId}`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f7f4ed] via-amber-50/20 to-slate-50 home-page-custom-border">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md shadow-lg overflow-visible border-b border-white/20" style={{ backgroundColor: 'rgba(14, 21, 46, 0.9)' }} data-testid="main-navigation">
        <div className="container mx-auto px-4 pt-4 pb-3 overflow-visible" data-testid="nav-container">
          <div className="flex items-center justify-between" data-testid="nav-content">
            <div className="flex items-center space-x-8" data-testid="nav-brand-links">
              <Link href="/" data-testid="nav-brand-link" className="relative overflow-visible">
                <img 
                  src="/logo domy.svg" 
                  alt="Domy v Itálii"
                  className="h-12 w-auto cursor-pointer" 
                  style={{ filter: 'drop-shadow(0 2px 6px rgba(0, 0, 0, 0.4))' }}
                  data-testid="nav-brand-logo"
                />
              </Link>
              <div className="hidden md:flex space-x-6" data-testid="nav-desktop-links">
                <Link href="/" className="text-gray-200 hover:text-copper-400 transition-colors" data-testid="nav-home-link">Domů</Link>
                <Link href="/properties" className="text-gray-200 hover:text-copper-400 transition-colors border-b-2 border-white pb-1" data-testid="nav-properties-link">Nemovitosti</Link>
                <Link href="/regions" className="text-gray-200 hover:text-copper-400 transition-colors" data-testid="nav-regions-link">Regiony</Link>
                <Link href="/about" className="text-gray-200 hover:text-copper-400 transition-colors" data-testid="nav-about-link">O nás</Link>
                <Link href="/process" className="text-gray-200 hover:text-copper-400 transition-colors" data-testid="nav-process-link">Proces</Link>
                <Link href="/contact" className="text-gray-200 hover:text-copper-400 transition-colors" data-testid="nav-contact-link">Kontakt</Link>
              </div>
            </div>
            <div className="flex items-center space-x-4" data-testid="nav-user-controls">
              {/* Language & Currency Selector */}
              <div className="group flex items-center bg-white/10 backdrop-blur-md rounded-full px-3 py-2 shadow-lg border border-white/20 transition-all duration-300 hover:shadow-xl hover:bg-white/20 hover:px-6 w-auto gap-2">
                {/* Language Buttons */}
                <div className="flex items-center">
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
                
                {/* Divider */}
                <div className="w-0 group-hover:w-px h-6 bg-gray-300 group-hover:mx-2 opacity-0 group-hover:opacity-100 transition-all duration-200 overflow-hidden"></div>
                
                {/* Currency Buttons */}
                <div className="flex items-center">
                  <button
                    onClick={() => handleCurrencyChange('EUR')}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ease-in-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-400 ${
                      currency === 'EUR' 
                        ? 'bg-white/20 text-white shadow-md backdrop-blur-sm' 
                        : 'text-white/60 hover:text-white/90 hover:bg-white/5 opacity-0 group-hover:opacity-100 absolute group-hover:relative group-hover:mx-1'
                    }`}
                  >
                    EUR
                  </button>
                  <button
                    onClick={() => handleCurrencyChange('CZK')}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ease-in-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-400 ${
                      currency === 'CZK' 
                        ? 'bg-white/20 text-white shadow-md backdrop-blur-sm' 
                        : 'text-white/60 hover:text-white/90 hover:bg-white/5 opacity-0 group-hover:opacity-100 absolute group-hover:relative group-hover:mx-1'
                    }`}
                  >
                    CZK
                  </button>
                </div>
          </div>

              {/* User Authentication */}
              {user ? (
                <div className="flex items-center space-x-3" data-testid="user-authenticated-section">
                  <div className="flex items-center space-x-2" data-testid="user-info">
                    <User className="h-4 w-4 text-gray-200" />
                    <span className="text-sm text-gray-200" data-testid="user-name">
                      {user.user_metadata?.name || user.email}
            </span>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={handleLogout} 
                    className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/50 transition-all duration-200"
                    data-testid="logout-button"
                  >
                    Logout
                  </Button>
          </div>
              ) : (
                <div className="bg-white/10 backdrop-blur-md rounded-full px-4 py-2 shadow-lg border border-white/20 transition-all duration-300 hover:shadow-xl hover:bg-white/20">
                  <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="text-sm font-medium text-white/90 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 rounded-full px-2 py-1 hover:bg-white/5"
                    data-testid="login-button"
                  >
                    {language === 'cs' ? 'Přihlásit' : (language === 'it' ? 'Accedi' : 'Login')}
                  </button>
                  <span className="text-white/40 mx-1">/</span>
                  <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="text-sm font-medium text-white/90 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 rounded-full px-2 py-1 hover:bg-white/5"
                    data-testid="register-button"
                  >
                    {language === 'cs' ? 'Registrovat' : (language === 'it' ? 'Registrati' : 'Register')}
                  </button>
        </div>
              )}
              
              {/* Mobile menu button */}
              <button
                className="md:hidden"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                data-testid="mobile-menu-button"
              >
                {isMenuOpen ? <X className="h-6 w-6 text-gray-200" /> : <Menu className="h-6 w-6 text-gray-200" />}
              </button>
            </div>
          </div>
          
          {/* Mobile menu */}
          {isMenuOpen && (
            <div className="md:hidden mt-4 pt-4 border-t border-[#0e152e]" data-testid="mobile-menu">
              <div className="flex flex-col space-y-4" data-testid="mobile-menu-links">
                <Link 
                  href="/properties" 
                  className="text-gray-200 hover:text-white transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                  data-testid="mobile-properties-link"
                >
                  Nemovitosti
                </Link>
                <Link 
                  href="/regions" 
                  className="text-gray-200 hover:text-white transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                  data-testid="mobile-regions-link"
                >
                  Regiony
                </Link>
                <Link 
                  href="/about" 
                  className="text-gray-200 hover:text-white transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                  data-testid="mobile-about-link"
                >
                  O nás
                </Link>
                <Link 
                  href="/process" 
                  className="text-gray-200 hover:text-white transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                  data-testid="mobile-process-link"
                >
                  Proces
                </Link>
                <Link 
                  href="/contact" 
                  className="text-gray-200 hover:text-white transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                  data-testid="mobile-contact-link"
                >
                  Kontakt
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      <div className="pt-28 pb-8">
        <div className="container mx-auto px-4">
          {/* Region Banner */}
          {showRegionBanner && filters.region && (
            <div className="mb-8">
              <RegionBanner 
                regionSlug={filters.region}
                language={language}
                onClose={() => {
                  setShowRegionBanner(false);
                  // Scroll to top when closing the banner
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            </div>
          )}
          
          <div className="flex gap-6">
        {/* Left Sidebar - Filters */}
            <div className="w-80 flex-shrink-0">
              <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-lg sticky top-24">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 bg-gradient-to-br from-gray-50 to-white rounded-t-2xl">
                  <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">
                    Nemovitosti v Itálii
                  </h1>
                  <span className="text-sm bg-slate-100 px-3 py-1.5 rounded-lg font-semibold text-slate-800">
                    {sortedProperties.length} nemovitostí
                  </span>
          </div>

          {/* Filters */}
                <div className="flex-1">
            {/* Property Type */}
            <div className="p-6 border-b border-gray-100">
                    <h3 className="font-bold mb-4 text-gray-900 text-sm uppercase tracking-wide">Typ nemovitosti</h3>
              <div className="grid grid-cols-2 gap-3">
                {propertyTypes.map(type => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setFilters(prev => ({ 
                        ...prev, 
                        propertyType: prev.propertyType === type.id ? '' : type.id 
                      }))}
                            className={`p-3 rounded-lg border transition-all duration-300 flex flex-col items-center space-y-2 hover:scale-105 shadow-sm hover:shadow-md ${
                        filters.propertyType === type.id 
                                ? 'bg-gradient-to-br from-slate-700 to-slate-800 border-slate-700 text-white shadow-lg' 
                                : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                            <span className="text-xs font-semibold">{type.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Region */}
            <div className="p-6 border-b border-gray-100">
                    <h3 className="font-bold mb-4 text-gray-900 text-sm uppercase tracking-wide">Region</h3>
              <select
                value={filters.region}
                onChange={(e) => setFilters(prev => ({ ...prev, region: e.target.value }))}
                      className="w-full p-3 pr-10 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 shadow-sm hover:border-gray-400 transition-colors duration-200 font-medium text-gray-700 appearance-none bg-no-repeat bg-right-2 bg-[length:16px] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTQgNkw4IDEwTDEyIDYiIHN0cm9rZT0iIzY0NzQ4QiIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K')]"
              >
                <option value="">Všechny regiony</option>
                {Object.keys(italianRegions).map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>

            {/* Rooms */}
            <div className="p-6 border-b border-gray-100">
                    <h3 className="font-bold mb-4 text-gray-900 text-sm uppercase tracking-wide">Počet pokojů</h3>
              <div className="flex space-x-2">
                {['1', '2', '3', '4+'].map(room => (
                  <button
                    key={room}
                    onClick={() => setFilters(prev => ({ 
                      ...prev, 
                      rooms: prev.rooms === room ? '' : room 
                    }))}
                          className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-300 hover:scale-105 shadow-sm ${
                      filters.rooms === room 
                              ? 'bg-gradient-to-br from-slate-700 to-slate-800 text-white border border-slate-700 shadow-lg' 
                              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:shadow-md'
                    }`}
                  >
                    {room}kk
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="p-6 border-b border-gray-100">
                    <h3 className="font-bold mb-4 text-gray-900 text-sm uppercase tracking-wide">Cenové rozpětí (EUR)</h3>
              <div className="space-y-3">
                <Input
                  type="number"
                  placeholder="Od"
                  value={filters.priceFrom}
                  onChange={(e) => setFilters(prev => ({ ...prev, priceFrom: e.target.value }))}
                        className="border-gray-300 focus:ring-2 focus:ring-slate-500 focus:border-slate-500 shadow-sm"
                />
                <Input
                  type="number"
                  placeholder="Do"
                  value={filters.priceTo}
                  onChange={(e) => setFilters(prev => ({ ...prev, priceTo: e.target.value }))}
                        className="border-gray-300 focus:ring-2 focus:ring-slate-500 focus:border-slate-500 shadow-sm"
                />
              </div>
            </div>

            {/* Amenities */}
            <div className="p-6">
                    <h3 className="font-bold mb-4 text-gray-900 text-sm uppercase tracking-wide">Vybavení</h3>
              <div className="space-y-3">
                {amenities.map(amenity => (
                  <label key={amenity.id} className="flex items-center space-x-3 cursor-pointer group">
                    <Checkbox
                      checked={filters.amenities.includes(amenity.id)}
                      onCheckedChange={() => toggleAmenity(amenity.id)}
                            className="data-[state=checked]:bg-slate-700 data-[state=checked]:border-slate-700"
                    />
                          <span className="text-sm text-gray-700 group-hover:text-slate-800 font-medium transition-colors duration-200">{amenity.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Clear Filters */}
                <div className="p-6 border-t border-gray-200 bg-gradient-to-br from-gray-50 to-white rounded-b-2xl">
            <Button 
              variant="outline" 
                    className="w-full border-slate-600 text-slate-700 hover:bg-slate-700 hover:text-white font-semibold transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-md"
              onClick={clearFilters}
            >
              <X className="h-4 w-4 mr-2" />
              Vymazat filtry
            </Button>
                </div>
          </div>
        </div>

            {/* Main Content Area */}
            <div className="flex-1 min-w-0">
              {/* Top Controls Bar */}
              <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between">
                  {/* Search Bar */}
                  <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <Input
                      type="text"
                      placeholder="Vyhledat nemovitosti..."
                      value={filters.search}
                      onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                      className="pl-10 border-gray-300 focus:ring-2 focus:ring-slate-500 focus:border-slate-500 rounded-lg shadow-sm"
                    />
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {/* Sort Dropdown */}
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="text-sm border border-gray-300 rounded-lg px-3 py-2 pr-10 bg-white hover:border-gray-400 focus:ring-2 focus:ring-slate-500 focus:border-slate-500 shadow-sm transition-colors duration-200 font-medium text-gray-700 appearance-none bg-no-repeat bg-right-2 bg-[length:16px] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTQgNkw4IDEwTDEyIDYiIHN0cm9rZT0iIzY0NzQ4QiIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K')]"
                    >
                      <option value="newest">Nejnovější</option>
                      <option value="cheapest">Nejlevnější</option>
                      <option value="expensive">Nejdražší</option>
                    </select>


                    {/* Map Toggle Button */}
                    <Button
                      onClick={() => setShowMap(!showMap)}
                      className={`${
                        showMap
                          ? 'bg-gradient-to-r from-slate-700 to-slate-800 text-white shadow-lg hover:shadow-xl'
                          : 'bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white shadow-md hover:shadow-lg'
                      } font-bold text-sm px-6 py-3 transition-all duration-300 hover:scale-105 border-0`}
                    >
                      <MapIcon className="h-5 w-5 mr-2" />
                      {showMap ? 'Skrýt mapu' : 'Zobrazit mapu'}
                    </Button>
              </div>
            </div>
          </div>

              {/* Map View (when toggled) */}
              {showMap && (
                <div className="bg-white border border-gray-200 rounded-2xl shadow-lg mb-6 overflow-hidden">
                  <div className="h-[500px] relative">
            <MapComponent
              properties={sortedProperties}
              selectedProperty={selectedProperty}
              onPropertyClick={handleCardClick}
              center={selectedProperty ? selectedProperty.location : [42.8333, 12.8333]}
              zoom={selectedProperty ? 10 : 6}
            />
                  </div>
                </div>
              )}

              {/* Properties Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedProperties.map(property => (
                  <PropertyCard
                  key={property.id} 
                    property={property}
                    onFavorite={(id) => {
                      // Handle favorite toggle
                      console.log('Toggle favorite for property:', id);
                    }}
                    isFavorited={false} // You can implement favorite state management
                    language={language}
                    currency={currency}
                  />
              ))}
              
              {/* Loading More Skeleton */}
              {isLoadingMore && (
                <>
                  {[...Array(ITEMS_PER_PAGE)].map((_, index) => (
                    <div key={`skeleton-${index}`} className="animate-pulse">
                      <div className="bg-gray-200 rounded-2xl h-96"></div>
                    </div>
                  ))}
                </>
              )}
              
              {loadingProperties && (
                <div className="col-span-full text-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-700 mx-auto mb-4"></div>
                  <p className="text-gray-600">Načítám nemovitosti...</p>
                </div>
              )}

              {sortedProperties.length === 0 && !loadingProperties && (
                  <div className="col-span-full text-center py-20 bg-white rounded-2xl border border-gray-200 shadow-lg">
                    <MapPin className="h-16 w-16 mx-auto mb-4 text-slate-300" />
                    <p className="font-bold text-xl text-gray-900 mb-2">Žádné nemovitosti nenalezeny</p>
                    <p className="text-sm text-gray-500 mb-6">Zkuste upravit kritéria vyhledávání nebo vymazat filtry</p>
                    <Button 
                      variant="outline" 
                      onClick={clearFilters} 
                      className="border-slate-600 text-slate-700 hover:bg-slate-700 hover:text-white transition-all duration-300 hover:scale-105 shadow-sm"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Vymazat všechny filtry
                  </Button>
                </div>
              )}
            </div>

            {/* Load More Section */}
            {!loadingProperties && sortedProperties.length > 0 && (
              <div className="mt-12 text-center space-y-6">
                {/* Results Counter */}
                <div className="text-gray-600 text-sm font-medium">
                  {language === 'cs' ? 'Zobrazeno' : language === 'it' ? 'Visualizzato' : 'Showing'}{' '}
                  <span className="text-slate-800 font-bold">{displayedProperties.length}</span>{' '}
                  {language === 'cs' ? 'z' : language === 'it' ? 'di' : 'of'}{' '}
                  <span className="text-slate-800 font-bold">{sortedProperties.length}</span>{' '}
                  {language === 'cs' ? 'nemovitostí' : language === 'it' ? 'proprietà' : 'properties'}
                </div>

                {/* Load More Button */}
                {hasMoreProperties && (
                  <Button
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    className="bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white font-semibold px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {isLoadingMore ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        {language === 'cs' ? 'Načítám další nemovitosti...' : language === 'it' ? 'Caricamento...' : 'Loading more properties...'}
                      </>
                    ) : (
                      <>
                        <ChevronRight className="h-5 w-5 mr-2 rotate-90" />
                        {language === 'cs' 
                          ? `Načíst další (${Math.min(ITEMS_PER_PAGE, sortedProperties.length - displayedCount)} nemovitostí)` 
                          : language === 'it' 
                          ? `Carica altri (${Math.min(ITEMS_PER_PAGE, sortedProperties.length - displayedCount)} proprietà)` 
                          : `Load More (${Math.min(ITEMS_PER_PAGE, sortedProperties.length - displayedCount)} properties)`
                        }
                      </>
                    )}
                  </Button>
                )}

                {/* All Loaded Message */}
                {!hasMoreProperties && sortedProperties.length > 12 && (
                  <div className="text-center py-8">
                    <div className="inline-flex items-center px-6 py-3 bg-slate-100 rounded-full text-slate-700 font-medium">
                      <Check className="h-5 w-5 mr-2 text-slate-600" />
                      {language === 'cs' ? 'Zobrazeny všechny nemovitosti' : language === 'it' ? 'Tutte le proprietà visualizzate' : 'All properties displayed'}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      </div>

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-40 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 active:scale-95 group"
          aria-label="Back to top"
        >
          <ChevronRight className="h-6 w-6 -rotate-90 group-hover:-translate-y-1 transition-transform duration-300" />
        </button>
      )}
      
      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}
'use client';

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  Search,
  SearchX,
  X,
  MapPin,
  Map as MapIcon,
  ChevronRight,
  SlidersHorizontal,
  Mail,
  MessageCircle,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '../../lib/supabase';
import Footer from '../../components/Footer';
import RegionBanner from '../../components/RegionBanner';
import Navigation from '@/components/Navigation';
import { getPropertyImage } from '@/lib/getPropertyImage';
import { resolvePropertyType, getLocalizedValue } from '@/lib/propertyDisplay';
import {
  REGION_LABEL_BY_SLUG,
  toRegionSlug,
  propertyTypes,
  ROOM_LAYOUT_OPTIONS,
  PAGE_LABELS,
  matchesRoomLayout,
  amenities,
} from './filterConfig';
import PropertyCard from './PropertyCard';

const AuthModal = dynamic(() => import('../../components/AuthModal'), { ssr: false });

const getPropertyTimestamp = (property) => {
  const value = property?.createdAt || property?.updatedAt || property?._createdAt || property?._updatedAt;
  const timestamp = Date.parse(value || '');
  return Number.isFinite(timestamp) ? timestamp : 0;
};

// Dynamically import map components to avoid SSR issues
const MapComponent = dynamic(() => import('../../components/PropertyMap'), {
  loading: () => (
    <div className="h-full bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <MapPin className="h-12 w-12 text-slate-800 mx-auto mb-2 animate-pulse" />
        <p className="text-slate-800">Loading map...</p>
      </div>
    </div>
  ),
  ssr: false
});

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
  
  const [showRegionBanner, setShowRegionBanner] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [mapCenter, setMapCenter] = useState([42.8333, 12.8333]);
  const [showMap, setShowMap] = useState(false);
  
  // Navigation state (user only used for Favorites functionality)
  const [user, setUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [language, setLanguage] = useState('cs');
  const [currency, setCurrency] = useState('EUR');

  // Properties state
  const [properties, setProperties] = useState([]);
  const [loadingProperties, setLoadingProperties] = useState(true);
  const [useSanity, setUseSanity] = useState(false);
  const [userFavorites, setUserFavorites] = useState(new Set());
  
  // Pagination state
  const [displayedCount, setDisplayedCount] = useState(12); // Show 12 properties initially
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const ITEMS_PER_PAGE = 9; // Load 9 more each time
  
  // Mobile filter state
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const pageLabels = PAGE_LABELS[language] || PAGE_LABELS.en;

  // Search whisper state
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const searchRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!supabase) return;
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        loadFavorites(user.id);
      }
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        loadFavorites(session.user.id);
      } else {
        setUserFavorites(new Set());
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadFavorites = async (userId) => {
    try {
      const response = await fetch('/api/favorites');
      if (response.ok) {
        const favorites = await response.json();
        setUserFavorites(new Set(favorites.map(fav => fav.listingId)));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const handleToggleFavorite = async (propertyId) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    // Optimistic update
    setUserFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(propertyId)) {
        newFavorites.delete(propertyId);
      } else {
        newFavorites.add(propertyId);
      }
      return newFavorites;
    });

    try {
      const response = await fetch('/api/favorites/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ listingId: propertyId }),
      });

      if (!response.ok) {
        throw new Error('Failed to toggle favorite');
      }

      // Refresh real state
      await loadFavorites(user.id);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      // Revert optimistic update on error
      await loadFavorites(user.id);
    }
  };

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

    // Listen for language changes from Navigation
    const handleLanguageChange = (event) => {
      setLanguage(event.detail)
      document.documentElement.lang = event.detail
    }

    window.addEventListener('languageChange', handleLanguageChange)
    return () => window.removeEventListener('languageChange', handleLanguageChange)
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
          const transformedProperties = sanityProperties.map((prop, index) => {
            const regionName =
              prop.location?.city?.region?.name?.en ||
              prop.location?.city?.region?.name?.it ||
              prop.location?.city?.region?.name?.cs ||
              prop.location?.city?.name?.it ||
              prop.location?.city?.name ||
              'Italy';

            const regionSlug =
              prop.location?.city?.region?.slug?.current ||
              toRegionSlug(regionName);

            const titleI18n = {
              en: prop.title?.en || prop.title?.it || prop.title?.cs || (typeof prop.title === 'string' ? prop.title : ''),
              it: prop.title?.it || prop.title?.en || prop.title?.cs || (typeof prop.title === 'string' ? prop.title : ''),
              cs: prop.title?.cs || prop.title?.en || prop.title?.it || (typeof prop.title === 'string' ? prop.title : '')
            };

            const typeContext = [
              prop.propertyType,
              prop.slug?.current || prop.slug,
              titleI18n.en,
              titleI18n.it,
              titleI18n.cs
            ]
              .filter(Boolean)
              .join(' ');

            const resolvedType = resolvePropertyType(prop.propertyType, typeContext);

            return {
              id: prop._id || `sanity-${index}`,
              title: titleI18n.en || 'Untitled Property',
              titleI18n,
              type: resolvedType,
              region: regionName,
              regionSlug,
              price: prop.price?.amount || 0,
              rooms: prop.specifications?.rooms || prop.specifications?.bedrooms || 0,
              bedrooms: prop.specifications?.bedrooms || 0,
              bathrooms: prop.specifications?.bathrooms || 0,
              area: prop.specifications?.squareFootage || 0,
              image: getPropertyImage(prop),
              location: prop.location?.coordinates
                ? [prop.location.coordinates.lat || prop.location.coordinates[1], prop.location.coordinates.lng || prop.location.coordinates[0]]
                : [42.8333, 12.8333],
              views: 0,
              terrain: 'mountains',
              amenities: prop.amenities?.map(a => a.name?.en?.toLowerCase().replace(/\s+/g, '_')) || [],
              description: prop.description?.en || prop.description?.it || prop.description || '',
              slug: prop.slug?.current || prop.slug || '',
              sanityId: prop._id,
              status: prop.status || 'available',
              sourceUrl: prop.sourceUrl || '',
              createdAt: prop._createdAt || prop.createdAt || '',
              updatedAt: prop._updatedAt || prop.updatedAt || '',
              isNew: Boolean(prop.isNew || prop.newListing),
              noAgency: Boolean(prop.noAgency || prop.no_agency || prop.badges?.includes('no-agency'))
            };
          });

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

  // Check URL parameters from homepage quick filters/search
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const regionParam = urlParams.get('region');
    const searchParam = urlParams.get('search');
    const amenityParam = (urlParams.get('amenity') || '').toLowerCase();
    const validAmenityIds = new Set(amenities.map((amenity) => amenity.id));
    const nextFilters = {};

    if (searchParam) {
      nextFilters.search = searchParam.trim();
    }

    if (amenityParam && validAmenityIds.has(amenityParam)) {
      nextFilters.amenities = [amenityParam];
    }

    if (regionParam) {
      const normalizedRegion = toRegionSlug(regionParam);
      if (normalizedRegion) {
        nextFilters.region = normalizedRegion;
        setShowRegionBanner(true);
      }
    }

    if (Object.keys(nextFilters).length > 0) {
      setFilters((prev) => ({ ...prev, ...nextFilters }));
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

  const handleAuthSuccess = (user) => {
    setUser(user);
    setIsAuthModalOpen(false);
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

  // Update map center when selected property changes
  useEffect(() => {
    if (selectedProperty) {
      setMapCenter(selectedProperty.location);
    }
  }, [selectedProperty]);

  // Filter properties
  const filteredProperties = useMemo(() => {
    return properties.filter(property => {
      const activeRegionSlug = toRegionSlug(filters.region);
      const localizedTitle = getLocalizedValue(property.titleI18n || property.title, language, '');

      if (filters.search) {
        const searchQuery = filters.search.toLowerCase();
        const searchableContent = [
          localizedTitle,
          property.description || '',
          property.region || '',
          ...(property.amenities || [])
        ]
          .join(' ')
          .toLowerCase();

        if (!searchableContent.includes(searchQuery)) {
          return false;
        }
      }
      if (filters.propertyType && resolvePropertyType(property.type, property.type) !== filters.propertyType) {
        return false;
      }
      if (activeRegionSlug && toRegionSlug(property.regionSlug || property.region) !== activeRegionSlug) {
        return false;
      }
      if (filters.rooms && !matchesRoomLayout(property.rooms, filters.rooms)) {
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
  }, [filters, properties, language]);

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
        return sorted.sort((a, b) => getPropertyTimestamp(b) - getPropertyTimestamp(a));
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

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };

  // Static whisper suggestions pool
  const staticSuggestions = useMemo(() => [
    // Regions
    { label: language === 'cs' ? 'Toskánsko' : 'Toscana', value: 'toscana', category: language === 'cs' ? 'Region' : 'Regione' },
    { label: 'Puglia', value: 'puglia', category: language === 'cs' ? 'Region' : 'Regione' },
    { label: language === 'cs' ? 'Sicílie' : 'Sicilia', value: 'sicilia', category: language === 'cs' ? 'Region' : 'Regione' },
    { label: 'Umbria', value: 'umbria', category: language === 'cs' ? 'Region' : 'Regione' },
    { label: 'Liguria', value: 'liguria', category: language === 'cs' ? 'Region' : 'Regione' },
    { label: language === 'cs' ? 'Sardinie' : 'Sardegna', value: 'sardegna', category: language === 'cs' ? 'Region' : 'Regione' },
    { label: 'Abruzzo', value: 'abruzzo', category: language === 'cs' ? 'Region' : 'Regione' },
    { label: 'Campania', value: 'campania', category: language === 'cs' ? 'Region' : 'Regione' },
    { label: 'Calabria', value: 'calabria', category: language === 'cs' ? 'Region' : 'Regione' },
    { label: 'Marche', value: 'marche', category: language === 'cs' ? 'Region' : 'Regione' },
    // Types
    { label: language === 'cs' ? 'Vila' : 'Villa', value: 'villa', category: language === 'cs' ? 'Typ' : 'Tipo' },
    { label: language === 'cs' ? 'Rustiko' : 'Rustico', value: 'rustico', category: language === 'cs' ? 'Typ' : 'Tipo' },
    { label: language === 'cs' ? 'Byt' : 'Appartamento', value: language === 'cs' ? 'byt' : 'appartamento', category: language === 'cs' ? 'Typ' : 'Tipo' },
    { label: language === 'cs' ? 'Dům' : 'Casa', value: language === 'cs' ? 'dum' : 'casa', category: language === 'cs' ? 'Typ' : 'Tipo' },
    // Amenities
    { label: language === 'cs' ? 'Bazén' : 'Piscina', value: language === 'cs' ? 'bazén' : 'piscina', category: language === 'cs' ? 'Vybavení' : 'Servizi' },
    { label: language === 'cs' ? 'Zahrada' : 'Giardino', value: language === 'cs' ? 'zahrada' : 'giardino', category: language === 'cs' ? 'Vybavení' : 'Servizi' },
    { label: language === 'cs' ? 'Výhled na moře' : 'Vista mare', value: language === 'cs' ? 'moře' : 'mare', category: language === 'cs' ? 'Vybavení' : 'Servizi' },
    { label: language === 'cs' ? 'Terasa' : 'Terrazza', value: language === 'cs' ? 'terasa' : 'terrazza', category: language === 'cs' ? 'Vybavení' : 'Servizi' },
  ], [language]);

  // Dynamic suggestions from loaded properties
  const dynamicSuggestions = useMemo(() => {
    const seen = new Set();
    return properties
      .flatMap(p => {
        const title = typeof p.titleI18n === 'object'
          ? (p.titleI18n[language] || p.titleI18n.en || '')
          : (p.title || '');
        return [
          title && { label: title, value: title.toLowerCase(), category: language === 'cs' ? 'Nemovitost' : 'Immobile' },
          p.region && { label: p.region, value: p.region.toLowerCase(), category: language === 'cs' ? 'Region' : 'Regione' },
        ].filter(Boolean);
      })
      .filter(s => {
        if (seen.has(s.value)) return false;
        seen.add(s.value);
        return true;
      })
      .slice(0, 30);
  }, [properties, language]);

  const allSuggestions = useMemo(() => [...dynamicSuggestions, ...staticSuggestions], [dynamicSuggestions, staticSuggestions]);

  const filteredSuggestions = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    if (!q) return staticSuggestions.slice(0, 6);
    return allSuggestions
      .filter(s => s.label.toLowerCase().includes(q) || s.value.includes(q))
      .slice(0, 6);
  }, [filters.search, allSuggestions, staticSuggestions]);

  const applySuggestion = useCallback((suggestion) => {
    setFilters(prev => ({ ...prev, search: suggestion.label }));
    setShowSuggestions(false);
    setHighlightedIndex(-1);
    inputRef.current?.blur();
  }, []);

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
        setHighlightedIndex(-1);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="min-h-screen bg-[#faf8f5] overflow-x-hidden">
      {/* Navigation */}
      <Navigation />

      {/* Prominent search bar — full width, above everything */}
      <div className="bg-white border-b border-gray-200 pt-28 sm:pt-24 pb-6 sm:pb-8">
        <div className="container mx-auto px-4 sm:px-6" style={{ maxWidth: '1100px' }}>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 text-center">
            {pageLabels.title}
          </h1>
          <p className="text-sm text-gray-400 text-center mb-5">
            {language === 'cs' ? 'Vyhledejte podle lokality, typu nebo vybavení' :
             language === 'it' ? 'Cerca per posizione, tipo o servizi' :
             'Search by location, type or amenities'}
          </p>
          <div ref={searchRef} className="relative">
            <div
              className="flex items-center gap-2 bg-white rounded-2xl p-2 transition-all duration-200"
              style={{
                border: '2px solid #e5e7eb',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              }}
            >
              <Search className="ml-2 h-5 w-5 flex-shrink-0 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={filters.search}
                onChange={e => {
                  setFilters(prev => ({ ...prev, search: e.target.value }));
                  setShowSuggestions(true);
                  setHighlightedIndex(-1);
                }}
                onFocus={() => setShowSuggestions(true)}
                onKeyDown={e => {
                  if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setHighlightedIndex(i => Math.min(i + 1, filteredSuggestions.length - 1));
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setHighlightedIndex(i => Math.max(i - 1, 0));
                  } else if (e.key === 'Enter' && highlightedIndex >= 0) {
                    applySuggestion(filteredSuggestions[highlightedIndex]);
                  } else if (e.key === 'Escape') {
                    setShowSuggestions(false);
                  }
                }}
                placeholder={language === 'cs' ? 'Toskánsko, vila, bazén, Puglia…' : language === 'it' ? 'Toscana, villa, piscina, Puglia…' : 'Tuscany, villa, pool, Puglia…'}
                className="flex-1 py-2.5 text-base bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-gray-800 placeholder-gray-400 min-w-0"
                style={{ outline: 'none', boxShadow: 'none' }}
              />
              {filters.search && (
                <button
                  onClick={() => { setFilters(prev => ({ ...prev, search: '' })); inputRef.current?.focus(); }}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <button
                className="flex-shrink-0 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-all duration-200"
                style={{
                  background: 'linear-gradient(to right, rgba(199,137,91,1), rgb(153,105,69))',
                  boxShadow: '0 2px 8px rgba(153,105,69,0.3)',
                }}
                onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.filter = ''; }}
                onClick={() => setShowSuggestions(false)}
              >
                {language === 'cs' ? 'Hledat' : language === 'it' ? 'Cerca' : 'Search'}
              </button>
            </div>

            {/* Whisper suggestions dropdown */}
            {showSuggestions && filteredSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl border border-gray-200 shadow-xl z-50 overflow-hidden">
                {filteredSuggestions.map((s, i) => (
                  <button
                    key={`${s.category}-${s.value}`}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors duration-100 hover:bg-amber-50"
                    style={{ backgroundColor: i === highlightedIndex ? 'rgba(199,137,91,0.08)' : '' }}
                    onMouseDown={e => { e.preventDefault(); applySuggestion(s); }}
                    onMouseEnter={() => setHighlightedIndex(i)}
                  >
                    <Search className="h-3.5 w-3.5 text-gray-300 flex-shrink-0" />
                    <span className="flex-1 text-sm text-gray-800 font-medium">{s.label}</span>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full flex-shrink-0">{s.category}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="pt-4 sm:pt-6 pb-6 sm:pb-8">
        <div className="container mx-auto px-6" style={{ maxWidth: '1600px' }}>
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
          
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
            {/* Mobile Filter Toggle Button */}
            <div className="lg:hidden">
              <Button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="w-full bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white font-semibold py-3 rounded-xl shadow-lg"
              >
                <SlidersHorizontal className="h-5 w-5 mr-2" />
                {showMobileFilters ? pageLabels.hideFilters : pageLabels.showFilters}
              </Button>
            </div>

            {/* Left Sidebar - Filters (Hidden on mobile, shown when toggled) */}
            <div className={`${showMobileFilters ? 'block' : 'hidden'} lg:block w-full lg:w-80 flex-shrink-0`}>
              <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-lg lg:sticky lg:top-24">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 bg-gradient-to-br from-gray-50 to-white rounded-t-2xl">
                  <h1 className="font-bold text-gray-900 tracking-tight mb-2">
                    {pageLabels.title}
                  </h1>
                  <span className="text-sm bg-slate-100 px-3 py-1.5 rounded-lg font-semibold text-slate-800">
                    {sortedProperties.length} {pageLabels.propertiesCount}
                  </span>
                </div>

                {/* Filters */}
                <div className="flex-1">
                  {/* Property Type */}
                  <div className="p-6 border-b border-gray-100">
                    <h3 className="font-bold mb-4 text-gray-900 text-sm uppercase tracking-wide">{pageLabels.propertyType}</h3>
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
                            className={`cursor-pointer leading-none p-3 rounded-lg border transition-all duration-300 flex flex-col items-center space-y-2 shadow-sm hover:shadow-md ${
                              filters.propertyType === type.id 
                                ? 'bg-gradient-to-br from-slate-700 to-slate-800 border-slate-700 text-white shadow-lg' 
                                : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700'
                            }`}
                          >
                            <Icon className="h-5 w-5" />
                            <span className="text-xs font-semibold">{type.name[language] || type.name.en}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Region */}
                  <div className="p-6 border-b border-gray-100">
                    <h3 className="font-bold mb-4 text-gray-900 text-sm uppercase tracking-wide">{pageLabels.region}</h3>
                    <select
                      value={filters.region}
                      onChange={(e) => setFilters(prev => ({ ...prev, region: toRegionSlug(e.target.value) }))}
                      className="w-full p-3 pr-10 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 shadow-sm hover:border-gray-400 transition-colors duration-200 font-medium text-gray-700 appearance-none bg-no-repeat bg-right-2 bg-[length:16px] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTQgNkw4IDEwTDEyIDYiIHN0cm9rZT0iIzY0NzQ4QiIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K')]"
                    >
                      <option value="">{pageLabels.allRegions}</option>
                      {Object.entries(REGION_LABEL_BY_SLUG).map(([regionSlug, regionLabel]) => (
                        <option key={regionSlug} value={regionSlug}>{regionLabel}</option>
                      ))}
                    </select>
                  </div>

                  {/* Rooms */}
                  <div className="p-6 border-b border-gray-100">
                    <h3 className="font-bold mb-4 text-gray-900 text-sm uppercase tracking-wide">{pageLabels.layout}</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {ROOM_LAYOUT_OPTIONS.map((layoutOption) => (
                        <button
                          key={layoutOption.id}
                          onClick={() => setFilters(prev => ({
                            ...prev,
                            rooms: prev.rooms === layoutOption.id ? '' : layoutOption.id
                          }))}
                          className={`cursor-pointer leading-none px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-300 shadow-sm ${
                            filters.rooms === layoutOption.id
                              ? 'bg-gradient-to-br from-slate-700 to-slate-800 text-white border border-slate-700 shadow-lg'
                              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:shadow-md'
                          }`}
                        >
                          {layoutOption.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div className="p-6 border-b border-gray-100">
                    <h3 className="font-bold mb-4 text-gray-900 text-sm uppercase tracking-wide">{pageLabels.priceRange}</h3>
                    <div className="space-y-3">
                      <Input
                        type="number"
                        placeholder={pageLabels.from}
                        value={filters.priceFrom}
                        onChange={(e) => setFilters(prev => ({ ...prev, priceFrom: e.target.value }))}
                        className="border-gray-300 focus:ring-2 focus:ring-slate-500 focus:border-slate-500 shadow-sm"
                      />
                      <Input
                        type="number"
                        placeholder={pageLabels.to}
                        value={filters.priceTo}
                        onChange={(e) => setFilters(prev => ({ ...prev, priceTo: e.target.value }))}
                        className="border-gray-300 focus:ring-2 focus:ring-slate-500 focus:border-slate-500 shadow-sm"
                      />
                    </div>
                  </div>

                  {/* Amenities */}
                  <div className="p-6">
                    <h3 className="font-bold mb-4 text-gray-900 text-sm uppercase tracking-wide">{pageLabels.amenities}</h3>
                    <div className="space-y-3">
                      {amenities.map(amenity => (
                        <label key={amenity.id} className="flex items-center space-x-3 cursor-pointer group">
                          <Checkbox
                            checked={filters.amenities.includes(amenity.id)}
                            onCheckedChange={() => toggleAmenity(amenity.id)}
                            className="data-[state=checked]:bg-slate-700 data-[state=checked]:border-slate-700"
                          />
                          <span className="text-sm text-gray-700 group-hover:text-slate-800 font-medium transition-colors duration-200">{amenity.name[language] || amenity.name.en}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Clear Filters */}
                <div className="p-6 border-t border-gray-200 bg-gradient-to-br from-gray-50 to-white rounded-b-2xl">
                  <Button 
                    variant="outline" 
                    className="w-full border-slate-600 text-slate-700 hover:bg-slate-700 hover:text-white font-semibold transition-all duration-300 shadow-sm hover:shadow-md"
                    onClick={clearFilters}
                  >
                    <X className="h-4 w-4 mr-2" />
                    {pageLabels.clearFilters}
                  </Button>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 min-w-0">
              {/* Top Controls Bar */}
              <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
                <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2 sm:gap-3">
                    {/* Sort Dropdown */}
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="text-sm border border-gray-300 rounded-lg px-2 sm:px-3 py-2 pr-8 sm:pr-10 bg-white hover:border-gray-400 focus:ring-2 focus:ring-slate-500 focus:border-slate-500 shadow-sm transition-colors duration-200 font-medium text-gray-700 appearance-none bg-no-repeat bg-right-2 bg-[length:16px] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTQgNkw4IDEwTDEyIDYiIHN0cm9rZT0iIzY0NzQ4QiIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K')] flex-1 sm:flex-none"
                    >
                      <option value="newest">{pageLabels.sortNewest}</option>
                      <option value="cheapest">{pageLabels.sortCheapest}</option>
                      <option value="expensive">{pageLabels.sortExpensive}</option>
                    </select>


                    {/* Map Toggle Button */}
                    <Button
                      onClick={() => setShowMap(!showMap)}
                      className={`${
                        showMap
                          ? 'bg-gradient-to-r from-slate-700 to-slate-800 text-white shadow-lg hover:shadow-xl'
                          : 'bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white shadow-md hover:shadow-lg'
                      } font-bold text-xs sm:text-sm px-3 sm:px-6 py-2 sm:py-3 transition-all duration-300 border-0 whitespace-nowrap`}
                    >
                      <MapIcon className="h-4 w-4 sm:h-5 sm:w-5 sm:mr-2" />
                      <span className="hidden sm:inline">{showMap ? pageLabels.hideMap : pageLabels.showMap}</span>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Map View (when toggled) */}
              {showMap && (
                <div className="bg-white border border-gray-200 rounded-2xl shadow-lg mb-4 sm:mb-6 overflow-hidden">
                  <div className="h-[300px] sm:h-[400px] lg:h-[500px] relative">
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
              {displayedProperties.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {displayedProperties.map(property => (
                    <PropertyCard 
                      key={property.id} 
                      property={property} 
                      onFavorite={handleToggleFavorite}
                      isFavorited={userFavorites.has(property.id)}
                      language={language}
                      currency={currency}
                      onClick={handleCardClick}
                    />
                  ))}
                </div>
              )}

              {/* No results — Contact Us CTA */}
              {!loadingProperties && sortedProperties.length === 0 && (
                <div
                  className="relative overflow-hidden rounded-2xl border border-amber-100/80 shadow-lg p-6 sm:p-12 text-center"
                  style={{
                    background:
                      'linear-gradient(135deg, #faf6f0 0%, #ffffff 60%, #fdf3e7 100%)'
                  }}
                  data-testid="properties-empty-state"
                >
                  {/* Decorative sparkle */}
                  <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full opacity-40 blur-2xl"
                    style={{ background: 'radial-gradient(circle, rgba(199,137,91,0.45), transparent 70%)' }}
                  />
                  <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full opacity-30 blur-2xl"
                    style={{ background: 'radial-gradient(circle, rgba(153,105,69,0.35), transparent 70%)' }}
                  />

                  <div className="relative">
                    <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full shadow-md"
                      style={{
                        background: 'linear-gradient(135deg, rgba(199,137,91,0.15), rgba(153,105,69,0.18))'
                      }}
                    >
                      <SearchX className="h-8 w-8" style={{ color: 'rgb(153,105,69)' }} />
                    </div>

                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider mb-4"
                      style={{
                        background: 'rgba(199,137,91,0.12)',
                        color: 'rgb(120, 80, 50)'
                      }}
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      {pageLabels.noResultsBadge}
                    </span>

                    <h2 className="text-xl sm:text-3xl font-bold text-gray-900 mb-4 max-w-2xl mx-auto leading-tight">
                      {pageLabels.noResultsTitle}
                    </h2>

                    <p className="text-sm sm:text-base text-gray-600 mb-3 max-w-2xl mx-auto leading-relaxed">
                      {pageLabels.noResultsDescription1}
                    </p>
                    <p className="text-sm sm:text-base text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
                      {pageLabels.noResultsDescription2}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center items-stretch sm:items-center">
                      <Link href="/contact" className="w-full sm:w-auto">
                        <Button
                          className="w-full sm:w-auto text-white font-semibold px-6 py-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border-0"
                          style={{
                            background:
                              'linear-gradient(to right, rgba(199,137,91,1), rgb(153,105,69))'
                          }}
                          data-testid="empty-state-contact-cta"
                        >
                          <Mail className="h-5 w-5 mr-2" />
                          {pageLabels.contactUsCta}
                        </Button>
                      </Link>

                      <a
                        href="https://wa.me/420731450001"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full sm:w-auto"
                      >
                        <Button
                          variant="outline"
                          className="w-full sm:w-auto font-semibold px-6 py-6 rounded-xl border-slate-300 text-slate-800 hover:bg-slate-50 hover:text-slate-800 shadow-sm hover:shadow-md transition-all duration-200"
                          data-testid="empty-state-whatsapp-cta"
                        >
                          <MessageCircle className="h-5 w-5 mr-2" />
                          {pageLabels.whatsappCta}
                        </Button>
                      </a>

                      <Button
                        variant="ghost"
                        onClick={clearFilters}
                        className="w-full sm:w-auto text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-semibold px-6 py-6 rounded-xl transition-all duration-200"
                        data-testid="empty-state-clear-filters"
                      >
                        <X className="h-4 w-4 mr-2" />
                        {pageLabels.clearFiltersCta}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Load More / Back to Top */}
              <div className="mt-12 text-center space-y-6">
                {hasMoreProperties && (
                  <Button 
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    className="bg-white hover:bg-gray-50 text-slate-800 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 px-8 py-6 rounded-xl font-semibold text-lg"
                  >
                    {isLoadingMore ? (
                      <span className="flex items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-800 mr-3"></div>
                        {pageLabels.loading}
                      </span>
                    ) : (
                      pageLabels.loadMore
                    )}
                  </Button>
                )}
                
                {!hasMoreProperties && displayedProperties.length > 0 && (
                  <p className="text-gray-500 font-medium">
                    {pageLabels.allShown} ({displayedProperties.length})
                  </p>
                )}

                {/* Back to Top Button - Only shows when scrolled down */}
                <div 
                  className={`fixed bottom-8 right-8 transition-all duration-300 transform ${
                    showBackToTop ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'
                  }`}
                >
                  <Button
                    onClick={scrollToTop}
                    className="bg-slate-800 hover:bg-slate-700 text-white rounded-full p-4 shadow-xl hover:shadow-2xl transition-all duration-300"
                  >
                    <ChevronRight className="h-6 w-6 transform -rotate-90" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer language={language} />

      {/* Auth Modal (for Favorites) */}
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

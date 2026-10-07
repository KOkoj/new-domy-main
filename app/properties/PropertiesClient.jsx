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
  List as ListIcon,
  SlidersHorizontal,
  Mail,
  MessageCircle,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '../../lib/supabase';
import Footer from '../../components/Footer';
import RegionBanner from '../../components/RegionBanner';
import Navigation from '@/components/Navigation';
import { resolvePropertyType, getLocalizedValue } from '@/lib/propertyDisplay';
import { t } from '@/lib/translations';
import {
  REGION_LABELS,
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

const isInsideMapBounds = (property, bounds) => {
  const lat = property?.location?.[0];
  const lng = property?.location?.[1];
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false;
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return false;
  return lat >= bounds.south && lat <= bounds.north && lng >= bounds.west && lng <= bounds.east;
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

export default function PropertiesClient({ initialProperties = [], intro = null }) {
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
  const [selectedPropertyId, setSelectedPropertyId] = useState(null);
  const [hoveredPropertyId, setHoveredPropertyId] = useState(null);
  const [mapBounds, setMapBounds] = useState(null);
  // Card that briefly flashes after being selected on the map
  const [flashedPropertyId, setFlashedPropertyId] = useState(null);
  // Whether the current hover originated from a map pin (rings the list card)
  const [hoverFromMap, setHoverFromMap] = useState(false);
  // 'list' = classic sidebar + grid, 'split' = list left / map right (Airbnb-style);
  // on mobile, 'split' renders as a full-screen map instead
  const [viewMode, setViewMode] = useState('list');
  const [amenitiesOpen, setAmenitiesOpen] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const mobileMapActive = viewMode === 'split' && isMobileViewport;
  
  // Navigation state (user only used for Favorites functionality)
  const [user, setUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [language, setLanguage] = useState('cs');
  const [currency, setCurrency] = useState('EUR');

  // Properties state
  const properties = useMemo(() => initialProperties.map(property => ({
    ...property,
    region: getLocalizedValue(property.regionI18n || property.region, language, ''),
  })), [initialProperties, language]);
  const [userFavorites, setUserFavorites] = useState(new Set());
  
  // Pagination state
  const [displayedCount, setDisplayedCount] = useState(12); // Show 12 properties initially
  const [isLoadingMore, setIsLoadingMore] = useState(false);
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

  // Reset displayed count when filters change
  useEffect(() => {
    setDisplayedCount(12);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [filters, sortBy]);

  // Check URL parameters from homepage quick filters/search
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const regionParam = urlParams.get('region');
    const searchParam = urlParams.get('search');
    const amenityParam = (urlParams.get('amenity') || '').toLowerCase();
    const viewParam = (urlParams.get('view') || '').toLowerCase();

    if (viewParam === 'split' || viewParam === 'map') {
      setViewMode('split');
    }
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

  // Track the lg breakpoint so only one map instance mounts at a time
  // (mounting Leaflet in a display:none container breaks its sizing)
  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 1023px)');
    const handleChange = (event) => setIsMobileViewport(event.matches);
    setIsMobileViewport(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Lock body scroll while the mobile full-screen map is open
  useEffect(() => {
    if (!mobileMapActive) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileMapActive]);

  // Persist view mode in the URL (?view=split) without triggering navigation
  useEffect(() => {
    const url = new URL(window.location.href);
    if (viewMode === 'split') {
      url.searchParams.set('view', 'split');
    } else {
      url.searchParams.delete('view');
    }
    window.history.replaceState(window.history.state, '', url);
  }, [viewMode]);

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
          propertyTypes.find(type => type.id === property.type)?.name?.[language] || '',
          ...amenities.filter(amenity => property.amenities?.includes(amenity.id)).map(amenity => amenity.name[language]),
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
    const sortPinnedFirst = (comparison) => (a, b) => {
      const aPin = Number(a.pinnedRank) || 0;
      const bPin = Number(b.pinnedRank) || 0;
      if (aPin || bPin) {
        if (!aPin) return 1;
        if (!bPin) return -1;
        if (aPin !== bPin) return aPin - bPin;
      }
      return comparison(a, b);
    };
    switch (sortBy) {
      case 'cheapest':
        return sorted.sort(sortPinnedFirst((a, b) => a.price - b.price));
      case 'expensive':
        return sorted.sort(sortPinnedFirst((a, b) => b.price - a.price));
      case 'newest':
      default:
        return sorted.sort(sortPinnedFirst((a, b) => getPropertyTimestamp(b) - getPropertyTimestamp(a)));
    }
  }, [filteredProperties, sortBy]);

  // Get displayed properties (for pagination)
  const displayedProperties = useMemo(() => {
    return sortedProperties.slice(0, displayedCount);
  }, [sortedProperties, displayedCount]);

  const syncListToMap = viewMode === 'split' && !isMobileViewport;
  const listProperties = useMemo(() => {
    if (syncListToMap && mapBounds) {
      return sortedProperties.filter((property) => isInsideMapBounds(property, mapBounds));
    }
    return displayedProperties;
  }, [syncListToMap, mapBounds, sortedProperties, displayedProperties]);

  const visibleMapKey = syncListToMap && mapBounds
    ? listProperties.map((property) => property.id).join('|')
    : '';

  const handleMapBounds = useCallback((next) => {
    setMapBounds((prev) => {
      if (
        prev &&
        prev.south === next.south &&
        prev.north === next.north &&
        prev.west === next.west &&
        prev.east === next.east
      ) {
        return prev;
      }
      return next;
    });
  }, []);

  useEffect(() => {
    if (viewMode !== 'split') setMapBounds(null);
  }, [viewMode]);

  // A new map viewport is a new list. Scroll only the side column.
  useEffect(() => {
    if (!visibleMapKey) return;
    document.querySelectorAll('[data-property-list]').forEach((list) => {
      if (list.getClientRects().length === 0) return;
      const card = selectedPropertyId
        ? list.querySelector(
            `[data-testid="property-card"][data-property-id="${CSS.escape(String(selectedPropertyId))}"]`
          )
        : null;
      if (!card) {
        list.scrollTop = 0;
        return;
      }
      const listRect = list.getBoundingClientRect();
      const cardRect = card.getBoundingClientRect();
      const nextTop = list.scrollTop + (cardRect.top - listRect.top) - (list.clientHeight - cardRect.height) / 2;
      list.scrollTop = Math.max(0, nextTop);
    });
  }, [visibleMapKey, selectedPropertyId]);

  // Check if there are more properties to load
  const hasMoreProperties = sortedProperties.length > displayedCount;

  // Map pin selected -> make sure the card is rendered, scroll to it, flash it
  useEffect(() => {
    if (!selectedPropertyId) return;

    const index = sortedProperties.findIndex((property) => property.id === selectedPropertyId);
    if (index === -1) return;

    // The card may be beyond the current pagination window; extend it first
    // and let this effect re-run once the card is in the DOM.
    if (!syncListToMap && index >= displayedCount) {
      setDisplayedCount(index + 1);
      return;
    }

    const element = document.querySelector(
      `[data-testid="property-card"][data-property-id="${CSS.escape(String(selectedPropertyId))}"]`
    );
    const list = element?.closest('[data-property-list]');
    if (element && list && viewMode === 'split' && !isMobileViewport) {
      const listRect = list.getBoundingClientRect();
      const cardRect = element.getBoundingClientRect();
      const nextTop = list.scrollTop + (cardRect.top - listRect.top) - (list.clientHeight - cardRect.height) / 2;
      list.scrollTo({ top: Math.max(0, nextTop), behavior: 'smooth' });
    }

    setFlashedPropertyId(selectedPropertyId);
    const timeout = setTimeout(() => setFlashedPropertyId(null), 2500);
    return () => clearTimeout(timeout);
  }, [selectedPropertyId, sortedProperties, displayedCount, viewMode, isMobileViewport, syncListToMap]);

  // Number of active filters (shown on the split-view filter bar toggle)
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.propertyType) count += 1;
    if (filters.region) count += 1;
    if (filters.rooms) count += 1;
    if (filters.priceFrom) count += 1;
    if (filters.priceTo) count += 1;
    count += filters.amenities.length;
    return count;
  }, [filters]);

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

  // Static whisper suggestions pool
  const staticSuggestions = useMemo(() => [
    ...Object.entries(REGION_LABELS).map(([slug, names]) => ({
      label: names[language] || names.en, value: slug, category: pageLabels.region,
    })),
    ...propertyTypes.map(({ id, name }) => ({
      label: name[language] || name.en, value: id,
      category: language === 'cs' ? 'Typ' : language === 'it' ? 'Tipo' : 'Type',
    })),
    ...amenities.map(({ id, name }) => ({
      label: name[language] || name.en, value: id,
      category: language === 'cs' ? 'Vybavení' : language === 'it' ? 'Servizi' : 'Amenities',
    })),
  ], [language, pageLabels.region]);

  // Dynamic suggestions from loaded properties
  const dynamicSuggestions = useMemo(() => {
    const seen = new Set();
    return properties
      .flatMap(p => {
        const title = typeof p.titleI18n === 'object'
          ? (p.titleI18n[language] || p.titleI18n.en || '')
          : (p.title || '');
        return [
          title && { label: title, value: title.toLowerCase(), category: language === 'cs' ? 'Nemovitost' : language === 'it' ? 'Immobile' : 'Property' },
          p.region && { label: p.region, value: p.region.toLowerCase(), category: pageLabels.region },
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
    <div className="site-page min-h-screen bg-[#f7f4ed] overflow-x-hidden">
      {/* Navigation */}
      <Navigation />

      <div className="pb-8 pt-40">
        <div className="container mx-auto">
          <div className="mb-6 text-center">
            <h1 className="text-pretty">{pageLabels.title}</h1>
            <p className="mt-3 text-sm font-medium text-gray-600">
              {sortedProperties.length} {pageLabels.propertiesCount}
            </p>
          </div>
          {intro ? <p className="sr-only">{getLocalizedValue(intro, language)}</p> : null}

          <div
            className="mb-6 rounded-2xl bg-white p-2 shadow-[0_10px_32px_rgba(14,21,46,0.06)] sm:p-3"
            data-testid="horizontal-filter-bar"
          >
            <div className="flex items-center gap-2">
              <div ref={searchRef} className="relative min-w-0 flex-1">
                <div className="flex h-11 items-center gap-2 rounded-xl bg-white px-3 shadow-[inset_0_0_0_1px_rgba(14,21,46,0.1)]">
                  <Search className="h-4 w-4 flex-shrink-0 text-gray-400" />
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
                    className="min-w-0 flex-1 bg-transparent text-sm text-[#0e152e] outline-none placeholder:text-gray-400"
                    style={{ outline: 'none', boxShadow: 'none' }}
                  />
                  {filters.search && (
                    <button
                      type="button"
                      onClick={() => { setFilters(prev => ({ ...prev, search: '' })); inputRef.current?.focus(); }}
                      className="flex-shrink-0 text-gray-400 hover:text-gray-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                {showSuggestions && filteredSuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl bg-white shadow-xl">
                    {filteredSuggestions.map((s, i) => (
                      <button
                        key={`${s.category}-${s.value}`}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors duration-100 hover:bg-white"
                        style={{ backgroundColor: i === highlightedIndex ? 'rgba(199,137,91,0.08)' : '' }}
                        onMouseDown={e => { e.preventDefault(); applySuggestion(s); }}
                        onMouseEnter={() => setHighlightedIndex(i)}
                      >
                        <Search className="h-3.5 w-3.5 flex-shrink-0 text-gray-300" />
                        <span className="flex-1 text-sm font-medium text-gray-800">{s.label}</span>
                        <span className="flex-shrink-0 rounded-full bg-white px-2 py-0.5 text-xs text-gray-500 shadow-[inset_0_0_0_1px_rgba(14,21,46,0.1)]">{s.category}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setShowMobileFilters(open => !open)}
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#1b2642] px-4 text-sm font-semibold text-white lg:hidden"
                data-testid="filter-bar-toggle"
              >
                <SlidersHorizontal className="h-4 w-4" />
                {pageLabels.filtersLabel}
                {activeFilterCount > 0 && (
                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-xs font-bold text-[#1b2642]">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              <div
                className="ml-auto hidden rounded-xl bg-white p-1 shadow-[inset_0_0_0_1px_rgba(14,21,46,0.1)] lg:inline-flex"
                role="group"
                data-testid="view-mode-toggle"
              >
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  aria-pressed={viewMode === 'list'}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold ${viewMode === 'list' ? 'bg-[#1b2642] text-white' : 'text-gray-600 hover:text-[#0e152e]'}`}
                  data-testid="view-mode-list"
                >
                  <ListIcon className="h-4 w-4" />
                  {pageLabels.viewList}
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('split')}
                  aria-pressed={viewMode === 'split'}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold ${viewMode === 'split' ? 'bg-[#1b2642] text-white' : 'text-gray-600 hover:text-[#0e152e]'}`}
                  data-testid="view-mode-map"
                >
                  <MapIcon className="h-4 w-4" />
                  {pageLabels.viewMap}
                </button>
              </div>
            </div>

            <div className={`${showMobileFilters ? 'mt-2 flex' : 'hidden'} flex-wrap items-center gap-2 lg:mt-2 lg:flex`}>
              <select
                value={filters.propertyType}
                onChange={(e) => setFilters(prev => ({ ...prev, propertyType: e.target.value }))}
                aria-label={pageLabels.propertyType}
                className="h-11 min-w-[12.5rem] flex-1 rounded-xl bg-white px-3 pr-8 text-sm font-medium text-[#0e152e] shadow-[inset_0_0_0_1px_rgba(14,21,46,0.1)] lg:flex-none"
              >
                <option value="">{pageLabels.propertyType}</option>
                {propertyTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.name[language] || type.name.en}</option>
                ))}
              </select>

              <select
                value={filters.region}
                onChange={(e) => setFilters(prev => ({ ...prev, region: toRegionSlug(e.target.value) }))}
                aria-label={pageLabels.region}
                className="h-11 min-w-[13rem] flex-1 rounded-xl bg-white px-3 pr-8 text-sm font-medium text-[#0e152e] shadow-[inset_0_0_0_1px_rgba(14,21,46,0.1)] lg:flex-none"
              >
                <option value="">{pageLabels.allRegions}</option>
                {Object.entries(REGION_LABELS).map(([regionSlug, regionLabel]) => (
                  <option key={regionSlug} value={regionSlug}>{regionLabel[language] || regionLabel.en}</option>
                ))}
              </select>

              <select
                value={filters.rooms}
                onChange={(e) => setFilters(prev => ({ ...prev, rooms: e.target.value }))}
                aria-label={pageLabels.layout}
                className="h-11 min-w-[8.5rem] flex-1 rounded-xl bg-white px-3 pr-8 text-sm font-medium text-[#0e152e] shadow-[inset_0_0_0_1px_rgba(14,21,46,0.1)] lg:flex-none"
              >
                <option value="">{pageLabels.layout}</option>
                {ROOM_LAYOUT_OPTIONS.map((layoutOption) => (
                  <option key={layoutOption.id} value={layoutOption.id}>{layoutOption.label}</option>
                ))}
              </select>

              <input
                type="number"
                inputMode="numeric"
                placeholder={pageLabels.from}
                aria-label={pageLabels.from}
                value={filters.priceFrom}
                onChange={(e) => setFilters(prev => ({ ...prev, priceFrom: e.target.value }))}
                className="h-11 w-28 rounded-xl bg-white px-3 text-sm font-medium text-[#0e152e] shadow-[inset_0_0_0_1px_rgba(14,21,46,0.1)]"
              />
              <input
                type="number"
                inputMode="numeric"
                placeholder={pageLabels.to}
                aria-label={pageLabels.to}
                value={filters.priceTo}
                onChange={(e) => setFilters(prev => ({ ...prev, priceTo: e.target.value }))}
                className="h-11 w-28 rounded-xl bg-white px-3 text-sm font-medium text-[#0e152e] shadow-[inset_0_0_0_1px_rgba(14,21,46,0.1)]"
              />

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label={pageLabels.sortNewest}
                className="h-11 min-w-[10.5rem] flex-1 rounded-xl bg-white px-3 pr-8 text-sm font-medium text-[#0e152e] shadow-[inset_0_0_0_1px_rgba(14,21,46,0.1)] lg:flex-none"
              >
                <option value="newest">{pageLabels.sortNewest}</option>
                <option value="cheapest">{pageLabels.sortCheapest}</option>
                <option value="expensive">{pageLabels.sortExpensive}</option>
              </select>

              <button
                type="button"
                onClick={() => setAmenitiesOpen(open => !open)}
                className={`h-11 rounded-xl px-3 text-sm font-semibold ${amenitiesOpen || filters.amenities.length ? 'bg-[#1b2642] text-white' : 'bg-white text-[#0e152e] shadow-[inset_0_0_0_1px_rgba(14,21,46,0.1)]'}`}
              >
                {pageLabels.amenities}{filters.amenities.length > 0 ? ` (${filters.amenities.length})` : ''}
              </button>

              {(activeFilterCount > 0 || filters.search) && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="h-11 px-2 text-sm font-semibold text-[#8e5636]"
                >
                  {pageLabels.clearFilters}
                </button>
              )}
            </div>

            {amenitiesOpen && (
              <div className="mt-2 flex flex-wrap gap-2 border-t border-gray-100 px-1 pt-2">
                {amenities.map(amenity => {
                  const active = filters.amenities.includes(amenity.id)
                  return (
                    <button
                      key={amenity.id}
                      type="button"
                      onClick={() => toggleAmenity(amenity.id)}
                      className={`rounded-full px-3 py-1.5 text-sm font-medium ${active ? 'bg-[#1b2642] text-white' : 'bg-white text-[#0e152e] shadow-[inset_0_0_0_1px_rgba(14,21,46,0.1)]'}`}
                    >
                      {amenity.name[language] || amenity.name.en}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {showRegionBanner && filters.region && (
            <div className="mb-8">
              <RegionBanner
                regionSlug={filters.region}
                language={language}
                onClose={() => {
                  setShowRegionBanner(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            </div>
          )}
              {/* Content: plain grid in list mode; in split mode the container is
                  viewport-height with an independently scrolling list column
                  (position:sticky is broken here by the root overflow-x-hidden) */}
              <div className={viewMode === 'split' ? 'flex items-stretch gap-4 lg:gap-6 lg:h-[calc(100dvh-20rem)] lg:min-h-[28rem]' : ''}>
                <div
                  className={viewMode === 'split' ? 'w-full lg:w-1/2 min-w-0 lg:h-full lg:overflow-y-auto lg:pr-1 lg:pb-2' : ''}
                  data-property-list=""
                >
              {/* Properties Grid */}
              {syncListToMap && mapBounds && listProperties.length > 0 && (
                <p className="mb-4 text-sm text-gray-600" data-testid="map-view-count">
                  {listProperties.length} {pageLabels.propertiesCount} {pageLabels.inMapView}
                </p>
              )}

              {syncListToMap && mapBounds && listProperties.length === 0 && sortedProperties.length > 0 && (
                <p className="rounded-2xl bg-white px-6 py-10 text-center text-gray-600 shadow-sm" data-testid="map-view-empty">
                  {pageLabels.mapViewEmpty}
                </p>
              )}

              {listProperties.length > 0 && (
                <div className={`grid gap-6 ${
                  viewMode === 'split'
                    ? 'grid-cols-1 xl:grid-cols-2'
                    : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                }`}>
                  {listProperties.map(property => (
                    <PropertyCard 
                      key={property.id} 
                      property={property} 
                      onFavorite={handleToggleFavorite}
                      isFavorited={userFavorites.has(property.id)}
                      language={language}
                      currency={currency}
                      onHoverStart={() => { setHoveredPropertyId(property.id); setHoverFromMap(false); }}
                      onHoverEnd={() => setHoveredPropertyId(null)}
                      isHighlighted={hoverFromMap && hoveredPropertyId === property.id}
                      isFlashed={flashedPropertyId === property.id}
                    />
                  ))}
                </div>
              )}

              {/* No results — Contact Us CTA */}
              {sortedProperties.length === 0 && (
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

              {/* Load more. The map column already shows every property in view. */}
              <div className="mt-12 text-center space-y-6">
                {!syncListToMap && hasMoreProperties && (
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
                
                {!syncListToMap && !hasMoreProperties && displayedProperties.length > 0 && (
                  <p className="text-gray-500 font-medium">
                    {pageLabels.allShown} ({displayedProperties.length})
                  </p>
                )}
              </div>
                </div>

                {/* Map panel (split view, desktop): full height beside the scrolling list */}
                {viewMode === 'split' && !isMobileViewport && (
                  <div className="hidden lg:block lg:w-1/2 lg:h-full">
                    <div className="h-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg">
                      <MapComponent
                        properties={sortedProperties}
                        selectedId={selectedPropertyId}
                        hoveredId={hoveredPropertyId}
                        onSelect={setSelectedPropertyId}
                        onHover={(id) => { setHoveredPropertyId(id); setHoverFromMap(Boolean(id)); }}
                        onBoundsChange={handleMapBounds}
                        currency={currency}
                        language={language}
                      />
                    </div>
                  </div>
                )}
              </div>
        </div>
      </div>

      {/* Mobile full-screen map (below the fixed header) */}
      {mobileMapActive && (
        <div className="fixed inset-x-0 bottom-0 top-20 z-40 lg:hidden" data-testid="mobile-map-overlay">
          <MapComponent
            properties={sortedProperties}
            selectedId={selectedPropertyId}
            hoveredId={hoveredPropertyId}
            onSelect={setSelectedPropertyId}
            onHover={(id) => { setHoveredPropertyId(id); setHoverFromMap(Boolean(id)); }}
            cardVariant="sheet"
            currency={currency}
            language={language}
          />
        </div>
      )}

      {/* Floating view toggle pill (mobile only, Airbnb-style) */}
      <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 lg:hidden">
        <button
          type="button"
          onClick={() => setViewMode(viewMode === 'split' ? 'list' : 'split')}
          className="flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-xl transition-transform active:scale-95"
          data-testid="mobile-view-toggle"
        >
          {viewMode === 'split' ? (
            <>
              <ListIcon className="h-4 w-4" />
              {pageLabels.viewList}
            </>
          ) : (
            <>
              <MapIcon className="h-4 w-4" />
              {pageLabels.viewMap}
            </>
          )}
        </button>
      </div>

      {/* Footer */}
      <Footer language={language} />

      {/* Auth Modal (for Favorites) */}
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        language={language}
        title={t('auth.loginRequired', language)}
        message={t('auth.favoriteLoginMessage', language)}
      />
    </div>
  )
}

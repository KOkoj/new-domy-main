'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Heart, 
  Search, 
  Filter, 
  Trash2,
  Eye,
  Share2,
  MapPin,
  DollarSign,
  Bed,
  Bath,
  Square,
  Calendar,
  Grid,
  List,
  ChevronRight,
  Compare
} from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import Link from 'next/link'

// Sample property data based on our existing properties
const SAMPLE_PROPERTY_DATA = {
  '1': {
    _id: '1',
    title: { en: 'Luxury Villa with Lake Como Views' },
    slug: { current: 'luxury-villa-lake-como' },
    propertyType: 'villa',
    price: { amount: 2500000, currency: 'EUR' },
    specifications: { bedrooms: 4, bathrooms: 3, squareFootage: 350 },
    location: { city: { name: { en: 'Como' } } },
    image: 'https://images.unsplash.com/photo-1734173071981-b16ee4f9867f',
    status: 'available',
    featured: true
  },
  '2': {
    _id: '2',
    title: { en: 'Tuscan Farmhouse with Vineyards' },
    slug: { current: 'tuscan-farmhouse-vineyards' },
    propertyType: 'house',
    price: { amount: 1200000, currency: 'EUR' },
    specifications: { bedrooms: 3, bathrooms: 2, squareFootage: 280 },
    location: { city: { name: { en: 'Tuscany' } } },
    image: 'https://images.unsplash.com/12/gladiator.jpg',
    status: 'available',
    featured: true
  },
  '3': {
    _id: '3',
    title: { en: 'Italian Villa with Lemon Gardens' },
    slug: { current: 'italian-villa-lemon-gardens' },
    propertyType: 'villa',
    price: { amount: 1800000, currency: 'EUR' },
    specifications: { bedrooms: 5, bathrooms: 4, squareFootage: 420 },
    location: { city: { name: { en: 'Amalfi' } } },
    image: 'https://images.unsplash.com/photo-1697200517905-ed24837193b5',
    status: 'available',
    featured: true
  }
}

export default function FavoritesManagement() {
  const [favorites, setFavorites] = useState([])
  const [filteredFavorites, setFilteredFavorites] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [priceFilter, setPriceFilter] = useState('all')
  const [viewMode, setViewMode] = useState('grid')
  const [selectedProperties, setSelectedProperties] = useState(new Set())
  const [user, setUser] = useState(null)

  useEffect(() => {
    loadFavorites()
  }, [])

  useEffect(() => {
    filterFavorites()
  }, [favorites, searchTerm, typeFilter, priceFilter])

  const loadFavorites = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      
      setUser(user)

      const { data: userFavorites, error } = await supabase
        .from('favorites')
        .select('*')
        .eq('userId', user.id)
        .order('createdAt', { ascending: false })

      if (error) throw error

      // Enrich with property data
      const enrichedFavorites = (userFavorites || []).map(fav => ({
        ...fav,
        property: SAMPLE_PROPERTY_DATA[fav.listingId] || {
          _id: fav.listingId,
          title: { en: 'Property Not Found' },
          price: { amount: 0, currency: 'EUR' },
          propertyType: 'unknown',
          specifications: { bedrooms: 0, bathrooms: 0, squareFootage: 0 },
          location: { city: { name: { en: 'Unknown' } } },
          image: 'https://images.unsplash.com/photo-1533554030380-20991a0f9c9e'
        }
      }))

      setFavorites(enrichedFavorites)
    } catch (error) {
      console.error('Error loading favorites:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterFavorites = () => {
    let filtered = favorites

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(fav => 
        fav.property.title.en.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fav.property.location.city.name.en.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(fav => fav.property.propertyType === typeFilter)
    }

    // Price filter
    if (priceFilter !== 'all') {
      filtered = filtered.filter(fav => {
        const price = fav.property.price.amount
        switch (priceFilter) {
          case 'under-1m': return price < 1000000
          case '1m-2m': return price >= 1000000 && price < 2000000
          case 'over-2m': return price >= 2000000
          default: return true
        }
      })
    }

    setFilteredFavorites(filtered)
  }

  const removeFavorite = async (favoriteId, propertyId) => {
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('id', favoriteId)

      if (error) throw error

      setFavorites(prev => prev.filter(fav => fav.id !== favoriteId))
    } catch (error) {
      console.error('Error removing favorite:', error)
      alert('Failed to remove favorite')
    }
  }

  const toggleSelection = (propertyId) => {
    const newSelection = new Set(selectedProperties)
    if (newSelection.has(propertyId)) {
      newSelection.delete(propertyId)
    } else {
      newSelection.add(propertyId)
    }
    setSelectedProperties(newSelection)
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: price.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price.amount)
  }

  const PropertyCard = ({ favorite, isGrid = true }) => {
    const { property } = favorite
    
    return (
      <Card className={`hover:shadow-lg transition-all duration-300 ${selectedProperties.has(property._id) ? 'ring-2 ring-blue-500' : ''}`}>
        <div className={`${isGrid ? 'block' : 'flex'}`}>
          <div className={`relative ${isGrid ? 'w-full h-48' : 'w-48 h-32 flex-shrink-0'}`}>
            <img 
              src={property.image} 
              alt={property.title.en}
              className="w-full h-full object-cover rounded-t-lg"
            />
            {property.featured && (
              <Badge className="absolute top-3 left-3 bg-yellow-500">Featured</Badge>
            )}
            <button
              onClick={() => toggleSelection(property._id)}
              className={`absolute top-3 right-3 p-2 rounded-full transition-colors ${
                selectedProperties.has(property._id) 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white/80 text-gray-600 hover:bg-white'
              }`}
            >
              <Compare className="h-4 w-4" />
            </button>
          </div>
          
          <div className={`p-4 ${isGrid ? '' : 'flex-1'}`}>
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="font-semibold text-lg line-clamp-1">{property.title.en}</h3>
                <div className="flex items-center text-gray-600 text-sm mt-1">
                  <MapPin className="h-3 w-3 mr-1" />
                  {property.location.city.name.en}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-blue-600">
                  {formatPrice(property.price)}
                </div>
                <Badge variant="secondary" className="capitalize mt-1">
                  {property.propertyType}
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
              <span className="flex items-center">
                <Bed className="h-3 w-3 mr-1" />
                {property.specifications.bedrooms} beds
              </span>
              <span className="flex items-center">
                <Bath className="h-3 w-3 mr-1" />
                {property.specifications.bathrooms} baths
              </span>
              <span className="flex items-center">
                <Square className="h-3 w-3 mr-1" />
                {property.specifications.squareFootage}m²
              </span>
            </div>
            
            <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
              <span className="flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                Saved: {new Date(favorite.createdAt).toLocaleDateString()}
              </span>
              <span className="flex items-center">
                <Heart className="h-3 w-3 mr-1 fill-red-500 text-red-500" />
                Favorite
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Link href={`/properties/${property.slug?.current || property._id}`} className="flex-1">
                <Button size="sm" className="w-full">
                  <Eye className="h-4 w-4 mr-1" />
                  View Details
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={() => removeFavorite(favorite.id, property._id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-80 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Favorites</h1>
          <p className="text-gray-600 mt-1">{favorites.length} saved properties</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant={viewMode === 'grid' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button 
            variant={viewMode === 'list' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search favorites by name or location..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <select
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="villa">Villa</option>
              <option value="house">House</option>
              <option value="apartment">Apartment</option>
            </select>
            <select
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value)}
            >
              <option value="all">All Prices</option>
              <option value="under-1m">Under €1M</option>
              <option value="1m-2m">€1M - €2M</option>
              <option value="over-2m">Over €2M</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Selection Actions */}
      {selectedProperties.size > 0 && (
        <Alert>
          <Compare className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{selectedProperties.size} properties selected for comparison</span>
            <div className="flex items-center space-x-2">
              <Button size="sm">
                Compare Properties
              </Button>
              <Button size="sm" variant="outline" onClick={() => setSelectedProperties(new Set())}>
                Clear Selection
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Favorites Grid/List */}
      {filteredFavorites.length > 0 ? (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
          : 'space-y-4'
        }>
          {filteredFavorites.map((favorite) => (
            <PropertyCard 
              key={favorite.id} 
              favorite={favorite} 
              isGrid={viewMode === 'grid'}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm || typeFilter !== 'all' || priceFilter !== 'all' 
                ? 'No favorites match your filters'
                : 'No favorites yet'
              }
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || typeFilter !== 'all' || priceFilter !== 'all'
                ? 'Try adjusting your search criteria or filters.'
                : 'Start browsing properties and save your favorites to see them here.'
              }
            </p>
            <Link href="/properties">
              <Button>
                <Search className="h-4 w-4 mr-2" />
                Browse Properties
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
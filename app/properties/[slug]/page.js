'use client'

import { useState, useEffect } from 'react'
import { Heart, MapPin, Bed, Bath, Square, Car, Wifi, Utensils, Tv, ArrowLeft, Share2, Calendar, Phone, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import Link from 'next/link'
import { supabase } from '../../../lib/supabase'
import Navigation from '../../../components/Navigation'

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

function InquiryForm({ propertyId, propertyTitle }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: `Hi, I'm interested in ${propertyTitle}. Could you please provide more information?`
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
      alert('Failed to submit inquiry. Please try again.')
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
          <h3 className="text-lg font-semibold mb-2">Inquiry Sent!</h3>
          <p className="text-gray-600">Thank you for your interest. We'll get back to you soon.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact Agent</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Name</label>
            <Input
              required
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Your full name"
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
            <label className="text-sm font-medium mb-1 block">Message</label>
            <Textarea
              required
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              placeholder="Your message..."
              rows={4}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Sending...' : 'Send Inquiry'}
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

  useEffect(() => {
    loadProperty()

    // Check if user is authenticated
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    checkUser()
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading property...</p>
        </div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Property Not Found</h1>
          <p className="text-gray-600 mb-4">The property you're looking for doesn't exist.</p>
          <Link href="/properties">
            <Button>Browse All Properties</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/properties">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Properties
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
                        Featured
                      </Badge>
                    )}
                    <Badge variant="outline" className="capitalize">
                      {property.status}
                    </Badge>
                  </div>
                  <h1 className="text-3xl font-bold mb-2">
                    {property.title?.en || property.title?.it || property.title || 'Untitled Property'}
                  </h1>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-4 w-4 mr-1" />
                    {property.location?.address?.en || 
                     property.location?.city?.name?.en || 
                     property.location?.city?.name?.it || 
                     property.location?.address || 
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
                      Share
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleFavorite}>
                      <Heart className={`h-4 w-4 mr-1 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
                      {isFavorited ? 'Saved' : 'Save'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Image Gallery */}
            <ImageGallery 
              images={property.images || []} 
              title={property.title?.en || property.title?.it || property.title || 'Property'} 
            />

            {/* Property Details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-white rounded-lg border">
                <Bed className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl font-bold">{property.specifications.bedrooms}</div>
                <div className="text-sm text-gray-600">Bedrooms</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border">
                <Bath className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl font-bold">{property.specifications.bathrooms}</div>
                <div className="text-sm text-gray-600">Bathrooms</div>
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
                  <div className="text-sm text-gray-600">Parking</div>
                </div>
              )}
            </div>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  {property.description?.en || property.description?.it || property.description || 'No description available.'}
                </p>
              </CardContent>
            </Card>

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Amenities & Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {property.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        <span className="text-sm">{amenity.name.en}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Property Details */}
            <Card>
              <CardHeader>
                <CardTitle>Property Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {property.specifications.yearBuilt && (
                    <div>
                      <span className="text-sm text-gray-600">Year Built:</span>
                      <span className="ml-2 font-medium">{property.specifications.yearBuilt}</span>
                    </div>
                  )}
                  {property.specifications.renovated && (
                    <div>
                      <span className="text-sm text-gray-600">Renovated:</span>
                      <span className="ml-2 font-medium">{property.specifications.renovated}</span>
                    </div>
                  )}
                  {property.specifications.lotSize && (
                    <div>
                      <span className="text-sm text-gray-600">Lot Size:</span>
                      <span className="ml-2 font-medium">{property.specifications.lotSize.toLocaleString()} m²</span>
                    </div>
                  )}
                  <div>
                    <span className="text-sm text-gray-600">Property Type:</span>
                    <span className="ml-2 font-medium capitalize">{property.propertyType}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Inquiry Form */}
            <InquiryForm propertyId={property._id} propertyTitle={property.title.en} />

            {/* Developer Info */}
            {property.developer && (
              <Card>
                <CardHeader>
                  <CardTitle>Listed By</CardTitle>
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
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Viewing
                </Button>
                <Button variant="outline" className="w-full">
                  Request Virtual Tour
                </Button>
                <Button variant="outline" className="w-full">
                  Calculate Mortgage
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
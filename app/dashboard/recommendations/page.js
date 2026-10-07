'use client'

import { useState, useEffect } from 'react'
import PropertyImage from '@/components/PropertyImage'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  TrendingUp,
  Heart,
  Eye,
  MapPin,
  Bed,
  Bath,
  Square,
  Filter,
  RefreshCw,
  Target,
  Lightbulb
} from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import { getDashboardUser } from '../../../lib/dashboardAuth'
import { formatPrice as formatPriceUtil } from '../../../lib/currency'
import { t } from '../../../lib/translations'
import { DEFAULT_LANGUAGE, readLanguageFromBrowser } from '../../../lib/userPreferences'
import { localizedField, selectDashboardRecommendations } from '../../../lib/dashboardListings'
import Link from 'next/link'

export default function PropertyRecommendations() {
  const [recommendations, setRecommendations] = useState([])
  const [filteredRecommendations, setFilteredRecommendations] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [filterType, setFilterType] = useState('all')
  const [language, setLanguage] = useState(DEFAULT_LANGUAGE)
  const [currency, setCurrency] = useState('EUR')

  useEffect(() => {
    loadRecommendations()
    setLanguage(readLanguageFromBrowser())
    const savedCurrency = localStorage.getItem('preferred-currency')
    if (savedCurrency) setCurrency(savedCurrency)

    const handleLanguageChange = (e) => {
      setLanguage(e.detail)
    }

    window.addEventListener('languageChange', handleLanguageChange)
    return () => window.removeEventListener('languageChange', handleLanguageChange)
  }, [])

  useEffect(() => {
    filterRecommendations()
  }, [recommendations, filterType])

  const loadRecommendations = async () => {
    setLoading(true)
    try {
      const currentUser = await getDashboardUser(supabase)
      if (currentUser) setUser(currentUser)

      const response = await fetch('/api/properties')
      if (!response.ok) {
        setRecommendations([])
        return
      }
      const payload = await response.json()
      setRecommendations(selectDashboardRecommendations(Array.isArray(payload) ? payload : [], { limit: 8 }))
    } catch (error) {
      console.error('Error loading recommendations:', error)
      setRecommendations([])
    } finally {
      setLoading(false)
    }
  }

  const filterRecommendations = () => {
    let filtered = recommendations
    if (filterType !== 'all') {
      filtered = filtered.filter((item) => item.type === filterType)
    }
    setFilteredRecommendations(filtered)
  }

  const addToFavorites = async (propertyId) => {
    if (!user || !supabase) return

    try {
      const { error } = await supabase
        .from('favorites')
        .insert([{ user_id: user.id, listing_id: propertyId }])

      if (error && error.code !== '23505') {
        throw error
      }

      alert(t('club.recommendationsPage.addedToFavorites', language))
    } catch (error) {
      console.error('Error adding to favorites:', error)
      alert(t('club.recommendationsPage.addError', language))
    }
  }

  const formatPrice = (price, listingCurrency) => (
    formatPriceUtil({ amount: price, currency: listingCurrency || 'EUR' }, currency, language)
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('club.recommendationsPage.title', language)}</h1>
          <p className="text-gray-600 mt-1">{t('club.recommendationsPage.subtitle', language)}</p>
        </div>
        <Button onClick={loadRecommendations} disabled={loading} className="w-full sm:w-auto">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {loading ? t('club.recommendationsPage.updating', language) : t('club.recommendationsPage.refresh', language)}
        </Button>
      </div>

      <Alert>
        <Target className="h-4 w-4" />
        <AlertDescription>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <span>{t('club.recommendationsPage.basedOnListings', language)}</span>
            <Link href="/dashboard/profile" className="sm:flex-shrink-0">
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                {t('club.recommendationsPage.updatePreferences', language)}
              </Button>
            </Link>
          </div>
        </AlertDescription>
      </Alert>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 items-center">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium">{t('club.recommendationsPage.filters', language)}:</span>
            </div>
            <select
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">{t('club.recommendationsPage.allTypes', language)}</option>
              <option value="villa">{t('club.recommendationsPage.villa', language)}</option>
              <option value="house">{t('club.recommendationsPage.house', language)}</option>
              <option value="apartment">{t('club.recommendationsPage.apartment', language)}</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {filteredRecommendations.length > 0 ? (
        <div className="space-y-6">
          {filteredRecommendations.map((property) => {
            const title = localizedField(property.titleI18n, language, '')
            const location = localizedField(property.regionI18n, language, '')
            return (
              <Card key={property._id} className="hover:shadow-lg transition-all duration-300 overflow-hidden">
                <div className="flex flex-col lg:flex-row">
                  <div className="lg:w-80 h-64 lg:h-auto relative">
                    <PropertyImage
                      src={property.image}
                      alt={title}
                      fill
                      sizes="(min-width: 1024px) 320px, 100vw"
                      className="object-cover"
                    />
                    <div className="absolute top-4 left-4 flex flex-col space-y-2">
                      {property.featured && (
                        <Badge className="bg-yellow-500 hover:bg-yellow-600">
                          {t('club.recommendationsPage.featured', language)}
                        </Badge>
                      )}
                      {property.isNew && (
                        <Badge className="bg-slate-800 hover:bg-slate-900">
                          {t('club.recommendationsPage.newListing', language)}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
                        <div className="flex items-center space-x-4 text-gray-600 mb-2">
                          {location ? (
                            <span className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {location}
                            </span>
                          ) : null}
                          {property.type ? (
                            <Badge variant="secondary" className="capitalize">
                              {property.type}
                            </Badge>
                          ) : null}
                        </div>
                        <div className="text-2xl font-bold text-blue-600 mb-3">
                          {formatPrice(property.price, property.currency)}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-4">
                      <span className="flex items-center">
                        <Bed className="h-4 w-4 mr-1" />
                        {property.bedrooms} {t('club.recommendationsPage.beds', language)}
                      </span>
                      <span className="flex items-center">
                        <Bath className="h-4 w-4 mr-1" />
                        {property.bathrooms} {t('club.recommendationsPage.baths', language)}
                      </span>
                      {property.area ? (
                        <span className="flex items-center">
                          <Square className="h-4 w-4 mr-1" />
                          {property.area}m²
                        </span>
                      ) : null}
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link href={property.slug ? `/properties/${property.slug}` : '/properties'}>
                          <Button>
                            <Eye className="h-4 w-4 mr-2" />
                            {t('club.recommendationsPage.viewDetails', language)}
                          </Button>
                        </Link>
                        <Button variant="outline" onClick={() => addToFavorites(property._id)}>
                          <Heart className="h-4 w-4 mr-2" />
                          {t('club.recommendationsPage.save', language)}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <TrendingUp className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('club.recommendationsPage.noMatch', language)}</h3>
            <p className="text-gray-600 mb-6">
              {t('club.recommendationsPage.noMatchHint', language)}
            </p>
            <div className="flex items-center justify-center space-x-4">
              <Button onClick={() => setFilterType('all')}>
                {t('club.recommendationsPage.clearFilters', language)}
              </Button>
              <Link href="/properties">
                <Button variant="outline">
                  {t('club.recommendationsPage.browseAll', language)}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lightbulb className="h-5 w-5" />
            <span>{t('club.recommendationsPage.howItWorks', language)}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-medium mb-2">{t('club.recommendationsPage.personalPreferences', language)}</h4>
              <p className="text-gray-600">{t('club.recommendationsPage.personalPreferencesDesc', language)}</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Heart className="h-6 w-6 text-slate-800" />
              </div>
              <h4 className="font-medium mb-2">{t('club.recommendationsPage.activityAnalysis', language)}</h4>
              <p className="text-gray-600">{t('club.recommendationsPage.activityAnalysisDesc', language)}</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <h4 className="font-medium mb-2">{t('club.recommendationsPage.marketIntelligence', language)}</h4>
              <p className="text-gray-600">{t('club.recommendationsPage.marketIntelligenceDesc', language)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

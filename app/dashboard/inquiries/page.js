'use client'

import { useState, useEffect } from 'react'
import PropertyImage from '@/components/PropertyImage'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import {
  MessageSquare,
  Search,
  Calendar,
  Home,
  Mail,
  Eye,
  CheckCircle,
  Clock,
  FileText
} from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import { getDashboardUser } from '../../../lib/dashboardAuth'
import { formatPrice as formatPriceUtil } from '../../../lib/currency'
import { t } from '../../../lib/translations'
import { DEFAULT_LANGUAGE, readLanguageFromBrowser } from '../../../lib/userPreferences'
import {
  findDashboardProperty,
  localizedField,
  mapApiPropertyForDashboard,
  toDashboardCard,
  unknownDashboardProperty
} from '../../../lib/dashboardListings'
import { resolvePropertyId } from '@/lib/propertyAliases'
import Link from 'next/link'

export default function InquiriesManagement() {
  const [inquiries, setInquiries] = useState([])
  const [filteredInquiries, setFilteredInquiries] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedInquiry, setSelectedInquiry] = useState(null)
  const [user, setUser] = useState(null)
  const [language, setLanguage] = useState(DEFAULT_LANGUAGE)
  const [currency, setCurrency] = useState('EUR')

  useEffect(() => {
    loadInquiries()
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
    filterInquiries()
  }, [inquiries, searchTerm, statusFilter, language])

  const loadInquiries = async () => {
    try {
      const currentUser = await getDashboardUser(supabase)
      if (!currentUser || !supabase) {
        setLoading(false)
        return
      }

      setUser(currentUser)

      const { data: userInquiries, error } = await supabase
        .from('inquiries')
        .select('*')
        .eq('userId', currentUser.id)
        .order('createdAt', { ascending: false })

      if (error) throw error

      let allProperties = []
      try {
        const response = await fetch('/api/properties')
        if (response.ok) {
          const payload = await response.json()
          if (Array.isArray(payload)) {
            allProperties = payload.map(mapApiPropertyForDashboard)
          }
        }
      } catch (err) {
        console.error('Error fetching properties API:', err)
      }

      const enrichedInquiries = (userInquiries || []).map((inquiry) => {
        const listingId = resolvePropertyId(inquiry.listing_id || inquiry.listingId)
        const mapped = findDashboardProperty(allProperties, listingId)
        return {
          ...inquiry,
          property: mapped ? toDashboardCard(mapped) : unknownDashboardProperty(listingId),
          status: inquiry.responded ? 'responded' : 'pending',
          createdAt: inquiry.created_at || inquiry.createdAt,
          message: inquiry.message || ''
        }
      })

      setInquiries(enrichedInquiries)
    } catch (error) {
      console.error('Error loading inquiries:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterInquiries = () => {
    let filtered = inquiries

    if (searchTerm) {
      const needle = searchTerm.toLowerCase()
      filtered = filtered.filter((inquiry) => {
        const title = localizedField(inquiry.property.titleI18n, language, '')
        const location = localizedField(inquiry.property.locationI18n, language, '')
        return (
          title.toLowerCase().includes(needle) ||
          location.toLowerCase().includes(needle) ||
          String(inquiry.message || '').toLowerCase().includes(needle)
        )
      })
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((inquiry) => inquiry.status === statusFilter)
    }

    setFilteredInquiries(filtered)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'responded': return 'bg-slate-100 text-slate-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatPrice = (price) => formatPriceUtil(price, currency, language)

  const propertyHref = (property) => (
    property?.slug?.current ? `/properties/${property.slug.current}` : '/properties'
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('club.inquiriesPage.title', language)}</h1>
          <p className="text-gray-600 mt-1">{inquiries.length} {t('club.inquiriesPage.inquiriesSent', language)}</p>
        </div>
        <Link href="/properties" className="sm:flex-shrink-0">
          <Button className="w-full sm:w-auto">
            <Home className="h-4 w-4 mr-2" />
            {t('club.inquiriesPage.browseProperties', language)}
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={t('club.inquiriesPage.searchPlaceholder', language)}
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <select
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">{t('club.inquiriesPage.allStatuses', language)}</option>
              <option value="pending">{t('club.inquiriesPage.pending', language)}</option>
              <option value="responded">{t('club.inquiriesPage.responded', language)}</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <MessageSquare className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{inquiries.length}</div>
            <div className="text-sm text-gray-600">{t('club.inquiriesPage.total', language)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{inquiries.filter((item) => item.status === 'pending').length}</div>
            <div className="text-sm text-gray-600">{t('club.inquiriesPage.awaitingResponse', language)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-8 w-8 text-slate-800 mx-auto mb-2" />
            <div className="text-2xl font-bold">{inquiries.filter((item) => item.status === 'responded').length}</div>
            <div className="text-sm text-gray-600">{t('club.inquiriesPage.responsesReceived', language)}</div>
          </CardContent>
        </Card>
      </div>

      {filteredInquiries.length > 0 ? (
        <div className="space-y-4">
          {filteredInquiries.map((inquiry) => {
            const title = localizedField(inquiry.property.titleI18n, language, '')
            const location = localizedField(inquiry.property.locationI18n, language, '')
            return (
              <Card key={inquiry.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="relative w-20 h-20 flex-shrink-0">
                      <PropertyImage
                        src={inquiry.property.image}
                        alt={title}
                        fill
                        sizes="80px"
                        className="object-cover rounded-lg"
                      />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-semibold text-gray-900">{title}</h3>
                            <Badge className={getStatusColor(inquiry.status)}>
                              {t(`club.inquiriesPage.${inquiry.status}`, language)}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
                            {location ? (
                              <span className="flex items-center">
                                <Home className="h-3 w-3 mr-1" />
                                {location}
                              </span>
                            ) : null}
                            {inquiry.property.price?.amount ? (
                              <span className="flex items-center font-medium text-blue-600">
                                {formatPrice(inquiry.property.price)}
                              </span>
                            ) : null}
                            <span className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(inquiry.createdAt).toLocaleDateString(language === 'cs' ? 'cs-CZ' : language === 'it' ? 'it-IT' : 'en-US')}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-3 rounded-lg mb-3">
                        <p className="text-sm text-gray-700 font-medium mb-1">{t('club.inquiriesPage.yourInquiry', language)}:</p>
                        <p className="text-sm text-gray-700 line-clamp-2">{inquiry.message}</p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setSelectedInquiry(inquiry)}>
                              <Eye className="h-4 w-4 mr-1" />
                              {t('club.inquiriesPage.viewDetails', language)}
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>{t('club.inquiriesPage.inquiryDetails', language)}</DialogTitle>
                            </DialogHeader>
                            {selectedInquiry && (
                              <div className="space-y-6">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-gray-50 rounded-lg">
                                  <div className="relative w-16 h-16 flex-shrink-0">
                                    <PropertyImage
                                      src={selectedInquiry.property.image}
                                      alt={localizedField(selectedInquiry.property.titleI18n, language, '')}
                                      fill
                                      sizes="64px"
                                      className="object-cover rounded-lg"
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold">{localizedField(selectedInquiry.property.titleI18n, language, '')}</h4>
                                    <p className="text-sm text-gray-600">{localizedField(selectedInquiry.property.locationI18n, language, '')}</p>
                                    {selectedInquiry.property.price?.amount ? (
                                      <p className="text-sm font-medium text-blue-600">
                                        {formatPrice(selectedInquiry.property.price)}
                                      </p>
                                    ) : null}
                                  </div>
                                  <div className="sm:flex-shrink-0">
                                    <Link href={propertyHref(selectedInquiry.property)}>
                                      <Button size="sm" className="w-full sm:w-auto">
                                        <Eye className="h-4 w-4 mr-1" />
                                        {t('club.inquiriesPage.viewProperty', language)}
                                      </Button>
                                    </Link>
                                  </div>
                                </div>

                                <div>
                                  <h4 className="font-medium mb-2">{t('club.inquiriesPage.yourInquiry', language)}</h4>
                                  <div className="space-y-2 text-sm">
                                    <p><strong>{t('club.inquiriesPage.date', language)}:</strong> {new Date(selectedInquiry.createdAt).toLocaleString(language === 'cs' ? 'cs-CZ' : language === 'it' ? 'it-IT' : 'en-US')}</p>
                                    <p><strong>{t('club.inquiriesPage.status', language)}:</strong>
                                      <Badge className={`ml-2 ${getStatusColor(selectedInquiry.status)}`}>
                                        {t(`club.inquiriesPage.${selectedInquiry.status}`, language)}
                                      </Badge>
                                    </p>
                                    <div>
                                      <strong>{t('club.inquiriesPage.message', language)}:</strong>
                                      <p className="mt-1 p-3 bg-gray-50 rounded border">{selectedInquiry.message}</p>
                                    </div>
                                  </div>
                                </div>

                                {selectedInquiry.email ? (
                                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 bg-blue-50 rounded-lg">
                                    <div className="flex items-center space-x-2 min-w-0">
                                      <Mail className="h-4 w-4 text-blue-600 flex-shrink-0" />
                                      <span className="text-sm truncate">{selectedInquiry.email}</span>
                                    </div>
                                  </div>
                                ) : null}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>

                        <Link href={propertyHref(inquiry.property)}>
                          <Button variant="outline" size="sm" className="w-full sm:w-auto">
                            <Home className="h-4 w-4 mr-1" />
                            {t('club.inquiriesPage.viewProperty', language)}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm || statusFilter !== 'all'
                ? t('club.inquiriesPage.noMatch', language)
                : t('club.inquiriesPage.noInquiries', language)
              }
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || statusFilter !== 'all'
                ? t('club.inquiriesPage.adjustFilters', language)
                : t('club.inquiriesPage.emptyHint', language)
              }
            </p>
            <Link href="/properties">
              <Button>
                <Search className="h-4 w-4 mr-2" />
                {t('club.inquiriesPage.browseProperties', language)}
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      <Alert>
        <FileText className="h-4 w-4" />
        <AlertDescription>
          <strong>{t('club.inquiriesPage.inquiryTips', language)}</strong> {t('club.inquiriesPage.inquiryTipsBody', language)}
        </AlertDescription>
      </Alert>
    </div>
  )
}

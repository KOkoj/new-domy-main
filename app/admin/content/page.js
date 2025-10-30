'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { 
  Home, 
  MapPin, 
  Settings, 
  Plus,
  Edit,
  Trash2,
  Eye,
  Save,
  X,
  Image,
  DollarSign,
  Bed,
  Bath,
  Square,
  Loader2,
  AlertCircle,
  CheckCircle,
  Upload,
  Star,
  Calendar,
  Tag,
  ExternalLink,
  Languages
} from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function ContentManagement() {
  const [activeTab, setActiveTab] = useState('properties')
  const [properties, setProperties] = useState([])
  const [regions, setRegions] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [sanityConfigured, setSanityConfigured] = useState(true)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [keywordInput, setKeywordInput] = useState('')
  const [translating, setTranslating] = useState({})

  useEffect(() => {
    loadContent()
  }, [activeTab])

  const loadContent = async () => {
    try {
      setLoading(true)
      setError(null)

      const type = activeTab === 'properties' ? 'properties' : 'regions'
      const response = await fetch(`/api/content?type=${type}`)
      const result = await response.json()

      if (!response.ok) {
        if (result.error === 'Sanity CMS not configured') {
          setSanityConfigured(false)
        }
        throw new Error(result.error || 'Failed to load content')
      }

      if (activeTab === 'properties') {
        setProperties(result.properties || [])
      } else {
        setRegions(result.regions || [])
      }
    } catch (err) {
      console.error('Error loading content:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price) => {
    if (!price || !price.amount) return 'N/A'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: price.currency || 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price.amount)
  }

  const handleEditProperty = (property) => {
    // Ensure all fields have proper defaults for editing
    setEditingItem({
      ...property,
      title: { en: '', cs: '', it: '', ...property.title },
      images: property.images || [],
      mainImage: property.mainImage ?? null,
      seoTitle: { en: '', cs: '', it: '', ...(property.seoTitle || {}) },
      seoDescription: { en: '', cs: '', it: '', ...(property.seoDescription || {}) },
      keywords: property.keywords || [],
      publishAt: property.publishAt || null,
      scheduledPublish: property.scheduledPublish || false,
      description: { en: '', cs: '', it: '', ...(property.description || {}) }
    })
    setKeywordInput('')
    setIsModalOpen(true)
  }

  const handleImageUpload = async (e) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploadingImage(true)
    try {
      const uploadedImages = []
      
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData()
        formData.append('file', files[i])

        const response = await fetch('/api/upload-image', {
          method: 'POST',
          body: formData
        })

        if (!response.ok) {
          throw new Error('Failed to upload image')
        }

        const result = await response.json()
        uploadedImages.push({
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: result.asset._id
          },
          url: result.asset.url
        })
      }

      setEditingItem(prev => ({
        ...prev,
        images: [...(prev.images || []), ...uploadedImages],
        // Set first uploaded image as main if no main image is set
        mainImage: prev.mainImage || (uploadedImages.length > 0 ? 0 : null)
      }))
    } catch (err) {
      setError('Failed to upload images: ' + err.message)
    } finally {
      setUploadingImage(false)
    }
  }

  const handleRemoveImage = (index) => {
    setEditingItem(prev => {
      const newImages = [...prev.images]
      newImages.splice(index, 1)
      
      // Adjust main image index if needed
      let newMainImage = prev.mainImage
      if (prev.mainImage === index) {
        newMainImage = newImages.length > 0 ? 0 : null
      } else if (prev.mainImage > index) {
        newMainImage = prev.mainImage - 1
      }

      return {
        ...prev,
        images: newImages,
        mainImage: newMainImage
      }
    })
  }

  const handleSetMainImage = (index) => {
    setEditingItem(prev => ({
      ...prev,
      mainImage: index
    }))
  }

  const handleAddKeyword = () => {
    if (!keywordInput.trim()) return
    
    setEditingItem(prev => ({
      ...prev,
      keywords: [...(prev.keywords || []), keywordInput.trim()]
    }))
    setKeywordInput('')
  }

  const handleRemoveKeyword = (index) => {
    setEditingItem(prev => ({
      ...prev,
      keywords: prev.keywords.filter((_, i) => i !== index)
    }))
  }

  const handleTranslate = async (field, sourceLang, targetLang) => {
    const translationKey = `${field}-${targetLang}`
    setTranslating(prev => ({ ...prev, [translationKey]: true }))

    try {
      // Get source text based on field type
      let sourceText = ''
      let context = ''
      
      if (field === 'title') {
        sourceText = editingItem.title[sourceLang]
        context = 'Property title'
      } else if (field === 'description') {
        sourceText = editingItem.description[sourceLang]
        context = 'Property description'
      } else if (field === 'seoTitle') {
        sourceText = editingItem.seoTitle[sourceLang]
        context = 'SEO page title'
      } else if (field === 'seoDescription') {
        sourceText = editingItem.seoDescription[sourceLang]
        context = 'SEO meta description'
      }

      if (!sourceText) {
        setError(`No ${sourceLang.toUpperCase()} text to translate`)
        setTranslating(prev => ({ ...prev, [translationKey]: false }))
        return
      }

      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: sourceText,
          sourceLang,
          targetLang,
          context
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Translation failed')
      }

      const { translatedText } = await response.json()

      // Update the appropriate field
      setEditingItem(prev => ({
        ...prev,
        [field]: {
          ...prev[field],
          [targetLang]: translatedText
        }
      }))

      setSuccess(`Translated to ${targetLang.toUpperCase()} successfully!`)
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      console.error('Translation error:', err)
      setError(err.message || 'Translation failed. Make sure OPENAI_API_KEY is configured.')
    } finally {
      setTranslating(prev => ({ ...prev, [translationKey]: false }))
    }
  }

  const handleSaveProperty = async () => {
    if (!sanityConfigured) {
      setError('Sanity CMS is not configured. Please add Sanity credentials to your environment variables.')
      return
    }

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
    if (editingItem._id === 'new') {
        // Create new property
        const response = await fetch('/api/content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'property',
            data: {
              title: editingItem.title,
              propertyType: editingItem.propertyType,
              price: editingItem.price,
              specifications: editingItem.specifications,
              status: editingItem.status,
              featured: editingItem.featured,
              description: editingItem.description || { en: '', it: '' },
              images: editingItem.images || [],
              mainImage: editingItem.mainImage,
              seoTitle: editingItem.seoTitle || { en: '', it: '' },
              seoDescription: editingItem.seoDescription || { en: '', it: '' },
              keywords: editingItem.keywords || [],
              publishAt: editingItem.publishAt || null,
              scheduledPublish: editingItem.scheduledPublish || false
            }
          })
        })

        const result = await response.json()
        if (!response.ok) {
          // Show detailed error message if available
          const errorMessage = result.details 
            ? `${result.error}: ${result.details}${result.hint ? ` (${result.hint})` : ''}`
            : result.error || 'Failed to create property'
          throw new Error(errorMessage)
        }

        setSuccess('Property created successfully!')
        setIsModalOpen(false)
        setEditingItem(null)
        await loadContent()
    } else {
      // Update existing property
        const response = await fetch('/api/content', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'property',
            id: editingItem._id,
            data: {
              title: editingItem.title,
              propertyType: editingItem.propertyType,
              price: editingItem.price,
              specifications: editingItem.specifications,
              status: editingItem.status,
              featured: editingItem.featured,
              description: editingItem.description,
              images: editingItem.images,
              mainImage: editingItem.mainImage,
              seoTitle: editingItem.seoTitle,
              seoDescription: editingItem.seoDescription,
              keywords: editingItem.keywords,
              publishAt: editingItem.publishAt,
              scheduledPublish: editingItem.scheduledPublish
            }
          })
        })

        const result = await response.json()
        if (!response.ok) {
          // Show detailed error message if available
          const errorMessage = result.details 
            ? `${result.error}: ${result.details}${result.hint ? ` (${result.hint})` : ''}`
            : result.error || 'Failed to update property'
          throw new Error(errorMessage)
    }

        setSuccess('Property updated successfully!')
    setIsModalOpen(false)
    setEditingItem(null)
        await loadContent()
      }
    } catch (err) {
      console.error('Error saving property:', err)
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteProperty = async (propertyId) => {
    if (!confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      return
    }

    if (!sanityConfigured) {
      setError('Sanity CMS is not configured.')
      return
    }

    try {
      setError(null)
      const response = await fetch(`/api/content?type=property&id=${propertyId}`, {
        method: 'DELETE'
      })

      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Failed to delete property')

      setSuccess('Property deleted successfully!')
      await loadContent()
    } catch (err) {
      console.error('Error deleting property:', err)
      setError(err.message)
    }
  }

  const createNewProperty = () => {
    setEditingItem({
      _id: 'new',
      title: { en: '', cs: '', it: '' },
      slug: { current: '' },
      propertyType: 'villa',
      price: { amount: 0, currency: 'EUR' },
      specifications: { bedrooms: 0, bathrooms: 0, squareFootage: 0 },
      location: { city: { name: { en: '', cs: '', it: '' } } },
      status: 'available',
      featured: false,
      description: { en: '', cs: '', it: '' },
      images: [],
      mainImage: null,
      seoTitle: { en: '', cs: '', it: '' },
      seoDescription: { en: '', cs: '', it: '' },
      keywords: [],
      publishAt: null,
      scheduledPublish: false
    })
    setKeywordInput('')
    setIsModalOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Content Management</h1>
          <p className="text-gray-600 mt-1">Manage properties, regions, and platform content</p>
        </div>
      </div>

      {/* Status Alerts */}
      {!sanityConfigured && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Sanity CMS Not Configured:</strong> Please add your Sanity project credentials 
            (NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET) to your environment variables to enable content management.
            You can still view content if it's already in Sanity, but create/edit/delete operations won't work.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Error:</strong> {error}
            <Button 
              variant="ghost" 
              size="sm" 
              className="ml-2"
              onClick={() => setError(null)}
            >
              <X className="h-3 w-3" />
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {success && (
      <Alert>
          <CheckCircle className="h-4 w-4" />
        <AlertDescription>
            {success}
            <Button 
              variant="ghost" 
              size="sm" 
              className="ml-2"
              onClick={() => setSuccess(null)}
            >
              <X className="h-3 w-3" />
            </Button>
        </AlertDescription>
      </Alert>
      )}

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="properties">Properties</TabsTrigger>
          <TabsTrigger value="regions">Regions</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Properties Tab */}
        <TabsContent value="properties" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Property Management</h2>
            <Button onClick={createNewProperty}>
              <Plus className="h-4 w-4 mr-2" />
              Add Property
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6 text-center">
                <Home className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold">{properties.length}</div>
                <div className="text-sm text-gray-600">Total Properties</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Eye className="h-8 w-8 text-slate-800 mx-auto mb-2" />
                <div className="text-2xl font-bold">{properties.filter(p => p.status === 'available').length}</div>
                <div className="text-sm text-gray-600">Available</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Badge className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                <div className="text-2xl font-bold">{properties.filter(p => p.featured).length}</div>
                <div className="text-sm text-gray-600">Featured</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Properties</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  <span className="ml-3 text-gray-600">Loading properties...</span>
                </div>
              ) : properties.length > 0 ? (
              <div className="space-y-6">
                {properties.map((property) => (
                  <div key={property._id} className="flex items-center justify-between p-6 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-6">
                      <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Home className="h-8 w-8 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-semibold text-gray-900 text-lg">
                              {property.title?.en || property.title?.it || 'Untitled Property'}
                            </h3>
                          {property.featured && (
                            <Badge className="bg-yellow-500 hover:bg-yellow-600">Featured</Badge>
                          )}
                          <Badge variant="secondary" className="capitalize">{property.propertyType}</Badge>
                            <Badge variant="outline" className="capitalize">{property.status || 'available'}</Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                            {property.location?.city?.name?.en && (
                          <span className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {property.location.city.name.en}
                          </span>
                            )}
                          <span className="flex items-center font-medium text-blue-600">
                            <DollarSign className="h-4 w-4 mr-1" />
                            {formatPrice(property.price)}
                          </span>
                            {property.specifications?.bedrooms !== undefined && (
                          <span className="flex items-center">
                            <Bed className="h-4 w-4 mr-1" />
                            {property.specifications.bedrooms} beds
                          </span>
                            )}
                            {property.specifications?.bathrooms !== undefined && (
                          <span className="flex items-center">
                            <Bath className="h-4 w-4 mr-1" />
                            {property.specifications.bathrooms} baths
                          </span>
                            )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        {property.slug?.current && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.open(`/properties/${property.slug.current}`, '_blank')}
                            title="View property detail page"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleEditProperty(property)}
                          disabled={!sanityConfigured}
                        >
                        <Edit className="h-4 w-4" />
                      </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDeleteProperty(property._id)}
                          disabled={!sanityConfigured}
                        >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              ) : (
                <div className="text-center py-12">
                  <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
                  <p className="text-gray-600 mb-4">
                    {sanityConfigured 
                      ? 'Get started by adding your first property.'
                      : 'Configure Sanity CMS to manage properties.'}
                  </p>
                  {sanityConfigured && (
                    <Button onClick={createNewProperty}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Property
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Regions Tab */}
        <TabsContent value="regions" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Region Management</h2>
            <Button disabled={!sanityConfigured}>
              <Plus className="h-4 w-4 mr-2" />
              Add Region
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Regions</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  <span className="ml-3 text-gray-600">Loading regions...</span>
                </div>
              ) : regions.length > 0 ? (
              <div className="space-y-4">
                {regions.map((region) => (
                  <div key={region._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                        <MapPin className="h-6 w-6 text-gray-600" />
                      </div>
                      <div>
                          <h3 className="font-medium text-gray-900">
                            {region.name?.en || region.name?.it || 'Unnamed Region'}
                          </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                            <span>{region.country || 'Italy'}</span>
                            <span>{region.propertyCount || 0} properties</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" disabled={!sanityConfigured}>
                        <Edit className="h-4 w-4" />
                      </Button>
                        <Button variant="outline" size="sm" disabled={!sanityConfigured}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              ) : (
                <div className="text-center py-12">
                  <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No regions found</h3>
                  <p className="text-gray-600">
                    {sanityConfigured 
                      ? 'Regions will appear here once they are added to Sanity CMS.'
                      : 'Configure Sanity CMS to manage regions.'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <h2 className="text-xl font-semibold">Platform Settings</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Site Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Site Name</label>
                  <Input defaultValue="Domy v Itálii" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Default Currency</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option value="EUR">EUR (€)</option>
                    <option value="USD">USD ($)</option>
                    <option value="CZK">CZK (Kč)</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Contact Email</label>
                  <Input defaultValue="info@domyvitalii.com" />
                </div>
                <Button>Save Settings</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Email Templates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Welcome Email Subject</label>
                  <Input defaultValue="Welcome to Domy v Itálii!" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Inquiry Auto-Response</label>
                  <Textarea 
                    defaultValue="Thank you for your inquiry. We'll get back to you within 24 hours."
                    rows={3}
                  />
                </div>
                <Button>Update Templates</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Property Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {editingItem?._id === 'new' ? 'Add New Property' : 'Edit Property'}
            </DialogTitle>
          </DialogHeader>
          {editingItem && (
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="images">Images</TabsTrigger>
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="seo">SEO & Publishing</TabsTrigger>
              </TabsList>

              {/* Basic Info Tab */}
              <TabsContent value="basic" className="space-y-4 mt-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Title (English) *</label>
                    <Input
                      value={editingItem.title.en}
                      onChange={(e) => setEditingItem(prev => ({
                        ...prev,
                        title: { ...prev.title, en: e.target.value }
                      }))}
                      placeholder="Luxury Villa in Tuscany"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Title (Czech)</label>
                    <Input
                      value={editingItem.title.cs || ''}
                      onChange={(e) => setEditingItem(prev => ({
                        ...prev,
                        title: { ...prev.title, cs: e.target.value }
                      }))}
                      placeholder="Luxusní vila v Toskánsku"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Title (Italian)</label>
                    <Input
                      value={editingItem.title.it}
                      onChange={(e) => setEditingItem(prev => ({
                        ...prev,
                        title: { ...prev.title, it: e.target.value }
                      }))}
                      placeholder="Villa di Lusso in Toscana"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Property Type *</label>
                    <Select
                      value={editingItem.propertyType}
                      onValueChange={(value) => setEditingItem(prev => ({
                        ...prev,
                        propertyType: value
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="villa">Villa</SelectItem>
                        <SelectItem value="house">House</SelectItem>
                        <SelectItem value="apartment">Apartment</SelectItem>
                        <SelectItem value="farmhouse">Farmhouse</SelectItem>
                        <SelectItem value="castle">Castle</SelectItem>
                        <SelectItem value="commercial">Commercial</SelectItem>
                        <SelectItem value="land">Land</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Status *</label>
                    <Select
                      value={editingItem.status}
                      onValueChange={(value) => setEditingItem(prev => ({
                        ...prev,
                        status: value
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="reserved">Reserved</SelectItem>
                        <SelectItem value="sold">Sold</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div className="col-span-1">
                    <label className="text-sm font-medium mb-1 block">Price (EUR) *</label>
                    <Input
                      type="number"
                      value={editingItem.price.amount}
                      onChange={(e) => setEditingItem(prev => ({
                        ...prev,
                        price: { ...prev.price, amount: parseInt(e.target.value) || 0 }
                      }))}
                      placeholder="500000"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Bedrooms</label>
                    <Input
                      type="number"
                      value={editingItem.specifications.bedrooms}
                      onChange={(e) => setEditingItem(prev => ({
                        ...prev,
                        specifications: { ...prev.specifications, bedrooms: parseInt(e.target.value) || 0 }
                      }))}
                      placeholder="3"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Bathrooms</label>
                    <Input
                      type="number"
                      value={editingItem.specifications.bathrooms}
                      onChange={(e) => setEditingItem(prev => ({
                        ...prev,
                        specifications: { ...prev.specifications, bathrooms: parseInt(e.target.value) || 0 }
                      }))}
                      placeholder="2"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Area (m²)</label>
                    <Input
                      type="number"
                      value={editingItem.specifications.squareFootage}
                      onChange={(e) => setEditingItem(prev => ({
                        ...prev,
                        specifications: { ...prev.specifications, squareFootage: parseInt(e.target.value) || 0 }
                      }))}
                      placeholder="250"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">City (English)</label>
                  <Input
                    value={editingItem.location.city.name.en}
                    onChange={(e) => setEditingItem(prev => ({
                      ...prev,
                      location: {
                        ...prev.location,
                        city: {
                          ...prev.location.city,
                          name: { ...prev.location.city.name, en: e.target.value }
                        }
                      }
                    }))}
                    placeholder="Florence, Tuscany"
                  />
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={editingItem.featured}
                    onChange={(e) => setEditingItem(prev => ({
                      ...prev,
                      featured: e.target.checked
                    }))}
                    className="w-4 h-4"
                  />
                  <label htmlFor="featured" className="text-sm font-medium flex items-center">
                    <Star className="h-4 w-4 mr-1 text-yellow-500" />
                    Featured Property (appears on homepage)
                  </label>
                </div>
              </TabsContent>

              {/* Images Tab */}
              <TabsContent value="images" className="space-y-4 mt-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Property Images</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      id="image-upload"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      {uploadingImage ? (
                        <>
                          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-2" />
                          <p className="text-sm text-gray-600">Uploading images...</p>
                        </>
                      ) : (
                        <>
                          <Upload className="h-12 w-12 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-600">
                            Click to upload images or drag and drop
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            PNG, JPG, GIF up to 10MB each
                          </p>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                {editingItem.images && editingItem.images.length > 0 && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Uploaded Images ({editingItem.images.length})
                    </label>
                    <p className="text-xs text-gray-600 mb-3">
                      Click the star icon to set the main image that will appear first
                    </p>
                    <div className="grid grid-cols-3 gap-4">
                      {editingItem.images.map((image, index) => (
                        <div
                          key={index}
                          className={`relative group border-2 rounded-lg overflow-hidden ${
                            editingItem.mainImage === index
                              ? 'border-yellow-500 shadow-lg'
                              : 'border-gray-200'
                          }`}
                        >
                          <img
                            src={image.url || image.asset?.url}
                            alt={`Property ${index + 1}`}
                            className="w-full h-32 object-cover"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center space-x-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleSetMainImage(index)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Star
                                className={`h-4 w-4 ${
                                  editingItem.mainImage === index ? 'fill-yellow-500 text-yellow-500' : ''
                                }`}
                              />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleRemoveImage(index)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          {editingItem.mainImage === index && (
                            <Badge className="absolute top-2 left-2 bg-yellow-500">
                              Main Image
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Description Tab */}
              <TabsContent value="description" className="space-y-4 mt-4">
                  <Alert className="mb-4">
                    <Languages className="h-4 w-4" />
                    <AlertDescription>
                      <strong>AI Translation:</strong> Fill in the English description, then use the translate buttons to automatically translate to Czech and Italian using OpenAI.
                    </AlertDescription>
                  </Alert>

                  <div>
                    <label className="text-sm font-medium mb-1 block">Description (English)</label>
                    <Textarea
                      value={editingItem.description?.en || ''}
                      onChange={(e) => setEditingItem(prev => ({
                        ...prev,
                        description: { ...(prev.description || {}), en: e.target.value }
                      }))}
                      rows={6}
                      placeholder="Enter a detailed description of the property in English..."
                      className="resize-y"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {(editingItem.description?.en || '').length} characters
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-sm font-medium block">Description (Czech)</label>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => handleTranslate('description', 'en', 'cs')}
                        disabled={!editingItem.description?.en || translating['description-cs']}
                        className="h-7"
                      >
                        {translating['description-cs'] ? (
                          <>
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            Translating...
                          </>
                        ) : (
                          <>
                            <Languages className="h-3 w-3 mr-1" />
                            Translate from EN
                          </>
                        )}
                      </Button>
                    </div>
                    <Textarea
                      value={editingItem.description?.cs || ''}
                      onChange={(e) => setEditingItem(prev => ({
                        ...prev,
                        description: { ...(prev.description || {}), cs: e.target.value }
                      }))}
                      rows={6}
                      placeholder="Zadejte podrobný popis nemovitosti v češtině..."
                      className="resize-y"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {(editingItem.description?.cs || '').length} characters
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-sm font-medium block">Description (Italian)</label>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => handleTranslate('description', 'en', 'it')}
                        disabled={!editingItem.description?.en || translating['description-it']}
                        className="h-7"
                      >
                        {translating['description-it'] ? (
                          <>
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            Translating...
                          </>
                        ) : (
                          <>
                            <Languages className="h-3 w-3 mr-1" />
                            Translate from EN
                          </>
                        )}
                      </Button>
                    </div>
                    <Textarea
                      value={editingItem.description?.it || ''}
                      onChange={(e) => setEditingItem(prev => ({
                        ...prev,
                        description: { ...(prev.description || {}), it: e.target.value }
                      }))}
                      rows={6}
                      placeholder="Inserisci una descrizione dettagliata della proprietà in italiano..."
                      className="resize-y"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {(editingItem.description?.it || '').length} characters
                    </p>
                  </div>
              </TabsContent>

              {/* SEO & Publishing Tab */}
              <TabsContent value="seo" className="space-y-6 mt-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center">
                    <Tag className="h-5 w-5 mr-2" />
                    SEO Settings
                  </h3>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">SEO Title (English)</label>
                      <Input
                        value={editingItem.seoTitle?.en || ''}
                        onChange={(e) => setEditingItem(prev => ({
                          ...prev,
                          seoTitle: { ...(prev.seoTitle || {}), en: e.target.value }
                        }))}
                        placeholder="Luxury Villa in Tuscany | Buy Italian Property"
                        maxLength={60}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {(editingItem.seoTitle?.en || '').length}/60 characters (optimal: 50-60)
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">SEO Title (Czech)</label>
                      <Input
                        value={editingItem.seoTitle?.cs || ''}
                        onChange={(e) => setEditingItem(prev => ({
                          ...prev,
                          seoTitle: { ...(prev.seoTitle || {}), cs: e.target.value }
                        }))}
                        placeholder="Luxusní vila v Toskánsku | Koupit italskou nemovitost"
                        maxLength={60}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {(editingItem.seoTitle?.cs || '').length}/60 characters
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">SEO Title (Italian)</label>
                      <Input
                        value={editingItem.seoTitle?.it || ''}
                        onChange={(e) => setEditingItem(prev => ({
                          ...prev,
                          seoTitle: { ...(prev.seoTitle || {}), it: e.target.value }
                        }))}
                        placeholder="Villa di Lusso in Toscana | Acquista Proprietà Italiana"
                        maxLength={60}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {(editingItem.seoTitle?.it || '').length}/60 characters
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Meta Description (English)</label>
                      <Textarea
                        value={editingItem.seoDescription?.en || ''}
                        onChange={(e) => setEditingItem(prev => ({
                          ...prev,
                          seoDescription: { ...(prev.seoDescription || {}), en: e.target.value }
                        }))}
                        rows={3}
                        placeholder="Stunning luxury villa in the heart of Tuscany with panoramic views..."
                        maxLength={160}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {(editingItem.seoDescription?.en || '').length}/160 characters (optimal: 150-160)
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Meta Description (Czech)</label>
                      <Textarea
                        value={editingItem.seoDescription?.cs || ''}
                        onChange={(e) => setEditingItem(prev => ({
                          ...prev,
                          seoDescription: { ...(prev.seoDescription || {}), cs: e.target.value }
                        }))}
                        rows={3}
                        placeholder="Úžasná luxusní vila v srdci Toskánska s panoramatickým výhledem..."
                        maxLength={160}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {(editingItem.seoDescription?.cs || '').length}/160 characters
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Meta Description (Italian)</label>
                      <Textarea
                        value={editingItem.seoDescription?.it || ''}
                        onChange={(e) => setEditingItem(prev => ({
                          ...prev,
                          seoDescription: { ...(prev.seoDescription || {}), it: e.target.value }
                        }))}
                        rows={3}
                        placeholder="Splendida villa di lusso nel cuore della Toscana con vista panoramica..."
                        maxLength={160}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {(editingItem.seoDescription?.it || '').length}/160 characters
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Keywords</label>
                    <div className="flex gap-2 mb-2">
                      <Input
                        value={keywordInput}
                        onChange={(e) => setKeywordInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleAddKeyword()
                          }
                        }}
                        placeholder="Enter keyword and press Enter"
                      />
                      <Button type="button" onClick={handleAddKeyword} variant="secondary">
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </div>
                    {editingItem.keywords && editingItem.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {editingItem.keywords.map((keyword, index) => (
                          <Badge key={index} variant="secondary" className="px-3 py-1">
                            {keyword}
                            <button
                              onClick={() => handleRemoveKeyword(index)}
                              className="ml-2 hover:text-red-500"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Publishing Schedule
                  </h3>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="scheduledPublish"
                      checked={editingItem.scheduledPublish || false}
                      onChange={(e) => setEditingItem(prev => ({
                        ...prev,
                        scheduledPublish: e.target.checked
                      }))}
                      className="w-4 h-4"
                    />
                    <label htmlFor="scheduledPublish" className="text-sm font-medium">
                      Schedule publication date
                    </label>
                  </div>

                  {editingItem.scheduledPublish && (
                    <div>
                      <label className="text-sm font-medium mb-1 block">Publish Date & Time</label>
                      <Input
                        type="datetime-local"
                        value={editingItem.publishAt || ''}
                        onChange={(e) => setEditingItem(prev => ({
                          ...prev,
                          publishAt: e.target.value
                        }))}
                        className="max-w-md"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Property will be automatically published at this date and time
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-2 pt-6 border-t mt-6">
                <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={saving}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSaveProperty}
                  disabled={saving || !sanityConfigured}
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {editingItem._id === 'new' ? 'Create Property' : 'Save Changes'}
                    </>
                  )}
                </Button>
              </div>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
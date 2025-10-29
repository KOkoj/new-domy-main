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
  CheckCircle
} from 'lucide-react'

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
    setEditingItem({ ...property })
    setIsModalOpen(true)
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
              description: editingItem.description || { en: '', it: '' }
            }
          })
        })

        const result = await response.json()
        if (!response.ok) throw new Error(result.error || 'Failed to create property')

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
              description: editingItem.description
            }
          })
        })

        const result = await response.json()
        if (!response.ok) throw new Error(result.error || 'Failed to update property')

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
      title: { en: '', it: '' },
      slug: { current: '' },
      propertyType: 'villa',
      price: { amount: 0, currency: 'EUR' },
      specifications: { bedrooms: 0, bathrooms: 0, squareFootage: 0 },
      location: { city: { name: { en: '', it: '' } } },
      status: 'available',
      featured: false,
      description: { en: '', it: '' }
    })
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
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem?._id === 'new' ? 'Add New Property' : 'Edit Property'}
            </DialogTitle>
          </DialogHeader>
          {editingItem && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Title (English)</label>
                  <Input
                    value={editingItem.title.en}
                    onChange={(e) => setEditingItem(prev => ({
                      ...prev,
                      title: { ...prev.title, en: e.target.value }
                    }))}
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
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Property Type</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={editingItem.propertyType}
                    onChange={(e) => setEditingItem(prev => ({
                      ...prev,
                      propertyType: e.target.value
                    }))}
                  >
                    <option value="villa">Villa</option>
                    <option value="house">House</option>
                    <option value="apartment">Apartment</option>
                    <option value="commercial">Commercial</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Status</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={editingItem.status}
                    onChange={(e) => setEditingItem(prev => ({
                      ...prev,
                      status: e.target.value
                    }))}
                  >
                    <option value="available">Available</option>
                    <option value="reserved">Reserved</option>
                    <option value="sold">Sold</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Price (EUR)</label>
                  <Input
                    type="number"
                    value={editingItem.price.amount}
                    onChange={(e) => setEditingItem(prev => ({
                      ...prev,
                      price: { ...prev.price, amount: parseInt(e.target.value) || 0 }
                    }))}
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
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">City</label>
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
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={editingItem.featured}
                  onChange={(e) => setEditingItem(prev => ({
                    ...prev,
                    featured: e.target.checked
                  }))}
                />
                <label htmlFor="featured" className="text-sm font-medium">Featured Property</label>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
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
                      Save Property
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
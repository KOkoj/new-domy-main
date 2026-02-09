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
  Languages,
  FileText,
  BookOpen,
  Clock,
  Link as LinkIcon,
  Download
} from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { t } from '@/lib/translations'

export default function ContentManagement() {
  const [activeTab, setActiveTab] = useState('properties')
  const [properties, setProperties] = useState([])
  const [regions, setRegions] = useState([])
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [editingArticle, setEditingArticle] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [sanityConfigured, setSanityConfigured] = useState(true)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [keywordInput, setKeywordInput] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [translating, setTranslating] = useState({})
  const [seeding, setSeeding] = useState(false)
  const [language, setLanguage] = useState('cs')

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'cs'
    setLanguage(savedLanguage)
    
    const handleLanguageChange = (e) => {
      if (e.detail) setLanguage(e.detail)
      else if (e.newValue) setLanguage(e.newValue)
    }
    
    window.addEventListener('languageChange', handleLanguageChange)
    window.addEventListener('storage', handleLanguageChange)
    
    return () => {
      window.removeEventListener('languageChange', handleLanguageChange)
      window.removeEventListener('storage', handleLanguageChange)
    }
  }, [])

  useEffect(() => {
    loadContent()
  }, [activeTab])

  const loadContent = async () => {
    try {
      setLoading(true)
      setError(null)

      const typeMap = { properties: 'properties', regions: 'regions', articles: 'articles' }
      const type = typeMap[activeTab] || 'properties'
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
      } else if (activeTab === 'regions') {
        setRegions(result.regions || [])
      } else if (activeTab === 'articles') {
        setArticles(result.articles || [])
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
        setError(t('admin.content.noTextToTranslate', language))
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

      setSuccess(t('admin.content.translationSuccess', language))
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      console.error('Translation error:', err)
      setError(err.message || t('admin.content.translationFailed', language))
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

        setSuccess(t('admin.content.propertyCreated', language))
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

        setSuccess(t('admin.content.propertyUpdated', language))
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
    if (!confirm(t('admin.content.deleteConfirm', language))) {
      return
    }

    if (!sanityConfigured) {
      setError(t('admin.content.sanityNotConfigured', language))
      return
    }

    try {
      setError(null)
      const response = await fetch(`/api/content?type=property&id=${propertyId}`, {
        method: 'DELETE'
      })

      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Failed to delete property')

      setSuccess(t('admin.content.propertyDeleted', language))
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

  // === Article Handlers ===
  const createNewArticle = () => {
    setEditingArticle({
      _id: 'new',
      slug: '',
      title: { en: '', cs: '', it: '' },
      excerpt: { en: '', cs: '', it: '' },
      date: new Date().toISOString().split('T')[0],
      readTime: '',
      category: { en: '', cs: '', it: '' },
      author: '',
      image: '',
      content: { en: '', cs: '', it: '' },
      tags: [],
      link: '',
      articleType: 'blog',
      relatedRegions: []
    })
    setTagInput('')
    setIsArticleModalOpen(true)
  }

  const handleEditArticle = (article) => {
    setEditingArticle({
      ...article,
      title: { en: '', cs: '', it: '', ...article.title },
      excerpt: { en: '', cs: '', it: '', ...article.excerpt },
      category: { en: '', cs: '', it: '', ...(article.category || {}) },
      content: { en: '', cs: '', it: '', ...(article.content || {}) },
      tags: article.tags || [],
      relatedRegions: article.relatedRegions || [],
      link: article.link || '',
      author: article.author || '',
      image: article.image || '',
    })
    setTagInput('')
    setIsArticleModalOpen(true)
  }

  const handleSaveArticle = async () => {
    if (!sanityConfigured) {
      setError('Sanity CMS is not configured.')
      return
    }

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      if (editingArticle._id === 'new') {
        const response = await fetch('/api/content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'article',
            data: {
              slug: editingArticle.slug,
              title: editingArticle.title,
              excerpt: editingArticle.excerpt,
              date: editingArticle.date,
              readTime: editingArticle.readTime,
              category: editingArticle.category,
              author: editingArticle.author,
              image: editingArticle.image,
              content: editingArticle.content,
              tags: editingArticle.tags,
              link: editingArticle.link,
              articleType: editingArticle.articleType,
              relatedRegions: editingArticle.relatedRegions
            }
          })
        })

        const result = await response.json()
        if (!response.ok) {
          const errorMessage = result.details 
            ? `${result.error}: ${result.details}`
            : result.error || 'Failed to create article'
          throw new Error(errorMessage)
        }

        setSuccess('Article created successfully!')
      } else {
        const response = await fetch('/api/content', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'article',
            id: editingArticle._id,
            data: {
              slug: editingArticle.slug,
              title: editingArticle.title,
              excerpt: editingArticle.excerpt,
              date: editingArticle.date,
              readTime: editingArticle.readTime,
              category: editingArticle.category,
              author: editingArticle.author,
              image: editingArticle.image,
              content: editingArticle.content,
              tags: editingArticle.tags,
              link: editingArticle.link,
              articleType: editingArticle.articleType,
              relatedRegions: editingArticle.relatedRegions
            }
          })
        })

        const result = await response.json()
        if (!response.ok) {
          throw new Error(result.error || 'Failed to update article')
        }

        setSuccess('Article updated successfully!')
      }

      setIsArticleModalOpen(false)
      setEditingArticle(null)
      await loadContent()
    } catch (err) {
      console.error('Error saving article:', err)
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteArticle = async (articleId) => {
    if (!confirm('Are you sure you want to delete this article? This action cannot be undone.')) {
      return
    }

    try {
      setError(null)
      const response = await fetch(`/api/content?type=article&id=${articleId}`, {
        method: 'DELETE'
      })

      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Failed to delete article')

      setSuccess('Article deleted successfully!')
      await loadContent()
    } catch (err) {
      console.error('Error deleting article:', err)
      setError(err.message)
    }
  }

  const handleAddTag = () => {
    if (!tagInput.trim()) return
    setEditingArticle(prev => ({
      ...prev,
      tags: [...(prev.tags || []), tagInput.trim()]
    }))
    setTagInput('')
  }

  const handleRemoveTag = (index) => {
    setEditingArticle(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }))
  }

  const handleSeedArticles = async () => {
    if (!confirm('This will import all existing hardcoded articles into the CMS. Articles that already exist will be skipped. Continue?')) {
      return
    }

    setSeeding(true)
    setError(null)

    try {
      const response = await fetch('/api/seed-articles', {
        method: 'POST'
      })

      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Failed to seed articles')

      setSuccess(`Successfully imported ${result.created} articles! (${result.skipped} already existed)`)
      await loadContent()
    } catch (err) {
      console.error('Error seeding articles:', err)
      setError(err.message)
    } finally {
      setSeeding(false)
    }
  }

  const handleArticleTranslate = async (field, sourceLang, targetLang) => {
    const translationKey = `article-${field}-${targetLang}`
    setTranslating(prev => ({ ...prev, [translationKey]: true }))

    try {
      let sourceText = ''
      let context = ''
      
      if (field === 'title') {
        sourceText = editingArticle.title[sourceLang]
        context = 'Blog article title'
      } else if (field === 'excerpt') {
        sourceText = editingArticle.excerpt[sourceLang]
        context = 'Blog article excerpt/summary'
      } else if (field === 'content') {
        sourceText = editingArticle.content[sourceLang]
        context = 'Blog article content (HTML format, preserve HTML tags)'
      } else if (field === 'category') {
        sourceText = editingArticle.category[sourceLang]
        context = 'Article category name'
      }

      if (!sourceText) {
        setError('No text to translate')
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

      setEditingArticle(prev => ({
        ...prev,
        [field]: {
          ...prev[field],
          [targetLang]: translatedText
        }
      }))

      setSuccess('Translated successfully!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      console.error('Translation error:', err)
      setError(err.message || 'Translation failed')
    } finally {
      setTranslating(prev => ({ ...prev, [translationKey]: false }))
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('admin.content.title', language)}</h1>
          <p className="text-gray-600 mt-1">{t('admin.content.subtitle', language)}</p>
        </div>
      </div>

      {/* Status Alerts */}
      {!sanityConfigured && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>{t('admin.content.sanityNotConfigured', language)}</strong>
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>{t('admin.content.error', language)}:</strong> {error}
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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="properties">{t('admin.content.properties', language)}</TabsTrigger>
          <TabsTrigger value="articles">
            <FileText className="h-4 w-4 mr-1" />
            {language === 'cs' ? 'Články' : language === 'it' ? 'Articoli' : 'Articles'}
          </TabsTrigger>
          <TabsTrigger value="regions">{t('admin.content.regions', language)}</TabsTrigger>
          <TabsTrigger value="settings">{t('admin.content.settings', language)}</TabsTrigger>
        </TabsList>

        {/* Properties Tab */}
        <TabsContent value="properties" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">{t('admin.content.propertyManagement', language)}</h2>
            <Button onClick={createNewProperty}>
              <Plus className="h-4 w-4 mr-2" />
              {t('admin.content.addProperty', language)}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6 text-center">
                <Home className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold">{properties.length}</div>
                <div className="text-sm text-gray-600">{t('admin.content.totalProperties', language)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Eye className="h-8 w-8 text-slate-800 mx-auto mb-2" />
                <div className="text-2xl font-bold">{properties.filter(p => p.status === 'available').length}</div>
                <div className="text-sm text-gray-600">{t('admin.content.available', language)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Badge className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                <div className="text-2xl font-bold">{properties.filter(p => p.featured).length}</div>
                <div className="text-sm text-gray-600">{t('admin.content.featured', language)}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t('admin.content.allProperties', language)}</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  <span className="ml-3 text-gray-600">{t('admin.content.loadingProperties', language)}</span>
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
                            {property.location?.city?.name?.en}
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
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{t('admin.content.noProperties', language)}</h3>
                  <p className="text-gray-600 mb-4">
                    {sanityConfigured 
                      ? t('admin.content.getStarted', language)
                      : t('admin.content.configureSanity', language)}
                  </p>
                  {sanityConfigured && (
                    <Button onClick={createNewProperty}>
                      <Plus className="h-4 w-4 mr-2" />
                      {t('admin.content.addFirstProperty', language)}
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Articles Tab */}
        <TabsContent value="articles" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {language === 'cs' ? 'Správa článků' : language === 'it' ? 'Gestione articoli' : 'Article Management'}
            </h2>
            <div className="flex items-center space-x-2">
              {articles.length === 0 && (
                <Button 
                  variant="outline" 
                  onClick={handleSeedArticles}
                  disabled={seeding || !sanityConfigured}
                >
                  {seeding ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {language === 'cs' ? 'Importuji...' : 'Importing...'}
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      {language === 'cs' ? 'Importovat existující články' : language === 'it' ? 'Importa articoli esistenti' : 'Import Existing Articles'}
                    </>
                  )}
                </Button>
              )}
              <Button onClick={createNewArticle} disabled={!sanityConfigured}>
                <Plus className="h-4 w-4 mr-2" />
                {language === 'cs' ? 'Přidat článek' : language === 'it' ? 'Aggiungi articolo' : 'Add Article'}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6 text-center">
                <FileText className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold">{articles.length}</div>
                <div className="text-sm text-gray-600">
                  {language === 'cs' ? 'Celkem článků' : language === 'it' ? 'Articoli totali' : 'Total Articles'}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <BookOpen className="h-8 w-8 text-slate-800 mx-auto mb-2" />
                <div className="text-2xl font-bold">{articles.filter(a => a.articleType === 'blog').length}</div>
                <div className="text-sm text-gray-600">
                  {language === 'cs' ? 'Blogové články' : language === 'it' ? 'Articoli blog' : 'Blog Articles'}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <MapPin className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold">{articles.filter(a => a.articleType === 'region').length}</div>
                <div className="text-sm text-gray-600">
                  {language === 'cs' ? 'Regionální články' : language === 'it' ? 'Articoli regionali' : 'Region Articles'}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>
                {language === 'cs' ? 'Všechny články' : language === 'it' ? 'Tutti gli articoli' : 'All Articles'}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  <span className="ml-3 text-gray-600">
                    {language === 'cs' ? 'Načítám články...' : 'Loading articles...'}
                  </span>
                </div>
              ) : articles.length > 0 ? (
                <div className="space-y-4">
                  {articles.map((article) => (
                    <div key={article._id} className="flex items-center justify-between p-5 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-5 flex-1">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          {article.image ? (
                            <img src={article.image} alt="" className="w-16 h-16 object-cover rounded-lg" />
                          ) : (
                            <FileText className="h-7 w-7 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1.5">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {article.title?.en || article.title?.cs || 'Untitled Article'}
                            </h3>
                            <Badge variant="secondary" className="capitalize text-xs">
                              {article.articleType === 'region' 
                                ? (language === 'cs' ? 'Region' : 'Region') 
                                : 'Blog'}
                            </Badge>
                            {article.category?.en && (
                              <Badge variant="outline" className="text-xs">
                                {article.category[language] || article.category.en}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 truncate mb-1">
                            {article.excerpt?.[language] || article.excerpt?.en || ''}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-gray-400">
                            {article.date && (
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {article.date}
                              </span>
                            )}
                            {article.readTime && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {article.readTime}
                              </span>
                            )}
                            {article.author && (
                              <span>{article.author}</span>
                            )}
                            {article.link && (
                              <span className="flex items-center gap-1 text-blue-500">
                                <LinkIcon className="h-3 w-3" />
                                {article.link}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleEditArticle(article)}
                          disabled={!sanityConfigured}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDeleteArticle(article._id)}
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
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {language === 'cs' ? 'Žádné články nenalezeny' : language === 'it' ? 'Nessun articolo trovato' : 'No articles found'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {language === 'cs' 
                      ? 'Importujte existující články nebo vytvořte nový.' 
                      : 'Import existing articles or create a new one.'}
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <Button variant="outline" onClick={handleSeedArticles} disabled={seeding || !sanityConfigured}>
                      {seeding ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          {language === 'cs' ? 'Importuji...' : 'Importing...'}
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4 mr-2" />
                          {language === 'cs' ? 'Importovat existující' : 'Import Existing'}
                        </>
                      )}
                    </Button>
                    <Button onClick={createNewArticle} disabled={!sanityConfigured}>
                      <Plus className="h-4 w-4 mr-2" />
                      {language === 'cs' ? 'Vytvořit článek' : 'Create Article'}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Regions Tab */}
        <TabsContent value="regions" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">{t('admin.content.regionManagement', language)}</h2>
            <Button disabled={!sanityConfigured}>
              <Plus className="h-4 w-4 mr-2" />
              {t('admin.content.addRegion', language)}
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t('admin.content.allRegions', language)}</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  <span className="ml-3 text-gray-600">{t('admin.content.loadingRegions', language)}</span>
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
                            {region.name?.en || region.name?.it || t('admin.content.unnamedRegion', language)}
                          </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                            <span>{region.country || 'Italy'}</span>
                            <span>{region.propertyCount || 0} {t('admin.content.propertiesCount', language)}</span>
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
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{t('admin.content.noRegions', language)}</h3>
                  <p className="text-gray-600">
                    {sanityConfigured 
                      ? t('admin.content.regionsWillAppear', language)
                      : t('admin.content.configureSanity', language)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <h2 className="text-xl font-semibold">{t('admin.content.platformSettings', language)}</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('admin.content.siteConfiguration', language)}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">{t('admin.content.siteName', language)}</label>
                  <Input defaultValue="Domy v Itálii" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">{t('admin.content.defaultCurrency', language)}</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option value="EUR">EUR (€)</option>
                    <option value="USD">USD ($)</option>
                    <option value="CZK">CZK (Kč)</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">{t('admin.content.contactEmail', language)}</label>
                  <Input defaultValue="info@domyvitalii.com" />
                </div>
                <Button>{t('admin.content.saveSettings', language)}</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('admin.content.emailTemplates', language)}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">{t('admin.content.welcomeEmailSubject', language)}</label>
                  <Input defaultValue="Welcome to Domy v Itálii!" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">{t('admin.content.inquiryAutoResponse', language)}</label>
                  <Textarea 
                    defaultValue="Thank you for your inquiry. We'll get back to you within 24 hours."
                    rows={3}
                  />
                </div>
                <Button>{t('admin.content.updateTemplates', language)}</Button>
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
              {editingItem?._id === 'new' ? t('admin.content.addNewProperty', language) : t('admin.content.editProperty', language)}
            </DialogTitle>
          </DialogHeader>
          {editingItem && (
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">{t('admin.content.basicInfo', language)}</TabsTrigger>
                <TabsTrigger value="images">{t('admin.content.images', language)}</TabsTrigger>
                <TabsTrigger value="description">{t('admin.content.descriptionTab', language)}</TabsTrigger>
                <TabsTrigger value="seo">{t('admin.content.seoPublishing', language)}</TabsTrigger>
              </TabsList>

              {/* Basic Info Tab */}
              <TabsContent value="basic" className="space-y-4 mt-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">{t('admin.content.titleEn', language)} *</label>
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
                    <label className="text-sm font-medium mb-1 block">{t('admin.content.titleCs', language)}</label>
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
                    <label className="text-sm font-medium mb-1 block">{t('admin.content.titleIt', language)}</label>
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
                    <label className="text-sm font-medium mb-1 block">{t('admin.content.propertyType', language)} *</label>
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
                        <SelectItem value="villa">{t('admin.content.propertyTypes.villa', language)}</SelectItem>
                        <SelectItem value="house">{t('admin.content.propertyTypes.house', language)}</SelectItem>
                        <SelectItem value="apartment">{t('admin.content.propertyTypes.apartment', language)}</SelectItem>
                        <SelectItem value="farmhouse">{t('admin.content.propertyTypes.farmhouse', language)}</SelectItem>
                        <SelectItem value="castle">{t('admin.content.propertyTypes.castle', language)}</SelectItem>
                        <SelectItem value="commercial">{t('admin.content.propertyTypes.commercial', language)}</SelectItem>
                        <SelectItem value="land">{t('admin.content.propertyTypes.land', language)}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">{t('admin.content.status', language)} *</label>
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
                        <SelectItem value="available">{t('admin.content.statusOptions.available', language)}</SelectItem>
                        <SelectItem value="reserved">{t('admin.content.statusOptions.reserved', language)}</SelectItem>
                        <SelectItem value="sold">{t('admin.content.statusOptions.sold', language)}</SelectItem>
                        <SelectItem value="draft">{t('admin.content.statusOptions.draft', language)}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div className="col-span-1">
                    <label className="text-sm font-medium mb-1 block">{t('admin.content.price', language)} *</label>
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
                    <label className="text-sm font-medium mb-1 block">{t('admin.content.bedrooms', language)}</label>
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
                    <label className="text-sm font-medium mb-1 block">{t('admin.content.bathrooms', language)}</label>
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
                    <label className="text-sm font-medium mb-1 block">{t('admin.content.area', language)}</label>
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
                  <label className="text-sm font-medium mb-1 block">{t('admin.content.city', language)}</label>
                  <Input
                    value={editingItem.location?.city?.name?.en || ''}
                    onChange={(e) => setEditingItem(prev => ({
                      ...prev,
                      location: {
                        ...prev.location,
                        city: {
                          ...prev.location?.city,
                          name: { ...prev.location?.city?.name, en: e.target.value }
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
                    {t('admin.content.featuredProperty', language)}
                  </label>
                </div>
              </TabsContent>

              {/* Images Tab */}
              <TabsContent value="images" className="space-y-4 mt-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">{t('admin.content.propertyImages', language)}</label>
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
                          <p className="text-sm text-gray-600">{t('admin.content.uploadingImages', language)}</p>
                        </>
                      ) : (
                        <>
                          <Upload className="h-12 w-12 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-600">
                            {t('admin.content.uploadImages', language)}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {t('admin.content.imageFormat', language)}
                          </p>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                {editingItem.images && editingItem.images.length > 0 && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      {t('admin.content.uploadedImages', language)} ({editingItem.images.length})
                    </label>
                    <p className="text-xs text-gray-600 mb-3">
                      {t('admin.content.setMainImage', language)}
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
                  <h3 className="text-sm font-semibold flex items-center">
                    <Tag className="h-5 w-5 mr-2" />
                    {t('admin.content.seoSettings', language)}
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
                  {t('admin.content.cancel', language)}
                </Button>
                <Button 
                  onClick={handleSaveProperty}
                  disabled={saving || !sanityConfigured}
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {t('admin.content.saving', language)}
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {editingItem._id === 'new' ? t('admin.content.createProperty', language) : t('admin.content.saveChanges', language)}
                    </>
                  )}
                </Button>
              </div>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Article Edit Modal */}
      <Dialog open={isArticleModalOpen} onOpenChange={setIsArticleModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {editingArticle?._id === 'new' 
                ? (language === 'cs' ? 'Nový článek' : language === 'it' ? 'Nuovo articolo' : 'New Article')
                : (language === 'cs' ? 'Upravit článek' : language === 'it' ? 'Modifica articolo' : 'Edit Article')}
            </DialogTitle>
          </DialogHeader>
          {editingArticle && (
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">
                  {language === 'cs' ? 'Základní info' : 'Basic Info'}
                </TabsTrigger>
                <TabsTrigger value="content">
                  {language === 'cs' ? 'Obsah' : language === 'it' ? 'Contenuto' : 'Content'}
                </TabsTrigger>
                <TabsTrigger value="meta">
                  {language === 'cs' ? 'Meta & Tagy' : 'Meta & Tags'}
                </TabsTrigger>
              </TabsList>

              {/* Basic Info Tab */}
              <TabsContent value="basic" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      {language === 'cs' ? 'Typ článku' : 'Article Type'} *
                    </label>
                    <Select
                      value={editingArticle.articleType}
                      onValueChange={(value) => setEditingArticle(prev => ({
                        ...prev,
                        articleType: value
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="blog">
                          {language === 'cs' ? 'Blog článek' : 'Blog Article'}
                        </SelectItem>
                        <SelectItem value="region">
                          {language === 'cs' ? 'Regionální článek' : 'Region Article'}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Slug *</label>
                    <Input
                      value={editingArticle.slug}
                      onChange={(e) => setEditingArticle(prev => ({
                        ...prev,
                        slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '-')
                      }))}
                      placeholder="my-article-slug"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      {language === 'cs' ? 'Název (EN)' : 'Title (EN)'} *
                    </label>
                    <Input
                      value={editingArticle.title.en}
                      onChange={(e) => setEditingArticle(prev => ({
                        ...prev,
                        title: { ...prev.title, en: e.target.value }
                      }))}
                      placeholder="Article title in English"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-sm font-medium block">
                        {language === 'cs' ? 'Název (CS)' : 'Title (CS)'}
                      </label>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => handleArticleTranslate('title', 'en', 'cs')}
                        disabled={!editingArticle.title.en || translating['article-title-cs']}
                        className="h-6 text-xs px-2"
                      >
                        {translating['article-title-cs'] ? <Loader2 className="h-3 w-3 animate-spin" /> : <Languages className="h-3 w-3" />}
                      </Button>
                    </div>
                    <Input
                      value={editingArticle.title.cs || ''}
                      onChange={(e) => setEditingArticle(prev => ({
                        ...prev,
                        title: { ...prev.title, cs: e.target.value }
                      }))}
                      placeholder="Název článku v češtině"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-sm font-medium block">
                        {language === 'cs' ? 'Název (IT)' : 'Title (IT)'}
                      </label>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => handleArticleTranslate('title', 'en', 'it')}
                        disabled={!editingArticle.title.en || translating['article-title-it']}
                        className="h-6 text-xs px-2"
                      >
                        {translating['article-title-it'] ? <Loader2 className="h-3 w-3 animate-spin" /> : <Languages className="h-3 w-3" />}
                      </Button>
                    </div>
                    <Input
                      value={editingArticle.title.it || ''}
                      onChange={(e) => setEditingArticle(prev => ({
                        ...prev,
                        title: { ...prev.title, it: e.target.value }
                      }))}
                      placeholder="Titolo dell'articolo in italiano"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      {language === 'cs' ? 'Shrnutí (EN)' : 'Excerpt (EN)'}
                    </label>
                    <Textarea
                      value={editingArticle.excerpt.en || ''}
                      onChange={(e) => setEditingArticle(prev => ({
                        ...prev,
                        excerpt: { ...prev.excerpt, en: e.target.value }
                      }))}
                      rows={3}
                      placeholder="Brief summary in English..."
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-sm font-medium block">
                        {language === 'cs' ? 'Shrnutí (CS)' : 'Excerpt (CS)'}
                      </label>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => handleArticleTranslate('excerpt', 'en', 'cs')}
                        disabled={!editingArticle.excerpt.en || translating['article-excerpt-cs']}
                        className="h-6 text-xs px-2"
                      >
                        {translating['article-excerpt-cs'] ? <Loader2 className="h-3 w-3 animate-spin" /> : <Languages className="h-3 w-3" />}
                      </Button>
                    </div>
                    <Textarea
                      value={editingArticle.excerpt.cs || ''}
                      onChange={(e) => setEditingArticle(prev => ({
                        ...prev,
                        excerpt: { ...prev.excerpt, cs: e.target.value }
                      }))}
                      rows={3}
                      placeholder="Krátké shrnutí v češtině..."
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-sm font-medium block">
                        {language === 'cs' ? 'Shrnutí (IT)' : 'Excerpt (IT)'}
                      </label>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => handleArticleTranslate('excerpt', 'en', 'it')}
                        disabled={!editingArticle.excerpt.en || translating['article-excerpt-it']}
                        className="h-6 text-xs px-2"
                      >
                        {translating['article-excerpt-it'] ? <Loader2 className="h-3 w-3 animate-spin" /> : <Languages className="h-3 w-3" />}
                      </Button>
                    </div>
                    <Textarea
                      value={editingArticle.excerpt.it || ''}
                      onChange={(e) => setEditingArticle(prev => ({
                        ...prev,
                        excerpt: { ...prev.excerpt, it: e.target.value }
                      }))}
                      rows={3}
                      placeholder="Breve riassunto in italiano..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      {language === 'cs' ? 'Datum' : 'Date'}
                    </label>
                    <Input
                      type="date"
                      value={editingArticle.date || ''}
                      onChange={(e) => setEditingArticle(prev => ({
                        ...prev,
                        date: e.target.value
                      }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      {language === 'cs' ? 'Doba čtení' : 'Read Time'}
                    </label>
                    <Input
                      value={editingArticle.readTime || ''}
                      onChange={(e) => setEditingArticle(prev => ({
                        ...prev,
                        readTime: e.target.value
                      }))}
                      placeholder="8 min"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      {language === 'cs' ? 'Autor' : 'Author'}
                    </label>
                    <Input
                      value={editingArticle.author || ''}
                      onChange={(e) => setEditingArticle(prev => ({
                        ...prev,
                        author: e.target.value
                      }))}
                      placeholder="Maria Rossi"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      {language === 'cs' ? 'Odkaz' : 'Link'}
                    </label>
                    <Input
                      value={editingArticle.link || ''}
                      onChange={(e) => setEditingArticle(prev => ({
                        ...prev,
                        link: e.target.value
                      }))}
                      placeholder="/guides/costs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">
                    {language === 'cs' ? 'URL obrázku' : 'Image URL'}
                  </label>
                  <Input
                    value={editingArticle.image || ''}
                    onChange={(e) => setEditingArticle(prev => ({
                      ...prev,
                      image: e.target.value
                    }))}
                    placeholder="https://images.unsplash.com/..."
                  />
                  {editingArticle.image && (
                    <img src={editingArticle.image} alt="Preview" className="mt-2 h-32 object-cover rounded-lg" />
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      {language === 'cs' ? 'Kategorie (EN)' : 'Category (EN)'}
                    </label>
                    <Input
                      value={editingArticle.category?.en || ''}
                      onChange={(e) => setEditingArticle(prev => ({
                        ...prev,
                        category: { ...prev.category, en: e.target.value }
                      }))}
                      placeholder="Guide"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-sm font-medium block">
                        {language === 'cs' ? 'Kategorie (CS)' : 'Category (CS)'}
                      </label>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => handleArticleTranslate('category', 'en', 'cs')}
                        disabled={!editingArticle.category?.en || translating['article-category-cs']}
                        className="h-6 text-xs px-2"
                      >
                        {translating['article-category-cs'] ? <Loader2 className="h-3 w-3 animate-spin" /> : <Languages className="h-3 w-3" />}
                      </Button>
                    </div>
                    <Input
                      value={editingArticle.category?.cs || ''}
                      onChange={(e) => setEditingArticle(prev => ({
                        ...prev,
                        category: { ...prev.category, cs: e.target.value }
                      }))}
                      placeholder="Průvodce"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-sm font-medium block">
                        {language === 'cs' ? 'Kategorie (IT)' : 'Category (IT)'}
                      </label>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => handleArticleTranslate('category', 'en', 'it')}
                        disabled={!editingArticle.category?.en || translating['article-category-it']}
                        className="h-6 text-xs px-2"
                      >
                        {translating['article-category-it'] ? <Loader2 className="h-3 w-3 animate-spin" /> : <Languages className="h-3 w-3" />}
                      </Button>
                    </div>
                    <Input
                      value={editingArticle.category?.it || ''}
                      onChange={(e) => setEditingArticle(prev => ({
                        ...prev,
                        category: { ...prev.category, it: e.target.value }
                      }))}
                      placeholder="Guida"
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Content Tab */}
              <TabsContent value="content" className="space-y-4 mt-4">
                <Alert className="mb-4">
                  <Languages className="h-4 w-4" />
                  <AlertDescription>
                    <strong>
                      {language === 'cs' ? 'AI Překlad:' : 'AI Translation:'}
                    </strong>{' '}
                    {language === 'cs' 
                      ? 'Vyplňte anglický obsah a poté použijte tlačítka překladu pro automatický překlad.' 
                      : 'Fill in the English content, then use the translate buttons. HTML tags are preserved.'}
                  </AlertDescription>
                </Alert>

                <div>
                  <label className="text-sm font-medium mb-1 block">Content (English) - HTML</label>
                  <Textarea
                    value={editingArticle.content?.en || ''}
                    onChange={(e) => setEditingArticle(prev => ({
                      ...prev,
                      content: { ...(prev.content || {}), en: e.target.value }
                    }))}
                    rows={10}
                    placeholder="<h2>Article heading</h2>\n<p>Article content...</p>"
                    className="resize-y font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {(editingArticle.content?.en || '').length} characters
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-sm font-medium block">Content (Czech) - HTML</label>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => handleArticleTranslate('content', 'en', 'cs')}
                      disabled={!editingArticle.content?.en || translating['article-content-cs']}
                      className="h-7"
                    >
                      {translating['article-content-cs'] ? (
                        <>
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          {language === 'cs' ? 'Překládám...' : 'Translating...'}
                        </>
                      ) : (
                        <>
                          <Languages className="h-3 w-3 mr-1" />
                          {language === 'cs' ? 'Přeložit z EN' : 'Translate from EN'}
                        </>
                      )}
                    </Button>
                  </div>
                  <Textarea
                    value={editingArticle.content?.cs || ''}
                    onChange={(e) => setEditingArticle(prev => ({
                      ...prev,
                      content: { ...(prev.content || {}), cs: e.target.value }
                    }))}
                    rows={10}
                    placeholder="<h2>Nadpis článku</h2>\n<p>Obsah článku...</p>"
                    className="resize-y font-mono text-sm"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-sm font-medium block">Content (Italian) - HTML</label>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => handleArticleTranslate('content', 'en', 'it')}
                      disabled={!editingArticle.content?.en || translating['article-content-it']}
                      className="h-7"
                    >
                      {translating['article-content-it'] ? (
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
                    value={editingArticle.content?.it || ''}
                    onChange={(e) => setEditingArticle(prev => ({
                      ...prev,
                      content: { ...(prev.content || {}), it: e.target.value }
                    }))}
                    rows={10}
                    placeholder="<h2>Titolo dell'articolo</h2>\n<p>Contenuto dell'articolo...</p>"
                    className="resize-y font-mono text-sm"
                  />
                </div>
              </TabsContent>

              {/* Meta & Tags Tab */}
              <TabsContent value="meta" className="space-y-4 mt-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Tags</label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleAddTag()
                        }
                      }}
                      placeholder={language === 'cs' ? 'Zadejte tag a stiskněte Enter' : 'Enter tag and press Enter'}
                    />
                    <Button type="button" onClick={handleAddTag} variant="secondary">
                      <Plus className="h-4 w-4 mr-1" />
                      {language === 'cs' ? 'Přidat' : 'Add'}
                    </Button>
                  </div>
                  {editingArticle.tags && editingArticle.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {editingArticle.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="px-3 py-1">
                          {tag}
                          <button
                            onClick={() => handleRemoveTag(index)}
                            className="ml-2 hover:text-red-500"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {editingArticle.articleType === 'region' && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      {language === 'cs' ? 'Související regiony (slug, oddělené čárkou)' : 'Related Regions (slugs, comma-separated)'}
                    </label>
                    <Input
                      value={(editingArticle.relatedRegions || []).join(', ')}
                      onChange={(e) => setEditingArticle(prev => ({
                        ...prev,
                        relatedRegions: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                      }))}
                      placeholder="lombardy, tuscany, liguria"
                    />
                  </div>
                )}
              </TabsContent>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-2 pt-6 border-t mt-6">
                <Button variant="outline" onClick={() => setIsArticleModalOpen(false)} disabled={saving}>
                  {language === 'cs' ? 'Zrušit' : 'Cancel'}
                </Button>
                <Button 
                  onClick={handleSaveArticle}
                  disabled={saving || !sanityConfigured}
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {language === 'cs' ? 'Ukládám...' : 'Saving...'}
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {editingArticle._id === 'new' 
                        ? (language === 'cs' ? 'Vytvořit článek' : 'Create Article')
                        : (language === 'cs' ? 'Uložit změny' : 'Save Changes')}
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
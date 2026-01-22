'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  FileText,
  Download,
  Search,
  Folder,
  File,
  FileCheck,
  FileSpreadsheet,
  FileImage,
  Eye,
  Clock
} from 'lucide-react'
import { supabase } from '../../lib/supabase'

export default function DocumentsPage() {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All Documents')
  const [categories, setCategories] = useState(['All Documents'])

  useEffect(() => {
    loadDocuments()
  }, [])

  const loadDocuments = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('premium_documents')
        .select('*')
        .order('uploaded_at', { ascending: false })

      if (error) {
        console.error('Error loading documents:', error)
      } else {
        setDocuments(data || [])
        
        // Extract unique categories
        const uniqueCategories = ['All Documents', ...new Set((data || []).map(d => d.category))]
        setCategories(uniqueCategories)
      }
    } catch (error) {
      console.error('Error loading documents:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (doc) => {
    // Log access
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('document_access_logs').insert({
          document_id: doc.id,
          user_id: user.id,
          action: 'download'
        })
      }
    } catch (err) {
      console.error('Error logging access:', err)
    }

    // Open URL
    window.open(doc.file_url, '_blank')
  }

  const handlePreview = async (doc) => {
    // Log access
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('document_access_logs').insert({
          document_id: doc.id,
          user_id: user.id,
          action: 'preview'
        })
      }
    } catch (err) {
      console.error('Error logging access:', err)
    }
    
    // For now, preview is same as download/open
    window.open(doc.file_url, '_blank')
  }

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'All Documents' || doc.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getFileIcon = (type) => {
    if (['PDF'].includes(type)) return FileText
    if (['XLS', 'XLSX', 'CSV'].includes(type)) return FileSpreadsheet
    if (['JPG', 'JPEG', 'PNG', 'WEBP'].includes(type)) return FileImage
    if (['DOC', 'DOCX'].includes(type)) return FileText
    return File
  }

  return (
    <div className="space-y-6" data-testid="documents-container">
      {/* Header */}
      <div data-testid="documents-header">
        <h1 className="text-3xl font-bold text-white flex items-center space-x-3" data-testid="documents-title">
          <Folder className="h-8 w-8 text-copper-400" data-testid="documents-title-icon" />
          <span data-testid="documents-title-text">Document Library</span>
        </h1>
        <p className="text-gray-400 mt-2" data-testid="documents-subtitle">
          Access contracts, guides, templates, and important documents
        </p>
      </div>

      {/* Search and Filters */}
      <Card className="bg-slate-800 border-copper-400/20" data-testid="documents-search-card">
        <CardContent className="p-6" data-testid="documents-search-content">
          <div className="flex flex-col lg:flex-row gap-4" data-testid="documents-search-layout">
            <div className="flex-1 relative" data-testid="documents-search-field">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" data-testid="documents-search-icon" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search documents..."
                className="pl-10 bg-slate-900 border-copper-400/20 text-white"
                data-testid="documents-search-input"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0" data-testid="documents-category-filters">
              {categories.map((category) => (
                <Button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  variant="outline"
                  size="sm"
                  className={`whitespace-nowrap ${
                    selectedCategory === category
                      ? 'bg-copper-600 text-white border-copper-600'
                      : 'bg-transparent border-copper-400/20 text-gray-300 hover:bg-copper-400/10'
                  }`}
                  data-testid={`documents-category-${category.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" data-testid="documents-stats-grid">
        <Card className="bg-slate-800 border-copper-400/20" data-testid="documents-stat-total">
          <CardContent className="p-6" data-testid="documents-stat-total-content">
            <div className="flex items-center justify-between" data-testid="documents-stat-total-layout">
              <div data-testid="documents-stat-total-info">
                <p className="text-sm font-medium text-gray-400" data-testid="documents-stat-total-label">Total Documents</p>
                <p className="text-3xl font-bold text-white mt-2" data-testid="documents-stat-total-value">{documents.length}</p>
              </div>
              <div className="p-3 rounded-full bg-copper-400/10" data-testid="documents-stat-total-icon">
                <FileText className="h-6 w-6 text-copper-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-copper-400/20" data-testid="documents-stat-categories">
          <CardContent className="p-6" data-testid="documents-stat-categories-content">
            <div className="flex items-center justify-between" data-testid="documents-stat-categories-layout">
              <div data-testid="documents-stat-categories-info">
                <p className="text-sm font-medium text-gray-400" data-testid="documents-stat-categories-label">Categories</p>
                <p className="text-3xl font-bold text-white mt-2" data-testid="documents-stat-categories-value">{Math.max(0, categories.length - 1)}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-400/10" data-testid="documents-stat-categories-icon">
                <Folder className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-copper-400/20" data-testid="documents-stat-downloads">
          <CardContent className="p-6" data-testid="documents-stat-downloads-content">
            <div className="flex items-center justify-between" data-testid="documents-stat-downloads-layout">
              <div data-testid="documents-stat-downloads-info">
                <p className="text-sm font-medium text-gray-400" data-testid="documents-stat-downloads-label">New This Month</p>
                <p className="text-3xl font-bold text-white mt-2" data-testid="documents-stat-downloads-value">
                  {documents.filter(d => {
                    const date = new Date(d.uploaded_at)
                    const now = new Date()
                    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
                  }).length}
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-400/10" data-testid="documents-stat-downloads-icon">
                <Clock className="h-6 w-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Documents List */}
      <div className="space-y-3" data-testid="documents-list">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-copper-400 mx-auto"></div>
          </div>
        ) : filteredDocuments.length > 0 ? (
          filteredDocuments.map((doc) => {
            const Icon = getFileIcon(doc.file_type)
            return (
              <Card key={doc.id} className="bg-slate-800 border-copper-400/20 hover:border-copper-400/50 transition-all" data-testid={`document-${doc.id}`}>
                <CardContent className="p-6" data-testid={`document-${doc.id}-content`}>
                  <div className="flex items-center gap-4" data-testid={`document-${doc.id}-layout`}>
                    {/* Icon */}
                    <div className="flex-shrink-0 w-12 h-12 bg-copper-400/10 rounded-lg flex items-center justify-center" data-testid={`document-${doc.id}-icon-container`}>
                      <Icon className="h-6 w-6 text-copper-400" data-testid={`document-${doc.id}-icon`} />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0" data-testid={`document-${doc.id}-details`}>
                      <h3 className="font-semibold text-white mb-1" data-testid={`document-${doc.id}-name`}>{doc.name}</h3>
                      <p className="text-sm text-gray-400 mb-2" data-testid={`document-${doc.id}-description`}>{doc.description}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-500" data-testid={`document-${doc.id}-metadata`}>
                        <Badge variant="outline" className="border-copper-400/30 text-copper-400" data-testid={`document-${doc.id}-category`}>
                          {doc.category}
                        </Badge>
                        <span data-testid={`document-${doc.id}-type`}>{doc.file_type}</span>
                        <span data-testid={`document-${doc.id}-size`}>{doc.file_size}</span>
                        <span className="flex items-center" data-testid={`document-${doc.id}-date`}>
                          <Clock className="h-3 w-3 mr-1" data-testid={`document-${doc.id}-date-icon`} />
                          {formatDate(doc.uploaded_at)}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2" data-testid={`document-${doc.id}-actions`}>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePreview(doc)}
                        className="bg-transparent border-copper-400/20 text-gray-300 hover:bg-copper-400/10"
                        data-testid={`document-${doc.id}-preview`}
                      >
                        <Eye className="h-4 w-4 mr-2" data-testid={`document-${doc.id}-preview-icon`} />
                        Preview
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleDownload(doc)}
                        className="bg-copper-600 hover:bg-copper-700"
                        data-testid={`document-${doc.id}-download`}
                      >
                        <Download className="h-4 w-4 mr-2" data-testid={`document-${doc.id}-download-icon`} />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        ) : (
          <Card className="bg-slate-800 border-copper-400/20" data-testid="documents-empty-state">
            <CardContent className="p-12 text-center" data-testid="documents-empty-content">
              <FileText className="h-12 w-12 text-gray-600 mx-auto mb-4" data-testid="documents-empty-icon" />
              <p className="text-gray-400" data-testid="documents-empty-message">No documents found matching your search.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

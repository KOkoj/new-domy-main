'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  Share2,
  Clock
} from 'lucide-react'

const DOCUMENTS = [
  {
    id: 1,
    name: 'Purchase Agreement Template',
    type: 'PDF',
    category: 'Legal Documents',
    size: '2.4 MB',
    uploadedAt: '2025-09-20',
    icon: FileText,
    description: 'Standard Italian property purchase agreement template'
  },
  {
    id: 2,
    name: 'Tax Guide for Foreign Buyers',
    type: 'PDF',
    category: 'Tax Documents',
    size: '1.8 MB',
    uploadedAt: '2025-09-18',
    icon: FileText,
    description: 'Comprehensive tax guide for international property buyers'
  },
  {
    id: 3,
    name: 'Property Inspection Checklist',
    type: 'XLSX',
    category: 'Inspection',
    size: '245 KB',
    uploadedAt: '2025-09-15',
    icon: FileSpreadsheet,
    description: 'Detailed checklist for property inspections'
  },
  {
    id: 4,
    name: 'Renovation Permit Application',
    type: 'PDF',
    category: 'Legal Documents',
    size: '890 KB',
    uploadedAt: '2025-09-10',
    icon: FileCheck,
    description: 'Template for renovation permit applications'
  },
  {
    id: 5,
    name: 'Italian Property Market Report Q3 2025',
    type: 'PDF',
    category: 'Market Reports',
    size: '5.2 MB',
    uploadedAt: '2025-09-05',
    icon: FileText,
    description: 'Quarterly market analysis and trends'
  },
  {
    id: 6,
    name: 'Mortgage Application Guide',
    type: 'PDF',
    category: 'Financing',
    size: '1.5 MB',
    uploadedAt: '2025-08-28',
    icon: FileText,
    description: 'Step-by-step mortgage application process'
  },
  {
    id: 7,
    name: 'Regional Investment Comparison',
    type: 'XLSX',
    category: 'Market Reports',
    size: '456 KB',
    uploadedAt: '2025-08-20',
    icon: FileSpreadsheet,
    description: 'Comparative analysis of Italian regions for investment'
  },
  {
    id: 8,
    name: 'Property Insurance Overview',
    type: 'PDF',
    category: 'Insurance',
    size: '1.1 MB',
    uploadedAt: '2025-08-15',
    icon: FileText,
    description: 'Guide to property insurance in Italy'
  }
]

const CATEGORIES = [
  'All Documents',
  'Legal Documents',
  'Tax Documents',
  'Financing',
  'Market Reports',
  'Inspection',
  'Insurance'
]

export default function DocumentsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All Documents')

  const filteredDocuments = DOCUMENTS.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.description.toLowerCase().includes(searchQuery.toLowerCase())
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

  const handleDownload = (doc) => {
    // TODO: Implement actual download
    alert(`Downloading ${doc.name}...`)
  }

  const handlePreview = (doc) => {
    // TODO: Implement document preview
    alert(`Opening preview for ${doc.name}...`)
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
              {CATEGORIES.map((category) => (
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
                <p className="text-3xl font-bold text-white mt-2" data-testid="documents-stat-total-value">{DOCUMENTS.length}</p>
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
                <p className="text-3xl font-bold text-white mt-2" data-testid="documents-stat-categories-value">{CATEGORIES.length - 1}</p>
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
                <p className="text-sm font-medium text-gray-400" data-testid="documents-stat-downloads-label">Downloads</p>
                <p className="text-3xl font-bold text-white mt-2" data-testid="documents-stat-downloads-value">47</p>
              </div>
              <div className="p-3 rounded-full bg-green-400/10" data-testid="documents-stat-downloads-icon">
                <Download className="h-6 w-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Documents List */}
      <div className="space-y-3" data-testid="documents-list">
        {filteredDocuments.length > 0 ? (
          filteredDocuments.map((doc) => {
            const Icon = doc.icon
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
                        <span data-testid={`document-${doc.id}-type`}>{doc.type}</span>
                        <span data-testid={`document-${doc.id}-size`}>{doc.size}</span>
                        <span className="flex items-center" data-testid={`document-${doc.id}-date`}>
                          <Clock className="h-3 w-3 mr-1" data-testid={`document-${doc.id}-date-icon`} />
                          {formatDate(doc.uploadedAt)}
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


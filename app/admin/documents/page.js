'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  FileText, 
  Upload, 
  Trash2, 
  Search, 
  File, 
  FileSpreadsheet,
  FileImage,
  Eye,
  Download,
  CheckCircle,
  AlertCircle,
  Plus
} from 'lucide-react'
import { supabase } from '../../../lib/supabase'

const STORAGE_BUCKET = 'documents'

export default function DocumentManagement() {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [newDoc, setNewDoc] = useState({
    name: '',
    description: '',
    category: 'Legal Documents',
    file: null
  })

  const CATEGORIES = [
    'Legal Documents',
    'Tax Documents',
    'Financing',
    'Market Reports',
    'Inspection',
    'Insurance',
    'Other'
  ]

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
        // If table doesn't exist yet, we might get an error. 
        // In a real scenario we'd handle this better, but for now we'll just log it.
        console.error('Error loading documents:', error)
      } else {
        setDocuments(data || [])
      }
    } catch (error) {
      console.error('Error loading documents:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setNewDoc({ ...newDoc, file })
    }
  }

  const handleUpload = async () => {
    if (!newDoc.name || !newDoc.category || !newDoc.file) return

    setIsUploading(true)
    try {
      if (!supabase) {
        throw new Error('Supabase is not configured')
      }

      const safeFileName = newDoc.file.name.replace(/\s+/g, '-')
      const storagePath = `premium/${Date.now()}_${safeFileName}`

      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(storagePath, newDoc.file, {
          cacheControl: '3600',
          upsert: false,
          contentType: newDoc.file.type || undefined
        })

      if (uploadError) {
        throw uploadError
      }

      const { data: publicUrlData } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(storagePath)

      const fileUrl = publicUrlData?.publicUrl || storagePath
      const fileSize = `${(newDoc.file.size / 1024 / 1024).toFixed(2)} MB`
      const fileType = newDoc.file.name.split('.').pop().toUpperCase()

      // 2. Insert metadata into database
      const { data, error } = await supabase
        .from('premium_documents')
        .insert({
          name: newDoc.name,
          description: newDoc.description,
          category: newDoc.category,
          file_url: fileUrl,
          file_size: fileSize,
          file_type: fileType,
          is_public: false, // Default to premium only
          uploaded_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error

      setDocuments([data, ...documents])
      setUploadDialogOpen(false)
      setNewDoc({ name: '', description: '', category: 'Legal Documents', file: null })
      
    } catch (error) {
      console.error('Error uploading document:', error)
      alert('Failed to upload document: ' + (error.message || 'Unknown error'))
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this document?')) return

    try {
      const { error } = await supabase
        .from('premium_documents')
        .delete()
        .eq('id', id)

      if (error) throw error

      setDocuments(documents.filter(doc => doc.id !== id))
    } catch (error) {
      console.error('Error deleting document:', error)
      alert('Failed to delete document')
    }
  }

  const getFileIcon = (type) => {
    if (['PDF'].includes(type)) return FileText
    if (['XLS', 'XLSX', 'CSV'].includes(type)) return FileSpreadsheet
    if (['JPG', 'JPEG', 'PNG', 'WEBP'].includes(type)) return FileImage
    return File
  }

  const filteredDocuments = documents.filter(doc => 
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Document Management</h1>
          <p className="text-gray-600 mt-1">Manage premium documents for club members</p>
        </div>
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Upload className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload New Document</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="name">Document Name</Label>
                <Input 
                  id="name" 
                  value={newDoc.name}
                  onChange={(e) => setNewDoc({ ...newDoc, name: e.target.value })}
                  placeholder="e.g. Purchase Agreement Template"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input 
                  id="description" 
                  value={newDoc.description}
                  onChange={(e) => setNewDoc({ ...newDoc, description: e.target.value })}
                  placeholder="Brief description of the document content"
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={newDoc.category}
                  onChange={(e) => setNewDoc({ ...newDoc, category: e.target.value })}
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="file">File</Label>
                <Input 
                  id="file" 
                  type="file"
                  onChange={handleFileChange}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleUpload} disabled={isUploading || !newDoc.file || !newDoc.name}>
                {isUploading ? 'Uploading...' : 'Upload'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search documents..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading documents...</div>
          ) : filteredDocuments.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
              <p className="text-gray-600">Upload a document to get started.</p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredDocuments.map((doc) => {
                const Icon = getFileIcon(doc.file_type)
                return (
                  <div key={doc.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Icon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{doc.name}</h3>
                        <p className="text-sm text-gray-500">{doc.description}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="secondary" className="text-xs">{doc.category}</Badge>
                          <span className="text-xs text-gray-400">• {doc.file_size}</span>
                          <span className="text-xs text-gray-400">• {new Date(doc.uploaded_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => window.open(doc.file_url, '_blank')}>
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(doc.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

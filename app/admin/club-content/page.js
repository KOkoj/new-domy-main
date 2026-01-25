'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Video, 
  FileText, 
  BookOpen, 
  Plus, 
  Edit, 
  Trash2, 
  Loader2, 
  Search,
  Upload,
  Link as LinkIcon,
  Eye,
  Clock,
  Calendar
} from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import { t } from '@/lib/translations'

export default function ClubContentManagement() {
  const [content, setContent] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
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

  const STORAGE_BUCKET = 'documents' // Using the same bucket for now, ideally 'premium-content'

  useEffect(() => {
    loadContent()
  }, [])

  const loadContent = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('premium_content')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setContent(data || [])
    } catch (err) {
      console.error('Error loading content:', err)
      setError('Failed to load content')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateNew = () => {
    setEditingItem({
      title: '',
      description: '',
      content_type: 'video', // video, guide, article
      category: 'Guides',
      thumbnail_url: '',
      content_url: '', // for video links or article text
      file_url: '', // for guide downloads
      duration: '',
      pages: 0,
      read_time: '',
      author: '',
      is_featured: false
    })
    setIsModalOpen(true)
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    setIsModalOpen(true)
  }

  const handleDelete = async (id) => {
    if (!confirm(t('admin.clubContent.deleteConfirm', language))) return

    try {
      const { error } = await supabase
        .from('premium_content')
        .delete()
        .eq('id', id)

      if (error) throw error
      await loadContent()
    } catch (err) {
      console.error('Error deleting item:', err)
      setError(t('admin.clubContent.deleteFailed', language))
    }
  }

  const handleFileUpload = async (e, field) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `premium-content/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(filePath)

      setEditingItem(prev => ({ ...prev, [field]: publicUrl }))
    } catch (err) {
      console.error('Error uploading file:', err)
      setError('Failed to upload file')
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    if (!editingItem.title || !editingItem.content_type) {
      setError('Title and Content Type are required')
      return
    }

    setSaving(true)
    try {
      // Prepare data for save
      const dataToSave = {
        title: editingItem.title,
        description: editingItem.description,
        content_type: editingItem.content_type,
        category: editingItem.category,
        thumbnail_url: editingItem.thumbnail_url,
        content_url: editingItem.content_url,
        file_url: editingItem.file_url,
        duration: editingItem.duration,
        pages: parseInt(editingItem.pages) || 0,
        read_time: editingItem.read_time,
        author: editingItem.author,
        is_featured: editingItem.is_featured,
        published_at: editingItem.published_at || new Date().toISOString()
      }

      if (editingItem.id) {
        const { error } = await supabase
          .from('premium_content')
          .update(dataToSave)
          .eq('id', editingItem.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('premium_content')
          .insert([dataToSave])
        if (error) throw error
      }

      setIsModalOpen(false)
      await loadContent()
    } catch (err) {
      console.error('Error saving content:', err)
      setError('Failed to save content')
    } finally {
      setSaving(false)
    }
  }

  const filteredContent = content.filter(item => 
    item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getTypeIcon = (type) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />
      case 'guide': return <BookOpen className="h-4 w-4" />
      case 'article': return <FileText className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('admin.clubContent.title', language)}</h1>
          <p className="text-gray-600 mt-1">{t('admin.clubContent.subtitle', language)}</p>
        </div>
        <Button onClick={handleCreateNew} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          {t('admin.clubContent.addContent', language)}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder={t('admin.clubContent.searchPlaceholder', language)}
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
              <p className="text-gray-500 mt-2">{t('admin.clubContent.loadingContent', language)}</p>
            </div>
          ) : filteredContent.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Video className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <h3 className="text-lg font-medium text-gray-900">{t('admin.clubContent.noContent', language)}</h3>
              <p className="text-gray-500 mb-4">{t('admin.clubContent.getStarted', language)}</p>
              <Button onClick={handleCreateNew} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                {t('admin.clubContent.addContent', language)}
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredContent.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                      {getTypeIcon(item.content_type)}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{item.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Badge variant="secondary" className="capitalize">
                          {item.content_type}
                        </Badge>
                        <span>•</span>
                        <span>{item.category}</span>
                        {item.author && (
                          <>
                            <span>•</span>
                            <span>{item.author}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem?.id ? t('admin.clubContent.editContent', language) : t('admin.clubContent.addNewContent', language)}</DialogTitle>
          </DialogHeader>
          
          {editingItem && (
            <div className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('admin.clubContent.contentType', language)}</label>
                  <Select 
                    value={editingItem.content_type} 
                    onValueChange={(val) => setEditingItem({...editingItem, content_type: val})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="video">{t('admin.clubContent.video', language)}</SelectItem>
                      <SelectItem value="guide">{t('admin.clubContent.guide', language)}</SelectItem>
                      <SelectItem value="article">{t('admin.clubContent.article', language)}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('admin.clubContent.category', language)}</label>
                  <Input 
                    value={editingItem.category} 
                    onChange={(e) => setEditingItem({...editingItem, category: e.target.value})}
                    placeholder={t('admin.clubContent.categoryPlaceholder', language)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t('admin.clubContent.title', language)}</label>
                <Input 
                  value={editingItem.title} 
                  onChange={(e) => setEditingItem({...editingItem, title: e.target.value})}
                  placeholder={t('admin.clubContent.titlePlaceholder', language)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t('admin.clubContent.description', language)}</label>
                <Textarea 
                  value={editingItem.description} 
                  onChange={(e) => setEditingItem({...editingItem, description: e.target.value})}
                  placeholder={t('admin.clubContent.descriptionPlaceholder', language)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t('admin.clubContent.thumbnailImage', language)}</label>
                <div className="flex gap-2">
                  <Input 
                    value={editingItem.thumbnail_url || ''} 
                    onChange={(e) => setEditingItem({...editingItem, thumbnail_url: e.target.value})}
                    placeholder="https://..."
                  />
                  <div className="relative">
                    <input
                      type="file"
                      id="thumbnail-upload"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'thumbnail_url')}
                      disabled={uploading}
                    />
                    <Button variant="outline" size="icon" asChild disabled={uploading}>
                      <label htmlFor="thumbnail-upload" className="cursor-pointer">
                        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                      </label>
                    </Button>
                  </div>
                </div>
              </div>

              {editingItem.content_type === 'video' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('admin.clubContent.videoUrl', language)}</label>
                    <Input 
                      value={editingItem.content_url || ''} 
                      onChange={(e) => setEditingItem({...editingItem, content_url: e.target.value})}
                      placeholder={t('admin.clubContent.videoUrlPlaceholder', language)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('admin.clubContent.duration', language)}</label>
                    <Input 
                      value={editingItem.duration || ''} 
                      onChange={(e) => setEditingItem({...editingItem, duration: e.target.value})}
                      placeholder={t('admin.clubContent.durationPlaceholder', language)}
                    />
                  </div>
                </div>
              )}

              {editingItem.content_type === 'guide' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('admin.clubContent.pdfFileUrl', language)}</label>
                    <div className="flex gap-2">
                      <Input 
                        value={editingItem.file_url || ''} 
                        onChange={(e) => setEditingItem({...editingItem, file_url: e.target.value})}
                        placeholder="https://..."
                      />
                      <div className="relative">
                        <input
                          type="file"
                          id="file-upload"
                          className="hidden"
                          accept=".pdf"
                          onChange={(e) => handleFileUpload(e, 'file_url')}
                          disabled={uploading}
                        />
                        <Button variant="outline" size="icon" asChild disabled={uploading}>
                          <label htmlFor="file-upload" className="cursor-pointer">
                            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                          </label>
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('admin.clubContent.pages', language)}</label>
                    <Input 
                      type="number"
                      value={editingItem.pages || ''} 
                      onChange={(e) => setEditingItem({...editingItem, pages: e.target.value})}
                      placeholder={t('admin.clubContent.pagesPlaceholder', language)}
                    />
                  </div>
                </div>
              )}

              {editingItem.content_type === 'article' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('admin.clubContent.readTime', language)}</label>
                    <Input 
                      value={editingItem.read_time || ''} 
                      onChange={(e) => setEditingItem({...editingItem, read_time: e.target.value})}
                      placeholder={t('admin.clubContent.readTimePlaceholder', language)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('admin.clubContent.author', language)}</label>
                    <Input 
                      value={editingItem.author || ''} 
                      onChange={(e) => setEditingItem({...editingItem, author: e.target.value})}
                      placeholder={t('admin.clubContent.authorPlaceholder', language)}
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={saving}>
                  {t('admin.clubContent.cancel', language)}
                </Button>
                <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
                  {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {t('admin.clubContent.saveContent', language)}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

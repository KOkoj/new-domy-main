'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { supabase } from '../../../lib/supabase'
import { t } from '../../../lib/translations'
import {
  FileText,
  BookOpen,
  Download,
  Play,
  Clock,
  Eye,
  Search,
  TrendingUp,
  Home,
  MapPin,
  Video,
  X
} from 'lucide-react'

const videoCategories = ['All', 'Market Insights', 'Property Tours', 'Renovation', 'Lifestyle', 'Guides', 'Case Studies']

export default function ContentPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedVideoCategory, setSelectedVideoCategory] = useState('All')
  const [language, setLanguage] = useState('cs')

  const [content, setContent] = useState({ videos: [], guides: [], articles: [] })
  const [loading, setLoading] = useState(true)

  // Viewer States
  const [viewingItem, setViewingItem] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    loadContent()
    
    // Load language
    const savedLanguage = localStorage.getItem('preferred-language')
    if (savedLanguage && (savedLanguage === 'cs' || savedLanguage === 'en')) {
      setLanguage(savedLanguage)
    }
    
    const handleStorageChange = () => {
      const newLang = localStorage.getItem('preferred-language')
      if (newLang && (newLang === 'cs' || newLang === 'en') && newLang !== language) {
        setLanguage(newLang)
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    const interval = setInterval(handleStorageChange, 1000)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [language])

  const loadContent = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('premium_content')
        .select('*')
        .order('published_at', { ascending: false })

      if (error) throw error

      // Organize content by type
      const organized = {
        videos: [],
        guides: [],
        articles: []
      }

      const contentData = data || []

      contentData.forEach(item => {
        if (!item) return
        if (item.content_type === 'video') organized.videos.push(item)
        else if (item.content_type === 'guide') {
          let Icon = BookOpen
          if (item.category === 'Market Reports') Icon = TrendingUp
          else if (item.category === 'Renovation') Icon = Home
          else if (item.category === 'Lifestyle') Icon = MapPin
          
          organized.guides.push({ ...item, icon: Icon })
        }
        else if (item.content_type === 'article') organized.articles.push(item)
      })

      setContent(organized)
    } catch (error) {
      console.error('Error loading content:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenItem = (item) => {
    if (item.content_type === 'guide' && item.file_url) {
      // For guides, direct download/open
      window.open(item.file_url, '_blank')
    } else {
      // For videos and articles, open modal
      setViewingItem(item)
      setIsModalOpen(true)
    }
    
    // Log view
    logView(item.id)
  }

  const logView = async (contentId) => {
    try {
      await supabase.rpc('increment_content_view', { content_id: contentId })
      // Also log to content_access_logs if needed, but simple counter is often enough
    } catch (e) {
      // Ignore logging errors
    }
  }

  const filteredVideos = (content.videos || []).filter(video => 
    (selectedVideoCategory === 'All' || video.category === selectedVideoCategory) &&
    ((video.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
     (video.description?.toLowerCase() || '').includes(searchQuery.toLowerCase()))
  )

  const formatDate = (dateString) => {
    if (!dateString) return ''
    try {
      const date = new Date(dateString)
      // Check for Invalid Date
      if (isNaN(date.getTime())) return ''
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      })
    } catch (e) {
      return ''
    }
  }

  // Helper to extract YouTube ID
  const getYouTubeId = (url) => {
    if (!url) return null
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return (match && match[2].length === 11) ? match[2] : null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center space-x-3">
          <Video className="h-8 w-8 text-copper-400" />
          <span>{t('club.contentPage.title', language)}</span>
        </h1>
        <p className="text-gray-400 mt-2">
          {t('club.contentPage.subtitle', language)}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800 border-copper-400/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">{t('club.contentPage.videos', language)}</p>
                <p className="text-3xl font-bold text-white mt-2">{content.videos.length}</p>
              </div>
              <div className="p-3 rounded-full bg-copper-400/10">
                <Video className="h-6 w-6 text-copper-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-copper-400/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">{t('club.contentPage.guides', language)}</p>
                <p className="text-3xl font-bold text-white mt-2">{content.guides.length}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-400/10">
                <BookOpen className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-copper-400/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">{t('club.contentPage.articles', language)}</p>
                <p className="text-3xl font-bold text-white mt-2">{content.articles.length}</p>
              </div>
              <div className="p-3 rounded-full bg-green-400/10">
                <FileText className="h-6 w-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-copper-400/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">{t('club.contentPage.totalViews', language)}</p>
                <p className="text-3xl font-bold text-white mt-2">
                  {/* Calculate total views */}
                  {[...content.videos, ...content.articles].reduce((acc, item) => acc + (item.view_count || 0), 0)}
                </p>
              </div>
              <div className="p-3 rounded-full bg-purple-400/10">
                <Eye className="h-6 w-6 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="bg-slate-800 border-copper-400/20">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('club.contentPage.searchPlaceholder', language)}
              className="pl-10 bg-slate-900 border-copper-400/20 text-white"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="videos" className="w-full">
        <TabsList className="bg-slate-800 border border-copper-400/20">
          <TabsTrigger value="videos" className="data-[state=active]:bg-copper-600">
            <Video className="h-4 w-4 mr-2" />
            {t('club.contentPage.videos', language)}
          </TabsTrigger>
          <TabsTrigger value="guides" className="data-[state=active]:bg-copper-600">
            <BookOpen className="h-4 w-4 mr-2" />
            {t('club.contentPage.guides', language)}
          </TabsTrigger>
          <TabsTrigger value="articles" className="data-[state=active]:bg-copper-600">
            <FileText className="h-4 w-4 mr-2" />
            {t('club.contentPage.articles', language)}
          </TabsTrigger>
        </TabsList>

        {/* Videos Tab */}
        <TabsContent value="videos" className="mt-6 space-y-4">
          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {videoCategories.map((category) => (
              <Button
                key={category}
                onClick={() => setSelectedVideoCategory(category)}
                variant="outline"
                size="sm"
                className={`whitespace-nowrap ${
                  selectedVideoCategory === category
                    ? 'bg-copper-600 text-white border-copper-600'
                    : 'bg-transparent border-copper-400/20 text-gray-300 hover:bg-copper-400/10'
                }`}
              >
                {category === 'All' ? t('club.contentPage.all', language) : category}
              </Button>
            ))}
          </div>

          {filteredVideos && filteredVideos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredVideos.map((video) => (
              <Card 
                key={video.id} 
                className="bg-slate-800 border-copper-400/20 hover:border-copper-400/50 transition-all overflow-hidden group cursor-pointer"
                onClick={() => handleOpenItem(video)}
              >
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={video.thumbnail_url || '/placeholder-video.jpg'} 
                    alt={video.title || 'Video'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="h-16 w-16 text-copper-400" />
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-xs text-white">
                    {video.duration}
                  </div>
                  <Badge className="absolute top-2 left-2 bg-copper-600">
                    {video.category}
                  </Badge>
                </div>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-white mb-2">{video.title}</h3>
                  <p className="text-sm text-gray-400 mb-4 line-clamp-2">{video.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center">
                      <Eye className="h-3 w-3 mr-1" />
                      {video.view_count || 0} {t('club.contentPage.views', language)}
                    </span>
                    <span>{formatDate(video.published_at)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          ) : (
            <div className="text-center py-12">
              <Video className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">{t('club.contentPage.noVideos', language)}</p>
            </div>
          )}
        </TabsContent>

        {/* Guides Tab */}
        <TabsContent value="guides" className="mt-6 space-y-4">
          {content.guides && content.guides.length > 0 ? (
            content.guides.map((guide) => {
            const Icon = guide.icon || BookOpen
            return (
              <Card key={guide.id} className="bg-slate-800 border-copper-400/20 hover:border-copper-400/50 transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-copper-400/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="h-8 w-8 text-copper-400" />
                    </div>
                    <div className="flex-1">
                      <Badge className="bg-copper-600/20 text-copper-400 border-copper-400/30 mb-2">
                        {guide.category}
                      </Badge>
                      <h3 className="text-lg font-semibold text-white mb-1">{guide.title}</h3>
                      <p className="text-sm text-gray-400 mb-3">{guide.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>{guide.pages} {t('club.contentPage.pages', language)}</span>
                        <span className="flex items-center">
                          <Download className="h-3 w-3 mr-1" />
                          {guide.download_count || 0} {t('club.contentPage.downloads', language)}
                        </span>
                        <span>{formatDate(guide.published_at)}</span>
                      </div>
                    </div>
                    <Button 
                      className="bg-copper-600 hover:bg-copper-700"
                      onClick={() => handleOpenItem(guide)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      {t('club.contentPage.download', language)}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })) : (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">{t('club.contentPage.noGuides', language)}</p>
            </div>
          )}
        </TabsContent>

        {/* Articles Tab */}
        <TabsContent value="articles" className="mt-6 space-y-4">
          {content.articles && content.articles.length > 0 ? (
            content.articles.map((article) => (
            <Card 
              key={article.id} 
              className="bg-slate-800 border-copper-400/20 hover:border-copper-400/50 transition-all cursor-pointer"
              onClick={() => handleOpenItem(article)}
            >
              <CardContent className="p-6">
                <Badge className="bg-blue-600/20 text-blue-400 border-blue-400/30 mb-3">
                  {article.category}
                </Badge>
                <h3 className="text-xl font-semibold text-white mb-2">{article.title}</h3>
                <p className="text-gray-400 mb-4 line-clamp-3">{article.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{article.author}</span>
                    <span className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {article.read_time}
                    </span>
                    <span className="flex items-center">
                      <Eye className="h-3 w-3 mr-1" />
                      {article.view_count || 0} {t('club.contentPage.views', language)}
                    </span>
                    <span>{formatDate(article.published_at)}</span>
                  </div>
                  <Button variant="outline" size="sm" className="bg-transparent border-copper-400/20 text-copper-400 hover:bg-copper-400/10">
                    {t('club.contentPage.readArticle', language)} →
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">{t('club.contentPage.noArticles', language)}</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Content Viewer Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl bg-slate-900 border-copper-400/20 text-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{viewingItem?.title}</DialogTitle>
          </DialogHeader>
          
          <div className="mt-4">
            {viewingItem?.content_type === 'video' && (
              <div className="space-y-4">
                <div className="aspect-video w-full bg-black rounded-lg overflow-hidden">
                  {getYouTubeId(viewingItem.content_url) ? (
                    <iframe 
                      width="100%" 
                      height="100%" 
                      src={`https://www.youtube.com/embed/${getYouTubeId(viewingItem.content_url)}`} 
                      title={viewingItem.title}
                      frameBorder="0" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowFullScreen
                    ></iframe>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-800">
                      <p className="text-gray-400">
                        {viewingItem.content_url ? (
                          <a href={viewingItem.content_url} target="_blank" rel="noreferrer" className="text-copper-400 hover:underline">
                            Watch Video (External Link)
                          </a>
                        ) : 'No video URL provided'}
                      </p>
                    </div>
                  )}
                </div>
                <div className="prose prose-invert max-w-none">
                  <p>{viewingItem.description}</p>
                </div>
              </div>
            )}

            {viewingItem?.content_type === 'article' && (
              <div className="space-y-6">
                <div className="flex items-center gap-4 text-sm text-gray-400 border-b border-gray-800 pb-4">
                  <span className="flex items-center"><Clock className="h-4 w-4 mr-1" /> {viewingItem.read_time}</span>
                  <span>|</span>
                  <span>{viewingItem.author}</span>
                  <span>|</span>
                  <span>{formatDate(viewingItem.published_at)}</span>
                </div>
                
                <div className="prose prose-invert max-w-none">
                  {/* If content_url is a link, show button to open it. If it's text, show it. */}
                  {viewingItem.content_url && viewingItem.content_url.startsWith('http') ? (
                    <div className="text-center py-8">
                       <p className="mb-4 text-gray-300">{viewingItem.description}</p>
                       <Button asChild className="bg-copper-600 hover:bg-copper-700">
                         <a href={viewingItem.content_url} target="_blank" rel="noreferrer">
                           Read Full Article <Eye className="ml-2 h-4 w-4" />
                         </a>
                       </Button>
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap text-gray-300">
                      {viewingItem.description}
                      {/* Placeholder for actual article body if we had a separate column */}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

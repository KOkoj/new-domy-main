'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { supabase } from '../../../lib/supabase'
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
  Video
} from 'lucide-react'

const VIDEOS = [
  {
    id: 1,
    title: 'Complete Guide to Buying Property in Italy',
    description: 'Step-by-step walkthrough of the entire property purchase process in Italy',
    duration: '45:23',
    views: 1247,
    category: 'Guides',
    thumbnail: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9',
    releaseDate: '2025-09-15'
  },
  {
    id: 2,
    title: 'Virtual Tour: Luxury Villas in Tuscany',
    description: 'Exclusive virtual tours of our premium properties in the Tuscan countryside',
    duration: '28:17',
    views: 892,
    category: 'Property Tours',
    thumbnail: 'https://images.unsplash.com/photo-1566073771259-6a8506099945',
    releaseDate: '2025-09-10'
  },
  {
    id: 3,
    title: 'Renovation Success Stories',
    description: 'Case studies of successful property renovations by our clients',
    duration: '32:45',
    views: 654,
    category: 'Case Studies',
    thumbnail: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e',
    releaseDate: '2025-09-01'
  },
  {
    id: 4,
    title: 'Living the Italian Dream: Expat Experiences',
    description: 'Interviews with expats who successfully relocated to Italy',
    duration: '41:12',
    views: 1089,
    category: 'Lifestyle',
    thumbnail: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9',
    releaseDate: '2025-08-20'
  }
]

const GUIDES = [
  {
    id: 1,
    title: 'The Ultimate Italian Property Buyer\'s Guide',
    description: 'Comprehensive 50-page guide covering everything from searching to closing',
    pages: 50,
    downloads: 342,
    category: 'Buying Guides',
    icon: BookOpen,
    releaseDate: '2025-09-01'
  },
  {
    id: 2,
    title: 'Regional Investment Analysis 2025',
    description: 'In-depth analysis of investment opportunities across all Italian regions',
    pages: 35,
    downloads: 287,
    category: 'Market Reports',
    icon: TrendingUp,
    releaseDate: '2025-08-15'
  },
  {
    id: 3,
    title: 'Renovation & Restoration Handbook',
    description: 'Expert guide to renovating Italian properties while preserving character',
    pages: 42,
    downloads: 198,
    category: 'Renovation',
    icon: Home,
    releaseDate: '2025-08-01'
  },
  {
    id: 4,
    title: 'Regional Lifestyle Guide',
    description: 'Discover the unique culture, cuisine, and lifestyle of each Italian region',
    pages: 28,
    downloads: 421,
    category: 'Lifestyle',
    icon: MapPin,
    releaseDate: '2025-07-15'
  }
]

const ARTICLES = [
  {
    id: 1,
    title: 'Top 10 Emerging Property Markets in Italy for 2025',
    excerpt: 'Discover the Italian regions showing the most promise for property investment this year...',
    readTime: '8 min read',
    views: 2341,
    category: 'Market Insights',
    author: 'Maria Rossi',
    date: '2025-10-01'
  },
  {
    id: 2,
    title: 'Tax Advantages for Foreign Property Buyers',
    excerpt: 'Understanding the fiscal benefits and incentives available to international buyers...',
    readTime: '6 min read',
    views: 1876,
    category: 'Legal & Tax',
    author: 'Giovanni Bianchi',
    date: '2025-09-28'
  },
  {
    id: 3,
    title: 'Navigating Italian Property Law: A Primer',
    excerpt: 'Essential legal knowledge every foreign buyer should have before purchasing...',
    readTime: '10 min read',
    views: 1542,
    category: 'Legal & Tax',
    author: 'Lucia Ferrari',
    date: '2025-09-20'
  }
]

export default function ContentPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedVideoCategory, setSelectedVideoCategory] = useState('All')

  const [content, setContent] = useState({ videos: [], guides: [], articles: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadContent()
  }, [])

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

      data.forEach(item => {
        if (item.content_type === 'video') organized.videos.push(item)
        if (item.content_type === 'guide') organized.guides.push({ ...item, icon: item.category === 'Buying Guides' ? BookOpen : item.category === 'Market Reports' ? TrendingUp : item.category === 'Renovation' ? Home : MapPin })
        if (item.content_type === 'article') organized.articles.push(item)
      })

      setContent(organized)
    } catch (error) {
      console.error('Error loading content:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredVideos = content.videos.filter(video => 
    (selectedVideoCategory === 'All' || video.category === selectedVideoCategory) &&
    (video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
     video.description.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center space-x-3">
          <Video className="h-8 w-8 text-copper-400" />
          <span>Exclusive Content Library</span>
        </h1>
        <p className="text-gray-400 mt-2">
          Access premium guides, videos, and market insights
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800 border-copper-400/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Videos</p>
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
                <p className="text-sm font-medium text-gray-400">Guides</p>
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
                <p className="text-sm font-medium text-gray-400">Articles</p>
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
                <p className="text-sm font-medium text-gray-400">Total Views</p>
                <p className="text-3xl font-bold text-white mt-2">8.2K</p>
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
              placeholder="Search videos, guides, and articles..."
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
            Videos
          </TabsTrigger>
          <TabsTrigger value="guides" className="data-[state=active]:bg-copper-600">
            <BookOpen className="h-4 w-4 mr-2" />
            Guides
          </TabsTrigger>
          <TabsTrigger value="articles" className="data-[state=active]:bg-copper-600">
            <FileText className="h-4 w-4 mr-2" />
            Articles
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
                {category}
              </Button>
            ))}
          </div>

          {filteredVideos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredVideos.map((video) => (
              <Card key={video.id} className="bg-slate-800 border-copper-400/20 hover:border-copper-400/50 transition-all overflow-hidden group">
                <div className="relative h-48 overflow-hidden cursor-pointer">
                  <img 
                    src={video.thumbnail_url || '/placeholder-video.jpg'} 
                    alt={video.title}
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
                  <p className="text-sm text-gray-400 mb-4">{video.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center">
                      <Eye className="h-3 w-3 mr-1" />
                      {video.view_count || 0} views
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
              <p className="text-gray-400">No videos found.</p>
            </div>
          )}
        </TabsContent>

        {/* Guides Tab */}
        <TabsContent value="guides" className="mt-6 space-y-4">
          {content.guides.length > 0 ? (
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
                        <span>{guide.pages} pages</span>
                        <span className="flex items-center">
                          <Download className="h-3 w-3 mr-1" />
                          {guide.download_count || 0} downloads
                        </span>
                        <span>{formatDate(guide.published_at)}</span>
                      </div>
                    </div>
                    <Button className="bg-copper-600 hover:bg-copper-700">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })) : (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No guides available yet.</p>
            </div>
          )}
        </TabsContent>

        {/* Articles Tab */}
        <TabsContent value="articles" className="mt-6 space-y-4">
          {content.articles.length > 0 ? (
            content.articles.map((article) => (
            <Card key={article.id} className="bg-slate-800 border-copper-400/20 hover:border-copper-400/50 transition-all cursor-pointer">
              <CardContent className="p-6">
                <Badge className="bg-blue-600/20 text-blue-400 border-blue-400/30 mb-3">
                  {article.category}
                </Badge>
                <h3 className="text-xl font-semibold text-white mb-2">{article.title}</h3>
                <p className="text-gray-400 mb-4">{article.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{article.author}</span>
                    <span className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {article.read_time}
                    </span>
                    <span className="flex items-center">
                      <Eye className="h-3 w-3 mr-1" />
                      {article.view_count || 0} views
                    </span>
                    <span>{formatDate(article.published_at)}</span>
                  </div>
                  <Button variant="outline" size="sm" className="bg-transparent border-copper-400/20 text-copper-400 hover:bg-copper-400/10">
                    Read Article →
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No articles available yet.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}


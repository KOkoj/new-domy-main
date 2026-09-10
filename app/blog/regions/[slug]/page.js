'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { ArrowLeft, Calendar, User, Clock, Share2, Heart, BookOpen, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import Image from 'next/image'
import Footer from '@/components/Footer'
import Navigation from '../../../../components/Navigation'
import InformationalDisclaimer from '@/components/legal/InformationalDisclaimer'

import { REGION_BLOG_DATA } from '../regionBlogData'

export default function RegionBlogPage() {
  const params = useParams()
  const slug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug
  const [language, setLanguage] = useState('cs')
  const [isLiked, setIsLiked] = useState(false)
  const [blogData, setBlogData] = useState(() => REGION_BLOG_DATA[slug] || null)

  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferred-language') || 'cs'
    setLanguage(savedLanguage)
    
    if (slug && REGION_BLOG_DATA[slug]) {
      setBlogData(REGION_BLOG_DATA[slug])
    }
  }, [slug])

  if (!blogData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-6 py-20 text-center" style={{ maxWidth: '1200px' }}>
          <h1 className="font-bold text-gray-900">
            Blog post not found
          </h1>
          <Link href="/regions">
            <Button className="mt-4">Back to Regions</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Article Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-6 py-16 md:py-24" style={{ maxWidth: '1200px' }}>
          <div className="max-w-4xl mx-auto">
            {/* Breadcrumb + Back to Articles */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
              <div className="flex items-center text-sm text-gray-600">
                <Link href="/regions" className="hover:text-blue-600 transition-colors">
                  Regions
                </Link>
                <span className="mx-2">/</span>
                <Link href={`/properties?region=${slug || ''}`} className="hover:text-blue-600 transition-colors">
                  {(slug || '').charAt(0).toUpperCase() + (slug || '').slice(1)}
                </Link>
                <span className="mx-2">/</span>
                <span className="text-gray-900">Blog</span>
              </div>
              <Link
                href="/blog"
                className="inline-flex items-center text-sm font-semibold text-slate-700 hover:text-slate-900 border border-slate-300 bg-white hover:bg-slate-50 rounded-lg px-3 py-2 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {language === 'cs' ? 'Zpět na články' : language === 'it' ? 'Torna agli articoli' : 'Back to articles'}
              </Link>
            </div>

            {/* Article Meta */}
            <div className="flex items-center space-x-6 text-sm text-gray-600 mb-6">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {new Date(blogData.publishedAt).toLocaleDateString()}
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {blogData.readTime}
              </div>
              <div className="flex items-center">
                <User className="h-4 w-4 mr-1" />
                {blogData.author}
              </div>
            </div>

            {/* Title */}
            <h1 className="font-bold text-gray-900 mb-8 leading-tight">
              {blogData.title[language]}
            </h1>

            {/* Excerpt */}
            <p className="text-gray-500 leading-relaxed mb-8" style={{color:'#4a4a4a', lineHeight:'1.75'}}>
              {blogData.excerpt[language]}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-8">
              {blogData.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="px-3 py-1">
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => setIsLiked(!isLiked)}
                className={`transition-all duration-200 ${isLiked ? 'text-red-600 border-red-600' : ''}`}
              >
                <Heart className={`h-4 w-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                {isLiked ? 'Liked' : 'Like'}
              </Button>
              
              <Button variant="outline">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Image */}
      <div className="container mx-auto px-6 py-8" style={{ maxWidth: '1200px' }}>
        <div className="max-w-4xl mx-auto">
          <Image
            src={blogData.image}
            alt={blogData.title[language]}
            width={1200}
            height={600}
            sizes="(min-width: 1024px) 1024px, 100vw"
            priority
            className="w-full h-96 object-cover rounded-2xl shadow-lg"
          />
        </div>
      </div>

      {/* Article Content */}
      <div className="container mx-auto px-6 pb-16 md:pb-24" style={{ maxWidth: '1200px' }}>
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
            <div 
              className="prose prose-lg max-w-none"
              style={{ maxWidth: '720px', marginLeft: 'auto', marginRight: 'auto' }}
              dangerouslySetInnerHTML={{ __html: blogData.content[language] }}
            />
            <InformationalDisclaimer language={language} className="mt-10" />
          </div>
        </div>
      </div>

      {/* Related Regions */}
      <div className="bg-white border-t">
        <div className="container mx-auto px-6 py-16 md:py-24" style={{ maxWidth: '1200px' }}>
          <div className="max-w-4xl mx-auto">
            <h3 className="font-bold text-gray-900 mb-8">Explore More Regions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {blogData.relatedRegions.map((regionSlug, index) => (
                <Link key={index} href={`/regions/${regionSlug}`}>
                  <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-center text-blue-600 group-hover:text-blue-800 transition-colors">
                        <MapPin className="h-5 w-5 mr-2" />
                        <span className="font-semibold capitalize">{regionSlug.replace('-', ' ')}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="container mx-auto px-6 py-16 md:py-24" style={{ maxWidth: '1200px' }}>
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              {language === 'cs' ? 'Připraveni najít svůj domov v Itálii?' : 
               language === 'it' ? 'Pronto a trovare la tua casa in Italia?' :
               'Ready to Find Your Home in Italy?'}
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              {language === 'cs' ? 'Prohlédněte si nemovitosti v tomto regionu' : 
               language === 'it' ? 'Esplora le proprietà in questa regione' :
               'Explore properties in this region'}
            </p>
            <Link href={`/properties?region=${slug || ''}`}>
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-8 py-4">
                <BookOpen className="h-5 w-5 mr-2" />
                {language === 'cs' ? 'Prohlédnout nemovitosti' : 
                 language === 'it' ? 'Visualizza proprietà' :
                 'View Properties'}
              </Button>
            </Link>
          </div>
        </div>
      </div>
      <Footer language={language} />
    </div>
  )
}

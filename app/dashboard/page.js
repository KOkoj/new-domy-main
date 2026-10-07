'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Heart, 
  Search, 
  MessageSquare, 
  Activity,
  Calendar,
  Settings,
  FileText,
  Video,
  MessageCircle,
  Clock
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { getDashboardUser } from '../../lib/dashboardAuth'
import { t } from '../../lib/translations'
import { DEFAULT_LANGUAGE, readLanguageFromBrowser } from '../../lib/userPreferences'
import Link from 'next/link'

export default function DashboardOverview() {
  const [stats, setStats] = useState({
    favorites: 0,
    inquiries: 0,
    completedWebinars: 0,
    documentsAccessed: 0,
    conciergeTickets: 0,
    membershipDays: 0,
    recentActivity: [],
    loading: true
  })
  const [user, setUser] = useState(null)
  const [upcomingWebinars, setUpcomingWebinars] = useState([])
  const [language, setLanguage] = useState(DEFAULT_LANGUAGE)

  useEffect(() => {
    loadDashboardData()
    
    setLanguage(readLanguageFromBrowser())

    // Listen for language changes
    const handleLanguageChange = (e) => {
      setLanguage(e.detail)
    }
    
    window.addEventListener('languageChange', handleLanguageChange)
    return () => window.removeEventListener('languageChange', handleLanguageChange)
  }, [])

  const loadDashboardData = async () => {
    try {
      const user = await getDashboardUser(supabase)
      if (!user) {
        setStats(prev => ({ ...prev, loading: false }))
        return
      }
      
      setUser(user)

      if (!supabase) {
        setStats(prev => ({
          ...prev,
          membershipDays: user?.created_at
            ? Math.floor((new Date() - new Date(user.created_at)) / (1000 * 60 * 60 * 24))
            : 0,
          loading: false
        }))
        return
      }

      // 1. Load basic stats (Parallel)
      const [
        favoritesRes, 
        inquiriesRes,
        webinarCountRes,
        docCountRes,
        ticketCountRes
      ] = await Promise.all([
        supabase.from('favorites').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        // inquiries uses camelCase columns
        supabase.from('inquiries').select('*', { count: 'exact', head: true }).eq('userId', user.id),
        supabase.from('webinar_registrations').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'attended'),
        // Use premium_documents instead of access logs to show total available
        supabase.from('premium_documents').select('*', { count: 'exact', head: true }),
        // Concierge tickets are stored in inquiries table with type='concierge'
        supabase.from('inquiries').select('*', { count: 'exact', head: true }).eq('userId', user.id).eq('type', 'concierge')
      ])

      // Membership days
      const startDate = user?.created_at || new Date().toISOString()
      const membershipDays = Math.floor((new Date() - new Date(startDate)) / (1000 * 60 * 60 * 24))

      // 2. Load Recent Activity (Standard)
      const { data: recentFavorites } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3)

      const { data: recentInquiries } = await supabase
        .from('inquiries')
        .select('*')
        .eq('userId', user.id) // camelCase
        .order('createdAt', { ascending: false }) // camelCase
        .limit(2)

      // 3. Load Club Activity (Logs)
      const { data: docLogs } = await supabase
        .from('document_access_logs')
        .select('*, premium_documents(name)')
        .eq('user_id', user.id)
        .order('accessed_at', { ascending: false })
        .limit(2)
      
      const { data: webinarLogs } = await supabase
        .from('webinar_registrations')
        .select('*, webinars(title)')
        .eq('user_id', user.id)
        .order('registered_at', { ascending: false })
        .limit(2)

      // 4. Load Upcoming Webinars
      const { data: webinars } = await supabase
        .from('webinars')
        .select('*')
        .eq('status', 'upcoming')
        .order('date', { ascending: true })
        .limit(2)

      setUpcomingWebinars(webinars || [])

      // Combine recent activity
      const recentActivity = [
        ...(recentFavorites || []).map(fav => ({
          type: 'favorite',
          action: t('club.activityFavorite', language),
          propertyId: fav.listing_id || fav.listingId,
          date: fav.created_at || fav.createdAt,
          icon: Heart,
          iconColor: 'text-red-600',
          bg: 'bg-red-100'
        })),
        ...(recentInquiries || []).map(inq => ({
          type: 'inquiry',
          action: t('club.activityInquiry', language),
          propertyId: inq.listingId || inq.listing_id,
          date: inq.createdAt || inq.created_at,
          icon: MessageSquare,
          iconColor: 'text-slate-800',
          bg: 'bg-slate-100'
        })),
        ...(docLogs || []).map(log => ({
          type: 'document',
          action: `${t('club.activityDocument', language)}: ${log.premium_documents?.name || t('club.documents', language)}`,
          date: log.accessed_at,
          icon: FileText,
          iconColor: 'text-blue-600',
          bg: 'bg-blue-100'
        })),
        ...(webinarLogs || []).map(log => ({
          type: 'webinar',
          action: `${t('club.activityWebinar', language)}: ${log.webinars?.title || t('club.webinarCalendar', language)}`,
          date: log.registered_at,
          icon: Video,
          iconColor: 'text-purple-600',
          bg: 'bg-purple-100'
        }))
      ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5)

      setStats({
        favorites: favoritesRes.count || 0,
        inquiries: inquiriesRes.count || 0,
        completedWebinars: webinarCountRes.count || 0,
        documentsAccessed: docCountRes.count || 0,
        conciergeTickets: ticketCountRes.count || 0,
        membershipDays,
        recentActivity,
        loading: false
      })
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      setStats(prev => ({ ...prev, loading: false }))
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(language === 'cs' ? 'cs-CZ' : (language === 'it' ? 'it-IT' : 'en-US'), { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (stats.loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          {t('club.welcomeBack', language)}, {user?.user_metadata?.name || user?.email || ''}!
        </h1>
        <p className="text-gray-600 mt-1">{t('club.dashboardSubtitle', language)}</p>
      </div>

      {/* Primary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/dashboard/favorites">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('club.favorites', language)}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.favorites}</p>
                  <p className="text-xs text-gray-500 mt-1">{t('club.savedProperties', language)}</p>
                </div>
                <div className="p-3 rounded-full bg-red-100">
                  <Heart className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/inquiries">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('club.inquiries', language)}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.inquiries}</p>
                  <p className="text-xs text-gray-500 mt-1">{t('club.sentToAgents', language)}</p>
                </div>
                <div className="p-3 rounded-full bg-slate-100">
                  <MessageSquare className="h-6 w-6 text-slate-800" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/concierge">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('club.conciergeTitle', language)}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.conciergeTickets}</p>
                  <p className="text-xs text-gray-500 mt-1">{t('club.activeTickets', language)}</p>
                </div>
                <div className="p-3 rounded-full bg-green-100">
                  <MessageCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/documents">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('club.documentsTitle', language)}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.documentsAccessed}</p>
                  <p className="text-xs text-gray-500 mt-1">{t('club.documentsAvailable', language) || 'Available documents'}</p>
                </div>
                <div className="p-3 rounded-full bg-blue-100">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6">
        
        {/* Recent Activity */}
        <Card className="h-full">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>{t('club.recentActivity', language)}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentActivity.length > 0 ? (
              <div className="space-y-4">
                {stats.recentActivity.map((activity, index) => {
                  const Icon = activity.icon
                  return (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className={`p-2 rounded-full ${activity.bg}`}>
                        <Icon className={`h-4 w-4 ${activity.iconColor}`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                        {activity.propertyId && (
                          <p className="text-xs text-gray-500">Property ID: {activity.propertyId}</p>
                        )}
                        <p className="text-xs text-gray-500">{new Date(activity.date).toLocaleDateString(language === 'cs' ? 'cs-CZ' : 'en-US')}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>{t('club.noActivity', language)}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Webinars & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>{t('club.upcomingWebinars', language)}</span>
              </CardTitle>
              <Link href="/dashboard/webinars">
                <Button variant="outline" size="sm">{t('club.viewCalendar', language)}</Button>
              </Link>
            </CardHeader>
            <CardContent>
              {upcomingWebinars.length > 0 ? (
                <div className="space-y-4">
                  {upcomingWebinars.map((webinar) => (
                    <div key={webinar.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 border rounded-lg hover:bg-gray-50">
                      <div>
                        <h4 className="font-medium text-gray-900">{webinar.title}</h4>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 mt-1">
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDate(webinar.date)}
                          </span>
                          <span className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {webinar.time}
                          </span>
                        </div>
                      </div>
                      <Link href="/dashboard/webinars" className="sm:flex-shrink-0">
                        <Button size="sm" variant="outline" className="w-full sm:w-auto">{t('club.register', language)}</Button>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <p>{t('club.noWebinars', language)}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>{t('club.quickActions', language)}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/dashboard/intake-form">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  {t('club.clientForm', language)}
                </Button>
              </Link>
              <Link href="/dashboard/content">
                <Button variant="outline" className="w-full justify-start">
                  <Video className="h-4 w-4 mr-2" />
                  {t('club.exclusiveContent', language)}
                </Button>
              </Link>
              <Link href="/properties">
                <Button variant="outline" className="w-full justify-start">
                  <Search className="h-4 w-4 mr-2" />
                  {t('club.browseProperties', language)}
                </Button>
              </Link>
              <Link href="/dashboard/profile">
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="h-4 w-4 mr-2" />
                  {t('club.updateProfile', language)}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

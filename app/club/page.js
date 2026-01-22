'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar,
  FileText,
  Video,
  MessageCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  Star,
  Award,
  Sparkles,
  ArrowRight,
  Bell,
  Crown
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { t } from '../../lib/translations'
import Link from 'next/link'

export default function ClubOverview() {
  const [stats, setStats] = useState({
    completedWebinars: 0,
    documentsAccessed: 0,
    conciergeTickets: 0,
    membershipDays: 0,
    loading: true
  })
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [language, setLanguage] = useState('en')
  const [upcomingWebinars, setUpcomingWebinars] = useState([])
  const [recentActivities, setRecentActivities] = useState([])

  useEffect(() => {
    loadClubData()
    
    // Load saved language preference
    const savedLanguage = localStorage.getItem('preferred-language')
    if (savedLanguage) {
      setLanguage(savedLanguage)
    }

    // Listen for language changes from localStorage
    const handleLanguageChange = () => {
      const savedLanguage = localStorage.getItem('preferred-language')
      if (savedLanguage && savedLanguage !== language) {
        setLanguage(savedLanguage)
      }
    }

    window.addEventListener('storage', handleLanguageChange)
    
    // Poll for language changes (since we can't easily detect changes from same tab)
    const interval = setInterval(() => {
      const savedLanguage = localStorage.getItem('preferred-language')
      if (savedLanguage && savedLanguage !== language) {
        setLanguage(savedLanguage)
      }
    }, 1000)

    return () => {
      window.removeEventListener('storage', handleLanguageChange)
      clearInterval(interval)
    }
  }, [language])

  const loadClubData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      
      setUser(user)

      // Load user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      setProfile(profile)

      // 1. Stats Calculation
      const membershipDays = profile?.createdAt 
        ? Math.floor((new Date() - new Date(profile.createdAt)) / (1000 * 60 * 60 * 24))
        : 0

      // Count webinars attended/registered
      const { count: webinarCount } = await supabase
        .from('webinar_registrations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'attended')

      // Count documents accessed
      const { count: docCount } = await supabase
        .from('document_access_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      // Count open tickets
      const { count: ticketCount } = await supabase
        .from('concierge_tickets')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .neq('status', 'closed')

      setStats({
        completedWebinars: webinarCount || 0,
        documentsAccessed: docCount || 0,
        conciergeTickets: ticketCount || 0,
        membershipDays,
        loading: false
      })

      // 2. Fetch Upcoming Webinars
      const { data: webinars } = await supabase
        .from('webinars')
        .select('*')
        .eq('status', 'upcoming')
        .order('date', { ascending: true })
        .limit(3)

      setUpcomingWebinars(webinars || [])

      // 3. Fetch Recent Activities (Logs)
      // Combine document logs and webinar registrations
      const { data: docLogs } = await supabase
        .from('document_access_logs')
        .select('*, premium_documents(name)')
        .eq('user_id', user.id)
        .order('accessed_at', { ascending: false })
        .limit(3)

      const { data: webinarLogs } = await supabase
        .from('webinar_registrations')
        .select('*, webinars(title)')
        .eq('user_id', user.id)
        .order('registered_at', { ascending: false })
        .limit(3)

      // Normalize and merge
      const activities = [
        ...(docLogs || []).map(log => ({
          id: `doc-${log.id}`,
          type: 'document',
          title: log.premium_documents?.name || 'Document',
          action: log.action === 'download' ? 'Downloaded document' : 'Viewed document',
          date: log.accessed_at,
          icon: FileText
        })),
        ...(webinarLogs || []).map(log => ({
          id: `web-${log.id}`,
          type: 'webinar',
          title: log.webinars?.title || 'Webinar',
          action: `Registered for webinar`,
          date: log.registered_at,
          icon: Video
        }))
      ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5)

      setRecentActivities(activities)

    } catch (error) {
      console.error('Error loading club data:', error)
      setStats(prev => ({ ...prev, loading: false }))
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }
  
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now - date) / 1000)
    
    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    return `${Math.floor(diffInSeconds / 86400)}d ago`
  }

  if (stats.loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-700 rounded w-64 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-slate-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6" data-testid="dashboard-container">
      {/* Header */}
      <div className="flex items-center justify-between" data-testid="dashboard-header">
        <div data-testid="dashboard-header-content">
          <h1 className="text-3xl font-bold text-white flex items-center space-x-3" data-testid="dashboard-welcome-title">
            <Crown className="h-8 w-8 text-copper-400" />
            <span>{t('club.welcome', language)}, {profile?.name || user?.user_metadata?.name || 'Member'}!</span>
          </h1>
          <p className="text-gray-400 mt-2" data-testid="dashboard-subtitle">{t('club.accessExclusive', language)}</p>
        </div>
        <Button className="bg-copper-600 hover:bg-copper-700" data-testid="dashboard-notifications-button">
          <Bell className="h-4 w-4 mr-2" />
          {t('club.notifications', language)}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6" data-testid="dashboard-stats-grid">
        <Card className="bg-slate-800 border-copper-400/20" data-testid="dashboard-stat-webinars">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400" data-testid="dashboard-stat-webinars-label">{t('club.webinarsAttended', language)}</p>
                <p className="text-3xl font-bold text-white mt-2" data-testid="dashboard-stat-webinars-value">{stats.completedWebinars}</p>
                <p className="text-sm text-copper-400 mt-1 flex items-center" data-testid="dashboard-stat-webinars-trend">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Lifetime
                </p>
              </div>
              <div className="p-3 rounded-full bg-copper-400/10" data-testid="dashboard-stat-webinars-icon">
                <Video className="h-6 w-6 text-copper-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-copper-400/20" data-testid="dashboard-stat-documents">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400" data-testid="dashboard-stat-documents-label">{t('club.documents', language)}</p>
                <p className="text-3xl font-bold text-white mt-2" data-testid="dashboard-stat-documents-value">{stats.documentsAccessed}</p>
                <p className="text-sm text-gray-400 mt-1" data-testid="dashboard-stat-documents-subtitle">{t('club.filesAccessed', language)}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-400/10" data-testid="dashboard-stat-documents-icon">
                <FileText className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-copper-400/20" data-testid="dashboard-stat-concierge">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400" data-testid="dashboard-stat-concierge-label">{t('club.conciergeSupport', language)}</p>
                <p className="text-3xl font-bold text-white mt-2" data-testid="dashboard-stat-concierge-value">{stats.conciergeTickets}</p>
                <p className="text-sm text-gray-400 mt-1" data-testid="dashboard-stat-concierge-subtitle">{t('club.activeTickets', language)}</p>
              </div>
              <div className="p-3 rounded-full bg-green-400/10" data-testid="dashboard-stat-concierge-icon">
                <MessageCircle className="h-6 w-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-copper-400/20" data-testid="dashboard-stat-membership">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400" data-testid="dashboard-stat-membership-label">{t('club.membership', language)}</p>
                <p className="text-3xl font-bold text-white mt-2" data-testid="dashboard-stat-membership-value">{stats.membershipDays}</p>
                <p className="text-sm text-gray-400 mt-1" data-testid="dashboard-stat-membership-subtitle">{t('club.daysAsMember', language)}</p>
              </div>
              <div className="p-3 rounded-full bg-purple-400/10" data-testid="dashboard-stat-membership-icon">
                <Award className="h-6 w-6 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" data-testid="dashboard-main-grid">
        {/* Upcoming Webinars - Takes 2 columns */}
        <div className="lg:col-span-2" data-testid="dashboard-webinars-section">
          <Card className="bg-slate-800 border-copper-400/20 h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center space-x-2 text-white" data-testid="dashboard-webinars-title">
                <Calendar className="h-5 w-5 text-copper-400" />
                <span>{t('club.upcomingWebinars', language)}</span>
              </CardTitle>
              <Link href="/club/webinars">
                <Button variant="outline" size="sm" className="bg-transparent border-copper-400/20 text-copper-400 hover:bg-copper-400/10" data-testid="dashboard-webinars-viewall">
                  {t('club.viewAll', language)}
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4" data-testid="dashboard-webinars-list">
                {upcomingWebinars.length > 0 ? (
                  upcomingWebinars.map((webinar) => (
                    <div key={webinar.id} className="p-4 bg-slate-900/50 border border-copper-400/10 rounded-lg hover:border-copper-400/30 transition-all cursor-pointer" data-testid={`dashboard-webinar-${webinar.id}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-white mb-2" data-testid={`dashboard-webinar-${webinar.id}-title`}>{webinar.title}</h4>
                          <div className="flex items-center space-x-4 text-sm text-gray-400">
                            <span className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {formatDate(webinar.date)}
                            </span>
                            <span className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {webinar.time}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mt-2">
                            Speaker: {webinar.speaker_name} • Duration: {webinar.duration}
                          </p>
                        </div>
                        <Button size="sm" className="bg-copper-600 hover:bg-copper-700" data-testid={`dashboard-webinar-${webinar.id}-register`}>
                          {t('club.register', language)}
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-10 w-10 text-gray-600 mx-auto mb-2" />
                    <p className="text-gray-400">No upcoming webinars scheduled.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div data-testid="dashboard-activity-section">
          <Card className="bg-slate-800 border-copper-400/20 h-full">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white" data-testid="dashboard-activity-title">
                <Sparkles className="h-5 w-5 text-copper-400" />
                <span>{t('club.recentActivity', language)}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4" data-testid="dashboard-activity-list">
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity) => {
                    const Icon = activity.icon
                    return (
                      <div key={activity.id} className="flex items-start space-x-3 p-3 bg-slate-900/50 rounded-lg" data-testid={`dashboard-activity-${activity.id}`}>
                        <div className="p-2 rounded-full bg-copper-400/10">
                          <Icon className="h-4 w-4 text-copper-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white" data-testid={`dashboard-activity-${activity.id}-title`}>{activity.title}</p>
                          <p className="text-xs text-gray-400 mt-1">{activity.action}</p>
                          <p className="text-xs text-gray-500 mt-1">{formatTimeAgo(activity.date)}</p>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="text-center py-8">
                    <Sparkles className="h-10 w-10 text-gray-600 mx-auto mb-2" />
                    <p className="text-gray-400">No recent activity.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <Card className="bg-slate-800 border-copper-400/20" data-testid="dashboard-quickactions">
        <CardHeader>
          <CardTitle className="text-white" data-testid="dashboard-quickactions-title">{t('club.quickActions', language)}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4" data-testid="dashboard-quickactions-grid">
            <Link href="/club/intake-form">
              <Card className="bg-slate-900/50 border-copper-400/20 hover:border-copper-400/50 transition-all cursor-pointer h-full" data-testid="dashboard-quickaction-intakeform">
                <CardContent className="p-6">
                  <FileText className="h-8 w-8 text-copper-400 mb-3" />
                  <h3 className="font-semibold text-white mb-2">{t('club.completeProfile', language)}</h3>
                  <p className="text-sm text-gray-400 mb-3">
                    {t('club.profileDescription', language)}
                  </p>
                  <Button variant="outline" size="sm" className="w-full bg-transparent border-copper-400/20 text-copper-400 hover:bg-copper-400/10">
                    {t('club.getStarted', language)} <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </Link>

            <Link href="/club/concierge">
              <Card className="bg-slate-900/50 border-copper-400/20 hover:border-copper-400/50 transition-all cursor-pointer h-full" data-testid="dashboard-quickaction-concierge">
                <CardContent className="p-6">
                  <MessageCircle className="h-8 w-8 text-green-400 mb-3" />
                  <h3 className="font-semibold text-white mb-2">{t('club.contactConcierge', language)}</h3>
                  <p className="text-sm text-gray-400 mb-3">
                    {t('club.conciergeDescription', language)}
                  </p>
                  <Button variant="outline" size="sm" className="w-full bg-transparent border-copper-400/20 text-copper-400 hover:bg-copper-400/10">
                    {t('club.chatNow', language)} <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </Link>

            <Link href="/club/content">
              <Card className="bg-slate-900/50 border-copper-400/20 hover:border-copper-400/50 transition-all cursor-pointer h-full" data-testid="dashboard-quickaction-content">
                <CardContent className="p-6">
                  <Video className="h-8 w-8 text-blue-400 mb-3" />
                  <h3 className="font-semibold text-white mb-2">{t('club.exclusiveContent', language)}</h3>
                  <p className="text-sm text-gray-400 mb-3">
                    {t('club.contentDescription', language)}
                  </p>
                  <Button variant="outline" size="sm" className="w-full bg-transparent border-copper-400/20 text-copper-400 hover:bg-copper-400/10">
                    {t('club.explore', language)} <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

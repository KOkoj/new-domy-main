'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  User, 
  Calendar,
  FileText,
  Award,
  Video,
  MessageCircle,
  Briefcase,
  Home, 
  LogOut,
  Menu,
  X,
  Shield,
  Crown,
  Sparkles
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { t } from '../../lib/translations'

const getClubMenuItems = (language) => [
  {
    title: t('club.clubOverview', language),
    href: '/club',
    icon: Crown,
    description: t('club.clubDescription', language)
  },
  {
    title: t('club.clientForm', language),
    href: '/club/intake-form',
    icon: FileText,
    description: t('club.formDescription', language)
  },
  {
    title: t('club.webinarCalendar', language),
    href: '/club/webinars',
    icon: Calendar,
    description: t('club.calendarDescription', language)
  },
  {
    title: t('club.documentsTitle', language),
    href: '/club/documents',
    icon: Briefcase,
    description: t('club.documentsDescription', language)
  },
  {
    title: t('club.conciergeTitle', language),
    href: '/club/concierge',
    icon: MessageCircle,
    description: t('club.conciergeTitleDescription', language)
  },
  {
    title: t('club.exclusiveContentTitle', language),
    href: '/club/content',
    icon: Video,
    description: t('club.exclusiveContentDescription', language)
  }
]

export default function ClubLayout({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userProfile, setUserProfile] = useState(null)
  const [isPremiumMember, setIsPremiumMember] = useState(false)
  const [language, setLanguage] = useState('en')
  const router = useRouter()

  useEffect(() => {
    checkUserAccess()
    
    // Load saved language preference
    const savedLanguage = localStorage.getItem('preferred-language')
    if (savedLanguage) {
      setLanguage(savedLanguage)
      document.documentElement.lang = savedLanguage
    }
  }, [])

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage)
    console.log(`Language changed to: ${newLanguage}`)
    document.documentElement.lang = newLanguage
    localStorage.setItem('preferred-language', newLanguage)
  }

  const checkUserAccess = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        router.push('/')
        return
      }

      setUser(user)

      // Load user profile and check premium status
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      setUserProfile(profile)
      
      // TODO: Implement proper premium membership check
      // For now, all authenticated users can access
      // In production, check profile.membership_tier === 'premium' or similar
      setIsPremiumMember(true)
      
      if (!true) { // Change to !isPremiumMember when implementing
        router.push('/dashboard')
        return
      }
    } catch (error) {
      console.error('User access check failed:', error)
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-copper-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading Premium Club...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Navigation />
        <div className="flex items-center justify-center pt-20">
          <Card className="max-w-md mx-auto bg-slate-800 border-copper-400/20">
            <CardContent className="p-8 text-center">
              <Shield className="h-12 w-12 text-copper-400 mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-2 text-white">Premium Access Required</h1>
              <p className="text-gray-300 mb-4">
                Please login to access the Premium Club.
              </p>
              <Link href="/">
                <Button className="bg-copper-600 hover:bg-copper-700">Go to Homepage</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 home-page-custom-border" data-testid="club-layout-container">
      <div className="lg:pt-0" data-testid="club-layout-wrapper">
        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-70 z-40 lg:hidden" 
            onClick={() => setSidebarOpen(false)}
            data-testid="club-layout-mobile-backdrop"
          />
        )}

        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-copper-400/20 shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`} data-testid="club-layout-sidebar">
          <div className="flex flex-col h-full" data-testid="club-sidebar-inner">
            {/* Logo */}
            <div className="flex items-center justify-between h-16 px-6 border-b border-copper-400/20" data-testid="club-sidebar-header">
              <Link href="/club" className="flex items-center space-x-3" data-testid="club-sidebar-logo-link">
                <img 
                  src="/logo domy.svg" 
                  alt="Domy Logo" 
                  className="h-8 w-8" 
                  data-testid="club-sidebar-logo-icon"
                />
                <span className="font-bold text-copper-400" data-testid="club-sidebar-logo-text">{t('club.title', language)}</span>
              </Link>
              <button 
                className="lg:hidden text-gray-400 hover:text-white" 
                onClick={() => setSidebarOpen(false)}
                data-testid="club-sidebar-close-button"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Premium Badge */}
            <div className="px-4 py-3 border-b border-copper-400/20" data-testid="club-sidebar-badge-container">
              <Badge className="w-full bg-gradient-to-r from-copper-400 to-copper-600 text-slate-900 border-none flex items-center justify-center space-x-1" data-testid="club-sidebar-premium-badge">
                <Sparkles className="h-3 w-3" />
                <span className="font-semibold">{t('club.premiumMember', language)}</span>
              </Badge>
            </div>

            {/* Language Switcher */}
            <div className="px-4 py-2 border-b border-copper-400/20" data-testid="club-language-switcher">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleLanguageChange('en')}
                  className={`px-2 py-1 rounded text-xs font-medium transition-all duration-200 ${
                    language === 'en' 
                      ? 'bg-copper-400/20 text-copper-400' 
                      : 'text-gray-400 hover:text-copper-400 hover:bg-copper-400/10'
                  }`}
                  data-testid="club-language-en"
                >
                  EN
                </button>
                <button
                  onClick={() => handleLanguageChange('cs')}
                  className={`px-2 py-1 rounded text-xs font-medium transition-all duration-200 ${
                    language === 'cs' 
                      ? 'bg-copper-400/20 text-copper-400' 
                      : 'text-gray-400 hover:text-copper-400 hover:bg-copper-400/10'
                  }`}
                  data-testid="club-language-cs"
                >
                  CS
                </button>
                <button
                  onClick={() => handleLanguageChange('it')}
                  className={`px-2 py-1 rounded text-xs font-medium transition-all duration-200 ${
                    language === 'it' 
                      ? 'bg-copper-400/20 text-copper-400' 
                      : 'text-gray-400 hover:text-copper-400 hover:bg-copper-400/10'
                  }`}
                  data-testid="club-language-it"
                >
                  IT
                </button>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto" data-testid="club-sidebar-navigation">
              {getClubMenuItems(language).map((item) => {
                const Icon = item.icon
                const testId = `club-sidebar-menu-${item.href.split('/').pop() || 'overview'}`
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-copper-400/10 hover:text-copper-400 transition-colors"
                    onClick={() => setSidebarOpen(false)}
                    data-testid={testId}
                  >
                    <Icon className="h-5 w-5" data-testid={`${testId}-icon`} />
                    <div data-testid={`${testId}-content`}>
                      <div className="font-medium" data-testid={`${testId}-title`}>{item.title}</div>
                      <div className="text-xs text-gray-500" data-testid={`${testId}-description`}>{item.description}</div>
                    </div>
                  </Link>
                )
              })}
            </nav>

            {/* User Info */}
            <div className="p-4 border-t border-copper-400/20" data-testid="club-sidebar-user-section">
              <div className="flex items-center space-x-3 mb-3" data-testid="club-sidebar-user-info">
                <div className="w-10 h-10 bg-gradient-to-br from-copper-400 to-copper-600 rounded-full flex items-center justify-center" data-testid="club-sidebar-user-avatar">
                  <User className="h-5 w-5 text-slate-900" />
                </div>
                <div className="flex-1 min-w-0" data-testid="club-sidebar-user-details">
                  <p className="text-sm font-medium text-white truncate" data-testid="club-sidebar-user-name">
                    {userProfile?.name || user?.user_metadata?.name || user?.email}
                  </p>
                  <p className="text-xs text-gray-400 truncate" data-testid="club-sidebar-user-email">{user?.email}</p>
                </div>
              </div>
              <div className="space-y-2" data-testid="club-sidebar-user-actions">
                <Link href="/" className="w-full">
                  <Button variant="outline" size="sm" className="w-full justify-start border-copper-400/20 bg-transparent text-gray-300 hover:bg-copper-400/10 hover:text-copper-400" data-testid="club-sidebar-browse-button">
                    <Home className="h-4 w-4 mr-2" />
                    {t('club.browseProperties', language)}
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start border-copper-400/20 bg-transparent text-gray-300 hover:bg-copper-400/10 hover:text-copper-400"
                  onClick={handleLogout}
                  data-testid="club-sidebar-logout-button"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {t('club.logout', language)}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="lg:pl-64" data-testid="club-layout-main-wrapper">
          {/* Mobile header */}
          <div className="lg:hidden flex items-center justify-between h-16 px-6 bg-slate-900 border-b border-copper-400/20" data-testid="club-layout-mobile-header">
            <button onClick={() => setSidebarOpen(true)} className="text-copper-400" data-testid="club-mobile-menu-button">
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="font-semibold text-copper-400 flex items-center space-x-2" data-testid="club-mobile-title">
              <img 
                src="/logo domy.svg" 
                alt="Domy Logo" 
                className="h-5 w-5" 
              />
              <span>{t('club.title', language)}</span>
            </h1>
            <div className="w-6" data-testid="club-mobile-spacer" /> {/* Spacer */}
          </div>

          {/* Page content */}
          <main className="min-h-screen lg:min-h-0 p-6" data-testid="club-layout-main-content">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}


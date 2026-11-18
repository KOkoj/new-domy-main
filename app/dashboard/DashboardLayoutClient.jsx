'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  User, 
  Heart, 
  Search, 
  MessageSquare, 
  TrendingUp,
  Activity,
  Settings,
  Crown,
  Home, 
  LogOut,
  Menu,
  X,
  Bell,
  FileText,
  Calendar,
  Briefcase,
  Video,
  MessageCircle
} from 'lucide-react'
import Navigation from '../../components/Navigation'
import Footer from '../../components/Footer'
import { loadSiteAuthUser } from '../../lib/siteAuthUser'
import ZoneBackLink from '../../components/zone/ZoneBackLink'
import { t } from '../../lib/translations'
import { DEFAULT_LANGUAGE, persistLanguage, readLanguageFromBrowser } from '../../lib/userPreferences'

const getDashboardMenuItems = (language) => [
  {
    title: language === 'cs' ? 'Přehled' : (language === 'it' ? 'Panoramica' : 'Overview'),
    href: '/dashboard',
    icon: Activity,
    description: language === 'cs' ? 'Přehled nástěnky' : (language === 'it' ? 'Panoramica dashboard' : 'Dashboard overview')
  },
  {
    title: language === 'cs' ? 'Profil' : (language === 'it' ? 'Profilo' : 'Profile'),
    href: '/dashboard/profile',
    icon: User,
    description: language === 'cs' ? 'Spravovat profil' : (language === 'it' ? 'Gestisci profilo' : 'Manage your profile')
  },
  {
    title: language === 'cs' ? 'Nastavení účtu' : (language === 'it' ? 'Impostazioni account' : 'Account settings'),
    href: '/dashboard/settings',
    icon: Settings,
    description: language === 'cs' ? 'Přihlašovací údaje a heslo' : (language === 'it' ? 'Credenziali e password' : 'Sign-in details and password')
  },
  {
    title: language === 'cs' ? 'Oblíbené' : (language === 'it' ? 'Preferiti' : 'My Favorites'),
    href: '/dashboard/favorites',
    icon: Heart,
    description: language === 'cs' ? 'Uložené nemovitostí' : (language === 'it' ? 'Proprietà salvate' : 'Saved properties')
  },
  {
    title: language === 'cs' ? 'Dotazy' : (language === 'it' ? 'Richieste' : 'My Inquiries'),
    href: '/dashboard/inquiries',
    icon: MessageSquare,
    description: language === 'cs' ? 'Dotazy na nemovitostí' : (language === 'it' ? 'Richieste proprietà' : 'Property inquiries')
  },
  {
    title: language === 'cs' ? 'Doporučení' : (language === 'it' ? 'Raccomandazioni' : 'Recommendations'),
    href: '/dashboard/recommendations',
    icon: TrendingUp,
    description: language === 'cs' ? 'Navržené nemovitosti' : (language === 'it' ? 'Proprietà suggerite' : 'Suggested properties')
  },
  {
    title: language === 'cs' ? 'Uložená hledání' : (language === 'it' ? 'Ricerche salvate' : 'Saved Searches'),
    href: '/dashboard/searches',
    icon: Search,
    description: language === 'cs' ? 'Vaše preference' : (language === 'it' ? 'Le tue preferenze' : 'Your search preferences')
  },
  {
    title: language === 'cs' ? 'Upozornění' : (language === 'it' ? 'Notifiche' : 'Notifications'),
    href: '/dashboard/notifications',
    icon: Bell,
    description: language === 'cs' ? 'Emailové preference' : (language === 'it' ? 'Preferenze email' : 'Email preferences')
  },
  {
    title: language === 'cs' ? 'Zákaznický formulář' : (language === 'it' ? 'Modulo cliente' : 'Client Form'),
    href: '/dashboard/intake-form',
    icon: FileText,
    description: language === 'cs' ? 'Osobní informace' : (language === 'it' ? 'Informazioni personali' : 'Personal information')
  },
  {
    title: language === 'cs' ? 'Webináře' : (language === 'it' ? 'Webinar' : 'Webinars'),
    href: '/dashboard/webinars',
    icon: Calendar,
    description: language === 'cs' ? 'Události a relace' : (language === 'it' ? 'Eventi e sessioni' : 'Events & sessions')
  },
  {
    title: language === 'cs' ? 'Dokumenty' : (language === 'it' ? 'Documenti' : 'Documents'),
    href: '/dashboard/documents',
    icon: Briefcase,
    description: language === 'cs' ? 'Soubory a smlouvy' : (language === 'it' ? 'File e contratti' : 'Files & contracts')
  },
  {
    title: language === 'cs' ? 'Konzultant' : (language === 'it' ? 'Concierge' : 'Concierge'),
    href: '/dashboard/concierge',
    icon: MessageCircle,
    description: language === 'cs' ? 'Prémiová podpora' : (language === 'it' ? 'Supporto premium' : 'Premium support')
  },
  {
    title: language === 'cs' ? 'Exkluzivní obsah' : (language === 'it' ? 'Contenuto esclusivo' : 'Exclusive Content'),
    href: '/dashboard/content',
    icon: Video,
    description: language === 'cs' ? 'Videa a průvodci' : (language === 'it' ? 'Video e guide' : 'Videos & guides')
  }
]

export default function DashboardLayout({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [language, setLanguage] = useState(DEFAULT_LANGUAGE)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    checkUserAccess()
  }, [])

  useEffect(() => {
    const savedLanguage = readLanguageFromBrowser()
    setLanguage(savedLanguage)
    document.documentElement.lang = savedLanguage
    const handleLanguageEvent = (event) => {
      if (event.detail) setLanguage(event.detail)
    }
    window.addEventListener('languageChange', handleLanguageEvent)
    return () => window.removeEventListener('languageChange', handleLanguageEvent)
  }, [])

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage)
    persistLanguage(newLanguage)
    document.documentElement.lang = newLanguage
    window.dispatchEvent(new CustomEvent('languageChange', { detail: newLanguage }))
  }

  // One shared server session request (same one the header uses), no
  // profile request here: the zone layout no longer shows the profile, and the
  // old session -> profile chain kept every dashboard page blank meanwhile.
  const checkUserAccess = async () => {
    try {
      const sessionUser = await loadSiteAuthUser()
      if (!sessionUser) {
        router.push('/login?redirect=/dashboard')
        return
      }
      setUser(sessionUser)
    } catch (error) {
      console.error('User access check failed:', error)
      router.push('/login?redirect=/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      window.location.assign('/')
    }
  }

  // Client zone ("vlákno"): site header + centered content, no left menu.
  // The old menu items (getDashboardMenuItems) and their routes stay in code,
  // just not linked from the zone.
  const isZonePage = pathname === '/dashboard' || pathname === '/dashboard/ulozene'

  if (loading && !isZonePage) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{language === 'cs' ? 'Načítání nástěnky...' : language === 'it' ? 'Caricamento dashboard...' : 'Loading dashboard...'}</p>
        </div>
      </div>
    )
  }

  if (!loading && !user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center pt-20">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-8 text-center">
              <User className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-2">{t('auth.loginRequired', language)}</h1>
              <p className="text-gray-600 mb-4">
                {language === 'cs' ? 'Pro přístup na nástěnku se přihlaste.' : language === 'it' ? 'Accedi per aprire la dashboard.' : 'Please login to access your dashboard.'}
              </p>
              <Link href="/">
                <Button>Go to Homepage</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="site-page min-h-screen bg-[#f7f4ed] overflow-x-hidden" data-testid="zone-layout">
      <Navigation />
      <main className="pt-20 sm:pt-24">
        {isZonePage ? (
          children
        ) : (
          <div className="mx-auto w-full max-w-[1344px] px-4 pb-16 pt-8 sm:px-6">
            {/* Settings renders its own back link inside its centered column. */}
            {pathname !== '/dashboard/settings' ? <ZoneBackLink language={language} className="-mt-2 mb-4" /> : null}
            {children}
          </div>
        )}
      </main>
      <Footer language={language} />
    </div>
  )
}

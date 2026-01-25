'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
import { supabase } from '../../lib/supabase'
import Navigation from '../../components/Navigation'

const dashboardMenuItems = [
  {
    title: 'Overview',
    href: '/dashboard',
    icon: Activity,
    description: 'Dashboard overview'
  },
  {
    title: 'Profile',
    href: '/dashboard/profile',
    icon: User,
    description: 'Manage your profile'
  },
  {
    title: 'My Favorites',
    href: '/dashboard/favorites',
    icon: Heart,
    description: 'Saved properties'
  },
  {
    title: 'Saved Searches',
    href: '/dashboard/searches',
    icon: Search,
    description: 'Your search criteria'
  },
  {
    title: 'My Inquiries',
    href: '/dashboard/inquiries',
    icon: MessageSquare,
    description: 'Property inquiries'
  },
  {
    title: 'Recommendations',
    href: '/dashboard/recommendations',
    icon: TrendingUp,
    description: 'Suggested properties'
  },
  {
    title: 'Notifications',
    href: '/dashboard/notifications',
    icon: Bell,
    description: 'Email preferences'
  },
  {
    title: 'Client Form',
    href: '/dashboard/intake-form',
    icon: FileText,
    description: 'Personal information'
  },
  {
    title: 'Webinars',
    href: '/dashboard/webinars',
    icon: Calendar,
    description: 'Events & sessions'
  },
  {
    title: 'Documents',
    href: '/dashboard/documents',
    icon: Briefcase,
    description: 'Files & contracts'
  },
  {
    title: 'Concierge',
    href: '/dashboard/concierge',
    icon: MessageCircle,
    description: 'Premium support'
  },
  {
    title: 'Exclusive Content',
    href: '/dashboard/content',
    icon: Video,
    description: 'Videos & guides'
  }
]

export default function DashboardLayout({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userProfile, setUserProfile] = useState(null)
  const router = useRouter()

  useEffect(() => {
    checkUserAccess()
  }, [])

  const checkUserAccess = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        router.push('/')
        return
      }

      setUser(user)

      // Load user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      setUserProfile(profile)
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center pt-20">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-8 text-center">
              <User className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-2">Login Required</h1>
              <p className="text-gray-600 mb-4">
                Please login to access your dashboard.
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
    <div className="min-h-screen bg-gray-50 home-page-custom-border">
      
      <div className="pt-16 lg:pt-0">
        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" 
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="flex flex-col h-full pt-16 lg:pt-0">
            {/* Logo */}
            <div className="flex items-center justify-between h-16 px-6 border-b">
              <Link href="/dashboard" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <span className="font-bold text-gray-900">My Dashboard</span>
              </Link>
              <button 
                className="lg:hidden" 
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-4 space-y-2">
              {dashboardMenuItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon className={`h-5 w-5 ${item.className || ''}`} />
                    <div>
                      <div className={`font-medium ${item.className || ''}`}>{item.title}</div>
                      <div className="text-xs text-gray-500">{item.description}</div>
                    </div>
                  </Link>
                )
              })}
            </nav>

            {/* User Info */}
            <div className="p-4 border-t">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {userProfile?.name || user?.user_metadata?.name || user?.email}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Link href="/" className="w-full">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Home className="h-4 w-4 mr-2" />
                    Browse Properties
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="lg:pl-64">
          {/* Mobile header */}
          <div className="lg:hidden flex items-center justify-between h-16 px-6 bg-white border-b">
            <button onClick={() => setSidebarOpen(true)}>
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="font-semibold text-gray-900">Dashboard</h1>
            <div className="w-6" /> {/* Spacer */}
          </div>

          {/* Page content */}
          <main className="min-h-screen lg:min-h-0 p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
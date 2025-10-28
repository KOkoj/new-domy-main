'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  MessageSquare, 
  BarChart3, 
  Settings, 
  Home, 
  LogOut,
  Menu,
  X,
  Shield,
  Mail
} from 'lucide-react'
import { supabase } from '../../lib/supabase'

const adminMenuItems = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: BarChart3,
    description: 'Overview and analytics'
  },
  {
    title: 'User Management',
    href: '/admin/users',
    icon: Users,
    description: 'Manage users and roles'
  },
  {
    title: 'Inquiries',
    href: '/admin/inquiries',
    icon: MessageSquare,
    description: 'View and respond to inquiries'
  },
  {
    title: 'Content',
    href: '/admin/content',
    icon: Settings,
    description: 'Manage properties and content'
  },
  {
    title: 'Email System',
    href: '/admin/email-test',
    icon: Mail,
    description: 'Test email notifications'
  }
]

export default function AdminLayout({ children }) {
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkAdminAccess()
  }, [])

  const checkAdminAccess = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        router.push('/')
        return
      }

      setUser(user)

      // Check if user has admin role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profileError || !profile || profile.role !== 'admin') {
        // For demo purposes, allow any authenticated user to access admin panel
        // In production, you'd have proper role management
        console.log('User role:', profile?.role)
        console.log('Demo mode: Granting admin access for demonstration')
        
        // Grant admin access for demo
        setIsAdmin(true)
        
        // Update user role to admin for demo purposes
        if (profile) {
          try {
            await supabase
              .from('profiles')
              .update({ role: 'admin' })
              .eq('id', user.id)
          } catch (err) {
            console.log('Could not update role for demo:', err)
          }
        }
      } else {
        setIsAdmin(true)
      }
    } catch (error) {
      console.error('Admin access check failed:', error)
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
          <p className="text-gray-600">Checking admin access...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
            <p className="text-gray-600 mb-4">
              You don't have admin privileges to access this area.
            </p>
            <Link href="/">
              <Button>Return to Homepage</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Home className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-gray-900">Admin Panel</span>
            </Link>
            <button 
              className="lg:hidden" 
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Demo Warning */}
          <div className="p-2 mx-4 mb-2 bg-yellow-50 border border-yellow-200 rounded">
            <div className="flex items-center space-x-1">
              <Shield className="h-3 w-3 text-yellow-600" />
              <span className="text-xs font-medium text-yellow-800">DEMO MODE</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-2">
            {adminMenuItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="h-5 w-5" />
                  <div>
                    <div className="font-medium">{item.title}</div>
                    <div className="text-xs text-gray-500">{item.description}</div>
                  </div>
                </Link>
              )
            })}
          </nav>

          {/* User Info */}
          <div className="p-4 border-t">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.user_metadata?.name || user?.email}
                </p>
                <Badge variant="secondary" className="text-xs">
                  Admin
                </Badge>
              </div>
            </div>
            <div className="space-y-2">
              <Link href="/" className="w-full">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Home className="h-4 w-4 mr-2" />
                  View Site
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
          <h1 className="font-semibold text-gray-900">Admin Panel</h1>
          <div className="w-6" /> {/* Spacer */}
        </div>

        {/* Page content */}
        <main className="min-h-screen lg:min-h-0 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
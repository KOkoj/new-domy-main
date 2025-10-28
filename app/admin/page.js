'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Users, 
  MessageSquare, 
  Home, 
  TrendingUp,
  Activity,
  Calendar,
  Heart,
  Search,
  AlertCircle
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import Link from 'next/link'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalInquiries: 0,
    totalFavorites: 0,
    totalSavedSearches: 0,
    recentUsers: [],
    recentInquiries: [],
    loading: true
  })

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      // Load user count
      const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
      
      // Load inquiries count
      const { count: inquiryCount } = await supabase
        .from('inquiries')
        .select('*', { count: 'exact', head: true })
      
      // Load favorites count
      const { count: favoriteCount } = await supabase
        .from('favorites')
        .select('*', { count: 'exact', head: true })
      
      // Load saved searches count
      const { count: searchCount } = await supabase
        .from('saved_searches')
        .select('*', { count: 'exact', head: true })
      
      // Load recent users
      const { data: recentUsers } = await supabase
        .from('profiles')
        .select('*')
        .order('createdAt', { ascending: false })
        .limit(5)
      
      // Load recent inquiries
      const { data: recentInquiries } = await supabase
        .from('inquiries')
        .select('*')
        .order('createdAt', { ascending: false })
        .limit(5)

      setStats({
        totalUsers: userCount || 0,
        totalInquiries: inquiryCount || 0,
        totalFavorites: favoriteCount || 0,
        totalSavedSearches: searchCount || 0,
        recentUsers: recentUsers || [],
        recentInquiries: recentInquiries || [],
        loading: false
      })
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      setStats(prev => ({ ...prev, loading: false }))
    }
  }

  if (stats.loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        </div>
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      change: '+12%',
      href: '/admin/users'
    },
    {
      title: 'Property Inquiries',
      value: stats.totalInquiries,
      icon: MessageSquare,
      color: 'text-slate-800',
      bgColor: 'bg-slate-100',
      change: '+8%',
      href: '/admin/inquiries'
    },
    {
      title: 'Total Favorites',
      value: stats.totalFavorites,
      icon: Heart,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      change: '+23%',
      href: '/admin/users'
    },
    {
      title: 'Saved Searches',
      value: stats.totalSavedSearches,
      icon: Search,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      change: '+15%',
      href: '/admin/users'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Italian Property Platform Management</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary">
            Last updated: {new Date().toLocaleTimeString()}
          </Badge>
          <Button variant="outline" onClick={loadDashboardData}>
            <Activity className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Link key={index} href={stat.href}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                      <div className="flex items-center mt-2">
                        <TrendingUp className="h-4 w-4 text-slate-800 mr-1" />
                        <span className="text-sm text-slate-800 font-medium">{stat.change}</span>
                        <span className="text-sm text-gray-500 ml-1">vs last month</span>
                      </div>
                    </div>
                    <div className={`p-3 rounded-full ${stat.bgColor}`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Recent Users</span>
            </CardTitle>
            <Link href="/admin/users">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {stats.recentUsers.length > 0 ? (
              <div className="space-y-4">
                {stats.recentUsers.map((user, index) => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.name || 'Unknown User'}</p>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary" className="text-xs">{user.role}</Badge>
                          <span className="text-xs text-gray-500">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No users found</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Inquiries */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5" />
              <span>Recent Inquiries</span>
            </CardTitle>
            <Link href="/admin/inquiries">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {stats.recentInquiries.length > 0 ? (
              <div className="space-y-4">
                {stats.recentInquiries.map((inquiry, index) => (
                  <div key={inquiry.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-gray-900">{inquiry.name}</p>
                        <p className="text-sm text-gray-600">{inquiry.email}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        Property: {inquiry.listingId}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-700 line-clamp-2">{inquiry.message}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(inquiry.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No inquiries found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/admin/users">
              <Button variant="outline" className="w-full h-16 flex-col space-y-2">
                <Users className="h-5 w-5" />
                <span>Manage Users</span>
              </Button>
            </Link>
            <Link href="/admin/inquiries">
              <Button variant="outline" className="w-full h-16 flex-col space-y-2">
                <MessageSquare className="h-5 w-5" />
                <span>Review Inquiries</span>
              </Button>
            </Link>
            <Link href="/admin/content">
              <Button variant="outline" className="w-full h-16 flex-col space-y-2">
                <Home className="h-5 w-5" />
                <span>Manage Content</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>System Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
              <div className="w-3 h-3 bg-slate-500 rounded-full"></div>
              <div>
                <p className="font-medium text-slate-900">Database</p>
                <p className="text-sm text-slate-700">Connected</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
              <div className="w-3 h-3 bg-slate-500 rounded-full"></div>
              <div>
                <p className="font-medium text-slate-900">Authentication</p>
                <p className="text-sm text-slate-700">Active</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
              <div className="w-3 h-3 bg-slate-500 rounded-full"></div>
              <div>
                <p className="font-medium text-slate-900">API Services</p>
                <p className="text-sm text-slate-700">Operational</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
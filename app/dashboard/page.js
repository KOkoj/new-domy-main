'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Heart, 
  Search, 
  MessageSquare, 
  TrendingUp,
  Activity,
  Calendar,
  MapPin,
  DollarSign,
  Bed,
  Bath,
  ChevronRight,
  Bell,
  Star,
  Settings
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import Link from 'next/link'

// Sample property data for recommendations
const SAMPLE_RECOMMENDATIONS = [
  {
    _id: '1',
    title: { en: 'Luxury Villa with Lake Como Views' },
    price: { amount: 2500000, currency: 'EUR' },
    location: { city: { name: { en: 'Como' } } },
    specifications: { bedrooms: 4, bathrooms: 3, squareFootage: 350 },
    image: 'https://images.unsplash.com/photo-1734173071981-b16ee4f9867f',
    matchScore: 95
  },
  {
    _id: '2',
    title: { en: 'Tuscan Farmhouse with Vineyards' },
    price: { amount: 1200000, currency: 'EUR' },
    location: { city: { name: { en: 'Tuscany' } } },
    specifications: { bedrooms: 3, bathrooms: 2, squareFootage: 280 },
    image: 'https://images.unsplash.com/12/gladiator.jpg',
    matchScore: 88
  }
]

export default function DashboardOverview() {
  const [stats, setStats] = useState({
    favorites: 0,
    savedSearches: 0,
    inquiries: 0,
    recentActivity: [],
    loading: true
  })
  const [user, setUser] = useState(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      
      setUser(user)

      // Load user stats
      const [favoritesRes, searchesRes, inquiriesRes] = await Promise.all([
        supabase.from('favorites').select('*', { count: 'exact', head: true }).eq('userId', user.id),
        supabase.from('saved_searches').select('*', { count: 'exact', head: true }).eq('userId', user.id),
        supabase.from('inquiries').select('*', { count: 'exact', head: true }).eq('userId', user.id)
      ])

      // Load recent activity
      const { data: recentFavorites } = await supabase
        .from('favorites')
        .select('*')
        .eq('userId', user.id)
        .order('createdAt', { ascending: false })
        .limit(3)

      const { data: recentInquiries } = await supabase
        .from('inquiries')
        .select('*')
        .eq('userId', user.id)
        .order('createdAt', { ascending: false })
        .limit(2)

      // Combine recent activity
      const recentActivity = [
        ...(recentFavorites || []).map(fav => ({
          type: 'favorite',
          action: 'Added property to favorites',
          propertyId: fav.listingId,
          date: fav.createdAt
        })),
        ...(recentInquiries || []).map(inq => ({
          type: 'inquiry',
          action: 'Sent property inquiry',
          propertyId: inq.listingId,
          date: inq.createdAt
        }))
      ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5)

      setStats({
        favorites: favoritesRes.count || 0,
        savedSearches: searchesRes.count || 0,
        inquiries: inquiriesRes.count || 0,
        recentActivity,
        loading: false
      })
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      setStats(prev => ({ ...prev, loading: false }))
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: price.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price.amount)
  }

  if (stats.loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map(i => (
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.user_metadata?.name || 'User'}!
          </h1>
          <p className="text-gray-600 mt-1">Here's what's happening with your property search</p>
        </div>
        <Button>
          <Bell className="h-4 w-4 mr-2" />
          Notifications
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/dashboard/favorites">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Favorite Properties</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.favorites}</p>
                  <p className="text-sm text-gray-500 mt-1">Properties saved</p>
                </div>
                <div className="p-3 rounded-full bg-red-100">
                  <Heart className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/searches">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Saved Searches</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.savedSearches}</p>
                  <p className="text-sm text-gray-500 mt-1">Active searches</p>
                </div>
                <div className="p-3 rounded-full bg-blue-100">
                  <Search className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/inquiries">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Property Inquiries</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.inquiries}</p>
                  <p className="text-sm text-gray-500 mt-1">Inquiries sent</p>
                </div>
                <div className="p-3 rounded-full bg-slate-100">
                  <MessageSquare className="h-6 w-6 text-slate-800" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Recent Activity</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentActivity.length > 0 ? (
              <div className="space-y-4">
                {stats.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`p-2 rounded-full ${activity.type === 'favorite' ? 'bg-red-100' : 'bg-slate-100'}`}>
                      {activity.type === 'favorite' ? (
                        <Heart className="h-4 w-4 text-red-600" />
                      ) : (
                        <MessageSquare className="h-4 w-4 text-slate-800" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                      <p className="text-xs text-gray-500">Property ID: {activity.propertyId}</p>
                      <p className="text-xs text-gray-500">{new Date(activity.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No recent activity</p>
                <p className="text-sm">Start exploring properties to see your activity here</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Property Recommendations */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Recommended for You</span>
            </CardTitle>
            <Link href="/dashboard/recommendations">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {SAMPLE_RECOMMENDATIONS.map((property) => (
                <div key={property._id} className="flex items-center space-x-4 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <img 
                    src={property.image} 
                    alt={property.title.en}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium text-gray-900 text-sm">{property.title.en}</h4>
                      <Badge variant="secondary" className="text-xs">
                        <Star className="h-3 w-3 mr-1" />
                        {property.matchScore}% match
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-3 text-xs text-gray-600">
                      <span className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {property.location?.city?.name?.en}
                      </span>
                      <span className="flex items-center font-medium text-blue-600">
                        <DollarSign className="h-3 w-3 mr-1" />
                        {formatPrice(property.price)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3 text-xs text-gray-600 mt-1">
                      <span className="flex items-center">
                        <Bed className="h-3 w-3 mr-1" />
                        {property.specifications.bedrooms} beds
                      </span>
                      <span className="flex items-center">
                        <Bath className="h-3 w-3 mr-1" />
                        {property.specifications.bathrooms} baths
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link href="/properties">
              <Button variant="outline" className="w-full h-16 flex-col space-y-2">
                <Search className="h-5 w-5" />
                <span>Browse Properties</span>
              </Button>
            </Link>
            <Link href="/dashboard/profile">
              <Button variant="outline" className="w-full h-16 flex-col space-y-2">
                <Settings className="h-5 w-5" />
                <span>Update Profile</span>
              </Button>
            </Link>
            <Link href="/dashboard/searches">
              <Button variant="outline" className="w-full h-16 flex-col space-y-2">
                <Bell className="h-5 w-5" />
                <span>Manage Alerts</span>
              </Button>
            </Link>
            <Link href="/regions">
              <Button variant="outline" className="w-full h-16 flex-col space-y-2">
                <MapPin className="h-5 w-5" />
                <span>Explore Regions</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
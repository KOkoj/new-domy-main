'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Calendar,
  Clock,
  Users,
  Video,
  Play,
  CheckCircle,
  CalendarPlus,
  Download,
  Share2
} from 'lucide-react'
import { supabase } from '../../../lib/supabase'

const UPCOMING_WEBINARS = [
  {
    id: 1,
    title: 'Italian Property Market Trends 2025',
    description: 'Comprehensive overview of the current Italian real estate market, emerging trends, and investment opportunities across different regions.',
    date: '2025-10-15',
    time: '14:00 CET',
    duration: '90 minutes',
    speaker: {
      name: 'Maria Rossi',
      title: 'Senior Real Estate Analyst',
      avatar: '/placeholder-avatar.jpg'
    },
    spots: 15,
    registered: false,
    category: 'Market Insights'
  },
  {
    id: 2,
    title: 'Tax Benefits for Foreign Property Owners',
    description: 'Learn about tax advantages, deductions, and fiscal incentives available to international buyers purchasing property in Italy.',
    date: '2025-10-22',
    time: '16:00 CET',
    duration: '60 minutes',
    speaker: {
      name: 'Giovanni Bianchi',
      title: 'Tax Consultant',
      avatar: '/placeholder-avatar.jpg'
    },
    spots: 20,
    registered: false,
    category: 'Legal & Tax'
  },
  {
    id: 3,
    title: 'Restoration & Renovation Guide',
    description: 'Expert guidance on renovating historical Italian properties, navigating permits, working with local contractors, and preserving authenticity.',
    date: '2025-10-29',
    time: '15:00 CET',
    duration: '75 minutes',
    speaker: {
      name: 'Alessandra Conti',
      title: 'Architectural Consultant',
      avatar: '/placeholder-avatar.jpg'
    },
    spots: 18,
    registered: true,
    category: 'Renovation'
  },
  {
    id: 4,
    title: 'Financing Your Italian Dream Home',
    description: 'Understanding mortgage options, international financing, currency considerations, and working with Italian banks.',
    date: '2025-11-05',
    time: '13:00 CET',
    duration: '60 minutes',
    speaker: {
      name: 'Franco Lombardi',
      title: 'Mortgage Specialist',
      avatar: '/placeholder-avatar.jpg'
    },
    spots: 25,
    registered: false,
    category: 'Financing'
  }
]

const PAST_WEBINARS = [
  {
    id: 101,
    title: 'Legal Framework for Property Purchase in Italy',
    description: 'Complete guide to the Italian property buying process, legal requirements, and necessary documentation.',
    date: '2025-09-18',
    time: '14:00 CET',
    duration: '90 minutes',
    speaker: {
      name: 'Lucia Ferrari',
      title: 'Real Estate Attorney',
      avatar: '/placeholder-avatar.jpg'
    },
    views: 124,
    category: 'Legal & Tax',
    recordingUrl: '#'
  },
  {
    id: 102,
    title: 'Living in Tuscany: A Complete Guide',
    description: 'Discover the lifestyle, culture, and practical aspects of living in one of Italy\'s most beloved regions.',
    date: '2025-09-10',
    time: '16:00 CET',
    duration: '60 minutes',
    speaker: {
      name: 'Marco Benedetti',
      title: 'Regional Expert',
      avatar: '/placeholder-avatar.jpg'
    },
    views: 89,
    category: 'Lifestyle',
    recordingUrl: '#'
  },
  {
    id: 103,
    title: 'Property Management for Absentee Owners',
    description: 'How to effectively manage your Italian property when you\'re not there, including rental opportunities.',
    date: '2025-08-25',
    time: '15:00 CET',
    duration: '75 minutes',
    speaker: {
      name: 'Silvia Martini',
      title: 'Property Manager',
      avatar: '/placeholder-avatar.jpg'
    },
    views: 156,
    category: 'Management',
    recordingUrl: '#'
  }
]

export default function WebinarsPage() {
  const [user, setUser] = useState(null)
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadWebinarData()
  }, [])

  const loadWebinarData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      
      setUser(user)

      // TODO: Load user's webinar registrations from database
      // For now using hardcoded data
      setRegistrations([3]) // User registered for webinar ID 3
    } catch (error) {
      console.error('Error loading webinar data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (webinarId) => {
    try {
      // TODO: Save registration to database
      setRegistrations(prev => [...prev, webinarId])
      
      // TODO: Send confirmation email
      alert('Successfully registered! You will receive a confirmation email with the webinar link.')
    } catch (error) {
      console.error('Error registering for webinar:', error)
      alert('Failed to register. Please try again.')
    }
  }

  const handleUnregister = async (webinarId) => {
    try {
      // TODO: Remove registration from database
      setRegistrations(prev => prev.filter(id => id !== webinarId))
      alert('Registration cancelled successfully.')
    } catch (error) {
      console.error('Error cancelling registration:', error)
      alert('Failed to cancel registration. Please try again.')
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  const addToCalendar = (webinar) => {
    // Simple calendar download functionality
    const startDate = new Date(`${webinar.date}T${webinar.time.split(' ')[0]}:00`)
    const endDate = new Date(startDate.getTime() + 90 * 60000) // Add 90 minutes
    
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTEND:${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z
SUMMARY:${webinar.title}
DESCRIPTION:${webinar.description}
LOCATION:Online Webinar
END:VEVENT
END:VCALENDAR`

    const blob = new Blob([icsContent], { type: 'text/calendar' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${webinar.title.replace(/\s+/g, '-')}.ics`
    link.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-copper-400"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6" data-testid="webinars-container">
      {/* Header */}
      <div data-testid="webinars-header">
        <h1 className="text-3xl font-bold text-white flex items-center space-x-3" data-testid="webinars-title">
          <Calendar className="h-8 w-8 text-copper-400" data-testid="webinars-title-icon" />
          <span data-testid="webinars-title-text">Webinar Calendar</span>
        </h1>
        <p className="text-gray-400 mt-2" data-testid="webinars-subtitle">
          Join exclusive educational sessions with industry experts
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="upcoming" className="w-full" data-testid="webinars-tabs">
        <TabsList className="bg-slate-800 border border-copper-400/20" data-testid="webinars-tabs-list">
          <TabsTrigger value="upcoming" className="data-[state=active]:bg-copper-600" data-testid="webinars-tab-upcoming">
            Upcoming Webinars
          </TabsTrigger>
          <TabsTrigger value="past" className="data-[state=active]:bg-copper-600" data-testid="webinars-tab-past">
            Past Recordings
          </TabsTrigger>
        </TabsList>

        {/* Upcoming Webinars */}
        <TabsContent value="upcoming" className="space-y-4 mt-6" data-testid="webinars-upcoming-content">
          {UPCOMING_WEBINARS.map((webinar) => {
            const isRegistered = registrations.includes(webinar.id)
            
            return (
              <Card key={webinar.id} className="bg-slate-800 border-copper-400/20" data-testid={`webinar-upcoming-${webinar.id}`}>
                <CardContent className="p-6" data-testid={`webinar-upcoming-${webinar.id}-content`}>
                  <div className="flex flex-col lg:flex-row gap-6" data-testid={`webinar-upcoming-${webinar.id}-layout`}>
                    {/* Date Badge */}
                    <div className="flex-shrink-0" data-testid={`webinar-upcoming-${webinar.id}-date-container`}>
                      <div className="w-24 h-24 bg-gradient-to-br from-copper-400 to-copper-600 rounded-lg flex flex-col items-center justify-center text-slate-900" data-testid={`webinar-upcoming-${webinar.id}-date-badge`}>
                        <div className="text-xs font-semibold uppercase" data-testid={`webinar-upcoming-${webinar.id}-date-month`}>
                          {new Date(webinar.date).toLocaleDateString('en-US', { month: 'short' })}
                        </div>
                        <div className="text-3xl font-bold" data-testid={`webinar-upcoming-${webinar.id}-date-day`}>
                          {new Date(webinar.date).getDate()}
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1" data-testid={`webinar-upcoming-${webinar.id}-content-area`}>
                      <div className="flex items-start justify-between mb-3" data-testid={`webinar-upcoming-${webinar.id}-header`}>
                        <div data-testid={`webinar-upcoming-${webinar.id}-info`}>
                          <Badge className="bg-copper-600/20 text-copper-400 border-copper-400/30 mb-2" data-testid={`webinar-upcoming-${webinar.id}-category`}>
                            {webinar.category}
                          </Badge>
                          <h3 className="text-xl font-bold text-white mb-2" data-testid={`webinar-upcoming-${webinar.id}-title`}>{webinar.title}</h3>
                          <p className="text-gray-400 text-sm" data-testid={`webinar-upcoming-${webinar.id}-description`}>{webinar.description}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-4" data-testid={`webinar-upcoming-${webinar.id}-details`}>
                        <span className="flex items-center" data-testid={`webinar-upcoming-${webinar.id}-date-info`}>
                          <Calendar className="h-4 w-4 mr-1" data-testid={`webinar-upcoming-${webinar.id}-date-icon`} />
                          {formatDate(webinar.date)}
                        </span>
                        <span className="flex items-center" data-testid={`webinar-upcoming-${webinar.id}-time-info`}>
                          <Clock className="h-4 w-4 mr-1" data-testid={`webinar-upcoming-${webinar.id}-time-icon`} />
                          {webinar.time}
                        </span>
                        <span className="flex items-center" data-testid={`webinar-upcoming-${webinar.id}-duration-info`}>
                          <Video className="h-4 w-4 mr-1" data-testid={`webinar-upcoming-${webinar.id}-duration-icon`} />
                          {webinar.duration}
                        </span>
                        <span className="flex items-center" data-testid={`webinar-upcoming-${webinar.id}-spots-info`}>
                          <Users className="h-4 w-4 mr-1" data-testid={`webinar-upcoming-${webinar.id}-spots-icon`} />
                          {webinar.spots} spots available
                        </span>
                      </div>

                      <div className="flex items-center justify-between" data-testid={`webinar-upcoming-${webinar.id}-footer`}>
                        <div className="flex items-center space-x-3" data-testid={`webinar-upcoming-${webinar.id}-speaker`}>
                          <div className="w-10 h-10 bg-gradient-to-br from-copper-400 to-copper-600 rounded-full flex items-center justify-center text-slate-900 font-bold" data-testid={`webinar-upcoming-${webinar.id}-speaker-avatar`}>
                            {webinar.speaker.name.charAt(0)}
                          </div>
                          <div data-testid={`webinar-upcoming-${webinar.id}-speaker-info`}>
                            <p className="text-white text-sm font-medium" data-testid={`webinar-upcoming-${webinar.id}-speaker-name`}>{webinar.speaker.name}</p>
                            <p className="text-gray-400 text-xs" data-testid={`webinar-upcoming-${webinar.id}-speaker-title`}>{webinar.speaker.title}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2" data-testid={`webinar-upcoming-${webinar.id}-actions`}>
                          {isRegistered && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => addToCalendar(webinar)}
                                className="bg-transparent border-copper-400/20 text-copper-400 hover:bg-copper-400/10"
                                data-testid={`webinar-upcoming-${webinar.id}-add-calendar`}
                              >
                                <CalendarPlus className="h-4 w-4 mr-2" data-testid={`webinar-upcoming-${webinar.id}-add-calendar-icon`} />
                                Add to Calendar
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUnregister(webinar.id)}
                                className="bg-transparent border-red-400/20 text-red-400 hover:bg-red-400/10"
                                data-testid={`webinar-upcoming-${webinar.id}-cancel`}
                              >
                                Cancel
                              </Button>
                            </>
                          )}
                          {!isRegistered && (
                            <Button
                              onClick={() => handleRegister(webinar.id)}
                              className="bg-copper-600 hover:bg-copper-700"
                              data-testid={`webinar-upcoming-${webinar.id}-register`}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" data-testid={`webinar-upcoming-${webinar.id}-register-icon`} />
                              Register Now
                            </Button>
                          )}
                        </div>
                      </div>

                      {isRegistered && (
                        <div className="mt-4 p-3 bg-green-900/20 border border-green-600/30 rounded-lg" data-testid={`webinar-upcoming-${webinar.id}-registered-status`}>
                          <p className="text-green-400 text-sm flex items-center" data-testid={`webinar-upcoming-${webinar.id}-registered-message`}>
                            <CheckCircle className="h-4 w-4 mr-2" data-testid={`webinar-upcoming-${webinar.id}-registered-icon`} />
                            You're registered! A calendar invite and webinar link will be sent to your email.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </TabsContent>

        {/* Past Webinars / Recordings */}
        <TabsContent value="past" className="space-y-4 mt-6" data-testid="webinars-past-content">
          {PAST_WEBINARS.map((webinar) => (
            <Card key={webinar.id} className="bg-slate-800 border-copper-400/20" data-testid={`webinar-past-${webinar.id}`}>
              <CardContent className="p-6" data-testid={`webinar-past-${webinar.id}-content`}>
                <div className="flex flex-col lg:flex-row gap-6" data-testid={`webinar-past-${webinar.id}-layout`}>
                  {/* Video Thumbnail */}
                  <div className="flex-shrink-0" data-testid={`webinar-past-${webinar.id}-thumbnail-container`}>
                    <div className="w-48 h-28 bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg flex items-center justify-center relative overflow-hidden group cursor-pointer" data-testid={`webinar-past-${webinar.id}-thumbnail`}>
                      <Play className="h-12 w-12 text-copper-400 group-hover:scale-110 transition-transform" data-testid={`webinar-past-${webinar.id}-play-icon`} />
                      <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded text-xs text-white" data-testid={`webinar-past-${webinar.id}-duration-badge`}>
                        {webinar.duration}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1" data-testid={`webinar-past-${webinar.id}-content-area`}>
                    <div className="flex items-start justify-between mb-3" data-testid={`webinar-past-${webinar.id}-header`}>
                      <div data-testid={`webinar-past-${webinar.id}-info`}>
                        <Badge className="bg-slate-700 text-gray-300 border-slate-600 mb-2" data-testid={`webinar-past-${webinar.id}-category`}>
                          {webinar.category}
                        </Badge>
                        <h3 className="text-xl font-bold text-white mb-2" data-testid={`webinar-past-${webinar.id}-title`}>{webinar.title}</h3>
                        <p className="text-gray-400 text-sm" data-testid={`webinar-past-${webinar.id}-description`}>{webinar.description}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-4" data-testid={`webinar-past-${webinar.id}-details`}>
                      <span className="flex items-center" data-testid={`webinar-past-${webinar.id}-date-info`}>
                        <Calendar className="h-4 w-4 mr-1" data-testid={`webinar-past-${webinar.id}-date-icon`} />
                        {formatDate(webinar.date)}
                      </span>
                      <span className="flex items-center" data-testid={`webinar-past-${webinar.id}-views-info`}>
                        <Users className="h-4 w-4 mr-1" data-testid={`webinar-past-${webinar.id}-views-icon`} />
                        {webinar.views} views
                      </span>
                    </div>

                    <div className="flex items-center justify-between" data-testid={`webinar-past-${webinar.id}-footer`}>
                      <div className="flex items-center space-x-3" data-testid={`webinar-past-${webinar.id}-speaker`}>
                        <div className="w-10 h-10 bg-gradient-to-br from-copper-400 to-copper-600 rounded-full flex items-center justify-center text-slate-900 font-bold" data-testid={`webinar-past-${webinar.id}-speaker-avatar`}>
                          {webinar.speaker.name.charAt(0)}
                        </div>
                        <div data-testid={`webinar-past-${webinar.id}-speaker-info`}>
                          <p className="text-white text-sm font-medium" data-testid={`webinar-past-${webinar.id}-speaker-name`}>{webinar.speaker.name}</p>
                          <p className="text-gray-400 text-xs" data-testid={`webinar-past-${webinar.id}-speaker-title`}>{webinar.speaker.title}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2" data-testid={`webinar-past-${webinar.id}-actions`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-transparent border-copper-400/20 text-copper-400 hover:bg-copper-400/10"
                          data-testid={`webinar-past-${webinar.id}-download`}
                        >
                          <Download className="h-4 w-4 mr-2" data-testid={`webinar-past-${webinar.id}-download-icon`} />
                          Download
                        </Button>
                        <Button
                          className="bg-copper-600 hover:bg-copper-700"
                          data-testid={`webinar-past-${webinar.id}-watch`}
                        >
                          <Play className="h-4 w-4 mr-2" data-testid={`webinar-past-${webinar.id}-watch-icon`} />
                          Watch Recording
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}


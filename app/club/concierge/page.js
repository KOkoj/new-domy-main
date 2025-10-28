'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  MessageCircle,
  Send,
  CheckCircle,
  Clock,
  AlertCircle,
  Phone,
  Mail,
  Calendar,
  User,
  Sparkles
} from 'lucide-react'
import { supabase } from '../../../lib/supabase'

const SAMPLE_TICKETS = [
  {
    id: 1,
    subject: 'Property Viewing Request - Villa in Tuscany',
    category: 'Property Viewing',
    status: 'open',
    priority: 'high',
    createdAt: '2025-10-01',
    lastUpdate: '2025-10-05',
    messages: 3
  },
  {
    id: 2,
    subject: 'Tax Documentation Question',
    category: 'Legal Support',
    status: 'in-progress',
    priority: 'medium',
    createdAt: '2025-09-28',
    lastUpdate: '2025-10-04',
    messages: 5
  },
  {
    id: 3,
    subject: 'Mortgage Pre-approval Assistance',
    category: 'Financing',
    status: 'resolved',
    priority: 'medium',
    createdAt: '2025-09-20',
    lastUpdate: '2025-09-25',
    messages: 8
  }
]

const TICKET_CATEGORIES = [
  'General Inquiry',
  'Property Viewing',
  'Legal Support',
  'Tax Questions',
  'Financing',
  'Property Management',
  'Renovation Advice',
  'Lifestyle & Relocation',
  'Other'
]

const PRIORITY_LEVELS = [
  { value: 'low', label: 'Low', color: 'text-green-400' },
  { value: 'medium', label: 'Medium', color: 'text-yellow-400' },
  { value: 'high', label: 'High', color: 'text-red-400' }
]

export default function ConciergePage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [tickets, setTickets] = useState(SAMPLE_TICKETS)

  const [newTicket, setNewTicket] = useState({
    subject: '',
    category: '',
    priority: 'medium',
    description: '',
    contactMethod: 'email'
  })

  useEffect(() => {
    loadConciergeData()
  }, [])

  const loadConciergeData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      
      setUser(user)

      // TODO: Load user's tickets from database
      // For now using sample data
    } catch (error) {
      console.error('Error loading concierge data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitTicket = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage({ type: '', text: '' })

    try {
      if (!newTicket.subject || !newTicket.category || !newTicket.description) {
        setMessage({ type: 'error', text: 'Please fill in all required fields.' })
        setSubmitting(false)
        return
      }

      // TODO: Save ticket to database
      const newTicketData = {
        id: tickets.length + 1,
        ...newTicket,
        status: 'open',
        createdAt: new Date().toISOString().split('T')[0],
        lastUpdate: new Date().toISOString().split('T')[0],
        messages: 1
      }

      setTickets(prev => [newTicketData, ...prev])
      setMessage({ 
        type: 'success', 
        text: 'Your request has been submitted! Our team will respond within 24 hours.' 
      })
      
      // Reset form
      setNewTicket({
        subject: '',
        category: '',
        priority: 'medium',
        description: '',
        contactMethod: 'email'
      })

      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (error) {
      console.error('Error submitting ticket:', error)
      setMessage({ type: 'error', text: 'Failed to submit request. Please try again.' })
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusBadge = (status) => {
    const styles = {
      open: 'bg-blue-900/20 text-blue-400 border-blue-400/30',
      'in-progress': 'bg-yellow-900/20 text-yellow-400 border-yellow-400/30',
      resolved: 'bg-green-900/20 text-green-400 border-green-400/30',
      closed: 'bg-gray-900/20 text-gray-400 border-gray-400/30'
    }
    return styles[status] || styles.open
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-copper-400"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center space-x-3">
          <MessageCircle className="h-8 w-8 text-copper-400" />
          <span>Premium Concierge Service</span>
        </h1>
        <p className="text-gray-400 mt-2">
          Get personalized assistance from our dedicated support team
        </p>
      </div>

      {/* Contact Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-800 border-copper-400/20">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-copper-400/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <Phone className="h-6 w-6 text-copper-400" />
            </div>
            <h3 className="font-semibold text-white mb-1">Call Us</h3>
            <p className="text-sm text-gray-400 mb-3">Mon-Fri, 9AM-6PM CET</p>
            <p className="text-copper-400 font-medium">+39 02 1234 5678</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-copper-400/20">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-blue-400/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <Mail className="h-6 w-6 text-blue-400" />
            </div>
            <h3 className="font-semibold text-white mb-1">Email Us</h3>
            <p className="text-sm text-gray-400 mb-3">Response within 24 hours</p>
            <p className="text-blue-400 font-medium">concierge@domy.com</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-copper-400/20">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-green-400/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <Calendar className="h-6 w-6 text-green-400" />
            </div>
            <h3 className="font-semibold text-white mb-1">Book a Call</h3>
            <p className="text-sm text-gray-400 mb-3">Schedule a consultation</p>
            <Button size="sm" className="bg-green-600 hover:bg-green-700">
              Schedule Now
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Message Alert */}
      {message.text && (
        <Alert 
          variant={message.type === 'error' ? 'destructive' : 'default'}
          className={message.type === 'success' ? 'bg-green-900/20 border-green-600 text-green-400' : ''}
        >
          {message.type === 'success' ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      {/* Tabs */}
      <Tabs defaultValue="new" className="w-full">
        <TabsList className="bg-slate-800 border border-copper-400/20">
          <TabsTrigger value="new" className="data-[state=active]:bg-copper-600">
            New Request
          </TabsTrigger>
          <TabsTrigger value="tickets" className="data-[state=active]:bg-copper-600">
            My Tickets ({tickets.length})
          </TabsTrigger>
        </TabsList>

        {/* New Request Tab */}
        <TabsContent value="new" className="mt-6">
          <Card className="bg-slate-800 border-copper-400/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <Sparkles className="h-5 w-5 text-copper-400" />
                <span>Submit a New Request</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitTicket} className="space-y-4">
                <div>
                  <Label htmlFor="subject" className="text-gray-300">Subject *</Label>
                  <Input
                    id="subject"
                    value={newTicket.subject}
                    onChange={(e) => setNewTicket(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Brief description of your request"
                    className="bg-slate-900 border-copper-400/20 text-white"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category" className="text-gray-300">Category *</Label>
                    <select
                      id="category"
                      value={newTicket.category}
                      onChange={(e) => setNewTicket(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full mt-2 p-3 rounded-lg bg-slate-900 border border-copper-400/20 text-white"
                      required
                    >
                      <option value="">Select a category</option>
                      {TICKET_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="priority" className="text-gray-300">Priority</Label>
                    <select
                      id="priority"
                      value={newTicket.priority}
                      onChange={(e) => setNewTicket(prev => ({ ...prev, priority: e.target.value }))}
                      className="w-full mt-2 p-3 rounded-lg bg-slate-900 border border-copper-400/20 text-white"
                    >
                      {PRIORITY_LEVELS.map((priority) => (
                        <option key={priority.value} value={priority.value}>
                          {priority.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description" className="text-gray-300">Description *</Label>
                  <Textarea
                    id="description"
                    value={newTicket.description}
                    onChange={(e) => setNewTicket(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Please provide detailed information about your request..."
                    rows={6}
                    className="bg-slate-900 border-copper-400/20 text-white"
                    required
                  />
                </div>

                <div>
                  <Label className="text-gray-300">Preferred Contact Method</Label>
                  <div className="flex gap-4 mt-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="contactMethod"
                        value="email"
                        checked={newTicket.contactMethod === 'email'}
                        onChange={(e) => setNewTicket(prev => ({ ...prev, contactMethod: e.target.value }))}
                        className="text-copper-600 focus:ring-copper-600"
                      />
                      <span className="text-gray-300">Email</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="contactMethod"
                        value="phone"
                        checked={newTicket.contactMethod === 'phone'}
                        onChange={(e) => setNewTicket(prev => ({ ...prev, contactMethod: e.target.value }))}
                        className="text-copper-600 focus:ring-copper-600"
                      />
                      <span className="text-gray-300">Phone</span>
                    </label>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-copper-600 hover:bg-copper-700 text-white py-6 text-lg"
                >
                  <Send className="h-5 w-5 mr-2" />
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* My Tickets Tab */}
        <TabsContent value="tickets" className="mt-6 space-y-4">
          {tickets.length > 0 ? (
            tickets.map((ticket) => (
              <Card key={ticket.id} className="bg-slate-800 border-copper-400/20 hover:border-copper-400/50 transition-all cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">{ticket.subject}</h3>
                        <Badge className={getStatusBadge(ticket.status)}>
                          {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                        <span className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          {ticket.category}
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          Created: {formatDate(ticket.createdAt)}
                        </span>
                        <span className="flex items-center">
                          <MessageCircle className="h-4 w-4 mr-1" />
                          {ticket.messages} messages
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="border-copper-400/30 text-copper-400 text-xs">
                          Priority: {ticket.priority}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          Last update: {formatDate(ticket.lastUpdate)}
                        </span>
                      </div>
                    </div>

                    <Button size="sm" className="bg-copper-600 hover:bg-copper-700">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="bg-slate-800 border-copper-400/20">
              <CardContent className="p-12 text-center">
                <MessageCircle className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No support tickets yet.</p>
                <p className="text-sm text-gray-500 mt-2">Submit your first request to get started!</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}


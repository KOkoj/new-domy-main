'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  MessageSquare, 
  Search, 
  Filter, 
  Mail,
  Calendar,
  User,
  Home,
  Reply,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react'
import { supabase } from '../../../lib/supabase'

export default function InquiryManagement() {
  const [inquiries, setInquiries] = useState([])
  const [filteredInquiries, setFilteredInquiries] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedInquiry, setSelectedInquiry] = useState(null)
  const [responseText, setResponseText] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    loadInquiries()
  }, [])

  useEffect(() => {
    filterInquiries()
  }, [inquiries, searchTerm, statusFilter])

  const loadInquiries = async () => {
    try {
      setLoading(true)
      
      const { data: inquiriesData, error } = await supabase
        .from('inquiries')
        .select('*')
        .order('createdAt', { ascending: false })

      if (error) throw error

      // Add demo status field for each inquiry
      const inquiriesWithStatus = (inquiriesData || []).map(inquiry => ({
        ...inquiry,
        status: inquiry.responded ? 'responded' : 'pending', // Demo field
        priority: Math.random() > 0.7 ? 'high' : 'normal' // Demo field
      }))

      setInquiries(inquiriesWithStatus)
    } catch (error) {
      console.error('Error loading inquiries:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterInquiries = () => {
    let filtered = inquiries

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(inquiry => 
        inquiry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inquiry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inquiry.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inquiry.listingId.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(inquiry => inquiry.status === statusFilter)
    }

    setFilteredInquiries(filtered)
  }

  const sendResponse = async () => {
    if (!selectedInquiry || !responseText.trim()) return

    setSending(true)
    try {
      // In a real application, you'd send an email here
      // For demo purposes, we'll just simulate the response
      
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      
      // Update inquiry status
      const { error } = await supabase
        .from('inquiries')
        .update({ responded: true })
        .eq('id', selectedInquiry.id)

      if (error) throw error

      // Update local state
      setInquiries(prev => prev.map(inquiry => 
        inquiry.id === selectedInquiry.id 
          ? { ...inquiry, status: 'responded', responded: true }
          : inquiry
      ))

      setResponseText('')
      setSelectedInquiry(null)
      alert('Response sent successfully!')
    } catch (error) {
      console.error('Error sending response:', error)
      alert('Failed to send response')
    } finally {
      setSending(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'responded': return 'bg-slate-100 text-slate-800'
      case 'archived': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600'
      case 'normal': return 'text-gray-600'
      default: return 'text-gray-600'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Inquiry Management</h1>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
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
          <h1 className="text-3xl font-bold text-gray-900">Inquiry Management</h1>
          <p className="text-gray-600 mt-1">{inquiries.length} total inquiries</p>
        </div>
        <Button onClick={loadInquiries}>
          <MessageSquare className="h-4 w-4 mr-2" />
          Refresh Inquiries
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search inquiries by name, email, message, or property ID..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="responded">Responded</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <MessageSquare className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{inquiries.length}</div>
            <div className="text-sm text-gray-600">Total Inquiries</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{inquiries.filter(i => i.status === 'pending').length}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-8 w-8 text-slate-800 mx-auto mb-2" />
            <div className="text-2xl font-bold">{inquiries.filter(i => i.status === 'responded').length}</div>
            <div className="text-sm text-gray-600">Responded</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{inquiries.filter(i => i.priority === 'high').length}</div>
            <div className="text-sm text-gray-600">High Priority</div>
          </CardContent>
        </Card>
      </div>

      {/* Inquiries List */}
      <Card>
        <CardHeader>
          <CardTitle>All Inquiries</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredInquiries.length > 0 ? (
            <div className="space-y-4">
              {filteredInquiries.map((inquiry) => (
                <div key={inquiry.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-medium text-gray-900">{inquiry.name}</h3>
                        <Badge className={getStatusColor(inquiry.status)}>
                          {inquiry.status}
                        </Badge>
                        {inquiry.priority === 'high' && (
                          <Badge variant="destructive" className="text-xs">
                            High Priority
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                        <span className="flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {inquiry.email}
                        </span>
                        <span className="flex items-center">
                          <Home className="h-3 w-3 mr-1" />
                          Property: {inquiry.listingId}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(inquiry.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm line-clamp-2">{inquiry.message}</p>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedInquiry(inquiry)
                              setResponseText(inquiry.status === 'pending' 
                                ? `Dear ${inquiry.name},\n\nThank you for your interest in our property. I'd be happy to help you with more information.\n\nBest regards,\nProperty Team`
                                : ''
                              )
                            }}
                          >
                            <Reply className="h-4 w-4 mr-1" />
                            {inquiry.status === 'pending' ? 'Respond' : 'View'}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Inquiry Details & Response</DialogTitle>
                          </DialogHeader>
                          {selectedInquiry && (
                            <div className="space-y-6">
                              {/* Inquiry Details */}
                              <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-medium mb-2">Original Inquiry</h4>
                                <div className="space-y-2 text-sm">
                                  <p><strong>From:</strong> {selectedInquiry.name} ({selectedInquiry.email})</p>
                                  <p><strong>Property:</strong> {selectedInquiry.listingId}</p>
                                  <p><strong>Date:</strong> {new Date(selectedInquiry.createdAt).toLocaleString()}</p>
                                  <p><strong>Message:</strong></p>
                                  <p className="bg-white p-3 rounded border">{selectedInquiry.message}</p>
                                </div>
                              </div>

                              {/* Response Form */}
                              {selectedInquiry.status === 'pending' ? (
                                <div className="space-y-4">
                                  <h4 className="font-medium">Send Response</h4>
                                  <Textarea
                                    placeholder="Type your response..."
                                    value={responseText}
                                    onChange={(e) => setResponseText(e.target.value)}
                                    rows={6}
                                  />
                                  <div className="flex justify-end space-x-2">
                                    <Button
                                      variant="outline"
                                      onClick={() => setSelectedInquiry(null)}
                                    >
                                      Cancel
                                    </Button>
                                    <Button
                                      onClick={sendResponse}
                                      disabled={sending || !responseText.trim()}
                                    >
                                      {sending ? 'Sending...' : 'Send Response'}
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <Alert>
                                  <CheckCircle className="h-4 w-4" />
                                  <AlertDescription>
                                    This inquiry has already been responded to.
                                  </AlertDescription>
                                </Alert>
                              )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No inquiries found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Demo Alert */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Demo Mode:</strong> In production, this would integrate with email services to send actual responses, 
          track email delivery status, and provide response templates.
        </AlertDescription>
      </Alert>
    </div>
  )
}
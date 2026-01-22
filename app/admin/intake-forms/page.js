'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  FileText, 
  Search, 
  User, 
  MapPin, 
  Calendar, 
  DollarSign, 
  CheckCircle, 
  Clock, 
  AlertCircle 
} from 'lucide-react'
import { supabase } from '../../../lib/supabase'

export default function IntakeFormsManagement() {
  const [forms, setForms] = useState([])
  const [filteredForms, setFilteredForms] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedForm, setSelectedForm] = useState(null)

  useEffect(() => {
    loadForms()
  }, [])

  useEffect(() => {
    filterForms()
  }, [forms, searchTerm])

  const loadForms = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('client_intake_forms')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading intake forms:', error)
      } else {
        setForms(data || [])
      }
    } catch (error) {
      console.error('Error loading intake forms:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterForms = () => {
    let filtered = forms
    if (searchTerm) {
      filtered = filtered.filter(form => 
        form.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        form.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        form.nationality?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    setFilteredForms(filtered)
  }

  const updateStatus = async (id, newStatus) => {
    try {
      const { error } = await supabase
        .from('client_intake_forms')
        .update({ status: newStatus })
        .eq('id', id)

      if (error) throw error

      setForms(forms.map(f => f.id === id ? { ...f, status: newStatus } : f))
      if (selectedForm?.id === id) {
        setSelectedForm({ ...selectedForm, status: newStatus })
      }
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Failed to update status')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted': return 'bg-blue-100 text-blue-800'
      case 'reviewed': return 'bg-yellow-100 text-yellow-800'
      case 'processed': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Intake Forms</h1>
          <p className="text-gray-600 mt-1">Review and manage client requirements</p>
        </div>
        <Button onClick={loadForms}>
          <FileText className="h-4 w-4 mr-2" />
          Refresh List
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, email, or nationality..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Forms</p>
              <p className="text-2xl font-bold text-gray-900">{forms.length}</p>
            </div>
            <FileText className="h-8 w-8 text-blue-500 opacity-20" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Pending Review</p>
              <p className="text-2xl font-bold text-yellow-600">
                {forms.filter(f => f.status === 'submitted').length}
              </p>
            </div>
            <Clock className="h-8 w-8 text-yellow-500 opacity-20" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Processed</p>
              <p className="text-2xl font-bold text-green-600">
                {forms.filter(f => f.status === 'processed').length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500 opacity-20" />
          </CardContent>
        </Card>
      </div>

      {/* List */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading forms...</div>
          ) : filteredForms.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No forms found</h3>
              <p className="text-gray-600">Wait for clients to submit their preferences.</p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredForms.map((form) => (
                <div key={form.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{form.full_name}</h3>
                        <Badge className={getStatusColor(form.status)}>{form.status}</Badge>
                        <span className="text-xs text-gray-500 flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(form.created_at)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2 text-gray-400" />
                          {form.email} • {form.phone}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                          From: {form.nationality} • Current: {form.current_location}
                        </div>
                        <div className="flex items-center col-span-2 mt-1">
                          <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
                          Budget: {form.budget_range}
                        </div>
                      </div>
                      
                      <div className="mt-2 flex flex-wrap gap-2">
                        {form.property_types?.map(type => (
                          <Badge key={type} variant="outline" className="text-xs">{type}</Badge>
                        ))}
                        {form.preferred_regions?.map(region => (
                          <Badge key={region} variant="outline" className="text-xs">{region}</Badge>
                        ))}
                      </div>
                    </div>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setSelectedForm(form)}>
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Client Intake Form Details</DialogTitle>
                        </DialogHeader>
                        {selectedForm && (
                          <div className="space-y-6">
                            {/* Actions Bar */}
                            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                              <span className="font-medium">Current Status: <Badge className={getStatusColor(selectedForm.status)}>{selectedForm.status}</Badge></span>
                              <div className="space-x-2">
                                <Button 
                                  size="sm" 
                                  variant={selectedForm.status === 'reviewed' ? 'default' : 'outline'}
                                  onClick={() => updateStatus(selectedForm.id, 'reviewed')}
                                >
                                  Mark Reviewed
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant={selectedForm.status === 'processed' ? 'default' : 'outline'}
                                  onClick={() => updateStatus(selectedForm.id, 'processed')}
                                  className="text-green-600 border-green-200 hover:bg-green-50"
                                >
                                  Mark Processed
                                </Button>
                              </div>
                            </div>

                            {/* Main Content */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <h4 className="font-semibold mb-3 flex items-center text-gray-900">
                                  <User className="h-4 w-4 mr-2" /> Personal Info
                                </h4>
                                <div className="space-y-2 text-sm">
                                  <p><span className="text-gray-500">Name:</span> {selectedForm.full_name}</p>
                                  <p><span className="text-gray-500">Email:</span> {selectedForm.email}</p>
                                  <p><span className="text-gray-500">Phone:</span> {selectedForm.phone}</p>
                                  <p><span className="text-gray-500">Nationality:</span> {selectedForm.nationality}</p>
                                  <p><span className="text-gray-500">Current Location:</span> {selectedForm.current_location}</p>
                                </div>
                              </div>

                              <div>
                                <h4 className="font-semibold mb-3 flex items-center text-gray-900">
                                  <DollarSign className="h-4 w-4 mr-2" /> Budget & Timeline
                                </h4>
                                <div className="space-y-2 text-sm">
                                  <p><span className="text-gray-500">Budget Range:</span> {selectedForm.budget_range}</p>
                                  <p><span className="text-gray-500">Timeline:</span> {selectedForm.timeline}</p>
                                  <p><span className="text-gray-500">Financing:</span> {selectedForm.financing_needed}</p>
                                  <p><span className="text-gray-500">Purchase Reason:</span> {selectedForm.purchase_reason}</p>
                                </div>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-semibold mb-3 flex items-center text-gray-900">
                                <MapPin className="h-4 w-4 mr-2" /> Property Preferences
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-lg">
                                <div>
                                  <p className="font-medium text-gray-700 mb-2">Regions</p>
                                  <div className="flex flex-wrap gap-2">
                                    {selectedForm.preferred_regions?.map(r => (
                                      <Badge key={r} variant="secondary">{r}</Badge>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <p className="font-medium text-gray-700 mb-2">Types</p>
                                  <div className="flex flex-wrap gap-2">
                                    {selectedForm.property_types?.map(t => (
                                      <Badge key={t} variant="secondary">{t}</Badge>
                                    ))}
                                  </div>
                                </div>
                                <div className="col-span-2 grid grid-cols-3 gap-4 mt-2 pt-2 border-t border-gray-200">
                                  <div>
                                    <span className="text-gray-500 block text-xs uppercase">Min Bedrooms</span>
                                    <span className="font-medium">{selectedForm.min_bedrooms || 'N/A'}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500 block text-xs uppercase">Min Bathrooms</span>
                                    <span className="font-medium">{selectedForm.min_bathrooms || 'N/A'}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500 block text-xs uppercase">Min Sq Meters</span>
                                    <span className="font-medium">{selectedForm.min_square_meters || 'N/A'} m²</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Extended Preferences if available */}
                            {selectedForm.extra_data && (
                              <div>
                                <h4 className="font-semibold mb-3 text-gray-900">Extended Preferences</h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm bg-gray-50 p-4 rounded-lg">
                                  {Object.entries(selectedForm.extra_data).map(([key, value]) => {
                                    if (!value || (Array.isArray(value) && value.length === 0)) return null
                                    return (
                                      <div key={key}>
                                        <span className="text-gray-500 block text-xs uppercase mb-1">
                                          {key.replace(/([A-Z])/g, ' $1').trim()}
                                        </span>
                                        <span className="font-medium">
                                          {Array.isArray(value) ? value.join(', ') : value}
                                        </span>
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                            )}

                            <div>
                              <h4 className="font-semibold mb-3 text-gray-900">Notes & Requirements</h4>
                              <div className="space-y-4 text-sm">
                                {selectedForm.additional_requirements && (
                                  <div>
                                    <p className="text-gray-500 mb-1">Additional Requirements:</p>
                                    <p className="bg-gray-50 p-3 rounded">{selectedForm.additional_requirements}</p>
                                  </div>
                                )}
                                {selectedForm.lifestyle_preferences && (
                                  <div>
                                    <p className="text-gray-500 mb-1">Lifestyle Preferences:</p>
                                    <p className="bg-gray-50 p-3 rounded">{selectedForm.lifestyle_preferences}</p>
                                  </div>
                                )}
                                {selectedForm.additional_notes && (
                                  <div>
                                    <p className="text-gray-500 mb-1">Additional Notes:</p>
                                    <p className="bg-gray-50 p-3 rounded">{selectedForm.additional_notes}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

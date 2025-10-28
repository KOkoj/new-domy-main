'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  FileText,
  Save,
  CheckCircle,
  AlertCircle,
  User,
  Home,
  DollarSign,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Globe
} from 'lucide-react'
import { supabase } from '../../../lib/supabase'

const PROPERTY_TYPES = ['Villa', 'House', 'Apartment', 'Farmhouse', 'Castle', 'Commercial', 'Land']
const ITALIAN_REGIONS = [
  'Abruzzo', 'Basilicata', 'Calabria', 'Campania', 'Emilia-Romagna', 
  'Friuli-Venezia Giulia', 'Lazio', 'Liguria', 'Lombardia', 'Marche', 
  'Molise', 'Piemonte', 'Puglia', 'Sardegna', 'Sicilia', 'Toscana', 
  'Trentino-Alto Adige', 'Umbria', "Valle d'Aosta", 'Veneto'
]
const BUDGET_RANGES = [
  'Under €250,000',
  '€250,000 - €500,000',
  '€500,000 - €1,000,000',
  '€1,000,000 - €2,000,000',
  'Over €2,000,000'
]
const TIMELINE_OPTIONS = [
  'Immediately (0-3 months)',
  'Short term (3-6 months)',
  'Medium term (6-12 months)',
  'Long term (12+ months)',
  'Just exploring'
]
const DISTANCE_FROM_SEA = [
  'On the beach (0-100m)',
  'Walking distance (100m-1km)',
  'Short drive (1-5km)',
  'Within 10km',
  'Within 20km',
  'Not important'
]
const DISTANCE_FROM_AIRPORT = [
  'Under 30 minutes',
  '30-60 minutes',
  '1-2 hours',
  '2+ hours',
  'Not important'
]
const DISTANCE_FROM_CITY = [
  'In city center',
  'City outskirts (0-5km)',
  'Nearby town (5-15km)',
  'Rural area (15-30km)',
  'Remote location (30km+)',
  'Not important'
]
const PROXIMITY_PREFERENCES = [
  'Beach/Sea',
  'Mountains',
  'Lake',
  'Historic Center',
  'Restaurants',
  'Shopping',
  'Medical Facilities',
  'International Schools',
  'Golf Course',
  'Ski Resort',
  'Airport',
  'Train Station'
]
const PROPERTY_AGE_OPTIONS = [
  'New build (0-5 years)',
  'Modern (5-20 years)',
  'Established (20-50 years)',
  'Historic (50-100 years)',
  'Antique (100+ years)',
  'No preference'
]
const PROPERTY_CONDITION_OPTIONS = [
  'Move-in ready',
  'Light cosmetic work needed',
  'Moderate renovation needed',
  'Major renovation needed',
  'Complete restoration project',
  'No preference'
]
const RENOVATION_WILLINGNESS = [
  'Only move-in ready properties',
  'Minor cosmetic updates acceptable',
  'Willing to do moderate renovation',
  'Interested in major renovation projects',
  'Looking for complete restoration projects'
]
const LAND_SIZE_OPTIONS = [
  'No land needed',
  'Small garden (under 500 sqm)',
  'Medium garden (500-1000 sqm)',
  'Large garden (1000-5000 sqm)',
  'Small plot (5000-10000 sqm)',
  'Large plot (1+ hectare)',
  'Agricultural land (5+ hectares)'
]
const CLIMATE_PREFERENCES = [
  'Mediterranean (hot, dry summers)',
  'Alpine (cooler, mountain climate)',
  'Coastal (mild, sea breezes)',
  'Continental (hot summers, cold winters)',
  'No preference'
]
const TOURIST_AREA_PREFERENCES = [
  'Quiet, off-the-beaten-path',
  'Some tourism but peaceful',
  'Popular tourist area',
  'Major tourist destination',
  'No preference'
]
const PURCHASE_REASONS = [
  'Primary residence',
  'Vacation/Holiday home',
  'Investment/Rental property',
  'Retirement home',
  'Business opportunity',
  'Combination of above'
]
const FINANCING_OPTIONS = [
  'Cash purchase',
  'Mortgage needed (pre-approved)',
  'Mortgage needed (not yet approved)',
  'Exploring financing options',
  'Not yet decided'
]
const HOW_HEARD_OPTIONS = [
  'Google search',
  'Social media',
  'Friend/Family referral',
  'Real estate website',
  'Magazine/Publication',
  'Previous client',
  'Other'
]

export default function IntakeForm() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [showExtendedForm, setShowExtendedForm] = useState(false)
  
  const [formData, setFormData] = useState({
    // Personal Information
    fullName: '',
    phone: '',
    email: '',
    nationality: '',
    currentLocation: '',
    
    // Property Preferences
    propertyTypes: [],
    preferredRegions: [],
    budgetRange: '',
    minBedrooms: '',
    minBathrooms: '',
    minSquareMeters: '',
    
    // Location Preferences
    maxDistanceFromSea: '',
    maxDistanceFromAirport: '',
    maxDistanceFromCity: '',
    preferredProximity: [],
    
    // Property Characteristics
    propertyAge: '',
    propertyCondition: '',
    renovationWillingness: '',
    landSize: '',
    
    // Purchase Details
    timeline: '',
    purchaseReason: '',
    financingNeeded: '',
    additionalRequirements: '',
    
    // Special Preferences
    mustHaveFeatures: [],
    lifestylePreferences: '',
    climatePreference: '',
    touristAreaPreference: '',
    
    // Additional Information
    howDidYouHear: '',
    additionalNotes: ''
  })

  useEffect(() => {
    loadFormData()
  }, [])

  const loadFormData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      
      setUser(user)
      
      // Pre-fill with user profile data
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profile) {
        setFormData(prev => ({
          ...prev,
          fullName: profile.name || '',
          email: user.email || '',
          phone: profile.phone || ''
        }))
      }

      // TODO: Load existing intake form data if available
      // const { data: intakeForm } = await supabase
      //   .from('client_intake_forms')
      //   .select('*')
      //   .eq('user_id', user.id)
      //   .single()
      
    } catch (error) {
      console.error('Error loading form data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage({ type: '', text: '' })

    try {
      // TODO: Save to database
      // For now, just save to profile preferences
      const { error } = await supabase
        .from('profiles')
        .update({
          name: formData.fullName,
          phone: formData.phone,
          preferences: {
            propertyTypes: formData.propertyTypes,
            preferredRegions: formData.preferredRegions,
            budgetRange: formData.budgetRange,
            timeline: formData.timeline
          },
          updatedAt: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) throw error

      setMessage({ 
        type: 'success', 
        text: 'Your information has been saved successfully! Our team will review it and contact you soon.' 
      })
      
      // Scroll to top to show message
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (error) {
      console.error('Error saving form:', error)
      setMessage({ 
        type: 'error', 
        text: 'Failed to save your information. Please try again.' 
      })
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const toggleArrayField = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-copper-400"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-1400 mx-auto" data-testid="intake-form-container">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center space-x-3">
          <FileText className="h-8 w-8 text-copper-400" />
          <span>Client Intake Form</span>
        </h1>
        <p className="text-gray-400 mt-2">
          Help us understand your needs better by completing this comprehensive form
        </p>
      </div>

      {/* Message Alert */}
      {message.text && (
        <Alert 
          variant={message.type === 'error' ? 'destructive' : 'default'}
          className={message.type === 'success' ? 'bg-green-900/20 border-green-600 text-green-400' : ''}
          data-testid={`intake-form-alert-${message.type}`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="h-4 w-4" data-testid="intake-form-alert-success-icon" />
          ) : (
            <AlertCircle className="h-4 w-4" data-testid="intake-form-alert-error-icon" />
          )}
          <AlertDescription data-testid={`intake-form-alert-${message.type}-message`}>{message.text}</AlertDescription>
        </Alert>
      )}

      {/* Personal Information */}
      <Card className="bg-slate-800 border-copper-400/20" data-testid="intake-form-personal-card">
        <CardHeader data-testid="intake-form-personal-header">
          <CardTitle className="flex items-center space-x-2 text-white" data-testid="intake-form-personal-title">
            <User className="h-5 w-5 text-copper-400" data-testid="intake-form-personal-icon" />
            <span data-testid="intake-form-personal-title-text">Personal Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4" data-testid="intake-form-personal-content">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-testid="intake-form-personal-row1">
            <div data-testid="intake-form-fullname-field">
              <Label htmlFor="fullName" className="text-gray-300" data-testid="intake-form-fullname-label">Full Name *</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                placeholder="Your full name"
                className="bg-slate-900 border-copper-400/20 text-white"
                data-testid="intake-form-fullname-input"
              />
            </div>
            <div data-testid="intake-form-email-field">
              <Label htmlFor="email" className="text-gray-300" data-testid="intake-form-email-label">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="your.email@example.com"
                className="bg-slate-900 border-copper-400/20 text-white"
                data-testid="intake-form-email-input"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-testid="intake-form-personal-row2">
            <div data-testid="intake-form-phone-field">
              <Label htmlFor="phone" className="text-gray-300" data-testid="intake-form-phone-label">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="bg-slate-900 border-copper-400/20 text-white"
                data-testid="intake-form-phone-input"
              />
            </div>
            <div data-testid="intake-form-nationality-field">
              <Label htmlFor="nationality" className="text-gray-300" data-testid="intake-form-nationality-label">Nationality</Label>
              <Input
                id="nationality"
                value={formData.nationality}
                onChange={(e) => handleChange('nationality', e.target.value)}
                placeholder="Your nationality"
                className="bg-slate-900 border-copper-400/20 text-white"
                data-testid="intake-form-nationality-input"
              />
            </div>
          </div>

          <div data-testid="intake-form-location-field">
            <Label htmlFor="currentLocation" className="text-gray-300" data-testid="intake-form-location-label">Current Location</Label>
            <Input
              id="currentLocation"
              value={formData.currentLocation}
              onChange={(e) => handleChange('currentLocation', e.target.value)}
              placeholder="City, Country"
              className="bg-slate-900 border-copper-400/20 text-white"
              data-testid="intake-form-location-input"
            />
          </div>
        </CardContent>
      </Card>

      {/* Property Preferences */}
      <Card className="bg-slate-800 border-copper-400/20" data-testid="intake-form-property-card">
        <CardHeader data-testid="intake-form-property-header">
          <CardTitle className="flex items-center space-x-2 text-white" data-testid="intake-form-property-title">
            <Home className="h-5 w-5 text-copper-400" data-testid="intake-form-property-icon" />
            <span data-testid="intake-form-property-title-text">Property Preferences</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6" data-testid="intake-form-property-content">
          {/* Property Types */}
          <div data-testid="intake-form-property-types-section">
            <Label className="text-gray-300 text-base font-medium" data-testid="intake-form-property-types-label">Property Types of Interest *</Label>
            <p className="text-sm text-gray-500 mb-3" data-testid="intake-form-property-types-description">Select all that apply</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3" data-testid="intake-form-property-types-grid">
              {PROPERTY_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => toggleArrayField('propertyTypes', type)}
                  className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                    formData.propertyTypes.includes(type)
                      ? 'bg-copper-400/20 border-copper-400 text-copper-400'
                      : 'bg-slate-900 border-copper-400/20 text-gray-300 hover:bg-slate-700'
                  }`}
                  data-testid={`intake-form-property-type-${type.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Preferred Regions */}
          <div data-testid="intake-form-regions-section">
            <Label className="text-gray-300 text-base font-medium" data-testid="intake-form-regions-label">Preferred Regions *</Label>
            <p className="text-sm text-gray-500 mb-3" data-testid="intake-form-regions-description">Select up to 5 regions</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3" data-testid="intake-form-regions-grid">
              {ITALIAN_REGIONS.map((region) => (
                <button
                  key={region}
                  onClick={() => {
                    if (formData.preferredRegions.includes(region) || formData.preferredRegions.length < 5) {
                      toggleArrayField('preferredRegions', region)
                    }
                  }}
                  className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                    formData.preferredRegions.includes(region)
                      ? 'bg-copper-400/20 border-copper-400 text-copper-400'
                      : 'bg-slate-900 border-copper-400/20 text-gray-300 hover:bg-slate-700'
                  }`}
                  disabled={!formData.preferredRegions.includes(region) && formData.preferredRegions.length >= 5}
                  data-testid={`intake-form-region-${region.toLowerCase().replace(/\s+/g, '-').replace(/'/, '')}`}
                >
                  {region}
                </button>
              ))}
            </div>
          </div>

          {/* Budget Range */}
          <div data-testid="intake-form-budget-section">
            <Label htmlFor="budgetRange" className="text-gray-300 text-base font-medium" data-testid="intake-form-budget-label">Budget Range *</Label>
            <select
              id="budgetRange"
              value={formData.budgetRange}
              onChange={(e) => handleChange('budgetRange', e.target.value)}
              className="w-full mt-2 p-3 rounded-lg bg-slate-900 border border-copper-400/20 text-white"
              data-testid="intake-form-budget-select"
            >
              <option value="" data-testid="intake-form-budget-placeholder">Select your budget range</option>
              {BUDGET_RANGES.map((range) => (
                <option key={range} value={range} data-testid={`intake-form-budget-${range.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}>{range}</option>
              ))}
            </select>
          </div>

          {/* Property Specifications */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4" data-testid="intake-form-specs-section">
            <div data-testid="intake-form-bedrooms-field">
              <Label htmlFor="minBedrooms" className="text-gray-300" data-testid="intake-form-bedrooms-label">Minimum Bedrooms</Label>
              <div className="relative">
                <Input
                  id="minBedrooms"
                  type="number"
                  value={formData.minBedrooms}
                  onChange={(e) => handleChange('minBedrooms', e.target.value)}
                  placeholder="e.g., 3"
                  className="bg-slate-900 border-copper-400/20 text-white pr-16"
                  data-testid="intake-form-bedrooms-input"
                />
                <div className="absolute right-1 top-1 bottom-1 flex flex-col">
                  <button
                    type="button"
                    onClick={() => handleChange('minBedrooms', String(Math.max(0, parseInt(formData.minBedrooms || 0) + 1)))}
                    className="flex-1 px-2 bg-copper-600 hover:bg-copper-700 text-white rounded-t transition-colors flex items-center justify-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="18 15 12 9 6 15"></polyline>
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange('minBedrooms', String(Math.max(0, parseInt(formData.minBedrooms || 0) - 1)))}
                    className="flex-1 px-2 bg-copper-600 hover:bg-copper-700 text-white rounded-b transition-colors flex items-center justify-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            <div data-testid="intake-form-bathrooms-field">
              <Label htmlFor="minBathrooms" className="text-gray-300" data-testid="intake-form-bathrooms-label">Minimum Bathrooms</Label>
              <div className="relative">
                <Input
                  id="minBathrooms"
                  type="number"
                  value={formData.minBathrooms}
                  onChange={(e) => handleChange('minBathrooms', e.target.value)}
                  placeholder="e.g., 2"
                  className="bg-slate-900 border-copper-400/20 text-white pr-16"
                  data-testid="intake-form-bathrooms-input"
                />
                <div className="absolute right-1 top-1 bottom-1 flex flex-col">
                  <button
                    type="button"
                    onClick={() => handleChange('minBathrooms', String(Math.max(0, parseInt(formData.minBathrooms || 0) + 1)))}
                    className="flex-1 px-2 bg-copper-600 hover:bg-copper-700 text-white rounded-t transition-colors flex items-center justify-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="18 15 12 9 6 15"></polyline>
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange('minBathrooms', String(Math.max(0, parseInt(formData.minBathrooms || 0) - 1)))}
                    className="flex-1 px-2 bg-copper-600 hover:bg-copper-700 text-white rounded-b transition-colors flex items-center justify-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            <div data-testid="intake-form-size-field">
              <Label htmlFor="minSquareMeters" className="text-gray-300" data-testid="intake-form-size-label">Min. Square Meters</Label>
              <div className="relative">
                <Input
                  id="minSquareMeters"
                  type="number"
                  value={formData.minSquareMeters}
                  onChange={(e) => handleChange('minSquareMeters', e.target.value)}
                  placeholder="e.g., 200"
                  className="bg-slate-900 border-copper-400/20 text-white pr-16"
                  data-testid="intake-form-size-input"
                />
                <div className="absolute right-1 top-1 bottom-1 flex flex-col">
                  <button
                    type="button"
                    onClick={() => handleChange('minSquareMeters', String(Math.max(0, parseInt(formData.minSquareMeters || 0) + 10)))}
                    className="flex-1 px-2 bg-copper-600 hover:bg-copper-700 text-white rounded-t transition-colors flex items-center justify-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="18 15 12 9 6 15"></polyline>
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange('minSquareMeters', String(Math.max(0, parseInt(formData.minSquareMeters || 0) - 10)))}
                    className="flex-1 px-2 bg-copper-600 hover:bg-copper-700 text-white rounded-b transition-colors flex items-center justify-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Extended Form Sections */}
      {showExtendedForm && (
        <>
          {/* Location Preferences */}
          <Card className="bg-slate-800 border-copper-400/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-white">
            <MapPin className="h-5 w-5 text-copper-400" />
            <span>Location Preferences</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Distance from Sea */}
          <div>
            <Label htmlFor="maxDistanceFromSea" className="text-gray-300 text-base font-medium">Distance from Sea</Label>
            <select
              id="maxDistanceFromSea"
              value={formData.maxDistanceFromSea}
              onChange={(e) => handleChange('maxDistanceFromSea', e.target.value)}
              className="w-full mt-2 p-3 rounded-lg bg-slate-900 border border-copper-400/20 text-white"
            >
              <option value="">Select distance preference</option>
              {DISTANCE_FROM_SEA.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          {/* Distance from Airport */}
          <div>
            <Label htmlFor="maxDistanceFromAirport" className="text-gray-300 text-base font-medium">Distance from Airport</Label>
            <select
              id="maxDistanceFromAirport"
              value={formData.maxDistanceFromAirport}
              onChange={(e) => handleChange('maxDistanceFromAirport', e.target.value)}
              className="w-full mt-2 p-3 rounded-lg bg-slate-900 border border-copper-400/20 text-white"
            >
              <option value="">Select airport distance</option>
              {DISTANCE_FROM_AIRPORT.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          {/* Distance from City */}
          <div>
            <Label htmlFor="maxDistanceFromCity" className="text-gray-300 text-base font-medium">Urban/Rural Preference</Label>
            <select
              id="maxDistanceFromCity"
              value={formData.maxDistanceFromCity}
              onChange={(e) => handleChange('maxDistanceFromCity', e.target.value)}
              className="w-full mt-2 p-3 rounded-lg bg-slate-900 border border-copper-400/20 text-white"
            >
              <option value="">Select location type</option>
              {DISTANCE_FROM_CITY.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          {/* Proximity Preferences */}
          <div>
            <Label className="text-gray-300 text-base font-medium">Important Proximity (Select all that apply)</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
              {PROXIMITY_PREFERENCES.map((proximity) => (
                <button
                  key={proximity}
                  type="button"
                  onClick={() => toggleArrayField('preferredProximity', proximity)}
                  className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                    formData.preferredProximity.includes(proximity)
                      ? 'bg-copper-400/20 border-copper-400 text-copper-400'
                      : 'bg-slate-900 border-copper-400/20 text-gray-300 hover:bg-slate-700'
                  }`}
                >
                  {proximity}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Property Characteristics */}
      <Card className="bg-slate-800 border-copper-400/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-white">
            <Home className="h-5 w-5 text-copper-400" />
            <span>Property Characteristics</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Property Age */}
          <div>
            <Label htmlFor="propertyAge" className="text-gray-300 text-base font-medium">Property Age Preference</Label>
            <select
              id="propertyAge"
              value={formData.propertyAge}
              onChange={(e) => handleChange('propertyAge', e.target.value)}
              className="w-full mt-2 p-3 rounded-lg bg-slate-900 border border-copper-400/20 text-white"
            >
              <option value="">Select age preference</option>
              {PROPERTY_AGE_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          {/* Property Condition */}
          <div>
            <Label htmlFor="propertyCondition" className="text-gray-300 text-base font-medium">Preferred Property Condition</Label>
            <select
              id="propertyCondition"
              value={formData.propertyCondition}
              onChange={(e) => handleChange('propertyCondition', e.target.value)}
              className="w-full mt-2 p-3 rounded-lg bg-slate-900 border border-copper-400/20 text-white"
            >
              <option value="">Select condition preference</option>
              {PROPERTY_CONDITION_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          {/* Renovation Willingness */}
          <div>
            <Label htmlFor="renovationWillingness" className="text-gray-300 text-base font-medium">Renovation Willingness</Label>
            <select
              id="renovationWillingness"
              value={formData.renovationWillingness}
              onChange={(e) => handleChange('renovationWillingness', e.target.value)}
              className="w-full mt-2 p-3 rounded-lg bg-slate-900 border border-copper-400/20 text-white"
            >
              <option value="">Select renovation preference</option>
              {RENOVATION_WILLINGNESS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          {/* Land Size */}
          <div>
            <Label htmlFor="landSize" className="text-gray-300 text-base font-medium">Land/Garden Size Preference</Label>
            <select
              id="landSize"
              value={formData.landSize}
              onChange={(e) => handleChange('landSize', e.target.value)}
              className="w-full mt-2 p-3 rounded-lg bg-slate-900 border border-copper-400/20 text-white"
            >
              <option value="">Select land size preference</option>
              {LAND_SIZE_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          {/* Climate Preference */}
          <div>
            <Label htmlFor="climatePreference" className="text-gray-300 text-base font-medium">Climate Preference</Label>
            <select
              id="climatePreference"
              value={formData.climatePreference}
              onChange={(e) => handleChange('climatePreference', e.target.value)}
              className="w-full mt-2 p-3 rounded-lg bg-slate-900 border border-copper-400/20 text-white"
            >
              <option value="">Select climate preference</option>
              {CLIMATE_PREFERENCES.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          {/* Tourist Area Preference */}
          <div>
            <Label htmlFor="touristAreaPreference" className="text-gray-300 text-base font-medium">Tourist Area Preference</Label>
            <select
              id="touristAreaPreference"
              value={formData.touristAreaPreference}
              onChange={(e) => handleChange('touristAreaPreference', e.target.value)}
              className="w-full mt-2 p-3 rounded-lg bg-slate-900 border border-copper-400/20 text-white"
            >
              <option value="">Select preference</option>
              {TOURIST_AREA_PREFERENCES.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>
        </>
      )}

      {/* Purchase Details */}
      <Card className="bg-slate-800 border-copper-400/20" data-testid="intake-form-purchase-card">
        <CardHeader data-testid="intake-form-purchase-header">
          <CardTitle className="flex items-center space-x-2 text-white" data-testid="intake-form-purchase-title">
            <Calendar className="h-5 w-5 text-copper-400" data-testid="intake-form-purchase-icon" />
            <span data-testid="intake-form-purchase-title-text">Purchase Details</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4" data-testid="intake-form-purchase-content">
          <div data-testid="intake-form-timeline-field">
            <Label htmlFor="timeline" className="text-gray-300 text-base font-medium" data-testid="intake-form-timeline-label">Purchase Timeline *</Label>
            <select
              id="timeline"
              value={formData.timeline}
              onChange={(e) => handleChange('timeline', e.target.value)}
              className="w-full mt-2 p-3 rounded-lg bg-slate-900 border border-copper-400/20 text-white"
              data-testid="intake-form-timeline-select"
            >
              <option value="" data-testid="intake-form-timeline-placeholder">Select your timeline</option>
              {TIMELINE_OPTIONS.map((option) => (
                <option key={option} value={option} data-testid={`intake-form-timeline-${option.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}>{option}</option>
              ))}
            </select>
          </div>

          <div data-testid="intake-form-purpose-field">
            <Label htmlFor="purchaseReason" className="text-gray-300 text-base font-medium" data-testid="intake-form-purpose-label">Purpose of Purchase *</Label>
            <select
              id="purchaseReason"
              value={formData.purchaseReason}
              onChange={(e) => handleChange('purchaseReason', e.target.value)}
              className="w-full mt-2 p-3 rounded-lg bg-slate-900 border border-copper-400/20 text-white"
              data-testid="intake-form-purpose-select"
            >
              <option value="">Select purchase reason</option>
              {PURCHASE_REASONS.map((reason) => (
                <option key={reason} value={reason}>{reason}</option>
              ))}
            </select>
          </div>

          <div data-testid="intake-form-financing-field">
            <Label htmlFor="financingNeeded" className="text-gray-300 text-base font-medium" data-testid="intake-form-financing-label">Financing Plan *</Label>
            <select
              id="financingNeeded"
              value={formData.financingNeeded}
              onChange={(e) => handleChange('financingNeeded', e.target.value)}
              className="w-full mt-2 p-3 rounded-lg bg-slate-900 border border-copper-400/20 text-white"
              data-testid="intake-form-financing-select"
            >
              <option value="">Select financing plan</option>
              {FINANCING_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <div data-testid="intake-form-requirements-field">
            <Label htmlFor="additionalRequirements" className="text-gray-300" data-testid="intake-form-requirements-label">Special Requirements</Label>
            <Textarea
              id="additionalRequirements"
              value={formData.additionalRequirements}
              onChange={(e) => handleChange('additionalRequirements', e.target.value)}
              placeholder="Any specific needs? Pool, garden, historical features, renovation potential, proximity to services..."
              rows={3}
              className="bg-slate-900 border-copper-400/20 text-white"
              data-testid="intake-form-requirements-textarea"
            />
          </div>
        </CardContent>
      </Card>

      {/* Additional Information */}
      <Card className="bg-slate-800 border-copper-400/20" data-testid="intake-form-additional-card">
        <CardHeader data-testid="intake-form-additional-header">
          <CardTitle className="flex items-center space-x-2 text-white" data-testid="intake-form-additional-title">
            <Globe className="h-5 w-5 text-copper-400" data-testid="intake-form-additional-icon" />
            <span data-testid="intake-form-additional-title-text">Additional Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4" data-testid="intake-form-additional-content">
          <div data-testid="intake-form-lifestyle-field">
            <Label htmlFor="lifestylePreferences" className="text-gray-300" data-testid="intake-form-lifestyle-label">Lifestyle & Living Preferences</Label>
            <Textarea
              id="lifestylePreferences"
              value={formData.lifestylePreferences}
              onChange={(e) => handleChange('lifestylePreferences', e.target.value)}
              placeholder="Tell us about your ideal Italian lifestyle. Do you prefer countryside, coastal, or city living? Any hobbies or activities you want to pursue?"
              rows={4}
              className="bg-slate-900 border-copper-400/20 text-white"
              data-testid="intake-form-lifestyle-textarea"
            />
          </div>

          <div data-testid="intake-form-referral-field">
            <Label htmlFor="howDidYouHear" className="text-gray-300 text-base font-medium" data-testid="intake-form-referral-label">How Did You Hear About Us?</Label>
            <select
              id="howDidYouHear"
              value={formData.howDidYouHear}
              onChange={(e) => handleChange('howDidYouHear', e.target.value)}
              className="w-full mt-2 p-3 rounded-lg bg-slate-900 border border-copper-400/20 text-white"
              data-testid="intake-form-referral-select"
            >
              <option value="">Select an option</option>
              {HOW_HEARD_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <div data-testid="intake-form-notes-field">
            <Label htmlFor="additionalNotes" className="text-gray-300" data-testid="intake-form-notes-label">Additional Notes</Label>
            <Textarea
              id="additionalNotes"
              value={formData.additionalNotes}
              onChange={(e) => handleChange('additionalNotes', e.target.value)}
              placeholder="Anything else you'd like us to know?"
              rows={4}
              className="bg-slate-900 border-copper-400/20 text-white"
              data-testid="intake-form-notes-textarea"
            />
          </div>
        </CardContent>
      </Card>

      {/* Extended Form Toggle */}
      <Card className="bg-gradient-to-r from-copper-400/10 to-slate-800 border-copper-400/30">
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">Extended Preferences Form</h3>
              <p className="text-gray-400 text-sm">
                Provide detailed preferences for better property matching (optional)
              </p>
            </div>
            <Button
              type="button"
              onClick={() => setShowExtendedForm(!showExtendedForm)}
              className={`${
                showExtendedForm 
                  ? 'bg-copper-600 hover:bg-copper-700' 
                  : 'bg-slate-700 hover:bg-slate-600'
              } text-white transition-all duration-300`}
            >
              {showExtendedForm ? 'Hide Extended Form' : 'Show Extended Form'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end space-x-4" data-testid="intake-form-actions">
        <Button
          onClick={handleSave}
          disabled={saving || !formData.fullName || !formData.email}
          className="bg-copper-600 hover:bg-copper-700 text-white px-8 py-6 text-lg"
          data-testid="intake-form-save-button"
        >
          <Save className="h-5 w-5 mr-2" data-testid="intake-form-save-icon" />
          <span data-testid="intake-form-save-text">{saving ? 'Saving...' : 'Save & Submit'}</span>
        </Button>
      </div>
    </div>
  )
}


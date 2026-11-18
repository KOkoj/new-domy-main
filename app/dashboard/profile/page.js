'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Save, 
  CheckCircle,
  AlertCircle,
  Settings
} from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import { getDashboardUser } from '../../../lib/dashboardAuth'
import { t } from '../../../lib/translations'
import { DEFAULT_LANGUAGE, readLanguageFromBrowser } from '../../../lib/userPreferences'

async function fetchWithTimeout(url, options = {}, ms = 10000) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), ms)
  try {
    return await fetch(url, { ...options, signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
}

export default function ProfileManagement() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    location: '',
    bio: '',
    preferences: {
      propertyTypes: [],
      priceRange: { min: '', max: '' },
      preferredRegions: [],
      emailNotifications: true,
      propertyAlerts: true
    }
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [language, setLanguage] = useState(DEFAULT_LANGUAGE)

  useEffect(() => {
    loadProfile()
    
    // Load language preference
    setLanguage(readLanguageFromBrowser())
    
    // Listen for language changes
    const handleLanguageChange = (e) => {
      setLanguage(e.detail)
    }
    
    window.addEventListener('languageChange', handleLanguageChange)
    return () => window.removeEventListener('languageChange', handleLanguageChange)
  }, [])

  const loadProfile = async () => {
    try {
      const user = await getDashboardUser(supabase)
      if (!user) {
        setLoading(false)
        return
      }

      setUser(user)

      // Load user profile through the server (no browser auth lock).
      const response = await fetchWithTimeout('/api/profile', { cache: 'no-store', credentials: 'same-origin' })
      const payload = response.ok ? await response.json().catch(() => ({})) : {}
      const profileData = payload?.profile || null

      if (profileData) {
        setProfile({
          firstName: profileData.first_name || '',
          lastName: profileData.last_name || '',
          phone: profileData.phone || '',
          location: profileData.location || '',
          bio: profileData.bio || '',
          preferences: {
            propertyTypes: profileData.preferences?.propertyTypes || [],
            priceRange: profileData.preferences?.priceRange || { min: '', max: '' },
            preferredRegions: profileData.preferences?.preferredRegions || [],
            emailNotifications: profileData.preferences?.emailNotifications ?? true,
            propertyAlerts: profileData.preferences?.propertyAlerts ?? true
          }
        })
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleProfileSave = async () => {
    setSaving(true)
    setMessage({ type: '', text: '' })

    try {
      const response = await fetchWithTimeout('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          firstName: profile.firstName,
          lastName: profile.lastName,
          phone: profile.phone,
          location: profile.location,
          bio: profile.bio,
          preferences: profile.preferences
        })
      })

      if (!response.ok) throw new Error(`profile ${response.status}`)

      setMessage({ type: 'success', text: t('club.profile.successMessage', language) })
    } catch (error) {
      console.error('Error saving profile:', error)
      setMessage({ type: 'error', text: t('club.profile.errorMessage', language) })
    } finally {
      setSaving(false)
    }
  }

  const handlePreferenceChange = (key, value) => {
    setProfile(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: value
      }
    }))
  }

  const togglePropertyType = (type) => {
    const currentTypes = profile.preferences.propertyTypes
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter(t => t !== type)
      : [...currentTypes, type]
    
    handlePreferenceChange('propertyTypes', newTypes)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="space-y-4">
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
          <h1 className="text-3xl font-bold text-gray-900">{t('club.profile.title', language)}</h1>
          <p className="text-gray-600 mt-1">{t('club.profile.subtitle', language)}</p>
        </div>
      </div>

      {/* Message Alert */}
      {message.text && (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
          {message.type === 'success' ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      {/* Profile Tabs */}
      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="personal" className="min-h-[44px] text-xs sm:text-sm px-1 sm:px-3">
            <span className="truncate">{t('club.profile.personalInfo', language)}</span>
          </TabsTrigger>
          <TabsTrigger value="preferences" className="min-h-[44px] text-xs sm:text-sm px-1 sm:px-3">
            <span className="truncate">{t('club.profile.preferences', language)}</span>
          </TabsTrigger>
        </TabsList>

        {/* Personal Information */}
        <TabsContent value="personal" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>{t('club.profile.personalInformation', language)}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">{t('club.profile.firstName', language)}</Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={profile.firstName}
                    onChange={(e) => setProfile(prev => ({ ...prev, firstName: e.target.value }))}
                    placeholder={t('club.profile.firstNamePlaceholder', language)}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">{t('club.profile.lastName', language)}</Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={profile.lastName}
                    onChange={(e) => setProfile(prev => ({ ...prev, lastName: e.target.value }))}
                    placeholder={t('club.profile.lastNamePlaceholder', language)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">{t('club.profile.emailAddress', language)}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-gray-500 mt-1">{t('club.profile.emailCannotChange', language)}</p>
                </div>
                <div>
                  <Label htmlFor="phone">{t('club.profile.phoneNumber', language)}</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder={t('forms.intake.phonePlaceholder', language)}
                  />
                </div>
                <div>
                  <Label htmlFor="location">{t('club.profile.location', language)}</Label>
                  <Input
                    id="location"
                    type="text"
                    value={profile.location}
                    onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
                    placeholder={t('club.profile.locationPlaceholder', language)}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="bio">{t('club.profile.aboutMe', language)}</Label>
                <Textarea
                  id="bio"
                  value={profile.bio}
                  onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder={t('club.profile.aboutMePlaceholder', language)}
                  rows={4}
                />
              </div>
              
              <Button onClick={handleProfileSave} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? t('club.profile.saving', language) : t('club.profile.saveChanges', language)}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences */}
        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>{t('club.profile.propertyPreferences', language)}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Property Types */}
              <div>
                <Label className="text-base font-medium">{t('club.profile.preferredPropertyTypes', language)}</Label>
                <p className="text-sm text-gray-600 mb-3">{t('club.profile.selectPropertyTypes', language)}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['villa', 'house', 'apartment', 'commercial'].map((type) => (
                    <button
                      key={type}
                      onClick={() => togglePropertyType(type)}
                      className={`p-3 rounded-lg border text-sm font-medium capitalize transition-colors ${
                        profile.preferences.propertyTypes.includes(type)
                          ? 'bg-blue-50 border-blue-200 text-blue-700'
                          : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <Label className="text-base font-medium">{t('club.profile.priceRange', language)}</Label>
                <p className="text-sm text-gray-600 mb-3">{t('club.profile.setBudget', language)}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="minPrice">{t('club.profile.minPrice', language)}</Label>
                    <Input
                      id="minPrice"
                      type="number"
                      value={profile.preferences.priceRange.min}
                      onChange={(e) => handlePreferenceChange('priceRange', {
                        ...profile.preferences.priceRange,
                        min: e.target.value
                      })}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxPrice">{t('club.profile.maxPrice', language)}</Label>
                    <Input
                      id="maxPrice"
                      type="number"
                      value={profile.preferences.priceRange.max}
                      onChange={(e) => handlePreferenceChange('priceRange', {
                        ...profile.preferences.priceRange,
                        max: e.target.value
                      })}
                      placeholder={t('club.profile.noLimit', language)}
                    />
                  </div>
                </div>
              </div>

              {/* Notification Preferences */}
              <div>
                <Label className="text-base font-medium">{t('club.profile.notificationPreferences', language)}</Label>
                <p className="text-sm text-gray-600 mb-3">{t('club.profile.chooseNotifications', language)}</p>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={profile.preferences.emailNotifications}
                      onChange={(e) => handlePreferenceChange('emailNotifications', e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">{t('club.profile.emailNotifications', language)}</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={profile.preferences.propertyAlerts}
                      onChange={(e) => handlePreferenceChange('propertyAlerts', e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">{t('club.profile.propertyAlerts', language)}</span>
                  </label>
                </div>
              </div>
              
              <Button onClick={handleProfileSave} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? t('club.profile.saving', language) : t('club.profile.savePreferences', language)}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  )
}

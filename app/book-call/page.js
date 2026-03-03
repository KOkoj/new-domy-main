'use client'

import { useEffect, useState } from 'react'
import { Calendar, Clock, Phone, Video, CheckCircle, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { supabase } from '@/lib/supabase'

const TIMEZONE_OPTIONS = [
  'Europe/Prague',
  'Europe/Rome',
  'Europe/Bratislava',
  'UTC'
]

const CALL_MODE_OPTIONS = [
  { value: 'google_meet', it: 'Google Meet' },
  { value: 'whatsapp', it: 'WhatsApp' },
  { value: 'phone_call', it: 'Telefonata' }
]

export default function BookCallPage() {
  const [language, setLanguage] = useState('it')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    preferredDate: '',
    preferredTime: '',
    timezone: 'Europe/Prague',
    callMode: 'google_meet',
    message: ''
  })

  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferred-language')
    if (savedLanguage) {
      setLanguage(savedLanguage)
      document.documentElement.lang = savedLanguage
    }

    const handleLanguageChange = (event) => {
      setLanguage(event.detail)
      document.documentElement.lang = event.detail
    }

    window.addEventListener('languageChange', handleLanguageChange)
    return () => window.removeEventListener('languageChange', handleLanguageChange)
  }, [])

  useEffect(() => {
    const preloadUser = async () => {
      if (!supabase) return
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setFormData((prev) => ({
        ...prev,
        email: user.email || prev.email
      }))
    }

    preloadUser()
  }, [])

  const handleInputChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const getCallModeLabel = (mode) => {
    if (mode === 'google_meet') return 'Google Meet'
    if (mode === 'whatsapp') return 'WhatsApp'
    return language === 'it' ? 'Telefonata' : language === 'cs' ? 'Telefonát' : 'Phone call'
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus(null)

    try {
      const preferredSlot = `${formData.preferredDate} ${formData.preferredTime} (${formData.timezone})`
      const bookingSummary = [
        `Call booking request`,
        `Preferred slot: ${preferredSlot}`,
        `Call mode: ${getCallModeLabel(formData.callMode)}`,
        formData.message ? `Notes: ${formData.message}` : null
      ]
        .filter(Boolean)
        .join('\n')

      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: bookingSummary,
          type: 'call_booking',
          propertyTitle: 'Call booking'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to submit booking')
      }

      setSubmitStatus('success')
      setFormData((prev) => ({
        ...prev,
        name: '',
        phone: '',
        preferredDate: '',
        preferredTime: '',
        callMode: 'google_meet',
        message: ''
      }))
    } catch (error) {
      console.error('Booking request error:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <Navigation />

      <main className="pt-28 md:pt-32 pb-12">
        <section className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
              {language === 'cs'
                ? 'Naplánujte si hovor'
                : language === 'it'
                ? 'Prenota una chiamata'
                : 'Schedule a Call'}
            </h1>
            <p className="text-gray-600">
              {language === 'cs'
                ? 'Vyberte preferovaný termín a způsob hovoru. Potvrdíme vám dostupnost e-mailem.'
                : language === 'it'
                ? 'Scegli data, ora e modalità della chiamata. Ti confermiamo la disponibilità via email.'
                : 'Choose your preferred date, time, and call mode. We will confirm availability by email.'}
            </p>
          </div>

          <Card className="max-w-3xl mx-auto bg-white border-gray-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-slate-800">
                {language === 'cs'
                  ? 'Richiesta di appuntamento'
                  : language === 'it'
                  ? 'Richiesta appuntamento'
                  : 'Appointment request'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {submitStatus === 'success' && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <p className="text-green-800 text-sm">
                    {language === 'cs'
                      ? 'Děkujeme, žádost byla odeslána. Brzy vám potvrdíme termín.'
                      : language === 'it'
                      ? 'Grazie, richiesta inviata. Ti confermeremo presto l\'orario.'
                      : 'Thanks, your request has been sent. We will confirm your slot shortly.'}
                  </p>
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {language === 'cs'
                    ? 'Invio non riuscito. Riprova tra qualche minuto.'
                    : language === 'it'
                    ? 'Invio non riuscito. Riprova tra qualche minuto.'
                    : 'Submission failed. Please try again in a few minutes.'}
                </div>
              )}

              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder={language === 'it' ? 'Nome e cognome *' : 'Full name *'}
                    required
                  />
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Email *"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder={language === 'it' ? 'Telefono / WhatsApp *' : 'Phone / WhatsApp *'}
                    required
                  />
                  <select
                    name="callMode"
                    value={formData.callMode}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg bg-white"
                    required
                  >
                    {CALL_MODE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.it}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <Calendar className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                      name="preferredDate"
                      type="date"
                      value={formData.preferredDate}
                      onChange={handleInputChange}
                      className="pl-10"
                      required
                    />
                  </div>
                  <div className="relative">
                    <Clock className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                      name="preferredTime"
                      type="time"
                      value={formData.preferredTime}
                      onChange={handleInputChange}
                      className="pl-10"
                      required
                    />
                  </div>
                  <select
                    name="timezone"
                    value={formData.timezone}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg bg-white"
                  >
                    {TIMEZONE_OPTIONS.map((timezone) => (
                      <option key={timezone} value={timezone}>
                        {timezone}
                      </option>
                    ))}
                  </select>
                </div>

                <Textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={5}
                  placeholder={
                    language === 'it'
                      ? 'Scrivi qui il contesto: obiettivo, budget, regione di interesse, urgenza...'
                      : 'Write your context: goal, budget, region of interest, urgency...'
                  }
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Video className="h-4 w-4" />
                    {language === 'it' ? 'Durata tipica: 20 minuti' : 'Typical duration: 20 minutes'}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4" />
                    {language === 'it' ? 'Conferma via email' : 'Confirmation by email'}
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white py-6"
                >
                  {isSubmitting ? (
                    language === 'it' ? 'Invio in corso...' : 'Sending...'
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      {language === 'it' ? 'Invia richiesta' : 'Send request'}
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </section>
      </main>

      <Footer language={language} />
    </div>
  )
}


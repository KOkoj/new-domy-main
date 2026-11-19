'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MessageCircle, Phone, Mail, Calendar } from 'lucide-react'
import { t } from '../../../lib/translations'
import { DEFAULT_LANGUAGE, readLanguageFromBrowser } from '../../../lib/userPreferences'
import {
  CONTACT_EMAIL,
  CONTACT_PHONE_DISPLAY,
  CONTACT_PHONE_E164,
  CONTACT_WHATSAPP_URL
} from '../../../lib/contactDetails'
import { getCallHoursLabel } from '../../../lib/zoneSchedule'

const WHATSAPP_LABELS = { cs: 'Napsat na WhatsApp', it: 'Scrivi su WhatsApp', en: 'Message on WhatsApp' }

// Leftover Club page. There is no on-site ticket form any more: calls are
// booked on /book-call and messages go to WhatsApp or the public inbox.
// The dashboard layout renders the back link to /dashboard.
export default function ConciergePage() {
  const [language, setLanguage] = useState(DEFAULT_LANGUAGE)

  useEffect(() => {
    setLanguage(readLanguageFromBrowser())
    const handleLanguageChange = (e) => setLanguage(e.detail)
    window.addEventListener('languageChange', handleLanguageChange)
    return () => window.removeEventListener('languageChange', handleLanguageChange)
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
          <MessageCircle className="h-8 w-8 text-copper-600" />
          <span>{t('club.conciergePage.title', language)}</span>
        </h1>
        <p className="text-gray-600 mt-2">{t('club.conciergePage.subtitle', language)}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-white border-gray-200">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">{t('club.conciergePage.bookCall', language)}</h3>
            <p className="text-sm text-gray-500 mb-3">{t('club.conciergePage.bookDescription', language)}</p>
            <Button asChild size="sm" className="bg-green-600 hover:bg-green-700">
              <Link href="/book-call" data-testid="concierge-book-call">
                {t('club.conciergePage.scheduleNow', language)}
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <MessageCircle className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">WhatsApp</h3>
            <p className="text-sm text-gray-500 mb-3">{CONTACT_PHONE_DISPLAY}</p>
            <Button asChild size="sm" className="bg-[#25d366] hover:bg-[#1fbe5b] text-white">
              <a href={CONTACT_WHATSAPP_URL} target="_blank" rel="noopener noreferrer" data-testid="concierge-whatsapp">
                {WHATSAPP_LABELS[language] || WHATSAPP_LABELS.cs}
              </a>
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-copper-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Phone className="h-6 w-6 text-copper-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">{t('club.conciergePage.callUs', language)}</h3>
            <p className="text-sm text-gray-500 mb-3">{getCallHoursLabel(language, 'withZone')}</p>
            <p className="text-copper-600 font-medium">
              <a href={`tel:${CONTACT_PHONE_E164}`}>{CONTACT_PHONE_DISPLAY}</a>
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Mail className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">{t('club.conciergePage.emailUs', language)}</h3>
            <p className="text-sm text-gray-500 mb-3">{t('club.conciergePage.emailResponse', language)}</p>
            <p className="text-blue-600 font-medium">
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

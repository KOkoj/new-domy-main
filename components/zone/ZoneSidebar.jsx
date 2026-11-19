'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Mail, Phone } from 'lucide-react'
import { CONTACT_EMAIL, CONTACT_PHONE_DISPLAY, CONTACT_PHONE_E164, buildWhatsappUrl } from '@/lib/contactDetails'
import { buildZoneCallBooking, getCallbackSlots, getCallHoursLabel, isOfficeHours } from '@/lib/zoneSchedule'
import { getUserDisplayName, loadSiteAuthUser } from '@/lib/siteAuthUser'
import { readAttributionForSubmit, trackLead } from '@/lib/adsTracking'
import { t } from '@/lib/translations'
import { formatSearchSummary } from './useZoneData'

export function TeamAvatars({ who = 'both', size = 36 }) {
  const people = [
    { key: 'lucie', src: '/team/source/lucieprimo.jpeg', alt: 'Lucie Kučerová' },
    { key: 'luca', src: '/team/source/lucaprimo.jpeg', alt: 'Luca Croce' }
  ].filter((p) => who === 'both' || p.key === who)
  return (
    <div className="flex -space-x-2.5 flex-shrink-0">
      {people.map((person) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={person.key}
          src={person.src}
          alt={person.alt}
          width={size}
          height={size}
          style={{ width: size, height: size }}
          className="rounded-full object-cover ring-2 ring-white"
        />
      ))}
    </div>
  )
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor" aria-hidden="true">
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.21 3.07.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35zM12.04 21.5h-.01a9.45 9.45 0 0 1-4.82-1.32l-.35-.21-3.58.94.96-3.49-.23-.36a9.43 9.43 0 0 1-1.45-5.03c0-5.22 4.25-9.47 9.48-9.47 2.53 0 4.91.99 6.7 2.78a9.42 9.42 0 0 1 2.77 6.7c0 5.22-4.25 9.46-9.47 9.46zm8.06-17.53A11.32 11.32 0 0 0 12.04.63C5.76.63.65 5.74.65 12.02c0 2.01.52 3.97 1.52 5.69L.55 23.6l6.03-1.58a11.36 11.36 0 0 0 5.45 1.39h.01c6.28 0 11.39-5.11 11.39-11.39 0-3.04-1.18-5.9-3.33-8.05z" />
    </svg>
  )
}

// Who the zone call booking is for: name/e-mail from the session, phone from
// the profiles row (same source as /dashboard/profile).
async function loadBookingContact() {
  const user = await loadSiteAuthUser().catch(() => null)
  if (!user) return {}
  const response = await fetch('/api/profile', { cache: 'no-store', credentials: 'same-origin' }).catch(() => null)
  const payload = response?.ok ? await response.json().catch(() => null) : null
  const profile = payload?.profile || null
  const displayName = getUserDisplayName(user, profile)
  const profileName = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ')
  return {
    name: displayName && !displayName.includes('@') ? displayName : profileName,
    email: user.email || profile?.email || '',
    phone: profile?.phone || user.phone || user.user_metadata?.phone || ''
  }
}

function CallBlock() {
  const [state, setState] = useState(null)
  const [picked, setPicked] = useState(null)
  const [status, setStatus] = useState(null)

  useEffect(() => {
    const now = new Date()
    setState({ open: isOfficeHours(now), slots: getCallbackSlots(now) })
  }, [])

  if (!state) return null

  if (state.open) {
    return (
      <div className="mt-5" data-testid="zone-call-open">
        <a
          href={`tel:${CONTACT_PHONE_E164}`}
          className="flex w-full items-center justify-center gap-2.5 rounded-lg bg-[#2d5a27] px-4 py-3 text-[15px] font-medium text-white transition hover:bg-[#234a1f]"
        >
          <Phone className="h-4 w-4" />
          Zavolat Lucii
        </a>
        <p className="mt-3 text-[15px] font-medium text-[#1b2333]">{CONTACT_PHONE_DISPLAY}</p>
        <p className="mt-1 text-[13px] text-gray-500">{getCallHoursLabel('cs')}</p>
      </div>
    )
  }

  const bookSlot = async (slot) => {
    if (status === 'sending') return
    setPicked(slot.id)
    setStatus('sending')
    try {
      const booking = buildZoneCallBooking({ slot, ...(await loadBookingContact()) })
      if (booking.action === 'redirect') {
        window.location.assign(booking.href)
        return
      }
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...booking.body, attribution: readAttributionForSubmit() })
      })
      if (!response.ok) throw new Error('Failed to submit booking')
      const result = await response.json().catch(() => null)
      trackLead({ type: 'call_booking', email: booking.body.email, inquiryId: result?.inquiryId })
      setStatus('success')
    } catch (error) {
      console.error('Zone call booking error:', error)
      setStatus('error')
    }
  }

  return (
    <div className="mt-5" data-testid="zone-call-slots">
      <p className="text-[14px] font-medium leading-snug text-[#1b2333]">Vyberte čas, kdy vám Lucie zavolá</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {state.slots.map((slot) => (
          <button
            key={slot.id}
            type="button"
            onClick={() => bookSlot(slot)}
            disabled={status === 'sending' || status === 'success'}
            aria-pressed={picked === slot.id}
            className={`rounded-full border px-3.5 py-2 text-[14px] transition disabled:cursor-default ${
              picked === slot.id
                ? 'border-[#2d5a27] bg-[#2d5a27] text-white'
                : 'border-[#e6d8c8] text-[#a8642f] hover:border-[#c78b5a]'
            }`}
          >
            {slot.label}
          </button>
        ))}
      </div>
      {status === 'success' ? (
        <p className="mt-3 text-[13px] font-medium text-[#2d5a27]" role="status" data-testid="zone-call-success">
          {t('forms.bookCall.success', 'cs')}
        </p>
      ) : null}
      {status === 'error' ? (
        <p className="mt-3 text-[13px] text-red-700" role="alert" data-testid="zone-call-error">
          {t('forms.bookCall.error', 'cs')}
        </p>
      ) : null}
      <p className="mt-3 text-[12.5px] leading-snug text-gray-500">
        Víkendové termíny si Lucie nastavuje sama. Teď je mimo {getCallHoursLabel('cs')}.
      </p>
    </div>
  )
}

export default function ZoneSidebar({ savedCount = 0, savedSearch = null }) {
  const searchSummary = formatSearchSummary(savedSearch?.filters) || savedSearch?.name || ''

  return (
    <div className="rounded-2xl border border-[#ebe5da] bg-white p-5 sm:p-6" data-testid="zone-sidebar">
      <div className="flex items-center gap-3">
        <TeamAvatars size={38} />
        <div className="min-w-0">
          <p className="text-[16px] font-medium text-[#1b2333]">Lucie a Luca</p>
          <p className="text-[13px] text-gray-500">Jsme tu pro vás, napište nám</p>
        </div>
      </div>

      <CallBlock />

      <div className="mt-4 space-y-2.5">
        <a
          href={buildWhatsappUrl('')}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2.5 rounded-lg bg-[#25d366] px-4 py-3 text-[15px] font-medium text-white transition hover:bg-[#1fbe5b]"
        >
          <WhatsAppIcon />
          Napsat na WhatsApp
        </a>
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-[#e3ddd2] bg-white px-4 py-3 text-[15px] font-medium text-[#1b2333] transition hover:bg-[#faf8f4]"
        >
          <Mail className="h-4 w-4" />
          Napsat e-mail
        </a>
      </div>

      <div className="mt-7 space-y-5 text-[14px]">
        {savedSearch ? (
          <div>
            <p className="font-medium text-[#1b2333]">Vaše hledání</p>
            {searchSummary ? <p className="mt-1.5 text-gray-600">{searchSummary}</p> : null}
            <Link href="/dashboard/searches" className="mt-2 inline-block text-[15px] text-[#a8642f] hover:underline">
              Upravit
            </Link>
          </div>
        ) : null}
        {savedCount > 0 ? (
          <div>
            <Link href="/dashboard/ulozene" className="text-[15px] text-[#a8642f] hover:underline">
              Uložené domy ({savedCount})
            </Link>
          </div>
        ) : null}
        <div>
          <Link href="/dashboard/settings" className="text-[15px] text-[#1b2333] hover:underline">
            Nastavení účtu
          </Link>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { Mail, MessageCircle, Phone } from 'lucide-react'
import { CONTACT_PHONE_E164, buildWhatsappUrl } from '@/lib/contactDetails'
import { trackClientEvent } from '@/lib/trackClientEvent'
import { t } from '@/lib/translations'

const ACTION =
  'flex min-h-[44px] items-center justify-center gap-1.5 whitespace-nowrap rounded-xl px-1 text-[13px] font-semibold leading-none transition-transform active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c48759]'
const ICON = 'hidden h-4 w-4 shrink-0 min-[380px]:block'

function isTextField(element) {
  return (
    element instanceof HTMLElement &&
    element.matches(
      'textarea, [contenteditable="true"], input:not([type="checkbox"]):not([type="radio"]):not([type="range"]):not([type="button"]):not([type="submit"])'
    )
  )
}

// Fixed bottom contact bar for phones and tablets (hidden from lg up).
// WhatsApp and phone clicks are measured by the global click listener in
// components/ConversionTracking.jsx; `data-track-location` makes them
// arrive with location=sticky_bar.
export default function MobileContactBar({
  language = 'cs',
  whatsappText = '',
  inquiryHref = '/contact#contact-form',
  onInquiryClick,
  hidden = false
}) {
  const tr = (key) => t(`forms.contactBar.${key}`, language)
  const [typing, setTyping] = useState(false)

  // Reserve space at the end of the page so the bar never covers the footer.
  useEffect(() => {
    if (hidden) return undefined
    document.body.dataset.contactBar = 'true'
    return () => {
      delete document.body.dataset.contactBar
    }
  }, [hidden])

  // Step aside while the visitor types, so the bar does not sit on top of the
  // on-screen keyboard and cover the field being filled in.
  useEffect(() => {
    const onFocusIn = (event) => setTyping(isTextField(event.target))
    const onFocusOut = () => setTyping(false)
    document.addEventListener('focusin', onFocusIn)
    document.addEventListener('focusout', onFocusOut)
    return () => {
      document.removeEventListener('focusin', onFocusIn)
      document.removeEventListener('focusout', onFocusOut)
    }
  }, [])

  if (hidden || typing) return null

  const handleInquiryClick = (event) => {
    trackClientEvent('inquiry_cta_click', { location: 'sticky_bar' })
    onInquiryClick?.(event)
  }

  return (
    <nav
      aria-label={tr('label')}
      data-testid="mobile-contact-bar"
      data-track-location="sticky_bar"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[#e4dfd3] bg-white/95 shadow-[0_-6px_24px_rgba(14,21,46,0.08)] backdrop-blur lg:hidden print:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="mx-auto grid h-[3.75rem] max-w-xl grid-cols-3 items-center gap-2 px-3">
        <a
          href={buildWhatsappUrl(whatsappText)}
          rel="noopener noreferrer"
          className={`${ACTION} bg-[#0e7a5f] text-white`}
          data-testid="mobile-contact-whatsapp"
        >
          <MessageCircle className={ICON} aria-hidden="true" />
          {tr('whatsapp')}
        </a>
        <a
          href={`tel:${CONTACT_PHONE_E164}`}
          className={`${ACTION} border border-[#1b2642] bg-white text-[#1b2642]`}
          data-testid="mobile-contact-call"
        >
          <Phone className={ICON} aria-hidden="true" />
          {tr('call')}
        </a>
        <a
          href={inquiryHref}
          onClick={handleInquiryClick}
          className={`${ACTION} bg-[#1b2642] text-white`}
          data-testid="mobile-contact-inquiry"
        >
          <Mail className={ICON} aria-hidden="true" />
          {tr('inquiry')}
        </a>
      </div>
    </nav>
  )
}

'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { rememberConciergeDismissal } from '@/lib/conciergeSession'
import { scheduleConciergeOpening } from '@/lib/conciergeEntrance'
import { trackClientEvent } from '@/lib/trackClientEvent'
import {
  CONTACT_PHONE_DISPLAY,
  CONTACT_PHONE_E164,
  buildWhatsappUrl
} from '@/lib/contactDetails'
import Image from 'next/image'
import styles from './ConciergeContact.module.css'

const ASSETS = '/images/home-concierge'
const PHONE = CONTACT_PHONE_DISPLAY
const PHONE_HREF = `tel:${CONTACT_PHONE_E164}`

const LABELS = {
  cs: {
    greeting: 'Dobrý den 👋', invitation: 'Potřebujete poradit?',
    hoursLabel: 'Volat můžete:', hours: 'Po–Pá: 9–16 a 18–20 hod.',
    close: 'Zavřít kontakt', open: 'Otevřít kontakt na Lucii Kučerovou',
    contact: 'Kontakt na Lucii Kučerovou', call: 'Zavolat Lucii Kučerové',
    role: 'konzultantka',
    whatsapp: 'Napsat na WhatsApp', message: 'Napsat zprávu',
    whatsappText: 'Dobrý den, mám dotaz ke koupi nemovitosti v Itálii.',
  },
  it: {
    greeting: 'Buongiorno 👋', invitation: 'Avete bisogno di un consiglio?',
    hoursLabel: 'Potete chiamare:', hours: 'Lun–Ven: 9–16 e 18–20',
    close: 'Chiudi il contatto', open: 'Apri il contatto di Lucie Kučerová',
    contact: 'Contatto di Lucie Kučerová', call: 'Chiama Lucie Kučerová',
    role: 'consulente',
    whatsapp: 'Scrivi su WhatsApp', message: 'Scrivi un messaggio',
    whatsappText: 'Buongiorno, ho una domanda sull\'acquisto di un immobile in Italia.',
  },
  en: {
    greeting: 'Hello 👋', invitation: 'Need some advice?',
    hoursLabel: 'You can call:', hours: 'Mon–Fri: 9–16 and 18–20',
    close: 'Close contact', open: 'Open contact for Lucie Kučerová',
    contact: 'Contact Lucie Kučerová', call: 'Call Lucie Kučerová',
    role: 'consultant',
    whatsapp: 'Message on WhatsApp', message: 'Send a message',
    whatsappText: 'Hello, I have a question about buying a property in Italy.',
  },
}

function Portrait() {
  const size = 52
  return (
    <div className={styles.portrait}>
      <Image
        src={`${ASSETS}/lucie-portrait.png`}
        alt="Lucie Kučerová"
        width={size}
        height={size}
        className={styles.portraitImage}
      />
      <img
        src={`${ASSETS}/status-floating.svg`}
        alt=""
        className={styles.status}
      />
    </div>
  )
}

export default function ConciergeContact({ language = 'cs' }) {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const cancelEntranceRef = useRef(() => {})
  const launcherRef = useRef(null)
  const panelId = useId()
  const labels = LABELS[language] || LABELS.cs

  useEffect(() => {
    setMounted(true)
    const cancel = scheduleConciergeOpening({
      window,
      document,
      // Automatic entrance (desktop only) is not a sign of interest, so it is
      // measured separately from a manual tap on the launcher.
      onOpen: () => {
        setOpen(true)
        trackClientEvent('concierge_auto_open', { location: 'home' })
      }
    })
    cancelEntranceRef.current = cancel
    return cancel
  }, [])

  const dismiss = () => {
    cancelEntranceRef.current()
    setOpen(false)
    rememberConciergeDismissal(() => window.sessionStorage, true)
    launcherRef.current?.focus()
    trackClientEvent('concierge_dismiss', { location: 'home' })
  }
  const toggle = () => {
    if (open) {
      dismiss()
      return
    }
    cancelEntranceRef.current()
    rememberConciergeDismissal(() => window.sessionStorage, false)
    setOpen(true)
    trackClientEvent('concierge_open', { location: 'home' })
  }

  // The portal escapes the hero's clipping/stacking context, so fixed means viewport-fixed.
  if (!mounted) return null
  return createPortal(
    <aside
      className={styles.floating}
      aria-label={labels.contact}
      data-testid="hero-concierge-contact"
      onKeyDown={(event) => {
        if (event.key === 'Escape' && open) {
          event.preventDefault()
          dismiss()
        }
      }}
    >
      {open && (
        <div id={panelId} className={styles.panel} data-testid="concierge-panel">
          <div className={styles.profile}>
            <Portrait />
            <div className={styles.identity}>
              <p className={styles.name}>Lucie Kučerová</p>
              <p className={styles.role}>{labels.role}</p>
            </div>
          </div>
          <div className={styles.welcome}>
            <p>{labels.greeting}</p>
            <p>{labels.invitation}</p>
          </div>
          <div className={styles.call}>
            <a href={buildWhatsappUrl(labels.whatsappText)} rel="noopener noreferrer" className={styles.whatsapp} draggable={false} data-testid="concierge-whatsapp">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
                <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 1.67c2.2 0 4.27.86 5.82 2.42a8.2 8.2 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23-1.48 0-2.93-.39-4.19-1.15l-.3-.17-3.12.82.83-3.04-.2-.32a8.19 8.19 0 0 1-1.26-4.38c.01-4.54 3.7-8.24 8.25-8.24ZM8.53 7.33c-.16 0-.43.06-.66.31-.22.25-.87.86-.87 2.07 0 1.22.89 2.39 1 2.56.14.17 1.76 2.67 4.25 3.73.59.27 1.05.42 1.41.53.59.19 1.13.16 1.56.1.48-.07 1.46-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.07-.1-.23-.16-.48-.27-.25-.14-1.47-.74-1.69-.82-.23-.08-.37-.12-.56.12-.16.25-.64.81-.78.97-.15.17-.29.19-.53.07-.26-.13-1.06-.39-2-1.23-.74-.66-1.23-1.47-1.38-1.72-.12-.24-.01-.39.11-.5.11-.11.27-.29.37-.44.13-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.11-.56-1.35-.77-1.84-.2-.48-.4-.42-.56-.43-.14 0-.3-.01-.47-.01Z" />
              </svg>
              <span>{labels.whatsapp}</span>
            </a>
            <a href={PHONE_HREF} className={styles.phone} draggable={false} data-testid="concierge-phone" aria-label={`${labels.call}: ${PHONE}`}>{PHONE}</a>
            <a href="/contact" className={styles.message} draggable={false} data-testid="concierge-message">{labels.message}</a>
            <div className={styles.callingHours}>
              <p className={styles.hoursLabel}>{labels.hoursLabel}</p>
              <p>{labels.hours}</p>
            </div>
          </div>
          <button type="button" className={styles.dismiss} onClick={dismiss} aria-label={labels.close}>
            <img src={`${ASSETS}/close.svg`} alt="" />
          </button>
        </div>
      )}
      <button
        ref={launcherRef}
        type="button"
        className={styles.launcher}
        onClick={toggle}
        aria-label={open ? labels.close : labels.open}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        data-testid="concierge-toggle"
      >
        <img
          src={`${ASSETS}/launcher.svg`}
          alt=""
          className={`${styles.launcherIcon} ${open ? styles.launcherOpen : styles.launcherClosed}`}
        />
      </button>
    </aside>,
    document.body
  )
}

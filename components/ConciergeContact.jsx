'use client'

import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { rememberConciergeDismissal } from '@/lib/conciergeSession'
import { scheduleConciergeOpening } from '@/lib/conciergeEntrance'
import Image from 'next/image'
import styles from './ConciergeContact.module.css'

const ASSETS = '/images/home-concierge'
const PHONE = '+420 731 450 001'
const PHONE_HREF = 'tel:+420731450001'
const useClientLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

const LABELS = {
  cs: {
    greeting: 'Dobrý den 👋', invitation: 'Potřebujete poradit?',
    hoursLabel: 'Volat můžete:', hours: 'Po–Pá: 9–16 a 18–20 hod.',
    close: 'Zavřít kontakt', open: 'Otevřít kontakt na Lucii Kučerovou',
    contact: 'Kontakt na Lucii Kučerovou', call: 'Zavolat Lucii Kučerové',
  },
  it: {
    greeting: 'Buongiorno 👋', invitation: 'Avete bisogno di un consiglio?',
    hoursLabel: 'Potete chiamare:', hours: 'Lun–Ven: 9–16 e 18–20',
    close: 'Chiudi il contatto', open: 'Apri il contatto di Lucie Kučerová',
    contact: 'Contatto di Lucie Kučerová', call: 'Chiama Lucie Kučerová',
  },
  en: {
    greeting: 'Hello 👋', invitation: 'Need some advice?',
    hoursLabel: 'You can call:', hours: 'Mon–Fri: 9–16 and 18–20',
    close: 'Close contact', open: 'Open contact for Lucie Kučerová',
    contact: 'Contact Lucie Kučerová', call: 'Call Lucie Kučerová',
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
  const floatingRef = useRef(null)
  const launcherRef = useRef(null)
  const panelId = useId()
  const labels = LABELS[language] || LABELS.cs

  useEffect(() => {
    setMounted(true)
    const cancel = scheduleConciergeOpening({ window, document, onOpen: () => setOpen(true) })
    cancelEntranceRef.current = cancel
    return cancel
  }, [])

  // Stack back-to-top above the entire widget, even when copy wraps or fonts resize it.
  useClientLayoutEffect(() => {
    if (!mounted || !floatingRef.current) return
    const element = floatingRef.current
    const updateHeight = () => document.body.style.setProperty('--concierge-stack-height', `${Math.ceil(element.getBoundingClientRect().height)}px`)
    updateHeight()
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(updateHeight)
    observer?.observe(element)
    window.addEventListener('resize', updateHeight)
    return () => {
      observer?.disconnect()
      window.removeEventListener('resize', updateHeight)
      document.body.style.removeProperty('--concierge-stack-height')
    }
  }, [mounted, open])

  const dismiss = () => {
    cancelEntranceRef.current()
    setOpen(false)
    rememberConciergeDismissal(() => window.sessionStorage, true)
    launcherRef.current?.focus()
  }
  const toggle = () => {
    if (open) {
      dismiss()
      return
    }
    cancelEntranceRef.current()
    rememberConciergeDismissal(() => window.sessionStorage, false)
    setOpen(true)
  }

  // The portal escapes the hero's clipping/stacking context, so fixed means viewport-fixed.
  if (!mounted) return null
  return createPortal(
    <aside
      ref={floatingRef}
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
              <p className={styles.role}>concierge agent</p>
            </div>
          </div>
          <div className={styles.welcome}>
            <p>{labels.greeting}</p>
            <p>{labels.invitation}</p>
          </div>
          <div className={styles.call}>
            <a href={PHONE_HREF} className={styles.phone} draggable={false} data-testid="concierge-phone" aria-label={`${labels.call}: ${PHONE}`}>{PHONE}</a>
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

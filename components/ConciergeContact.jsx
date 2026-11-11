'use client'

import { useId, useRef, useState } from 'react'
import Image from 'next/image'
import styles from './ConciergeContact.module.css'

const ASSETS = '/images/home-concierge'
const PHONE = '+420 731 450 001'
const PHONE_HREF = 'tel:+420731450001'

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

function Portrait({ compact = false }) {
  const size = compact ? 44 : 52
  return (
    <div className={compact ? styles.compactPortrait : styles.portrait}>
      <Image
        src={`${ASSETS}/${compact ? 'lucie-nav-portrait.png' : 'lucie-portrait.png'}`}
        alt="Lucie Kučerová"
        width={size}
        height={size}
        className={styles.portraitImage}
      />
      <img
        src={`${ASSETS}/${compact ? 'status-nav.svg' : 'status-floating.svg'}`}
        alt=""
        className={styles.status}
      />
    </div>
  )
}

export function CompactConciergeContact({ language = 'cs' }) {
  const labels = LABELS[language] || LABELS.cs
  return (
    <div className={styles.navigationContact} data-testid="nav-concierge-contact">
      <div className={styles.compact}>
        <div className={styles.compactProfile}>
          <Portrait compact />
          <div className={styles.compactIdentity}>
            <p className={styles.compactName}>Lucie Kučerová</p>
            <p className={styles.compactRole}>concierge agent</p>
          </div>
        </div>
        <div className={styles.compactCall}>
          <a href={PHONE_HREF} className={styles.compactPhone} aria-label={`${labels.call}: ${PHONE}`}>
            <img src={`${ASSETS}/phone.svg`} alt="" />
            <span>{PHONE}</span>
          </a>
          <p className={styles.compactHours}>{labels.hours}</p>
        </div>
      </div>
      <a href={PHONE_HREF} className={styles.mobileContact} aria-label={`${labels.call}: ${PHONE}. ${labels.hours}`}>
        <Image src={`${ASSETS}/lucie-nav-portrait.png`} alt="" width={32} height={32} />
        <img src={`${ASSETS}/phone.svg`} alt="" />
        <span>{PHONE}</span>
      </a>
    </div>
  )
}

export default function ConciergeContact({ language = 'cs' }) {
  const [open, setOpen] = useState(true)
  const launcherRef = useRef(null)
  const panelId = useId()
  const labels = LABELS[language] || LABELS.cs
  const dismiss = () => {
    setOpen(false)
    launcherRef.current?.focus()
  }

  return (
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
              <p className={styles.role}>concierge agent</p>
            </div>
          </div>
          <div className={styles.welcome}>
            <p>{labels.greeting}</p>
            <p>{labels.invitation}</p>
          </div>
          <div className={styles.call}>
            <a href={PHONE_HREF} className={styles.phone} aria-label={`${labels.call}: ${PHONE}`}>{PHONE}</a>
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
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? labels.close : labels.open}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        data-testid="concierge-toggle"
      >
        {open ? (
          <img src={`${ASSETS}/launcher.svg`} alt="" />
        ) : (
          <Image src={`${ASSETS}/lucie-portrait.png`} alt="" width={52} height={52} className={styles.launcherPortrait} />
        )}
      </button>
    </aside>
  )
}

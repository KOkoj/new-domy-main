import Image from 'next/image'
import Link from 'next/link'
import styles from './LucieBenesovaCard.module.css'

export default function LucieBenesovaCard({ language = 'cs' }) {
  const copy = language === 'it' ? {
    badge: 'Ambasciatrice & Storia', before: 'Come abbiamo aiutato ', name: 'Lucie Benešová', after: ' a trovare il suo angolo d’Italia',
    description: 'L’intero percorso, dalla scelta alla consegna delle chiavi della sua nuova casa.', button: 'Leggi la storia completa →',
  } : language === 'en' ? {
    badge: 'Ambassador & Story', before: 'How we helped ', name: 'Lucie Benešová', after: ' find her own piece of Italy',
    description: 'The complete process, from choosing a property to the keys to her new home.', button: 'Read the full story →',
  } : {
    badge: 'Ambasadorka & Příběh', before: 'Jak jsme ', name: 'Lucii Benešové', after: ' pomohli ke kousku Itálie',
    description: 'Kompletní proces od výběru až po předání klíčů k jejímu novému domu.', button: 'Přečíst celý příběh →',
  }

  return (
    <article className={styles.story} data-reveal="photo" style={{ '--d': '180ms' }} data-testid="benesova-story">
      <Image
        src="/images/home-concierge/benesova-story-card.webp"
        alt="Lucie Benešová s týmem Domy v Itálii při setkání v kanceláři"
        fill
        sizes="(min-width: 1024px) 408px, (min-width: 640px) 408px, calc(100vw - 40px)"
        className={styles.photo}
      />
      <div className={styles.shade} aria-hidden="true" />
      <p className={styles.badge}>{copy.badge}</p>
      <div className={styles.content}>
        <h3 className={styles.headline}>{copy.before}<strong>{copy.name}</strong>{copy.after}</h3>
        <p className={styles.description}>{copy.description}</p>
        <Link href="/blog/pribeh-lucie-benesove-1" className={styles.link} data-testid="benesova-story-link">{copy.button}</Link>
      </div>
    </article>
  )
}

import Image from 'next/image'
import Link from 'next/link'
import styles from './LucieBenesovaCard.module.css'

// Keep the Czech title and perex in sync with the public story page, without importing the article data.
const STORY_PEREX = '1. díl: Když vysněný dům skrývá víc, než se na první pohled zdá'

export default function LucieBenesovaCard({ language = 'cs' }) {
  const copy = language === 'it' ? {
    badge: 'Ambasciatrice & Storia',
    before: 'Come abbiamo aiutato ',
    name: 'Lucie Benešová',
    after: ' a realizzare il suo sogno italiano',
    description: '1ª puntata: Quando la casa dei sogni nasconde più di quanto sembri.',
    button: 'Leggi la storia',
  } : language === 'en' ? {
    badge: 'Ambassador & Story',
    before: 'How we helped ',
    name: 'Lucie Benešová',
    after: ' fulfill her Italian dream',
    description: 'Part 1: When the dream house hides more than it first appears.',
    button: 'Read the story',
  } : {
    badge: 'Ambasadorka & Příběh',
    before: 'Jak jsme pomohli ',
    name: 'Lucii Benešové',
    after: ' splnit její italský sen',
    description: STORY_PEREX,
    button: 'Přečíst příběh',
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

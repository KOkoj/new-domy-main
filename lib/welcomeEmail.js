import { SITE_NAME } from '@/lib/siteConfig'

const SUPPORTED = ['cs', 'en', 'it']

export function normalizeEmailLanguage(language) {
  return SUPPORTED.includes(language) ? language : 'cs'
}

export function getWelcomeEmailTemplate({ userName, language = 'cs', dashboardUrl }) {
  const locale = normalizeEmailLanguage(language)
  const name = String(userName || '').trim() || (locale === 'it' ? 'ciao' : locale === 'en' ? 'there' : 'u nás')
  const brand = SITE_NAME

  const templates = {
    cs: {
      subject: `Vítejte v ${brand}`,
      eyebrow: brand,
      title: 'Váš účet je připraven',
      intro: `Dobrý den, ${name}, vítejte v ${brand}.`,
      body: 'Účet máte založený. Můžete si ukládat hledání, sledovat oblíbené nemovitosti, spravovat poptávky a mít celý nákup na jednom místě.',
      bullets: [
        'uložit hledání a zapnout upozornění',
        'přidat zajímavé nemovitosti do oblíbených',
        'sledovat poptávky a další kroky na nástěnce'
      ],
      ctaLabel: 'Otevřít nástěnku',
      closing: 'Pokud potřebujete pomoc s koupí v Itálii, ozvěte se nám v sekci Kontakt nebo v průvodcích.'
    },
    en: {
      subject: `Welcome to ${brand}`,
      eyebrow: brand,
      title: 'Your account is ready',
      intro: `Hello ${name}, welcome to ${brand}.`,
      body: 'Your account is ready. You can save searches, track favorite properties, manage inquiries, and keep your buying process organized in one place.',
      bullets: [
        'save searches and turn on alerts',
        'keep interesting properties in your favorites',
        'track inquiries and next steps from your dashboard'
      ],
      ctaLabel: 'Open your dashboard',
      closing: 'If you need help buying in Italy, the guides and contact page are the best place to continue.'
    },
    it: {
      subject: `Benvenuto in ${brand}`,
      eyebrow: brand,
      title: 'Il tuo account è pronto',
      intro: `Ciao ${name}, benvenuto in ${brand}.`,
      body: 'Il tuo account è pronto. Puoi salvare le ricerche, seguire gli immobili preferiti, gestire le richieste e tenere tutto il processo di acquisto in un unico posto.',
      bullets: [
        'salvare le ricerche e attivare gli avvisi',
        'aggiungere gli immobili interessanti ai preferiti',
        'seguire le richieste e i prossimi passi dalla dashboard'
      ],
      ctaLabel: 'Apri la dashboard',
      closing: 'Se ti serve aiuto per l’acquisto in Italia, usa la pagina Contatto o le guide.'
    }
  }

  const copy = templates[locale]
  return {
    ...copy,
    dashboardUrl: dashboardUrl || null
  }
}

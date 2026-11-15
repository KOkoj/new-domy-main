// Copy for the consent prompt. Czech body sentence approved 15.11.2026.
// Title, category names, and button labels are a proposal on the preview
// (PR, not merged) until Matej approves them.
// The prompt only renders with NEXT_PUBLIC_CONSENT_PROMPT=1.
// Providers (Google, Seznam) are listed on /cookies.
export const CONSENT_COPY = Object.freeze({
  cs: {
    title: 'Cookies na tomto webu',
    text: 'Používáme cookies k měření návštěvnosti a reklam.',
    accept: 'Přijmout vše',
    decline: 'Odmítnout vše',
    customize: 'Přizpůsobit',
    save: 'Uložit výběr',
    more: 'Více informací',
    label: 'Souhlas s cookies',
    footerSettings: 'Nastavení cookies',
    necessary: 'Nezbytné',
    necessaryDesc: 'Potřebné pro fungování webu.',
    analytics: 'Analytické',
    analyticsDesc: 'Pomáhají nám pochopit, jak web používáte.',
    marketing: 'Marketingové',
    marketingDesc: 'Slouží k měření a zobrazování reklam.'
  },
  en: {
    title: 'Cookies on this site',
    text: 'We use cookies to measure visits and advertising.',
    accept: 'Accept all',
    decline: 'Reject all',
    customize: 'Customize',
    save: 'Save selection',
    more: 'More info',
    label: 'Cookie consent',
    footerSettings: 'Cookie settings',
    necessary: 'Necessary',
    necessaryDesc: 'Required for the website to work.',
    analytics: 'Analytics',
    analyticsDesc: 'They help us understand how you use the website.',
    marketing: 'Marketing',
    marketingDesc: 'Used to measure and display ads.'
  },
  it: {
    title: 'Cookie su questo sito',
    text: 'Utilizziamo i cookie per misurare le visite e la pubblicità.',
    accept: 'Accetta tutto',
    decline: 'Rifiuta tutto',
    customize: 'Personalizza',
    save: 'Salva selezione',
    more: 'Maggiori info',
    label: 'Consenso cookie',
    footerSettings: 'Impostazioni cookie',
    necessary: 'Necessari',
    necessaryDesc: 'Necessari per il funzionamento del sito.',
    analytics: 'Analitici',
    analyticsDesc: 'Ci aiutano a capire come usi il sito.',
    marketing: 'Marketing',
    marketingDesc: 'Servono a misurare e mostrare gli annunci.'
  }
})

export function consentCopy(language) {
  return CONSENT_COPY[language] || CONSENT_COPY.cs
}

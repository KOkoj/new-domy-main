export const MARKETING_CONSENT_VERSION = 'marketing-email-v1-2026-02-24'

const COPY = {
  it: {
    checkboxLabel:
      'Acconsento a ricevere email promozionali da Domy v Itálii (es. guide premium, offerte e aggiornamenti commerciali).',
    helper:
      'Consenso facoltativo e revocabile in qualsiasi momento dalle preferenze account.',
    legalLinkLabel: 'Leggi GDPR / Privacy',
    anonymousNote:
      'Nessuna email promozionale verrà inviata senza consenso esplicito.'
  },
  en: {
    checkboxLabel:
      'I agree to receive marketing emails from Domy v Itálii (e.g. premium guides, offers, and commercial updates).',
    helper:
      'Optional consent. You can withdraw it at any time in your account preferences.',
    legalLinkLabel: 'Read GDPR / Privacy',
    anonymousNote:
      'No marketing emails will be sent without explicit consent.'
  },
  cs: {
    checkboxLabel:
      'Souhlasím se zasíláním marketingových e-mailů od Domy v Itálii (např. prémiové průvodce, nabídky a obchodní novinky).',
    helper:
      'Souhlas je dobrovolný a můžete ho kdykoli odvolat v nastavení účtu.',
    legalLinkLabel: 'Přečíst GDPR / ochranu soukromí',
    anonymousNote:
      'Bez výslovného souhlasu nebudou zasílány žádné marketingové e-maily.'
  }
}

export function getMarketingConsentUiCopy(language = 'it') {
  const safeLanguage = language === 'cs' || language === 'en' ? language : 'it'
  return COPY[safeLanguage]
}

export function getMarketingConsentRecord(language = 'it') {
  const safeLanguage = language === 'cs' || language === 'en' ? language : 'it'
  const ui = COPY[safeLanguage]

  return {
    type: 'marketing_emails',
    version: MARKETING_CONSENT_VERSION,
    language: safeLanguage,
    text: `${ui.checkboxLabel} ${ui.helper}`
  }
}

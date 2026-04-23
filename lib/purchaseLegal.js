export const PDF_PURCHASE_LEGAL_VERSION = 'pdf-purchase-terms-v1-2026-03-02'

const LEGAL_COPY = {
  it: {
    termsLabel:
      "Dichiaro di aver letto e accettato i Termini di vendita dei contenuti digitali.",
    privacyLabel:
      "Confermo di aver letto l'informativa privacy (GDPR) sul trattamento dei miei dati per acquisto e supporto.",
    digitalWaiverLabel:
      'Richiedo la fornitura immediata del contenuto digitale e accetto la perdita del diritto di recesso dopo l\'inizio del download.'
  },
  en: {
    termsLabel:
      'I confirm I have read and accepted the Terms of Sale for digital content.',
    privacyLabel:
      'I confirm I have read the privacy notice (GDPR) about processing my data for purchase and support.',
    digitalWaiverLabel:
      'I request immediate supply of digital content and acknowledge loss of withdrawal rights once download starts.'
  },
  cs: {
    termsLabel:
      'Potvrzuji, že jsem četl(a) a přijímám obchodní podmínky pro digitální obsah.',
    privacyLabel:
      'Potvrzuji, že jsem četl(a) informace o ochraně osobních údajů (GDPR) pro nákup a podporu.',
    digitalWaiverLabel:
      'Žádám o okamžité dodání digitálního obsahu a beru na vědomí ztrátu práva na odstoupení po zahájení stahování.'
  }
}

function getSafeLanguage(language = 'it') {
  return language === 'cs' || language === 'en' ? language : 'it'
}

export function getPurchaseLegalCopy(language = 'it') {
  return LEGAL_COPY[getSafeLanguage(language)]
}

export function getPurchaseLegalSnapshot(language = 'it') {
  const safeLanguage = getSafeLanguage(language)
  const copy = LEGAL_COPY[safeLanguage]

  return {
    version: PDF_PURCHASE_LEGAL_VERSION,
    language: safeLanguage,
    termsText: copy.termsLabel,
    privacyText: copy.privacyLabel,
    digitalWaiverText: copy.digitalWaiverLabel
  }
}

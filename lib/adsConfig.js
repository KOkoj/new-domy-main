// Ads / analytics IDs. Every value comes from an env var and stays empty until
// the accounts exist; an empty value means the tag is never loaded (no-op).
// NEXT_PUBLIC_* must be referenced literally so Next.js inlines them.

function clean(value) {
  return typeof value === 'string' ? value.trim() : ''
}

export const ADS_CONFIG = Object.freeze({
  ga4Id: clean(process.env.NEXT_PUBLIC_GA4_ID), // G-XXXXXXX
  gadsId: clean(process.env.NEXT_PUBLIC_GADS_ID), // AW-XXXXXXXXX
  gadsLeadLabel: clean(process.env.NEXT_PUBLIC_GADS_LEAD_LABEL), // conversion label of the "Lead" action
  gadsContactLabel: clean(process.env.NEXT_PUBLIC_GADS_CONTACT_LABEL), // optional secondary action (phone/e-mail/WhatsApp click)
  sklikId: clean(process.env.NEXT_PUBLIC_SKLIK_ID), // SEM ID from Sklik → Nastavení účtu
  metaPixelId: clean(process.env.NEXT_PUBLIC_META_PIXEL_ID), // stays empty: Meta is off for the 3k plan
  // The consent prompt copy is a proposal until approved, so the prompt only
  // renders with this flag. Without consent no tag ever loads.
  consentPromptEnabled: clean(process.env.NEXT_PUBLIC_CONSENT_PROMPT) === '1'
})

export function hasGoogleTags(config = ADS_CONFIG) {
  return Boolean(config.ga4Id || config.gadsId)
}

export function hasAnyAdsTag(config = ADS_CONFIG) {
  return Boolean(hasGoogleTags(config) || config.sklikId || config.metaPixelId)
}

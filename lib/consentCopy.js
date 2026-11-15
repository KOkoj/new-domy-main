// PROPOSAL – NOT APPROVED YET. Copy for the small consent prompt.
// The prompt only renders with NEXT_PUBLIC_CONSENT_PROMPT=1, which must stay
// off in Vercel until Matej / Lucie approve these texts (see the PR and
// docs/ads-tracking.md). "Povolit", "Odmítnout" and "Více informací" are
// reused from the earlier Meta consent prompt.
export const CONSENT_COPY = Object.freeze({
  cs: {
    text: 'Se souhlasem měříme návštěvnost a účinnost reklam (Google, Seznam).',
    accept: 'Povolit',
    decline: 'Odmítnout',
    more: 'Více informací',
    label: 'Souhlas s cookies'
  },
  en: {
    text: 'With your consent we measure visits and ad performance (Google, Seznam).',
    accept: 'Allow',
    decline: 'Decline',
    more: 'More info',
    label: 'Cookie consent'
  },
  it: {
    text: 'Con il tuo consenso misuriamo visite ed efficacia degli annunci (Google, Seznam).',
    accept: 'Consenti',
    decline: 'Rifiuta',
    more: 'Maggiori info',
    label: 'Consenso cookie'
  }
})

export function consentCopy(language) {
  return CONSENT_COPY[language] || CONSENT_COPY.cs
}

export { LEAD_CONSENT_TEXT } from '@/lib/leadConsent'

export const LEAD_ASSETS = {
  pdf_inspections: {
    key: 'inspections',
    source: 'pdf_inspections',
    storagePathEnv: 'FREE_PDF_PATH_INSPECTIONS',
    defaultStoragePath: 'free/inspections-guide.pdf',
    downloadName: 'prohlidky-nemovitosti-v-italii.pdf',
    landingPath: '/guides/inspections/free-pdf',
    label: 'Průvodce prohlídkami nemovitostí v Itálii'
  },
  pdf_mistakes: {
    key: 'mistakes',
    source: 'pdf_mistakes',
    storagePathEnv: 'FREE_PDF_PATH_MISTAKES',
    defaultStoragePath: 'free/nejcastejsi-chyby-pri-koupi-v-italii.pdf',
    downloadName: 'nejcastejsi-chyby-pri-koupi-v-italii.pdf',
    landingPath: '/guides/mistakes/free-pdf',
    label: 'Nejčastější chyby při koupi nemovitosti v Itálii'
  }
}

const ASSETS_BY_KEY = Object.values(LEAD_ASSETS).reduce((result, asset) => {
  result[asset.key] = asset
  return result
}, {})

export function getLeadAssetBySource(source) {
  return LEAD_ASSETS[source] || null
}

export function getLeadAssetByKey(key) {
  return ASSETS_BY_KEY[key] || null
}

export function getLeadAssetStoragePath(asset) {
  if (!asset) return null
  return process.env[asset.storagePathEnv] || asset.defaultStoragePath
}

export function isValidLeadEmail(value) {
  if (typeof value !== 'string') return false
  const email = value.trim()
  if (email.length < 3 || email.length > 254) return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function buildLeadUrl(path) {
  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || '').replace(/\/$/, '')
  return baseUrl ? `${baseUrl}${path}` : null
}

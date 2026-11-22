// Client zone thread (table public.client_messages, db/setup-client-messages.sql).
// Pure helpers only (no imports) so tests can load this file directly.

export const CLIENT_MESSAGES_TABLE = 'client_messages'
export const TEAM_AUTHOR_KINDS = ['lucie', 'luca', 'team']
export const MESSAGE_MAX_LENGTH = 4000
export const MISSING_MIGRATION_MESSAGE = 'Chybí migrace db/setup-client-messages.sql (tabulka client_messages neexistuje).'

export const AUTHOR_LABELS = {
  lucie: 'Lucie',
  luca: 'Luca',
  team: 'Lucie a Luca',
  client: 'Vy'
}

// Avatars shown with a message (TeamAvatars `who`).
export function authorAvatar(kind) {
  if (kind === 'lucie' || kind === 'luca') return kind
  if (kind === 'team') return 'both'
  return null
}

export function isTeamAuthor(kind) {
  return TEAM_AUTHOR_KINDS.includes(kind)
}

// Table not created yet (migration not applied): Postgres 42P01 or the
// PostgREST schema-cache error PGRST205 / PGRST204 wording.
export function isMissingTableError(error) {
  if (!error) return false
  const code = String(error.code || '')
  if (code === '42P01' || code === 'PGRST205') return true
  const text = `${error.message || ''} ${error.details || ''} ${error.hint || ''}`
  return /client_messages/.test(text) && /(does not exist|could not find the table|schema cache)/i.test(text)
}

// Lowercase without diacritics, for admin search ("Toskánsko" ~ "toskansko").
export function foldText(value) {
  return String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

// Trimmed body or '' when invalid (empty / too long).
export function normalizeMessageBody(value) {
  const body = String(value ?? '').replace(/\r\n?/g, '\n').trim()
  if (!body || body.length > MESSAGE_MAX_LENGTH) return ''
  return body
}

export function normalizePropertyId(value) {
  const id = String(value ?? '').trim()
  if (!id || id.length > 300) return null
  return id
}

// E-mail safety switch: outside Vercel production only the internal test
// inboxes may receive the notification; everything else is skipped.
const TEST_RECIPIENT = /^jarvis-matej(\+[a-z0-9._-]+)?@mail\.grokbot\.com$/i

export function canSendMessageNotification(email, env = {}) {
  const address = String(email || '').trim()
  if (!address) return false
  if (env.VERCEL_ENV === 'production') return true
  return TEST_RECIPIENT.test(address)
}

export function formatMessageDate(value, now = new Date()) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const time = new Intl.DateTimeFormat('cs-CZ', { hour: 'numeric', minute: '2-digit', timeZone: 'Europe/Prague' }).format(date)
  const dayKey = (d) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Prague' }).format(d)
  if (dayKey(date) === dayKey(now)) return `dnes ${time}`
  const sameYear = dayKey(date).slice(0, 4) === dayKey(now).slice(0, 4)
  const day = new Intl.DateTimeFormat('cs-CZ', {
    day: 'numeric',
    month: 'numeric',
    ...(sameYear ? {} : { year: 'numeric' }),
    timeZone: 'Europe/Prague'
  }).format(date)
  return `${day} ${time}`
}

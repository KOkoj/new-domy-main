// Shared helpers for the e-mail + password sign-in (client + server).
// No imports so it can be used anywhere and loaded by tests directly.

// Generated passwords (registration e-mail, forgotten password): 8 characters,
// upper-case letters and digits without look-alikes (no I, L, O, 0, 1).
export const GENERATED_PASSWORD_LENGTH = 8
export const GENERATED_PASSWORD_LETTERS = 'ABCDEFGHJKMNPQRSTUVWXYZ'
export const GENERATED_PASSWORD_DIGITS = '23456789'

// Own passwords set in "Nastavení účtu".
export const MIN_PASSWORD_LENGTH = 8
export const MAX_PASSWORD_LENGTH = 72

// The form allows "Poslat heslo znovu" after this many seconds (the server
// enforces the same per e-mail).
export const RESEND_COOLDOWN_SECONDS = 60

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function normalizeEmailAddress(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : ''
}

export function isValidEmailAddress(value) {
  if (typeof value !== 'string') return false
  const email = value.trim()
  return email.length <= 254 && EMAIL_PATTERN.test(email)
}

// The password from the e-mail is often pasted with a leading/trailing space
// or a line break. Inner characters and letter case stay untouched.
export function normalizePastedPassword(value) {
  return String(value ?? '').replace(/^\s+|\s+$/g, '')
}

export function isValidNewPassword(value) {
  return typeof value === 'string' &&
    value.length >= MIN_PASSWORD_LENGTH &&
    value.length <= MAX_PASSWORD_LENGTH
}

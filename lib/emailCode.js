// Shared helpers for the e-mail one-time-code sign-in (client + server).
// No imports so it can be used anywhere and loaded by tests directly.

// Supabase "Email OTP length" should be 6 (dashboard); 7-8 is accepted in case
// the project setting differs.
export const OTP_LENGTH = 6
export const OTP_MIN_LENGTH = 6
export const OTP_MAX_LENGTH = 8
export const RESEND_COOLDOWN_SECONDS = 60

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function isValidEmailAddress(value) {
  if (typeof value !== 'string') return false
  const email = value.trim()
  return email.length <= 254 && EMAIL_PATTERN.test(email)
}

// Keeps only digits, so pasted "123 456", "123-456" or "Kód: 123456" work.
export function normalizeOtpInput(value) {
  return String(value ?? '').replace(/\D/g, '').slice(0, OTP_MAX_LENGTH)
}

export function isCompleteOtp(value) {
  const digits = String(value ?? '')
  return /^\d+$/.test(digits) && digits.length >= OTP_MIN_LENGTH && digits.length <= OTP_MAX_LENGTH
}

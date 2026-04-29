// Shared helpers for reading and writing user preferences (language, currency).
//
// We persist preferences in BOTH localStorage and cookies. localStorage keeps
// backward compatibility with existing client code, while the cookies allow
// Next.js Server Components to read the active locale on the first request,
// so the very first server-rendered HTML can come back in the user's
// chosen language. This is critical for SEO: Googlebot can index Czech,
// English, and Italian variants based on the cookie/Accept-Language hint.

export const SUPPORTED_LANGUAGES = ['cs', 'en', 'it']
export const DEFAULT_LANGUAGE = 'cs'
export const SUPPORTED_CURRENCIES = ['EUR', 'CZK', 'USD']
export const DEFAULT_CURRENCY = 'EUR'

const LANGUAGE_COOKIE = 'preferred-language'
const CURRENCY_COOKIE = 'preferred-currency'
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365 // one year

function isValidLanguage(value) {
  return typeof value === 'string' && SUPPORTED_LANGUAGES.includes(value)
}

function isValidCurrency(value) {
  return typeof value === 'string' && SUPPORTED_CURRENCIES.includes(value)
}

// ---------- Client-side helpers ----------

// Safe lazy initializer for useState — reads synchronously on the client so the
// very first render already uses the stored preference.  On the server (SSR)
// there is no window/document, so we fall back to the default and accept the
// hydration mismatch; React recovers silently before the first paint.
export function getInitialLanguage() {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE
  return readLanguageFromBrowser()
}

export function getInitialCurrency() {
  if (typeof window === 'undefined') return DEFAULT_CURRENCY
  return readCurrencyFromBrowser()
}

function readBrowserCookie(name) {
  if (typeof document === 'undefined') return null
  const match = document.cookie
    .split('; ')
    .find((entry) => entry.startsWith(`${name}=`))
  if (!match) return null
  return decodeURIComponent(match.split('=')[1] || '')
}

function writeBrowserCookie(name, value) {
  if (typeof document === 'undefined') return
  const encoded = encodeURIComponent(value)
  document.cookie = `${name}=${encoded}; path=/; max-age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`
}

export function readLanguageFromBrowser() {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE

  const cookieValue = readBrowserCookie(LANGUAGE_COOKIE)
  if (isValidLanguage(cookieValue)) return cookieValue

  try {
    const local = window.localStorage?.getItem(LANGUAGE_COOKIE)
    if (isValidLanguage(local)) {
      writeBrowserCookie(LANGUAGE_COOKIE, local)
      return local
    }
  } catch {
    // localStorage may be unavailable in private browsing.
  }

  return DEFAULT_LANGUAGE
}

export function readCurrencyFromBrowser() {
  if (typeof window === 'undefined') return DEFAULT_CURRENCY

  const cookieValue = readBrowserCookie(CURRENCY_COOKIE)
  if (isValidCurrency(cookieValue)) return cookieValue

  try {
    const local = window.localStorage?.getItem(CURRENCY_COOKIE)
    if (isValidCurrency(local)) {
      writeBrowserCookie(CURRENCY_COOKIE, local)
      return local
    }
  } catch {
    // ignore
  }

  return DEFAULT_CURRENCY
}

export function persistLanguage(language) {
  if (!isValidLanguage(language)) return
  writeBrowserCookie(LANGUAGE_COOKIE, language)
  try {
    window.localStorage?.setItem(LANGUAGE_COOKIE, language)
  } catch {
    // ignore
  }
}

export function persistCurrency(currency) {
  if (!isValidCurrency(currency)) return
  writeBrowserCookie(CURRENCY_COOKIE, currency)
  try {
    window.localStorage?.setItem(CURRENCY_COOKIE, currency)
  } catch {
    // ignore
  }
}

// ---------- Server-side helper ----------

// Reads the language cookie from a Next.js cookies() store. Pass in the
// result of `cookies()` from `next/headers`. Falls back to the default
// language if the cookie is missing or invalid.
export function readLanguageFromCookies(cookieStore) {
  try {
    const value = cookieStore?.get?.(LANGUAGE_COOKIE)?.value
    return isValidLanguage(value) ? value : DEFAULT_LANGUAGE
  } catch {
    return DEFAULT_LANGUAGE
  }
}

export function readCurrencyFromCookies(cookieStore) {
  try {
    const value = cookieStore?.get?.(CURRENCY_COOKIE)?.value
    return isValidCurrency(value) ? value : DEFAULT_CURRENCY
  } catch {
    return DEFAULT_CURRENCY
  }
}

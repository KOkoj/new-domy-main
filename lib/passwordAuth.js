// Server-only helpers for the e-mail + password sign-in:
// generated passwords, pending ("forgotten") passwords stored as scrypt hashes,
// rate limits shared across serverless instances and the password e-mails.
// Tables and the lookup function: db/setup-password-auth.sql.

import { createHash, randomBytes, randomInt, scrypt as scryptCallback, timingSafeEqual } from 'crypto'
import { promisify } from 'util'
import emailService from '@/lib/emailService'
import { checkRateLimit } from '@/lib/rateLimit'
import { getPublicAbsoluteUrl } from '@/lib/siteUrl'
import { AUTH_EMAIL_FROM_DEFAULT, buildPasswordEmail } from '@/lib/passwordEmail'
import {
  GENERATED_PASSWORD_DIGITS,
  GENERATED_PASSWORD_LENGTH,
  GENERATED_PASSWORD_LETTERS,
  RESEND_COOLDOWN_SECONDS
} from '@/lib/authInput'

const scrypt = promisify(scryptCallback)

export const PENDING_PASSWORD_TTL_MS = 24 * 60 * 60 * 1000

// Password e-mails (registration + forgotten password share the limits):
// 1 per 60 s and 5 per hour, per e-mail and per IP.
export const PASSWORD_EMAIL_LIMITS = [
  { scope: 'email', cooldownMs: RESEND_COOLDOWN_SECONDS * 1000, max: 5, windowMs: 60 * 60 * 1000 },
  { scope: 'ip', cooldownMs: RESEND_COOLDOWN_SECONDS * 1000, max: 5, windowMs: 60 * 60 * 1000 }
]

// Sign-in attempts checked against a pending password: 10 per 15 min,
// per e-mail and per IP. Also used for the current-password check when
// changing the password.
export const PENDING_LOGIN_LIMITS = [
  { scope: 'email', cooldownMs: 0, max: 10, windowMs: 15 * 60 * 1000 },
  { scope: 'ip', cooldownMs: 0, max: 10, windowMs: 15 * 60 * 1000 }
]

// ---------------------------------------------------------------------------
// Passwords

export function generatePassword(length = GENERATED_PASSWORD_LENGTH) {
  const alphabet = GENERATED_PASSWORD_LETTERS + GENERATED_PASSWORD_DIGITS
  // Always at least one letter and one digit ("písmena a číslice").
  for (;;) {
    let value = ''
    for (let index = 0; index < length; index += 1) {
      value += alphabet[randomInt(alphabet.length)]
    }
    if (/[A-Z]/.test(value) && /[0-9]/.test(value)) return value
  }
}

const SCRYPT_PARAMS = { N: 16384, r: 8, p: 1 }
const SCRYPT_KEYLEN = 32

export async function hashPassword(password) {
  const salt = randomBytes(16)
  const derived = await scrypt(String(password), salt, SCRYPT_KEYLEN, SCRYPT_PARAMS)
  const { N, r, p } = SCRYPT_PARAMS
  return `scrypt$${N}$${r}$${p}$${salt.toString('base64')}$${Buffer.from(derived).toString('base64')}`
}

export async function verifyPasswordHash(password, stored) {
  if (typeof password !== 'string' || typeof stored !== 'string') return false
  const parts = stored.split('$')
  if (parts.length !== 6 || parts[0] !== 'scrypt') return false
  const [, n, r, p, saltB64, hashB64] = parts
  const expected = Buffer.from(hashB64, 'base64')
  if (expected.length === 0) return false
  try {
    const derived = await scrypt(password, Buffer.from(saltB64, 'base64'), expected.length, {
      N: Number(n),
      r: Number(r),
      p: Number(p)
    })
    return timingSafeEqual(Buffer.from(derived), expected)
  } catch {
    return false
  }
}

// ---------------------------------------------------------------------------
// Rate limits (Supabase table, in-memory fallback)

export function getClientIp(request) {
  const forwardedFor = request?.headers?.get?.('x-forwarded-for')
  if (forwardedFor) return forwardedFor.split(',')[0].trim()
  return request?.headers?.get?.('x-real-ip') || 'unknown'
}

function hashIdentifier(value) {
  const pepper = process.env.AUTH_RATE_LIMIT_SALT || 'domy-auth-rate-limit'
  return createHash('sha256').update(`${pepper}:${value}`).digest('hex')
}

function memoryLimit({ request, kind, rule, identifier }) {
  const id = `${rule.scope}:${identifier}`
  if (rule.cooldownMs > 0) {
    const cooldown = checkRateLimit({ request, bucket: `${kind}-cooldown`, limit: 1, windowMs: rule.cooldownMs, identifier: id })
    if (!cooldown.allowed) return cooldown
  }
  return checkRateLimit({ request, bucket: `${kind}-window`, limit: rule.max, windowMs: rule.windowMs, identifier: id })
}

/**
 * Checks the limits and, when allowed, records the attempt.
 * @returns {Promise<{ allowed: boolean, retryAfterSeconds?: number }>}
 */
export async function consumeAuthLimit({ admin, request, kind, email, limits }) {
  const identifiers = {
    email: hashIdentifier(`email:${email}`),
    ip: hashIdentifier(`ip:${getClientIp(request)}`)
  }

  if (admin) {
    try {
      const now = Date.now()
      for (const rule of limits) {
        const column = rule.scope === 'ip' ? 'ip_hash' : 'email_hash'
        const { data, error } = await admin
          .from('auth_email_log')
          .select('created_at')
          .eq('kind', kind)
          .eq(column, identifiers[rule.scope])
          .gte('created_at', new Date(now - rule.windowMs).toISOString())
          .order('created_at', { ascending: false })
          .limit(rule.max)
        if (error) throw error

        const times = (data || []).map((row) => Date.parse(row.created_at)).filter(Number.isFinite)
        if (rule.cooldownMs > 0 && times.length > 0 && now - times[0] < rule.cooldownMs) {
          return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((times[0] + rule.cooldownMs - now) / 1000)) }
        }
        if (times.length >= rule.max) {
          const oldest = times[times.length - 1]
          return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((oldest + rule.windowMs - now) / 1000)) }
        }
      }

      const { error: insertError } = await admin
        .from('auth_email_log')
        .insert({ kind, email_hash: identifiers.email, ip_hash: identifiers.ip })
      if (insertError) throw insertError

      if (Math.random() < 0.05) {
        await admin
          .from('auth_email_log')
          .delete()
          .lt('created_at', new Date(now - 24 * 60 * 60 * 1000).toISOString())
      }
      return { allowed: true }
    } catch (error) {
      console.error('[AUTH LIMIT] Falling back to in-memory limit:', error?.message || error)
    }
  }

  for (const rule of limits) {
    const result = memoryLimit({ request, kind, rule, identifier: identifiers[rule.scope] })
    if (!result.allowed) return { allowed: false, retryAfterSeconds: result.retryAfterSeconds }
  }
  return { allowed: true }
}

// ---------------------------------------------------------------------------
// Users and pending passwords

export function isEmailExistsError(error) {
  const code = String(error?.code || '').toLowerCase()
  if (code === 'email_exists' || code === 'user_already_exists') return true
  return /already (been )?registered|already exists/i.test(String(error?.message || ''))
}

export async function findAuthUserByEmail(admin, email) {
  const { data, error } = await admin.rpc('find_auth_user_by_email', { p_email: email })
  if (error) throw error
  const row = Array.isArray(data) ? data[0] : data
  return row?.id ? row : null
}

export async function savePendingPassword(admin, { userId, email, password }) {
  const passwordHash = await hashPassword(password)
  const { error } = await admin
    .from('pending_passwords')
    .upsert({
      user_id: userId,
      email,
      password_hash: passwordHash,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + PENDING_PASSWORD_TTL_MS).toISOString()
    }, { onConflict: 'user_id' })
  if (error) throw error
}

export async function deletePendingPassword(admin, userId) {
  if (!admin || !userId) return
  const { error } = await admin.from('pending_passwords').delete().eq('user_id', userId)
  if (error) console.error('[AUTH PENDING] Delete failed:', error.message)
}

export async function getPendingPassword(admin, email) {
  const { data, error } = await admin
    .from('pending_passwords')
    .select('user_id, password_hash, expires_at')
    .eq('email', email)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
  if (error) throw error
  return data?.[0] || null
}

/**
 * Makes a matching pending password the real password of the account.
 * The e-mail address counts as confirmed: the password was sent to it.
 * @returns {Promise<{ status: 'none' | 'mismatch' | 'limited' | 'applied', retryAfterSeconds?: number }>}
 */
export async function applyPendingPassword({ admin, request, email, password }) {
  const pending = await getPendingPassword(admin, email)
  if (!pending) return { status: 'none' }

  const limit = await consumeAuthLimit({ admin, request, kind: 'pending_login', email, limits: PENDING_LOGIN_LIMITS })
  if (!limit.allowed) return { status: 'limited', retryAfterSeconds: limit.retryAfterSeconds }

  const matches = await verifyPasswordHash(password, pending.password_hash)
  if (!matches) return { status: 'mismatch' }

  const { error } = await admin.auth.admin.updateUserById(pending.user_id, {
    password,
    email_confirm: true,
    app_metadata: { welcome_email_sent: true }
  })
  if (error) throw error

  await deletePendingPassword(admin, pending.user_id)
  return { status: 'applied', userId: pending.user_id }
}

// ---------------------------------------------------------------------------
// E-mail

export async function sendPasswordEmail({ kind, email, password, language, request }) {
  const { subject, html, text } = buildPasswordEmail({
    kind,
    email,
    password,
    language,
    loginUrl: getPublicAbsoluteUrl('/login', request)
  })
  return emailService.sendEmail({
    to: email,
    from: process.env.AUTH_EMAIL_FROM || AUTH_EMAIL_FROM_DEFAULT,
    subject,
    html,
    text,
    sensitive: true
  })
}

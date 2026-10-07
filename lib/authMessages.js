const AUTH_ERROR_KEYS = new Set([
  'emailRequired',
  'emailPasswordRequired',
  'nameEmailPasswordRequired',
  'passwordTooShort',
  'currentPasswordRequired',
  'currentPasswordInvalid',
  'resetSessionExpired',
  'unauthorized',
  'authNotConfigured',
  'unexpectedError',
  'invalidCredentials',
  'emailNotConfirmed',
  'userAlreadyRegistered',
  'emailRateLimited',
  'overRequestRateLimit',
  'weakPassword',
  'samePassword',
  'otpExpired',
  'invalidToken',
  'signupDisabled',
  'userNotFound',
  'invalidEmail',
  'sessionMissing',
  'serverLoginFailed',
  'serverSignupFailed',
  'resetRequestFailed',
  'resetUpdateFailed',
  'magicLinkFailed',
  'connectionError'
])

const CODE_MAP = {
  invalid_credentials: 'invalidCredentials',
  invalid_login_credentials: 'invalidCredentials',
  email_not_confirmed: 'emailNotConfirmed',
  user_already_exists: 'userAlreadyRegistered',
  email_exists: 'userAlreadyRegistered',
  over_email_send_rate_limit: 'emailRateLimited',
  over_request_rate_limit: 'overRequestRateLimit',
  weak_password: 'weakPassword',
  same_password: 'samePassword',
  otp_expired: 'otpExpired',
  expired_otp: 'otpExpired',
  expired_token: 'invalidToken',
  access_denied: 'invalidToken',
  signup_disabled: 'signupDisabled',
  user_not_found: 'userNotFound',
  validation_failed: 'invalidEmail',
  session_not_found: 'sessionMissing',
  auth_session_missing: 'sessionMissing'
}

const MESSAGE_PATTERNS = [
  [/invalid login credentials/i, 'invalidCredentials'],
  [/invalid email or password/i, 'invalidCredentials'],
  [/email not confirmed/i, 'emailNotConfirmed'],
  [/user already registered/i, 'userAlreadyRegistered'],
  [/already been registered/i, 'userAlreadyRegistered'],
  [/user already exists/i, 'userAlreadyRegistered'],
  [/email rate limit/i, 'emailRateLimited'],
  [/for security purposes/i, 'emailRateLimited'],
  [/only request this after/i, 'emailRateLimited'],
  [/password should be at least/i, 'passwordTooShort'],
  [/password must be at least/i, 'passwordTooShort'],
  [/new password should be different/i, 'samePassword'],
  [/should be different from the old password/i, 'samePassword'],
  [/weak password/i, 'weakPassword'],
  [/token has expired/i, 'invalidToken'],
  [/expired or is invalid/i, 'invalidToken'],
  [/otp has expired/i, 'otpExpired'],
  [/auth session missing/i, 'sessionMissing'],
  [/session missing/i, 'sessionMissing'],
  [/signups not allowed/i, 'signupDisabled'],
  [/user not found/i, 'userNotFound'],
  [/unable to validate email/i, 'invalidEmail'],
  [/invalid email/i, 'invalidEmail'],
  [/email is required/i, 'emailRequired']
]

export function isAuthErrorKey(value) {
  return typeof value === 'string' && AUTH_ERROR_KEYS.has(value)
}

export function mapSupabaseAuthError(error, fallbackKey = 'unexpectedError') {
  if (typeof error === 'string' && isAuthErrorKey(error)) {
    return error
  }

  const code = String(error?.code || '').trim().toLowerCase()
  if (code && CODE_MAP[code]) {
    return CODE_MAP[code]
  }

  const message = String(error?.message || error || '')
  for (const [pattern, key] of MESSAGE_PATTERNS) {
    if (pattern.test(message)) {
      return key
    }
  }

  return isAuthErrorKey(fallbackKey) ? fallbackKey : 'unexpectedError'
}

export function authErrorPayload(errorKey, extra = {}) {
  const key = isAuthErrorKey(errorKey) ? errorKey : 'unexpectedError'
  return { errorKey: key, ...extra }
}

export function resolveAuthClientMessage(payload, translate, fallbackKey) {
  const key = typeof payload?.errorKey === 'string' ? payload.errorKey : ''
  if (key) {
    const value = translate(key)
    if (value && value !== `auth.${key}` && value !== key) {
      return value
    }
  }
  return translate(fallbackKey)
}

'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff, AlertCircle, MailWarning } from 'lucide-react'
import { t } from '@/lib/translations'
import { resolveAuthClientMessage } from '@/lib/authMessages'
import { getSafeRedirectPath } from '@/lib/safeRedirect'
import {
  RESEND_COOLDOWN_SECONDS,
  isValidEmailAddress,
  normalizeEmailAddress,
  normalizePastedPassword
} from '@/lib/authInput'
import GoogleSignInButton from '@/components/auth/GoogleSignInButton'

const VARIANTS = {
  light: {
    title: 'text-xl font-bold text-slate-800',
    subtitle: 'text-sm text-gray-600',
    label: 'text-sm font-medium text-slate-700',
    input: 'h-11 text-base sm:text-sm bg-white',
    muted: 'text-gray-600',
    strong: 'text-slate-900',
    link: 'font-semibold text-[#aa6a3f] underline-offset-2 hover:underline',
    primary: 'w-full h-11 text-sm font-semibold bg-slate-800 hover:bg-slate-900 text-white',
    divider: 'border-gray-200',
    dividerText: 'bg-white text-gray-500',
    box: 'border border-[#e7d9c9] bg-[#faf6f3] text-gray-700',
    boxIcon: 'text-[#aa6a3f]',
    error: 'border border-red-200 bg-red-50 text-red-800',
    errorHint: 'text-red-700',
    google: 'h-11'
  },
  dark: {
    title: 'text-lg font-semibold text-white',
    subtitle: 'text-sm text-gray-400',
    label: 'text-sm text-gray-300',
    input: 'h-11 bg-slate-900 border-amber-400/20 text-white',
    muted: 'text-gray-400',
    strong: 'text-white',
    link: 'font-semibold text-amber-400 underline-offset-2 hover:underline',
    primary: 'w-full h-11 bg-amber-600 hover:bg-amber-700 text-white',
    divider: 'border-amber-400/20',
    dividerText: 'bg-slate-800 text-gray-400',
    box: 'border border-amber-400/20 bg-slate-900/60 text-gray-300',
    boxIcon: 'text-amber-400',
    error: 'border border-red-600 bg-red-900/20 text-red-300',
    errorHint: 'text-red-400',
    google: 'h-11'
  }
}

const SENT_MODES = new Set(['registerSent', 'forgotSent'])

/**
 * Registration, sign-in and forgotten password (Figma frames 2, 3 and 4):
 *   register    -> POST /api/auth/register         -> registerSent
 *   forgot      -> POST /api/auth/forgot-password  -> forgotSent
 *   login, registerSent, forgotSent -> POST /api/auth/login
 * Google sign-in sits on top of register and login.
 */
export default function PasswordAuthForm({
  language = 'cs',
  nextPath = '/properties',
  variant = 'light',
  idPrefix = 'auth',
  initialMode = 'register',
  registrationHref = '',
  onSuccess,
  onModeChange,
  onEmailSubmitted,
  headingLevel = 'h2'
}) {
  const styles = VARIANTS[variant] || VARIANTS.light
  const tr = (key) => t(`auth.${key}`, language)
  const safeNext = getSafeRedirectPath(nextPath, '/properties')
  const Heading = headingLevel

  const [mode, setModeState] = useState(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [website, setWebsite] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [wrongPassword, setWrongPassword] = useState(false)
  const [notice, setNotice] = useState('')
  const [resendAt, setResendAt] = useState(0)
  const [now, setNow] = useState(() => Date.now())
  const passwordInputRef = useRef(null)

  const secondsLeft = Math.max(0, Math.ceil((resendAt - now) / 1000))
  const isSentMode = SENT_MODES.has(mode)

  useEffect(() => {
    setModeState(initialMode)
  }, [initialMode])

  useEffect(() => {
    if (!resendAt) return undefined
    const timer = setInterval(() => {
      const current = Date.now()
      setNow(current)
      if (current >= resendAt) clearInterval(timer)
    }, 1000)
    return () => clearInterval(timer)
  }, [resendAt])

  useEffect(() => {
    if (isSentMode) passwordInputRef.current?.focus()
  }, [isSentMode])

  const resetMessages = () => {
    setError('')
    setNotice('')
    setWrongPassword(false)
  }

  const setMode = (nextMode) => {
    resetMessages()
    setPassword('')
    setShowPassword(false)
    setModeState(nextMode)
    onModeChange?.(nextMode)
  }

  const startCooldown = (seconds) => {
    setResendAt(Date.now() + seconds * 1000)
    setNow(Date.now())
  }

  // Registration and forgotten password both e-mail a generated password.
  const requestPassword = async (kind, { isResend = false } = {}) => {
    const normalizedEmail = normalizeEmailAddress(email)
    if (!normalizedEmail) {
      setError(tr('emailRequired'))
      return
    }
    if (!isValidEmailAddress(normalizedEmail)) {
      setError(tr('invalidEmail'))
      return
    }

    setIsLoading(true)
    resetMessages()
    try {
      const endpoint = kind === 'forgot' ? '/api/auth/forgot-password' : '/api/auth/register'
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail, language, website })
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        setError(resolveAuthClientMessage(payload, tr, 'passwordEmailFailed'))
        if (response.status === 429) {
          startCooldown(Number(payload?.retryAfterSeconds) || RESEND_COOLDOWN_SECONDS)
        }
        return
      }
      setEmail(normalizedEmail)
      setPassword('')
      startCooldown(RESEND_COOLDOWN_SECONDS)
      if (isResend) setNotice(tr('passwordResent'))
      if (kind === 'register') onEmailSubmitted?.(normalizedEmail)
      const sentMode = kind === 'forgot' ? 'forgotSent' : 'registerSent'
      if (mode !== sentMode) {
        setModeState(sentMode)
        onModeChange?.(sentMode)
      }
    } catch {
      setError(tr('connectionError'))
    } finally {
      setIsLoading(false)
    }
  }

  const signIn = async () => {
    const normalizedEmail = normalizeEmailAddress(email)
    const value = isSentMode ? normalizePastedPassword(password) : password
    if (!normalizedEmail || !value) {
      setError(tr('emailPasswordRequired'))
      return
    }

    setIsLoading(true)
    resetMessages()
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail, password: value, next: safeNext, language })
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        if (isSentMode && payload?.errorKey === 'invalidCredentials') {
          setWrongPassword(true)
        } else {
          setError(resolveAuthClientMessage(payload, tr, 'serverLoginFailed'))
        }
        setIsLoading(false)
        return
      }

      if (onSuccess) {
        onSuccess(payload?.user || null)
        return
      }
      // Full navigation so navigation, favorites and pending favorites pick
      // up the new session cookies.
      window.location.assign(getSafeRedirectPath(payload?.next, safeNext))
    } catch {
      setError(tr('connectionError'))
      setIsLoading(false)
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (isLoading) return
    if (mode === 'register') requestPassword('register')
    else if (mode === 'forgot') requestPassword('forgot')
    else signIn()
  }

  const id = (name) => `${idPrefix}-${name}`

  const errorBox = error && (
    <div role="alert" className={`flex items-start gap-2 rounded-lg px-3 py-2 text-sm ${styles.error}`} data-testid="auth-error">
      <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
      <span>{error}</span>
    </div>
  )

  const noticeBox = notice && (
    <p className={`text-sm ${styles.muted}`} role="status" data-testid="auth-notice">{notice}</p>
  )

  const googleBlock = (
    <>
      <GoogleSignInButton
        label={tr('continueWithGoogle')}
        nextPath={safeNext}
        className={styles.google}
        onError={(key) => setError(key ? tr(key) : '')}
      />
      <div className="relative my-1" aria-hidden="true">
        <div className="absolute inset-0 flex items-center">
          <span className={`w-full border-t ${styles.divider}`} />
        </div>
        <div className="relative flex justify-center text-xs font-semibold tracking-widest">
          <span className={`px-3 ${styles.dividerText}`}>{tr('orDivider')}</span>
        </div>
      </div>
    </>
  )

  const emailField = (
    <div className="space-y-1.5">
      <Label htmlFor={id('email')} className={styles.label}>{tr('email')}</Label>
      <Input
        id={id('email')}
        type="email"
        inputMode="email"
        autoComplete="email"
        placeholder={tr('emailPlaceholder')}
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        className={styles.input}
        required
        data-testid="auth-email-input"
      />
    </div>
  )

  const passwordField = ({ label, placeholder, autoComplete }) => (
    <div className="space-y-1.5">
      <Label htmlFor={id('password')} className={styles.label}>{label}</Label>
      <div className="relative">
        <Input
          id={id('password')}
          ref={passwordInputRef}
          type={showPassword ? 'text' : 'password'}
          autoComplete={autoComplete}
          autoCapitalize={isSentMode ? 'characters' : 'none'}
          spellCheck={false}
          placeholder={placeholder}
          value={password}
          onChange={(event) => {
            setPassword(event.target.value)
            if (wrongPassword) setWrongPassword(false)
          }}
          className={`${styles.input} pr-12 ${isSentMode ? 'font-mono tracking-wider placeholder:font-sans placeholder:tracking-normal' : ''}`}
          aria-invalid={wrongPassword || undefined}
          required
          data-testid="auth-password-input"
        />
        <button
          type="button"
          className="absolute right-0 top-0 flex h-full min-w-[44px] items-center justify-center px-3 text-gray-400 hover:text-gray-600"
          onClick={() => setShowPassword((value) => !value)}
          aria-label={showPassword ? tr('hidePassword') : tr('showPassword')}
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {wrongPassword && (
        <p className={`text-xs ${styles.errorHint}`} data-testid="auth-password-hint">{tr('generatedPasswordHint')}</p>
      )}
    </div>
  )

  const honeypot = (
    <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label htmlFor={id('website')}>Website</label>
      <input
        id={id('website')}
        type="text"
        tabIndex={-1}
        autoComplete="off"
        value={website}
        onChange={(event) => setWebsite(event.target.value)}
      />
    </div>
  )

  const renderSentTo = (key) => {
    const [before, after = ''] = tr(key).split('{email}')
    return (
      <>
        {before}
        <span className={`font-semibold break-all ${styles.strong}`} data-testid="auth-sent-email">{email}</span>
        {after}
      </>
    )
  }

  // ---- registerSent / forgotSent (Figma 2b, 2c, 4b) ----
  if (isSentMode) {
    const isForgot = mode === 'forgotSent'
    const resendLabel = wrongPassword ? tr('sendNewPassword') : tr('resendPassword')
    return (
      <form onSubmit={handleSubmit} className="relative space-y-4" data-testid="auth-sent-form" noValidate>
        <Heading className={styles.title}>{isForgot ? tr('forgotSentTitle') : tr('checkEmailTitle')}</Heading>

        {wrongPassword ? (
          <div role="alert" className={`rounded-lg px-4 py-3 ${styles.error}`} data-testid="auth-wrong-password">
            <p className="font-semibold">{tr('wrongPasswordTitle')}</p>
            <p className="mt-1 text-sm">{tr('wrongPasswordText')}</p>
          </div>
        ) : (
          <div className="space-y-1 text-sm">
            <p className={styles.muted}>{renderSentTo(isForgot ? 'newPasswordSentTo' : 'passwordSentTo')}</p>
            <p className={styles.muted}>{isForgot ? tr('forgotSentInfo') : tr('checkEmailInfo')}</p>
          </div>
        )}

        {errorBox}
        {emailField}
        {passwordField({
          label: isForgot ? tr('newEmailPasswordLabel') : tr('emailPasswordLabel'),
          placeholder: isForgot ? tr('newEmailPasswordPlaceholder') : tr('emailPasswordPlaceholder'),
          autoComplete: 'current-password'
        })}

        <Button type="submit" className={styles.primary} disabled={isLoading} data-testid="auth-submit">
          {isLoading ? tr('signingIn') : tr('signIn')}
        </Button>

        {!wrongPassword && (
          <div className={`flex items-start gap-3 rounded-lg p-3 ${styles.box}`}>
            <MailWarning className={`mt-0.5 h-4 w-4 flex-shrink-0 ${styles.boxIcon}`} aria-hidden="true" />
            <div className="text-sm">
              <p className={`font-semibold ${styles.strong}`}>{tr('noEmailTitle')}</p>
              <p className="mt-0.5">{isForgot ? tr('noEmailForgot') : tr('noEmailRegister')}</p>
            </div>
          </div>
        )}

        {noticeBox}

        <p className={`text-center text-sm ${styles.muted}`}>
          <button
            type="button"
            className={`${styles.link} disabled:cursor-not-allowed disabled:opacity-60 disabled:no-underline`}
            disabled={isLoading || secondsLeft > 0}
            onClick={() => requestPassword(isForgot ? 'forgot' : 'register', { isResend: true })}
            data-testid="auth-resend"
          >
            {resendLabel}
          </button>
          {secondsLeft > 0 && <span> {tr('resendIn').replace('{seconds}', String(secondsLeft))}</span>}
          <span aria-hidden="true"> · </span>
          <button
            type="button"
            className={styles.link}
            onClick={() => setMode(isForgot ? 'forgot' : 'register')}
            data-testid="auth-change-email"
          >
            {tr('changeEmail')}
          </button>
        </p>
      </form>
    )
  }

  // ---- forgot (Figma 4a) ----
  if (mode === 'forgot') {
    return (
      <form onSubmit={handleSubmit} className="relative space-y-4" data-testid="auth-forgot-form" noValidate>
        <div className="space-y-1">
          <Heading className={styles.title}>{tr('forgotTitle')}</Heading>
          <p className={styles.subtitle}>{tr('forgotSubtitle')}</p>
        </div>
        {errorBox}
        {emailField}
        {honeypot}
        <Button type="submit" className={styles.primary} disabled={isLoading} data-testid="auth-submit">
          {isLoading ? tr('sending') : tr('sendNewPassword')}
        </Button>
        <p className="text-center text-sm">
          <button type="button" className={styles.link} onClick={() => setMode('login')} data-testid="auth-back-to-login">
            {tr('backToLogin')}
          </button>
        </p>
      </form>
    )
  }

  // ---- login (Figma 3) ----
  if (mode === 'login') {
    return (
      <form onSubmit={handleSubmit} className="relative space-y-4" data-testid="auth-login-form" noValidate>
        <div className="space-y-1">
          <Heading className={styles.title}>{tr('loginTitle')}</Heading>
          <p className={styles.subtitle}>{tr('loginSubtitle')}</p>
        </div>
        {googleBlock}
        {errorBox}
        {emailField}
        {passwordField({ label: tr('password'), placeholder: tr('loginPasswordPlaceholder'), autoComplete: 'current-password' })}
        <p className="-mt-2 text-right text-sm">
          <button type="button" className={styles.link} onClick={() => setMode('forgot')} data-testid="auth-forgot-link">
            {tr('forgotPasswordLink')}
          </button>
        </p>
        <Button type="submit" className={styles.primary} disabled={isLoading} data-testid="auth-submit">
          {isLoading ? tr('signingIn') : tr('signIn')}
        </Button>
        <p className={`text-center text-sm ${styles.muted}`}>
          {tr('noAccount')}{' '}
          <button type="button" className={styles.link} onClick={() => setMode('register')} data-testid="auth-to-register">
            {tr('noAccountLink')}
          </button>
        </p>
        {registrationHref && (
          <p className="text-center text-sm">
            <Link href={registrationHref} className={styles.link} data-testid="auth-registration-link">
              {tr('whatYouGet')}
            </Link>
          </p>
        )}
      </form>
    )
  }

  // ---- register (Figma 2a) ----
  return (
    <form onSubmit={handleSubmit} className="relative space-y-4" data-testid="auth-register-form" noValidate>
      <div className="space-y-1">
        <Heading className={styles.title}>{tr('registerTitle')}</Heading>
        <p className={styles.subtitle}>{tr('registerSubtitle')}</p>
      </div>
      {googleBlock}
      {errorBox}
      {emailField}
      <p className={`text-sm ${styles.muted}`}>{tr('registerHint')}</p>
      {honeypot}
      <Button type="submit" className={styles.primary} disabled={isLoading} data-testid="auth-submit">
        {isLoading ? tr('sending') : tr('registerButton')}
      </Button>
      <p className={`text-xs leading-relaxed ${styles.muted}`}>
        {tr('privacyNotice')}{' '}
        <Link href="/gdpr" className="underline">{tr('privacyNoticeLink')}</Link>.
      </p>
      <p className={`text-center text-sm ${styles.muted}`}>
        {tr('haveAccount')}{' '}
        <button type="button" className={styles.link} onClick={() => setMode('login')} data-testid="auth-to-login">
          {tr('haveAccountLink')}
        </button>
      </p>
    </form>
  )
}

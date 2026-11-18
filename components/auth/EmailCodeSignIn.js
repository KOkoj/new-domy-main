'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Mail, Lock, Eye, EyeOff, KeyRound, CheckCircle, AlertCircle } from 'lucide-react'
import { t } from '@/lib/translations'
import { resolveAuthClientMessage } from '@/lib/authMessages'
import { getSafeRedirectPath } from '@/lib/safeRedirect'
import {
  OTP_LENGTH,
  OTP_MAX_LENGTH,
  RESEND_COOLDOWN_SECONDS,
  isCompleteOtp,
  isValidEmailAddress,
  normalizeOtpInput
} from '@/lib/emailCode'

const VARIANTS = {
  light: {
    label: 'text-sm text-slate-700',
    input: 'h-10 text-sm',
    icon: 'text-gray-400',
    muted: 'text-slate-600',
    strong: 'text-slate-900',
    link: 'text-slate-700 underline hover:text-slate-900',
    primary: 'w-full h-10 text-sm',
    secondary: 'w-full h-10 text-sm',
    divider: 'border-slate-200',
    dividerText: 'bg-background text-muted-foreground',
    hint: 'bg-slate-50 border border-slate-200 text-slate-600',
    error: '',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    code: 'h-14 text-center text-2xl tracking-[0.5em] font-mono'
  },
  dark: {
    label: 'text-sm text-gray-300',
    input: 'h-10 bg-slate-900 border-amber-400/20 text-white',
    icon: 'text-gray-400',
    muted: 'text-gray-400',
    strong: 'text-white',
    link: 'text-amber-400 underline hover:text-amber-300',
    primary: 'w-full h-10 bg-amber-600 hover:bg-amber-700 text-white',
    secondary: 'w-full h-10 border-amber-400/20 bg-transparent text-amber-400 hover:bg-amber-400/10 hover:text-amber-300',
    divider: 'border-amber-400/20',
    dividerText: 'bg-slate-800 text-gray-400',
    hint: 'bg-slate-900/60 border border-amber-400/20 text-gray-300',
    error: 'bg-red-900/20 border-red-600 text-red-400',
    success: 'bg-green-900/20 border-green-600 text-green-400',
    code: 'h-14 text-center text-2xl tracking-[0.5em] font-mono bg-slate-900 border-amber-400/20 text-white'
  }
}

/**
 * E-mail sign-in / registration with a one-time code:
 *   1. e-mail -> POST /api/auth/send-code (creates the account for new e-mails)
 *   2. code   -> POST /api/auth/verify-otp (sets the session cookies server-side)
 * Used by the auth modal, /login and /registrace so every entry point behaves
 * the same. Optional password login stays for older accounts.
 */
export default function EmailCodeSignIn({
  language = 'cs',
  nextPath = '/dashboard',
  variant = 'light',
  idPrefix = 'auth',
  allowPassword = false,
  autoFocus = false,
  onEmailSubmitted,
  onPasswordSuccess,
  footer = null
}) {
  const styles = VARIANTS[variant] || VARIANTS.light
  const tr = (key) => t(`auth.${key}`, language)
  const safeNext = getSafeRedirectPath(nextPath, '/dashboard')

  const [step, setStep] = useState('email')
  const [usePassword, setUsePassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [code, setCode] = useState('')
  const [website, setWebsite] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [resendAt, setResendAt] = useState(0)
  const [now, setNow] = useState(() => Date.now())
  const codeInputRef = useRef(null)
  const verifyingRef = useRef(false)

  const secondsLeft = Math.max(0, Math.ceil((resendAt - now) / 1000))

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
    if (step === 'code') codeInputRef.current?.focus()
  }, [step])

  const resetMessages = () => {
    setError('')
    setNotice('')
  }

  const sendCode = async ({ isResend = false } = {}) => {
    const normalizedEmail = email.trim().toLowerCase()
    if (!normalizedEmail) {
      setError(tr('emailRequired'))
      return
    }
    if (!isValidEmailAddress(normalizedEmail)) {
      setError(tr('invalidEmail'))
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail, next: safeNext, language, website })
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        setError(resolveAuthClientMessage(payload, tr, 'codeSendFailed'))
        if (response.status === 429) {
          const retry = Number(payload?.retryAfterSeconds) || RESEND_COOLDOWN_SECONDS
          setResendAt(Date.now() + retry * 1000)
          setNow(Date.now())
        }
        return
      }
      setEmail(normalizedEmail)
      setCode('')
      setStep('code')
      setResendAt(Date.now() + RESEND_COOLDOWN_SECONDS * 1000)
      setNow(Date.now())
      if (isResend) setNotice(tr('codeResent'))
      onEmailSubmitted?.(normalizedEmail)
    } catch {
      setError(tr('connectionError'))
    } finally {
      setIsLoading(false)
    }
  }

  const verifyCode = async (rawCode) => {
    const token = normalizeOtpInput(rawCode)
    if (!isCompleteOtp(token)) {
      setError(tr('codeRequired'))
      return
    }
    if (verifyingRef.current) return
    verifyingRef.current = true

    setIsLoading(true)
    resetMessages()
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, next: safeNext, language })
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        setError(resolveAuthClientMessage(payload, tr, 'codeVerifyFailed'))
        verifyingRef.current = false
        setIsLoading(false)
        return
      }
      setNotice(tr('codeVerified'))
      // Full navigation so every part of the page (navigation, favorites,
      // pending favorites) picks up the new session cookies.
      window.location.assign(getSafeRedirectPath(payload?.next, safeNext))
    } catch {
      setError(tr('connectionError'))
      verifyingRef.current = false
      setIsLoading(false)
    }
  }

  const handleCodeChange = (value) => {
    const digits = normalizeOtpInput(value)
    const previousLength = code.length
    setCode(digits)
    if (error) setError('')
    // Auto-submit once the code is complete: typed 6th digit, or a whole
    // pasted / autofilled code (also with spaces or 7-8 digits).
    if (digits.length >= OTP_LENGTH && previousLength < OTP_LENGTH && !isLoading) {
      verifyCode(digits)
    }
  }

  const handlePasswordLogin = async () => {
    if (!email || !password) {
      setError(tr('fillAllFields'))
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        setError(resolveAuthClientMessage(payload, tr, 'serverLoginFailed'))
        return
      }

      setNotice(tr('loginSuccessRedirect'))
      try {
        await fetch('/api/profile', { method: 'POST' })
      } catch (profileError) {
        console.warn('Profile check/creation failed:', profileError)
      }

      setTimeout(() => {
        if (onPasswordSuccess) onPasswordSuccess(payload?.user || null)
        else window.location.assign(safeNext)
      }, 800)
    } catch {
      setError(tr('connectionError'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmailSubmit = async (event) => {
    event.preventDefault()
    resetMessages()
    if (usePassword) await handlePasswordLogin()
    else await sendCode()
  }

  const messages = (
    <>
      {error && (
        <Alert variant="destructive" className={`py-2 ${styles.error}`} data-testid="auth-error">
          {variant === 'dark' && <AlertCircle className="h-4 w-4" />}
          <AlertDescription className="text-sm">{error}</AlertDescription>
        </Alert>
      )}
      {notice && (
        <Alert className={`py-2 ${styles.success}`} data-testid="auth-notice">
          {variant === 'dark' && <CheckCircle className="h-4 w-4" />}
          <AlertDescription className="text-sm">{notice}</AlertDescription>
        </Alert>
      )}
    </>
  )

  if (step === 'code') {
    return (
      <form
        onSubmit={(event) => {
          event.preventDefault()
          verifyCode(code)
        }}
        className="space-y-3"
        data-testid="auth-code-form"
      >
        <div className="space-y-1">
          <p className={`text-base font-semibold ${styles.strong}`}>{tr('codeStepTitle')}</p>
          <p className={`text-sm ${styles.muted}`}>
            {tr('codeSentTo')}{' '}
            <span className={`font-semibold break-all ${styles.strong}`} data-testid="auth-code-email">{email}</span>
          </p>
          <button
            type="button"
            className={`text-sm ${styles.link}`}
            onClick={() => {
              setStep('email')
              setCode('')
              resetMessages()
            }}
            disabled={isLoading}
            data-testid="auth-change-email"
          >
            {tr('changeEmail')}
          </button>
        </div>

        <div className="space-y-1">
          <Label htmlFor={`${idPrefix}-code`} className={styles.label}>{tr('codeLabel')}</Label>
          <Input
            ref={codeInputRef}
            id={`${idPrefix}-code`}
            name="one-time-code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9 ]*"
            maxLength={OTP_MAX_LENGTH + 4}
            placeholder={'•'.repeat(OTP_LENGTH)}
            className={styles.code}
            value={code}
            onChange={(event) => handleCodeChange(event.target.value)}
            disabled={isLoading}
            aria-describedby={`${idPrefix}-code-hint`}
            data-testid="auth-code-input"
          />
        </div>

        {messages}

        <Button type="submit" className={styles.primary} disabled={isLoading} data-testid="auth-verify-submit">
          <KeyRound className="w-4 h-4 mr-2" />
          {isLoading ? tr('verifyingCode') : tr('verifyCode')}
        </Button>

        <Button
          type="button"
          variant="outline"
          className={styles.secondary}
          disabled={isLoading || secondsLeft > 0}
          onClick={() => {
            resetMessages()
            sendCode({ isResend: true })
          }}
          data-testid="auth-resend-code"
        >
          {secondsLeft > 0
            ? tr('resendIn').replace('{seconds}', String(secondsLeft))
            : tr('resendCode')}
        </Button>

        <p id={`${idPrefix}-code-hint`} className={`rounded-md px-3 py-2 text-xs leading-snug ${styles.hint}`}>
          {tr('spamHint')}
        </p>

        {footer}
      </form>
    )
  }

  return (
    <form onSubmit={handleEmailSubmit} className="space-y-3" data-testid="auth-email-form">
      <div className="space-y-1" data-testid="auth-email-field">
        <Label htmlFor={`${idPrefix}-email`} className={styles.label}>{tr('email')}</Label>
        <div className="relative">
          <Mail className={`absolute left-3 top-3 h-4 w-4 ${styles.icon}`} />
          <Input
            id={`${idPrefix}-email`}
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            autoFocus={autoFocus}
            placeholder={tr('emailPlaceholder')}
            className={`pl-10 ${styles.input}`}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={isLoading}
            data-testid="auth-email-input"
          />
        </div>
      </div>

      {/* Honeypot: hidden from people, bots tend to fill it. */}
      <div aria-hidden="true" style={{ position: 'absolute', left: '-10000px', width: 1, height: 1, overflow: 'hidden' }}>
        <label htmlFor={`${idPrefix}-website`}>Website</label>
        <input
          id={`${idPrefix}-website`}
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(event) => setWebsite(event.target.value)}
        />
      </div>

      {usePassword && (
        <div className="space-y-1" data-testid="auth-password-field">
          <Label htmlFor={`${idPrefix}-password`} className={styles.label}>{tr('password')}</Label>
          <div className="relative">
            <Lock className={`absolute left-3 top-3 h-4 w-4 ${styles.icon}`} />
            <Input
              id={`${idPrefix}-password`}
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder={tr('passwordPlaceholder')}
              className={`pl-10 pr-10 ${styles.input}`}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={isLoading}
              data-testid="auth-password-input"
            />
            <button
              type="button"
              className={`absolute right-3 top-3 leading-none ${styles.icon}`}
              onClick={() => setShowPassword((value) => !value)}
              aria-label={tr('password')}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <div className="text-right">
            <Link href="/forgot-password" className={`text-xs ${styles.link}`}>
              {tr('forgotPassword')}
            </Link>
          </div>
        </div>
      )}

      {!usePassword && (
        <p className={`text-xs leading-snug ${styles.muted}`}>{tr('emailStepHint')}</p>
      )}

      {messages}

      <Button type="submit" className={styles.primary} disabled={isLoading} data-testid="auth-submit">
        {usePassword ? (
          isLoading ? tr('signingIn') : tr('signIn')
        ) : (
          <>
            <Mail className="w-4 h-4 mr-2" />
            {isLoading ? tr('sendingCode') : tr('sendCode')}
          </>
        )}
      </Button>

      {allowPassword && (
        <>
          <div className="relative py-1">
            <div className="absolute inset-0 flex items-center">
              <span className={`w-full border-t ${styles.divider}`} />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className={`px-2 ${styles.dividerText}`}>{tr('or')}</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className={styles.secondary}
            onClick={() => {
              setUsePassword((value) => !value)
              resetMessages()
            }}
            disabled={isLoading}
            data-testid="auth-password-toggle"
          >
            {usePassword ? (
              <>
                <Mail className="w-4 h-4 mr-2" />
                {tr('useCodeInstead')}
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 mr-2" />
                {tr('passwordLogin')}
              </>
            )}
          </Button>
        </>
      )}

      {footer}
    </form>
  )
}

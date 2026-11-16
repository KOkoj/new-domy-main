'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import Image from 'next/image'
import { t } from '@/lib/translations'
import { resolveAuthClientMessage } from '@/lib/authMessages'

// Single-field auth: new visitors only enter an e-mail and receive a magic
// link that both creates the account and signs them in. Password login stays
// available as an option for existing accounts.
export default function AuthModal({
  isOpen,
  onClose,
  onAuthSuccess,
  onEmailSubmitted,
  redirectTo = '',
  title = '',
  message = '',
  defaultTab = 'login',
  language = 'cs'
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [usePassword, setUsePassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [activeTab, setActiveTab] = useState(defaultTab)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    if (isOpen) setActiveTab(defaultTab)
  }, [isOpen, defaultTab])

  const tr = (key) => t(`auth.${key}`, language)

  const resolveNextPath = () => {
    if (typeof redirectTo === 'string' && redirectTo.startsWith('/') && !redirectTo.startsWith('//')) {
      return redirectTo
    }
    if (typeof window !== 'undefined') {
      const { pathname, search } = window.location
      if (pathname && pathname !== '/login') return `${pathname}${search || ''}`
    }
    return '/dashboard'
  }

  const loginViaServer = async (loginEmail, loginPassword) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: loginEmail, password: loginPassword })
    })

    const payload = await response.json().catch(() => ({}))
    if (!response.ok) {
      return {
        ok: false,
        error: resolveAuthClientMessage(payload, tr, 'serverLoginFailed')
      }
    }

    return {
      ok: true,
      user: payload?.user || null
    }
  }

  const handlePasswordLogin = async () => {
    if (!email || !password) {
      setError(tr('fillAllFields'))
      return
    }

    setIsLoading(true)
    try {
      const result = await loginViaServer(email, password)
      if (!result.ok) {
        setError(result.error || tr('serverLoginFailed'))
        return
      }

      setSuccess(tr('loginSuccess'))

      try {
        await fetch('/api/profile', { method: 'POST' })
      } catch (profileError) {
        console.warn('Profile check/creation failed:', profileError)
      }

      setTimeout(() => {
        onAuthSuccess?.(result.user)
        onClose()
      }, 1000)
    } catch (err) {
      setError(tr('connectionError'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleMagicLink = async () => {
    if (!email) {
      setError(tr('emailRequired'))
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, next: resolveNextPath(), language })
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        setError(resolveAuthClientMessage(payload, tr, 'magicLinkFailed'))
        return
      }
      setSuccess(tr('magicLinkSent'))
      onEmailSubmitted?.(email.trim().toLowerCase())
    } catch {
      setError(tr('connectionError'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (usePassword) {
      await handlePasswordLogin()
    } else {
      await handleMagicLink()
    }
  }

  const resetForm = () => {
    setEmail('')
    setPassword('')
    setUsePassword(false)
    setError('')
    setSuccess('')
    setShowPassword(false)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const displayTitle = activeTab === 'signup' ? tr('signup') : tr('login')
  const contextMessage = message || (title && title !== displayTitle ? title : '')

  return (
    <Dialog open={isOpen} onOpenChange={handleClose} data-testid="auth-modal">
      <DialogContent
        className="sm:max-w-sm w-[calc(100%-2rem)] max-h-[90vh] overflow-y-auto p-4 gap-2"
        data-testid="auth-modal-content"
      >
        <DialogHeader data-testid="auth-modal-header">
          <div className="text-center space-y-1" data-testid="auth-modal-title">
            <Image
              src="/domy logo V3.svg"
              alt="Domy v Itálii"
              width={40}
              height={40}
              className="h-10 w-auto mx-auto"
              data-testid="auth-modal-logo"
            />
            <DialogTitle className="text-base font-bold">
              {displayTitle}
            </DialogTitle>
            {contextMessage && (
              <p className="text-xs text-slate-600 leading-snug">
                {contextMessage}
              </p>
            )}
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-2 mt-2" data-testid="auth-email-form">
          <div className="space-y-1" data-testid="auth-email-field">
            <Label htmlFor="auth-email" className="text-sm">{tr('email')}</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                id="auth-email"
                type="email"
                autoComplete="email"
                placeholder={tr('emailPlaceholder')}
                className="pl-10 h-9 text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                data-testid="auth-email-input"
              />
            </div>
          </div>

          {usePassword && (
            <div className="space-y-1" data-testid="auth-password-field">
              <Label htmlFor="auth-password" className="text-sm">{tr('password')}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder={tr('passwordPlaceholder')}
                  className="pl-10 pr-10 h-9 text-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  data-testid="auth-password-input"
                />
                <button
                  type="button"
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <div className="text-right">
                <Link href="/forgot-password" className="text-xs underline text-slate-600 hover:text-slate-900">
                  {tr('forgotPassword')}
                </Link>
              </div>
            </div>
          )}

          {error && (
            <Alert variant="destructive" className="py-2">
              <AlertDescription className="text-xs">{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="py-2">
              <AlertDescription className="text-xs text-slate-800">{success}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full h-9 text-sm" disabled={isLoading} data-testid="auth-submit">
            {usePassword ? (
              isLoading ? tr('signingIn') : tr('signIn')
            ) : (
              <>
                <Mail className="w-4 h-4 mr-2" />
                {tr('sendMagicLink')}
              </>
            )}
          </Button>

          <div className="relative py-1">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">{tr('or')}</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full h-9 text-sm"
            onClick={() => {
              setUsePassword((value) => !value)
              setError('')
              setSuccess('')
            }}
            disabled={isLoading}
            data-testid="auth-password-toggle"
          >
            {usePassword ? (
              <>
                <Mail className="w-4 h-4 mr-2" />
                {tr('sendMagicLink')}
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 mr-2" />
                {tr('password')}
              </>
            )}
          </Button>
        </form>

        <div className="text-center text-sm text-gray-600 leading-snug mt-2">
          {tr('termsText')}{' '}
          <Link href="/terms" className="underline">
            {tr('termsLink')}
          </Link>
          , {' '}
          <Link href="/gdpr" className="underline">
            {tr('privacyLink')}
          </Link>
          {' '}{tr('and')}{' '}
          <Link href="/cookies" className="underline">
            {tr('cookiePolicy')}
          </Link>
          .
        </div>
      </DialogContent>
    </Dialog>
  )
}

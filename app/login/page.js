'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Mail, Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react'
import FormPrivacyNotice from '@/components/legal/FormPrivacyNotice'
import { t } from '@/lib/translations'
import { resolveAuthClientMessage } from '@/lib/authMessages'
import { DEFAULT_LANGUAGE, readLanguageFromBrowser } from '@/lib/userPreferences'
import { getSafeRedirectPath } from '@/lib/safeRedirect'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [activeTab, setActiveTab] = useState('login')
  const [usePassword, setUsePassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [language, setLanguage] = useState(DEFAULT_LANGUAGE)
  const router = useRouter()
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab')
  const redirectParam = searchParams.get('redirect')
  const errorParam = searchParams.get('error')
  const redirectPath = getSafeRedirectPath(redirectParam, '/dashboard')
  const tr = (key) => t(`auth.${key}`, language)


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

    return { ok: true }
  }


  useEffect(() => {
    setLanguage(readLanguageFromBrowser())

    const handleLanguageChange = (event) => setLanguage(event.detail)
    window.addEventListener('languageChange', handleLanguageChange)
    return () => window.removeEventListener('languageChange', handleLanguageChange)
  }, [])

  useEffect(() => {
    if (tabParam === 'signup' || tabParam === 'login') {
      setActiveTab(tabParam)
    }
  }, [tabParam])

  useEffect(() => {
    if (!errorParam) return

    const callbackErrors = {
      'auth-not-configured': tr('authNotConfigured'),
      'auth-callback-failed': tr('authCallbackFailed')
    }

    setError(callbackErrors[errorParam] || decodeURIComponent(errorParam))
  }, [errorParam, language])

  // Check if user is already logged in
  useEffect(() => {
    const checkUser = async () => {
      try {
        const response = await fetch('/api/auth/session', { cache: 'no-store' })
        if (!response.ok) return
        const payload = await response.json()
        if (payload?.authenticated) {
          router.push(redirectPath)
        }
      } catch (error) {
        // Ignore network checks on first load
      }
    }
    checkUser()
  }, [router, redirectPath])


  // One e-mail field for everyone. The magic link signs existing users in and
  // creates the account for new e-mails; password login is optional for
  // existing accounts.
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
        body: JSON.stringify({ email, next: redirectPath, language })
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        setError(resolveAuthClientMessage(payload, tr, 'magicLinkFailed'))
        return
      }
      setSuccess(tr('magicLinkSent'))
    } catch {
      setError(tr('connectionError'))
    } finally {
      setIsLoading(false)
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

      setSuccess(tr('loginSuccessRedirect'))
      try {
        await fetch('/api/profile', { method: 'POST' })
      } catch (profileError) {
        console.warn('Profile check/creation failed:', profileError)
      }
      setTimeout(() => {
        window.location.assign(redirectPath)
      }, 1000)
    } catch (err) {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 home-page-custom-border">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Image
            src="/domy logo V3.svg"
            alt="Domy v Itálii"
            width={64}
            height={64}
            priority
            className="h-16 w-auto mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-white">{tr('welcome')}</h1>
          <p className="text-gray-400 mt-2">{tr('welcomeSubtitle')}</p>
        </div>

        <Card className="bg-slate-800 border-amber-400/20">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-white text-center">
              {activeTab === 'signup' ? tr('signup') : tr('login')}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4 mt-6" data-testid="login-email-form">
              <div className="space-y-2">
                <Label htmlFor="login-email" className="text-gray-300">{tr('email')}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    placeholder={tr('emailPlaceholder')}
                    className="pl-10 bg-slate-900 border-amber-400/20 text-white"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              {usePassword && (
                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-gray-300">{tr('password')}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder={tr('passwordPlaceholder')}
                      className="pl-10 pr-10 bg-slate-900 border-amber-400/20 text-white"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-3 text-gray-400 hover:text-white cursor-pointer leading-none"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <div className="text-right">
                    <Link href="/forgot-password" className="text-sm text-amber-400 underline">
                      {tr('forgotPassword')}
                    </Link>
                  </div>
                </div>
              )}

              {error && (
                <Alert variant="destructive" className="bg-red-900/20 border-red-600 text-red-400">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="bg-green-900/20 border-green-600 text-green-400">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                disabled={isLoading}
              >
                {usePassword ? (
                  isLoading ? tr('signingIn') : tr('signIn')
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    {tr('sendMagicLink')}
                  </>
                )}
              </Button>

              <FormPrivacyNotice language={language} purpose="account" className="bg-slate-900/60 border-amber-400/20" />

              <div className="relative py-1">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-amber-400/20" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-slate-800 px-2 text-gray-400">{tr('or')}</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full border-amber-400/20 text-amber-400 hover:bg-amber-400/10"
                disabled={isLoading}
                onClick={() => {
                  setUsePassword((value) => !value)
                  setError('')
                  setSuccess('')
                }}
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

            <div className="text-center text-sm text-gray-400 mt-6 space-y-1">
              <p>
                {tr('termsText')}{' '}
                <Link href="/terms" className="underline">
                  {tr('termsLink')}
                </Link>{' '}
                {tr('and')}{' '}
                <Link href="/gdpr" className="underline">
                  {tr('privacyLink')}
                </Link>
                .
              </p>
              <p>
                <Link href="/cookies" className="underline">
                  {tr('cookiePolicy')}
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Button 
            variant="outline" 
            onClick={() => router.push('/')}
            className="border-amber-400/20 text-amber-400 hover:bg-amber-400/10"
          >
            ← {tr('backToHomepage')}
          </Button>
        </div>
      </div>
    </div>
  )
}

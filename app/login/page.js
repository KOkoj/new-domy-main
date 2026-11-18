'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import FormPrivacyNotice from '@/components/legal/FormPrivacyNotice'
import EmailCodeSignIn from '@/components/auth/EmailCodeSignIn'
import { t } from '@/lib/translations'
import { isAuthErrorKey } from '@/lib/authMessages'
import { DEFAULT_LANGUAGE, readLanguageFromBrowser } from '@/lib/userPreferences'
import { getSafeRedirectPath } from '@/lib/safeRedirect'

export default function LoginPage() {
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('login')
  const [language, setLanguage] = useState(DEFAULT_LANGUAGE)
  const router = useRouter()
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab')
  const redirectParam = searchParams.get('redirect')
  const errorParam = searchParams.get('error')
  const redirectPath = getSafeRedirectPath(redirectParam, '/dashboard')
  const registrationHref = `/registrace?redirect=${encodeURIComponent(redirectPath)}`
  const tr = (key) => t(`auth.${key}`, language)

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

    // /auth/callback sends a translation key; anything else falls back to the
    // generic callback message instead of echoing raw text from the URL.
    setError(
      callbackErrors[errorParam] ||
      (isAuthErrorKey(errorParam) ? tr(errorParam) : tr('authCallbackFailed'))
    )
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
            {error && (
              <Alert variant="destructive" className="mt-4 bg-red-900/20 border-red-600 text-red-400">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {/* One e-mail field for everyone: a 6-digit code signs existing
                users in and creates the account for new e-mails. Password
                login stays as a secondary option for older accounts. */}
            <div className="mt-6" data-testid="login-email-form">
              <EmailCodeSignIn
                language={language}
                nextPath={redirectPath}
                variant="dark"
                idPrefix="login"
                allowPassword
                footer={<FormPrivacyNotice language={language} purpose="account" className="bg-slate-900/60 border-amber-400/20" />}
              />
            </div>
            <p className="mt-4 text-center text-sm">
              <Link href={registrationHref} className="text-amber-400 underline hover:text-amber-300" data-testid="login-registration-link">
                {tr('whatYouGet')}
              </Link>
            </p>

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

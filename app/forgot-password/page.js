'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Mail, AlertCircle, CheckCircle } from 'lucide-react'
import { t } from '@/lib/translations'
import { DEFAULT_LANGUAGE, readLanguageFromBrowser } from '@/lib/userPreferences'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [language, setLanguage] = useState(DEFAULT_LANGUAGE)
  const router = useRouter()
  const tr = (key) => t(`auth.${key}`, language)

  useEffect(() => {
    setLanguage(readLanguageFromBrowser())
    const handleLanguageChange = (event) => setLanguage(event.detail)
    window.addEventListener('languageChange', handleLanguageChange)
    return () => window.removeEventListener('languageChange', handleLanguageChange)
  }, [])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    if (!email) {
      setError(tr('fillAllFields'))
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        setError(payload?.error || tr('resetRequestFailed'))
        return
      }
      setSuccess(tr('resetEmailSent'))
    } catch {
      setError(tr('connectionError'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 home-page-custom-border">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Image
            src="/domy logo V3.svg"
            alt="Domy v Itálii"
            width={64}
            height={64}
            priority
            className="h-16 w-auto mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-white">{tr('forgotPasswordTitle')}</h1>
          <p className="text-gray-400 mt-2">{tr('forgotPasswordSubtitle')}</p>
        </div>

        <Card className="bg-slate-800 border-amber-400/20">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email" className="text-gray-300">{tr('email')}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder={tr('emailPlaceholder')}
                    className="pl-10 bg-slate-900 border-amber-400/20 text-white"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

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
                {isLoading ? tr('sendingReset') : tr('sendResetLink')}
              </Button>
            </form>

            <p className="text-center text-sm text-gray-400 mt-6">
              <Link href="/login" className="underline">
                {tr('backToLogin')}
              </Link>
            </p>
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

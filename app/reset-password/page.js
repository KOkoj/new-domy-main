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
import { Lock, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react'
import { t } from '@/lib/translations'
import { resolveAuthClientMessage } from '@/lib/authMessages'
import { DEFAULT_LANGUAGE, readLanguageFromBrowser } from '@/lib/userPreferences'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
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

    if (!password || !confirmPassword) {
      setError(tr('fillAllFields'))
      setIsLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError(tr('passwordsDoNotMatch'))
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError(tr('passwordTooShort'))
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        setError(resolveAuthClientMessage(payload, tr, 'resetUpdateFailed'))
        return
      }
      setSuccess(tr('resetSuccess'))
      setTimeout(() => {
        window.location.assign('/dashboard')
      }, 1200)
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
          <h1 className="text-2xl font-bold text-white">{tr('resetPasswordTitle')}</h1>
          <p className="text-gray-400 mt-2">{tr('resetPasswordSubtitle')}</p>
        </div>

        <Card className="bg-slate-800 border-amber-400/20">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password" className="text-gray-300">{tr('newPassword')}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="new-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={tr('passwordMinLength')}
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-gray-300">{tr('confirmPassword')}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder={tr('confirmPasswordPlaceholder')}
                    className="pl-10 bg-slate-900 border-amber-400/20 text-white"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                {isLoading ? tr('savingPassword') : tr('saveNewPassword')}
              </Button>
            </form>

            <p className="text-center text-sm text-gray-400 mt-6">
              <Link href="/forgot-password" className="underline">
                {tr('requestNewReset')}
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

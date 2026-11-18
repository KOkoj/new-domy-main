'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import Image from 'next/image'
import { t } from '@/lib/translations'
import { getSafeRedirectPath } from '@/lib/safeRedirect'
import EmailCodeSignIn from '@/components/auth/EmailCodeSignIn'

// Quick auth for contextual actions (heart, gallery, finder): one e-mail field,
// then a 6-digit code from the e-mail. The code creates the account for new
// e-mails and signs existing users in. Password login stays available for
// existing accounts. The full explanation lives on /registrace.
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
  const [activeTab, setActiveTab] = useState(defaultTab)
  const [formKey, setFormKey] = useState(0)

  useEffect(() => {
    if (isOpen) setActiveTab(defaultTab)
  }, [isOpen, defaultTab])

  const tr = (key) => t(`auth.${key}`, language)

  const resolveNextPath = () => {
    const explicit = getSafeRedirectPath(redirectTo, '')
    if (explicit) return explicit
    if (typeof window !== 'undefined') {
      const { pathname, search } = window.location
      if (pathname && pathname !== '/login' && pathname !== '/registrace') {
        return getSafeRedirectPath(`${pathname}${search || ''}`, '/dashboard')
      }
    }
    return '/dashboard'
  }

  const handleClose = () => {
    // Remount the form so the next opening starts at the e-mail step.
    setFormKey((value) => value + 1)
    onClose()
  }

  const nextPath = isOpen ? resolveNextPath() : '/dashboard'
  const registrationHref = `/registrace?redirect=${encodeURIComponent(nextPath)}`

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

        <div className="mt-2">
          <EmailCodeSignIn
            key={formKey}
            language={language}
            nextPath={nextPath}
            variant="light"
            idPrefix="auth-modal"
            allowPassword
            onEmailSubmitted={onEmailSubmitted}
            onPasswordSuccess={(user) => {
              onAuthSuccess?.(user)
              handleClose()
            }}
          />
        </div>

        <p className="text-center text-sm mt-1">
          <Link
            href={registrationHref}
            className="text-slate-700 underline hover:text-slate-900"
            onClick={handleClose}
            data-testid="auth-modal-registration-link"
          >
            {tr('whatYouGet')}
          </Link>
        </p>

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

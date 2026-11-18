'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { t } from '@/lib/translations'
import { getSafeRedirectPath } from '@/lib/safeRedirect'
import PasswordAuthForm from '@/components/auth/PasswordAuthForm'

// Sign-in window from the header and from contextual actions (heart, gallery,
// finder) - Figma frame 3: Google on top, then e-mail + password, forgotten
// password and registration. The full explanation lives on /registrace.
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
  const [formKey, setFormKey] = useState(0)
  const [mode, setMode] = useState(defaultTab === 'signup' ? 'register' : 'login')

  const tr = (key) => t(`auth.${key}`, language)

  const resolveNextPath = () => {
    const explicit = getSafeRedirectPath(redirectTo, '')
    if (explicit) return explicit
    if (typeof window !== 'undefined') {
      const { pathname, search } = window.location
      if (pathname && pathname !== '/login' && pathname !== '/registrace') {
        return getSafeRedirectPath(`${pathname}${search || ''}`, '/properties')
      }
    }
    return '/properties'
  }

  const handleClose = () => {
    // Remount the form so the next opening starts at the first step.
    setFormKey((value) => value + 1)
    setMode(defaultTab === 'signup' ? 'register' : 'login')
    onClose()
  }

  const nextPath = isOpen ? resolveNextPath() : '/properties'
  const registrationHref = `/registrace?redirect=${encodeURIComponent(nextPath)}`
  const initialMode = defaultTab === 'signup' ? 'register' : 'login'
  const srTitle = mode === 'register' || mode === 'registerSent' ? tr('registerTitle') : tr('loginTitle')
  const contextMessage = message || title

  return (
    <Dialog open={isOpen} onOpenChange={handleClose} data-testid="auth-modal">
      <DialogContent
        className="sm:max-w-md w-[calc(100%-2rem)] max-h-[90vh] overflow-y-auto p-6 sm:p-8 gap-3"
        data-testid="auth-modal-content"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>{srTitle}</DialogTitle>
        </DialogHeader>
        {contextMessage && mode === initialMode && (
          <p className="rounded-lg bg-[#faf6f3] px-3 py-2 text-xs leading-snug text-slate-600" data-testid="auth-modal-context">
            {contextMessage}
          </p>
        )}
        <PasswordAuthForm
          key={formKey}
          language={language}
          nextPath={nextPath}
          variant="light"
          idPrefix="auth-modal"
          initialMode={initialMode}
          registrationHref={registrationHref}
          onModeChange={setMode}
          headingLevel="p"
          onEmailSubmitted={onEmailSubmitted}
          onSuccess={(user) => {
            onAuthSuccess?.(user)
            // Full navigation so navigation, favorites and pending favorites
            // pick up the new session cookies.
            window.location.assign(nextPath)
          }}
        />
      </DialogContent>
    </Dialog>
  )
}

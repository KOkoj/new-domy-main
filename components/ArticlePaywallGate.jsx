'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'
import { Crown, Lock, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

const AuthModal = dynamic(() => import('@/components/AuthModal'), { ssr: false })

function isProtectedArticlePath(pathname) {
  if (!pathname) return false
  if (pathname === '/regions') return false
  if (pathname.startsWith('/regions/')) return true

  if (pathname === '/clanky/pruvodce-italii') return false
  if (pathname.startsWith('/clanky/pruvodce-italii/')) return true

  if (pathname.startsWith('/blog/regions/')) return true

  if (pathname === '/guides') return false
  if (pathname.startsWith('/guides/')) return true

  return false
}

const COPY = {
  cs: {
    badge: 'Klub pro klienty',
    free: 'Zdarma',
    title: 'Pokračujte ve čtení v našem klubu',
    subtitle:
      'Kompletní článek, regionální průvodci a exkluzivní analýzy jsou zdarma pro registrované členy klubu.',
    benefits: [
      'Bezplatná registrace, bez platební karty',
      'Přístup ke všem prémiovým článkům a průvodcům',
      'Aktualizace o italském realitním trhu'
    ],
    register: 'Registrovat zdarma',
    login: 'Přihlásit se',
    haveAccount: 'Už jste členem?'
  },
  en: {
    badge: 'Klub pro klienty',
    free: 'Free',
    title: 'Continue reading in our free Klub',
    subtitle:
      'Get full access to this article, regional guides and exclusive analyses — free for Klub members.',
    benefits: [
      'Free registration, no credit card',
      'Access to all premium articles and guides',
      'Italian property market updates'
    ],
    register: 'Register for free',
    login: 'Log in',
    haveAccount: 'Already a member?'
  },
  it: {
    badge: 'Klub pro klienty',
    free: 'Gratuito',
    title: 'Continua a leggere nel nostro Klub gratuito',
    subtitle:
      "Accesso completo all'articolo, alle guide regionali e ai contenuti esclusivi, gratuito per i membri del Klub.",
    benefits: [
      'Registrazione gratuita, senza carta',
      'Accesso a tutti gli articoli e le guide premium',
      'Aggiornamenti sul mercato immobiliare italiano'
    ],
    register: 'Registrati gratis',
    login: 'Accedi',
    haveAccount: 'Sei già membro?'
  }
}

export default function ArticlePaywallGate() {
  const pathname = usePathname()
  const isProtected = isProtectedArticlePath(pathname)

  const [language, setLanguage] = useState('en')
  const [authChecked, setAuthChecked] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [authTab, setAuthTab] = useState('signup')

  useEffect(() => {
    if (typeof window === 'undefined') return
    const saved = localStorage.getItem('preferred-language')
    if (saved) setLanguage(saved)
    const handleLanguageChange = (event) => {
      if (event?.detail) setLanguage(event.detail)
    }
    window.addEventListener('languageChange', handleLanguageChange)
    return () => window.removeEventListener('languageChange', handleLanguageChange)
  }, [])

  useEffect(() => {
    if (!isProtected) {
      setAuthChecked(true)
      setIsAuthenticated(false)
      return
    }

    let mounted = true
    setAuthChecked(false)

    fetch('/api/auth/session', { cache: 'no-store' })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        if (mounted) setIsAuthenticated(Boolean(payload?.authenticated))
      })
      .catch(() => {
        if (mounted) setIsAuthenticated(false)
      })
      .finally(() => {
        if (mounted) setAuthChecked(true)
      })

    return () => {
      mounted = false
    }
  }, [isProtected, pathname])

  const isLocked = isProtected && authChecked && !isAuthenticated

  // Tag the document so global CSS can apply the teaser/blur effects to the page.
  useEffect(() => {
    if (typeof document === 'undefined') return
    if (isLocked) {
      document.body.dataset.paywall = 'active'
      document.documentElement.dataset.paywall = 'active'
    } else {
      delete document.body.dataset.paywall
      delete document.documentElement.dataset.paywall
    }
    return () => {
      delete document.body.dataset.paywall
      delete document.documentElement.dataset.paywall
    }
  }, [isLocked])

  if (!isLocked && !authOpen) return null

  const copy = COPY[language] || COPY.en

  const handleOpenLogin = () => {
    setAuthTab('login')
    setAuthOpen(true)
  }
  const handleOpenSignup = () => {
    setAuthTab('signup')
    setAuthOpen(true)
  }
  const handleAuthSuccess = () => {
    setAuthOpen(false)
    setIsAuthenticated(true)
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  return (
    <>
      {isLocked && (
        <>
          <div
            aria-hidden="true"
            className="fixed inset-x-0 bottom-0 z-40 pointer-events-none"
            style={{ height: '70vh' }}
          >
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(to bottom, rgba(14,21,46,0) 0%, rgba(14,21,46,0.55) 35%, rgba(14,21,46,0.92) 70%, rgba(14,21,46,1) 100%)',
                backdropFilter: 'blur(14px)',
                WebkitBackdropFilter: 'blur(14px)',
                maskImage:
                  'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 35%, rgba(0,0,0,1) 100%)',
                WebkitMaskImage:
                  'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 35%, rgba(0,0,0,1) 100%)'
              }}
            />
          </div>

          <div className="fixed inset-x-0 bottom-0 z-50 pointer-events-none px-4 pb-6 sm:pb-8">
            <div className="container mx-auto">
              <div className="max-w-2xl mx-auto pointer-events-auto">
                <div className="rounded-2xl border border-amber-400/25 bg-[#0e152e]/95 backdrop-blur-md shadow-[0_20px_60px_rgba(0,0,0,0.55)] p-5 sm:p-7 text-white">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <Crown className="h-4 w-4 text-amber-400" />
                      <span className="text-[11px] sm:text-xs uppercase tracking-wider text-amber-300 font-semibold">
                        {copy.badge}
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 border border-amber-400/40 px-2.5 py-0.5 text-[11px] font-semibold text-amber-300">
                      <Lock className="h-3 w-3" />
                      {copy.free}
                    </span>
                  </div>

                  <h2 className="text-lg sm:text-2xl font-bold leading-tight mb-2">
                    {copy.title}
                  </h2>
                  <p className="text-sm sm:text-[15px] text-gray-300 leading-relaxed mb-4">
                    {copy.subtitle}
                  </p>

                  <ul className="space-y-1.5 mb-5">
                    {copy.benefits.map((benefit) => (
                      <li
                        key={benefit}
                        className="flex items-start gap-2 text-sm text-gray-200"
                      >
                        <Check className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
                    <Button
                      onClick={handleOpenSignup}
                      className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold flex-1 h-11"
                      data-testid="paywall-register-button"
                    >
                      {copy.register}
                    </Button>
                    <Button
                      onClick={handleOpenLogin}
                      variant="outline"
                      className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white flex-1 h-11"
                      data-testid="paywall-login-button"
                    >
                      {copy.login}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <AuthModal
        isOpen={authOpen}
        defaultTab={authTab}
        onClose={() => setAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        language={language}
      />
    </>
  )
}

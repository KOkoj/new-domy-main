'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Menu, X, User, XCircle, Crown, LayoutDashboard, LogOut, Settings } from 'lucide-react'
import AuthModal from './AuthModal'
import PremiumPdfComingSoonTrigger from '@/components/PremiumPdfComingSoonTrigger'
import { PREMIUM_PDFS_ENABLED } from '@/lib/featureFlags'
import { supabase } from '@/lib/supabase'
import { readLanguageFromBrowser, persistLanguage, DEFAULT_LANGUAGE, getInitialLanguage } from '@/lib/userPreferences'
import { LanguageMenu, SiteNavMenu } from '@/components/SiteNavControls'

export default function Navigation({ appearAfterHero = false }) {
  const pathname = usePathname()
  const [user, setUser] = useState(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authModalDefaultTab, setAuthModalDefaultTab] = useState('login')
  const [language, setLanguage] = useState(getInitialLanguage)
  const [isPopupBarVisible, setIsPopupBarVisible] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isPastHero, setIsPastHero] = useState(!appearAfterHero)
  const navRef = useRef(null)

  const isActive = (path) => {
    if (path === '/') return pathname === '/'
    return pathname?.startsWith(path)
  }

  useEffect(() => {
    const savedLanguage = readLanguageFromBrowser()
    setLanguage(savedLanguage)
    document.documentElement.lang = savedLanguage

    // Check if popup bar was dismissed
    const popupDismissed = localStorage.getItem('premium-club-popup-dismissed')
    if (popupDismissed === 'true') {
      setIsPopupBarVisible(false)
    }

    const handleLanguageChange = (event) => {
      if (!event.detail) return
      setLanguage(event.detail)
    }
    window.addEventListener('languageChange', handleLanguageChange)
    return () => window.removeEventListener('languageChange', handleLanguageChange)
  }, [])

  useEffect(() => {
    if (!appearAfterHero) return

    const update = () => {
      const hero = document.querySelector('[data-testid="hero-section"]')
      const heroBottom = hero ? hero.getBoundingClientRect().bottom : window.innerHeight
      setIsPastHero(heroBottom <= 80)
    }

    update()
    window.addEventListener('scroll', update, { passive: true })
    let frame = 0
    let attempts = 0
    const attachLenis = () => {
      if (window.lenis?.on) {
        window.lenis.on('scroll', update)
        return
      }
      if (attempts > 120) return
      attempts += 1
      frame = requestAnimationFrame(attachLenis)
    }
    attachLenis()
    return () => {
      window.removeEventListener('scroll', update)
      cancelAnimationFrame(frame)
      window.lenis?.off?.('scroll', update)
    }
  }, [appearAfterHero])

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!supabase) return

    // Check if user is authenticated
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      // Check if user is admin
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle()
        
        setIsAdmin(profile?.role === 'admin')
      } else {
        setIsAdmin(false)
      }
    }
    checkUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user || null)
      
      // Check admin status on auth change
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .maybeSingle()
        
        setIsAdmin(profile?.role === 'admin')
      } else {
        setIsAdmin(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch {
      // Continue with client sign-out even if the cookie route fails.
    }
    if (supabase) {
      await supabase.auth.signOut()
    }
    setUser(null)
    setIsMenuOpen(false)
    window.location.assign('/')
  }

  const handleAuthSuccess = (user) => {
    setUser(user)
    setIsAuthModalOpen(false)
  }

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage)
    document.documentElement.lang = newLanguage
    persistLanguage(newLanguage)
    window.dispatchEvent(new CustomEvent('languageChange', { detail: newLanguage }))
  }

  const authButtonLabel = language === 'cs'
    ? 'Přihlásit / Registrovat'
    : language === 'it'
      ? 'Accedi / Registrati'
      : 'Login / Register'

  const handleClosePopup = () => {
    setIsPopupBarVisible(false)
    localStorage.setItem('premium-club-popup-dismissed', 'true')
  }

  const navLabels = {
    home: language === 'cs' ? 'Domů' : language === 'it' ? 'Casa' : 'Home',
    properties: language === 'cs' ? 'Nemovitosti' : language === 'it' ? 'Proprietà' : 'Properties',
    regions: language === 'cs' ? 'Regiony' : language === 'it' ? 'Regioni' : 'Regions',
    about: language === 'cs' ? 'O nás' : language === 'it' ? 'Chi siamo' : 'About',
    reference: language === 'cs' ? 'Reference' : language === 'it' ? 'Referenze' : 'References',
    contact: language === 'cs' ? 'Kontakt' : language === 'it' ? 'Contatto' : 'Contact',
    dashboard: language === 'cs' ? 'Nástěnka' : language === 'it' ? 'Cruscotto' : 'Dashboard',
    admin: language === 'cs' ? 'Admin' : language === 'it' ? 'Amministrazione' : 'Admin'
  }

  const navHidden = appearAfterHero && !isPastHero

  return (
    <>
    <nav 
      ref={navRef}
      className={`fixed top-0 left-0 right-0 z-50 overflow-visible shadow-lg transition-transform duration-700 ease-in-out ${
        navHidden ? '-translate-y-[calc(100%+6rem)] pointer-events-none shadow-none' : 'translate-y-0'
      }`}
      aria-hidden={navHidden ? true : undefined}
      inert={navHidden ? '' : undefined}
      style={{ 
        backgroundColor: 'rgb(26, 39, 68)',
      }} 
      data-testid="navigation-component"
    >
      <div className="mx-auto w-full max-w-[1800px] overflow-visible px-5 pt-4 pb-3 sm:px-8 sm:pt-5 sm:pb-3 xl:px-12" data-testid="nav-container">
        <div className="relative flex items-center gap-4" data-testid="nav-content">
          <div className="flex shrink-0 items-center" data-testid="nav-brand-links">
            <Link href="/" data-testid="nav-brand-link" className="relative overflow-visible">
              <Image
                src="/domy logo V3.svg"
                alt="Domy v Itálii"
                width={120}
                height={120}
                priority={!appearAfterHero}
                className={`w-auto cursor-pointer z-30 relative sm:absolute top-0 left-0 h-14 sm:h-20 md:h-24 drop-shadow-[0_2px_6px_rgba(0,0,0,0.22)] ${isMenuOpen ? 'sm:opacity-0' : ''}`}
                data-testid="nav-brand-logo"
              />
              <div className="hidden sm:block h-12 w-24"></div>
            </Link>
          </div>
            <SiteNavMenu
              language={language}
              isActive={isActive}
              tone="bar"
              testIdPrefix="nav-"
              className="absolute left-1/2 top-0 hidden h-12 -translate-x-[calc(50%+4.5rem)] items-center min-[1400px]:flex"
            />
          
          <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3" data-testid="nav-user-controls">
            <LanguageMenu
              language={language}
              onChange={handleLanguageChange}
              testIdPrefix="language-option-"
              className="hidden sm:block"
            />

            {/* User Authentication */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-1 sm:gap-2 bg-transparent hover:bg-white/10 text-gray-200 hover:text-white rounded-full px-2 sm:px-3 py-1.5 sm:py-2 transition-all">
                    <span className="h-7 w-7 sm:h-8 sm:w-8 border border-white/20 rounded-full bg-white/10 text-white text-sm inline-flex items-center justify-center">
                      {(user.user_metadata?.name || user.email || 'U').charAt(0).toUpperCase()}
                    </span>
                    <span className="text-base font-medium hidden min-[1400px]:inline-block max-w-[100px] truncate">
                      {user.user_metadata?.name || user.email}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-[#0e152e] border-white/20 text-gray-200">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-base font-medium leading-none text-white">{user.user_metadata?.name || 'User'}</p>
                      <p className="text-xs leading-none text-gray-400">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem className="focus:bg-white/10 focus:text-white cursor-pointer" asChild>
                    <Link href="/dashboard" className="flex w-full items-center">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>{navLabels.dashboard}</span>
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem className="focus:bg-white/10 focus:text-white cursor-pointer" asChild>
                      <Link href="/admin" className="flex w-full items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>{navLabels.admin}</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem onClick={handleLogout} className="focus:bg-white/10 focus:text-white cursor-pointer text-red-400 focus:text-red-400">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <button
                onClick={() => { setAuthModalDefaultTab('login'); setIsAuthModalOpen(true) }}
                className="hidden sm:flex items-center gap-2 cursor-pointer rounded-full border-0 bg-[#1b2642] px-6 py-3 text-base font-medium leading-none text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.4)] transition-colors duration-200 hover:bg-[#243056]"
                data-testid="login-button"
              >
                <User className="h-4 w-4" />
                <span>{authButtonLabel}</span>
              </button>
            )}
            
            {/* Mobile dashboard shortcut — visible when logged in, below lg */}
            {user && (
              <Link
                href="/dashboard"
                className="min-[1400px]:hidden flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-2 text-base font-medium text-white/90 hover:text-white hover:bg-white/20 border border-white/15 transition-all duration-200"
                data-testid="mobile-dashboard-button"
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                <span>{navLabels.dashboard}</span>
              </Link>
            )}

            <LanguageMenu
              language={language}
              onChange={handleLanguageChange}
              testIdPrefix="mobile-language-option-"
              className="sm:hidden"
            />

            {/* Mobile menu button */}
            <button
              className="min-[1400px]:hidden p-2 rounded-lg cursor-pointer text-gray-200 hover:text-white hover:bg-white/10 transition-colors duration-200"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              data-testid="mobile-menu-button"
            >
              {isMenuOpen ? <X className="h-6 w-6 text-gray-200" /> : <Menu className="h-6 w-6 text-gray-200" />}
            </button>
          </div>
        </div>
        
        {/* Mobile menu */}
        <div 
          className={`relative z-40 min-[1400px]:hidden overflow-hidden transition-all duration-200 ease-out ${
            isMenuOpen ? 'max-h-[calc(100dvh-4rem)] opacity-100' : 'max-h-0 opacity-0'
          }`}
          data-testid="mobile-menu"
        >
          <div className="flex flex-col space-y-1 pt-4 pb-6 mt-3 border-t border-white/10 overflow-y-auto max-h-[calc(100dvh-6rem)]" data-testid="mobile-menu-links">
            {[
              { href: '/', label: navLabels.home, testId: 'mobile-home-link' },
              { href: '/properties', label: navLabels.properties, testId: 'mobile-properties-link' },
              { href: '/regions', label: navLabels.regions, testId: 'mobile-regions-link' },
              { href: '/process', label: language === 'cs' ? 'Náš proces' : language === 'it' ? 'Il nostro processo' : 'Our Process', testId: 'mobile-process-link' },
              { href: '/blog', label: language === 'cs' ? 'Články' : language === 'it' ? 'Articoli' : 'Articles', testId: 'mobile-blog-link' },
              { href: '/faq', label: 'FAQ', testId: 'mobile-faq-link' },
              { href: '/about', label: navLabels.about, testId: 'mobile-about-link' },
              { href: '/reference', label: navLabels.reference, testId: 'mobile-reference-link' },
              { href: '/contact', label: navLabels.contact, testId: 'mobile-contact-link' },
            ].map(({ href, label, testId }) => (
              <Link 
                key={href}
                href={href}
                className={`rounded-lg px-3 py-2.5 text-base transition-colors duration-200 ${
                  isActive(href)
                    ? 'bg-white/10 font-medium text-white shadow-[inset_3px_0_0_0_#c48759]'
                    : 'text-gray-300 hover:bg-white/5 hover:text-white'
                }`}
                aria-current={isActive(href) ? 'page' : undefined}
                onClick={() => setIsMenuOpen(false)}
                data-testid={testId}
              >
                {label}
              </Link>
            ))}
            {user && (
              <Link 
                href="/dashboard" 
                className={`px-3 py-2.5 rounded-lg text-base transition-colors ${isActive('/dashboard') ? 'text-white bg-white/10 font-medium' : 'text-gray-300 hover:text-white hover:bg-white/5'}`}
                onClick={() => setIsMenuOpen(false)}
                data-testid="mobile-dashboard-link"
              >
                {navLabels.dashboard}
              </Link>
            )}
            {user && isAdmin && (
              <Link 
                href="/admin" 
                className="px-3 py-2.5 rounded-lg text-base text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                onClick={() => setIsMenuOpen(false)}
                data-testid="mobile-admin-link"
              >
                {navLabels.admin}
              </Link>
            )}
            {!user && (
              <button
                onClick={() => {
                  setIsMenuOpen(false)
                  setIsAuthModalOpen(true)
                }}
                className="px-3 py-2.5 rounded-lg text-base leading-none cursor-pointer text-copper-300 hover:text-copper-200 hover:bg-white/5 transition-colors text-left font-medium"
                data-testid="mobile-login-link"
              >
                {authButtonLabel}
              </button>
            )}
            {user && (
              <button
                onClick={handleLogout}
                className="px-3 py-2.5 rounded-lg text-base leading-none cursor-pointer text-copper-300 hover:text-copper-200 hover:bg-white/5 transition-colors text-left font-medium"
                data-testid="mobile-logout-link"
              >
                {language === 'cs' ? 'Odhlásit' : language === 'it' ? 'Esci' : 'Log out'}
              </button>
            )}
          </div>
        </div>
      </div>
      
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        defaultTab={authModalDefaultTab}
        language={language}
      />
      
      {/* Premium Club Popup Bar - inside nav so it flows directly below */}
      {PREMIUM_PDFS_ENABLED && isPopupBarVisible && (
        <div 
          className="w-full backdrop-blur-sm transition-all duration-300 border-t border-white/10"
          style={{ 
            background: 'linear-gradient(to right, rgba(199, 137, 91, 0.68), rgba(153, 105, 69, 0.68))',
          }}
        >
          <div className="container mx-auto px-4 py-0.5 sm:py-1">
            <div className="flex items-center justify-center relative">
              <PremiumPdfComingSoonTrigger
                language={language}
                className="flex items-center gap-2 sm:gap-3 group hover:opacity-90 transition-opacity"
              >
                <Crown className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-white/90 flex-shrink-0" />
                <span className="text-white/90 font-normal text-xs">
                  {language === 'cs' ? 'Klub pro klienty - Zaregistrujte se zdarma nyní' :
                   language === 'it' ? 'Klub pro klienty - Registrati gratuitamente ora' :
                   'Klub pro klienty - Register for Free Now'}
                </span>
              </PremiumPdfComingSoonTrigger>
              <button
                onClick={handleClosePopup}
                className="absolute right-0 p-1 sm:p-1.5 cursor-pointer hover:bg-white/15 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white/40"
                aria-label="Close popup"
              >
                <XCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-white/90" />
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
    </>
  )
}

'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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

export default function Navigation() {
  const pathname = usePathname()
  const [user, setUser] = useState(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authModalDefaultTab, setAuthModalDefaultTab] = useState('login')
  const [language, setLanguage] = useState(getInitialLanguage)
  const [isPopupBarVisible, setIsPopupBarVisible] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
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

    // Scroll detection for nav background
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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
          .single()
        
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
          .single()
        
        setIsAdmin(profile?.role === 'admin')
      } else {
        setIsAdmin(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    if (!supabase) return
    const { error } = await supabase.auth.signOut()
    if (!error) {
      setUser(null)
    }
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

  const handleClosePopup = () => {
    setIsPopupBarVisible(false)
    localStorage.setItem('premium-club-popup-dismissed', 'true')
  }

  const navLabels = {
    home: language === 'cs' ? 'Domů' : language === 'it' ? 'Casa' : 'Home',
    properties: language === 'cs' ? 'Nemovitosti' : language === 'it' ? 'Proprietà' : 'Properties',
    regions: language === 'cs' ? 'Regiony' : language === 'it' ? 'Regioni' : 'Regions',
    about: language === 'cs' ? 'O nás' : language === 'it' ? 'Chi siamo' : 'About',
    contact: language === 'cs' ? 'Kontakt' : language === 'it' ? 'Contatto' : 'Contact',
    dashboard: language === 'cs' ? 'Nástěnka' : language === 'it' ? 'Cruscotto' : 'Dashboard',
    admin: language === 'cs' ? 'Admin' : language === 'it' ? 'Amministrazione' : 'Admin'
  }

  return (
    <>
    <nav 
      ref={navRef}
      className={`fixed top-0 left-0 right-0 z-50 overflow-visible transition-all duration-300 ease-out ${
        isScrolled 
          ? 'shadow-lg backdrop-blur-xl' 
          : ''
      }`}
      style={{ 
        backgroundColor: isScrolled ? 'rgba(14, 21, 46, 0.97)' : 'rgba(14, 21, 46, 0.85)',
        backdropFilter: isScrolled ? 'blur(20px) saturate(180%)' : 'blur(8px)',
      }} 
      data-testid="navigation-component"
    >
      <div className={`container mx-auto px-4 overflow-visible transition-all duration-300 ${isScrolled ? 'pt-2 pb-1.5' : 'pt-3 pb-2 sm:pt-4 sm:pb-2'}`} data-testid="nav-container">
        <div className="flex items-center justify-between" data-testid="nav-content">
          <div className="flex items-center space-x-2 sm:space-x-4 md:space-x-8" data-testid="nav-brand-links">
            <Link href="/" data-testid="nav-brand-link" className="relative overflow-visible">
              <Image
                src="/logo domy.svg"
                alt="Domy v Italii"
                width={120}
                height={115}
                priority
                className={`w-auto cursor-pointer z-30 transition-all duration-300 ease-out relative sm:absolute top-0 left-0 drop-shadow-[0_2px_6px_rgba(0,0,0,0.4)] ${isScrolled ? 'h-12 sm:h-16 md:h-24' : 'h-14 sm:h-20 md:h-32'}`}
                data-testid="nav-brand-logo"
              />
              <div className="hidden sm:block h-12 w-24"></div>
            </Link>
            <div className="hidden lg:flex items-center space-x-0.5 xl:space-x-1" data-testid="nav-desktop-links">
              {[
                { href: '/', label: navLabels.home, testId: 'nav-home-link' },
                { href: '/process', label: language === 'cs' ? 'Náš proces' : language === 'it' ? 'Il nostro processo' : 'Our Process', testId: 'nav-process-link' },
                { href: '/properties', label: navLabels.properties, testId: 'nav-properties-link' },
                { href: '/regions', label: navLabels.regions, testId: 'nav-regions-link' },
                { href: '/blog', label: language === 'cs' ? 'Články' : language === 'it' ? 'Articoli' : 'Articles', testId: 'nav-blog-link' },
                { href: '/about', label: navLabels.about, testId: 'nav-about-link' },
                { href: '/contact', label: navLabels.contact, testId: 'nav-contact-link' },
              ].map(({ href, label, testId }) => (
                <Link 
                  key={href}
                  href={href} 
                  className={`relative px-2 xl:px-3 py-2 text-sm font-medium leading-none rounded-lg transition-all duration-200 whitespace-nowrap ${
                    isActive(href) 
                      ? 'text-white bg-white/10' 
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                  data-testid={testId}
                >
                  {label}
                  {isActive(href) && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-copper-400 rounded-full" />
                  )}
                </Link>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-1 sm:gap-2 lg:gap-3" data-testid="nav-user-controls">
            {/* Language Selector */}
            <div className="hidden sm:flex items-center bg-white/10 backdrop-blur-md rounded-full px-1 py-1 shadow-sm border border-white/15 gap-0.5">
              {['en', 'cs', 'it'].map((lang) => (
                <button
                  key={lang}
                  onClick={() => handleLanguageChange(lang)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                    language === lang 
                      ? 'bg-white/20 text-white shadow-sm' 
                      : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                  }`}
                  data-testid={`language-option-${lang}`}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>

            {/* User Authentication */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-1 sm:gap-2 bg-transparent hover:bg-white/10 text-gray-200 hover:text-white rounded-full px-2 sm:px-3 py-1.5 sm:py-2 transition-all">
                    <span className="h-7 w-7 sm:h-8 sm:w-8 border border-white/20 rounded-full bg-white/10 text-white text-sm inline-flex items-center justify-center">
                      {(user.user_metadata?.name || user.email || 'U').charAt(0).toUpperCase()}
                    </span>
                    <span className="text-sm font-medium hidden lg:inline-block max-w-[100px] truncate">
                      {user.user_metadata?.name || user.email}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-[#0e152e] border-white/20 text-gray-200">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none text-white">{user.user_metadata?.name || 'User'}</p>
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
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={() => { setAuthModalDefaultTab('login'); setIsAuthModalOpen(true) }}
                  className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md rounded-full px-3 py-1.5 lg:px-4 lg:py-2 text-xs lg:text-sm font-medium leading-none cursor-pointer text-white/90 hover:text-white hover:bg-white/20 border border-white/15 transition-all duration-200"
                  data-testid="login-button"
                >
                  <User className="h-3.5 w-3.5" />
                  <span>{language === 'cs' ? 'Přihlásit' : (language === 'it' ? 'Accedi' : 'Login')}</span>
                </button>
                <button
                  onClick={() => { setAuthModalDefaultTab('signup'); setIsAuthModalOpen(true) }}
                  className="flex items-center gap-1.5 bg-copper-500/80 backdrop-blur-md rounded-full px-3 py-1.5 lg:px-4 lg:py-2 text-xs lg:text-sm font-medium leading-none cursor-pointer text-white hover:bg-copper-400 border border-copper-400/50 transition-all duration-200"
                  data-testid="register-button"
                >
                  <span>{language === 'cs' ? 'Registrovat' : (language === 'it' ? 'Registrati' : 'Register')}</span>
                </button>
              </div>
            )}
            
            {/* Mobile dashboard shortcut — visible when logged in, below lg */}
            {user && (
              <Link
                href="/dashboard"
                className="lg:hidden flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1.5 text-xs font-medium text-white/90 hover:text-white hover:bg-white/20 border border-white/15 transition-all duration-200"
                data-testid="mobile-dashboard-button"
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                <span>{navLabels.dashboard}</span>
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 rounded-lg cursor-pointer text-gray-200 hover:text-white hover:bg-white/10 transition-colors duration-200"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              data-testid="mobile-menu-button"
            >
              {isMenuOpen ? <X className="h-6 w-6 text-gray-200" /> : <Menu className="h-6 w-6 text-gray-200" />}
            </button>
          </div>
        </div>
        
        {/* Mobile menu */}
        <div 
          className={`lg:hidden overflow-hidden transition-all duration-200 ease-out ${
            isMenuOpen ? 'max-h-[calc(100dvh-4rem)] opacity-100' : 'max-h-0 opacity-0'
          }`}
          data-testid="mobile-menu"
        >
          <div className="flex flex-col space-y-1 pt-4 pb-6 mt-3 border-t border-white/10 overflow-y-auto max-h-[calc(100dvh-6rem)]" data-testid="mobile-menu-links">
            {[
              { href: '/', label: navLabels.home, testId: 'mobile-home-link' },
              { href: '/process', label: language === 'cs' ? 'Náš proces' : language === 'it' ? 'Il nostro processo' : 'Our Process', testId: 'mobile-process-link' },
              { href: '/properties', label: navLabels.properties, testId: 'mobile-properties-link' },
              { href: '/regions', label: navLabels.regions, testId: 'mobile-regions-link' },
              { href: '/blog', label: language === 'cs' ? 'Články' : language === 'it' ? 'Articoli' : 'Articles', testId: 'mobile-blog-link' },
              { href: '/faq', label: 'FAQ', testId: 'mobile-faq-link' },
              { href: '/about', label: navLabels.about, testId: 'mobile-about-link' },
              { href: '/contact', label: navLabels.contact, testId: 'mobile-contact-link' },
            ].map(({ href, label, testId }) => (
              <Link 
                key={href}
                href={href}
                className={`px-3 py-2.5 rounded-lg text-base transition-all duration-200 ${
                  isActive(href) 
                    ? 'text-white bg-white/10 font-medium' 
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
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
                {language === 'cs' ? 'Přihlásit / Registrovat' : (language === 'it' ? 'Accedi / Registrati' : 'Login / Register')}
              </button>
            )}
            {/* Language selector for mobile */}
            <div className="flex gap-2 pt-3 mt-2 border-t border-white/10">
              {['en', 'cs', 'it'].map((lang) => (
                <button
                  key={lang}
                  onClick={() => { handleLanguageChange(lang); setIsMenuOpen(false) }}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium leading-none cursor-pointer transition-all duration-200 ${
                    language === lang 
                      ? 'bg-copper-500/30 text-copper-200 ring-1 ring-copper-400/40' 
                      : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                  }`}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>
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

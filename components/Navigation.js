'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Menu, X, User, XCircle, Crown, LayoutDashboard, LogOut, Settings } from 'lucide-react'
import { t } from '../lib/translations'
import AuthModal from './AuthModal'
import { supabase } from '@/lib/supabase'

export default function Navigation() {
  const pathname = usePathname()
  const [user, setUser] = useState(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [language, setLanguage] = useState('en')
  const [isPopupBarVisible, setIsPopupBarVisible] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const navRef = useRef(null)

  const isActive = (path) => {
    if (path === '/') return pathname === '/'
    return pathname?.startsWith(path)
  }

  useEffect(() => {
    // Load saved language preference
    const savedLanguage = localStorage.getItem('preferred-language')
    if (savedLanguage) {
      setLanguage(savedLanguage)
      document.documentElement.lang = savedLanguage
    }
    
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
    console.log(`Language changed to: ${newLanguage}`)
    document.documentElement.lang = newLanguage
    localStorage.setItem('preferred-language', newLanguage)
    
    // Dispatch custom event for pages to listen to
    window.dispatchEvent(new CustomEvent('languageChange', { detail: newLanguage }))
  }

  const handleClosePopup = () => {
    setIsPopupBarVisible(false)
    localStorage.setItem('premium-club-popup-dismissed', 'true')
  }

  return (
    <>
    <nav 
      ref={navRef}
      className={`fixed top-0 left-0 right-0 z-50 overflow-visible transition-all duration-500 ease-out ${
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
      <div className={`container mx-auto px-4 overflow-visible transition-all duration-300 ${isScrolled ? 'pt-2 pb-1.5' : 'pt-4 pb-2'}`} data-testid="nav-container">
        <div className="flex items-center justify-between" data-testid="nav-content">
          <div className="flex items-center space-x-2 sm:space-x-4 md:space-x-8" data-testid="nav-brand-links">
            <Link href="/" data-testid="nav-brand-link" className="relative overflow-visible">
              <img 
                src="/logo domy.svg" 
                alt="Domy v Italii"
                className={`w-auto cursor-pointer absolute top-0 left-0 z-30 transition-all duration-500 ease-out ${isScrolled ? 'h-16 md:h-24' : 'h-20 md:h-32'}`}
                style={{ 
                  transform: 'translateY(-2px)',
                  filter: 'drop-shadow(0 2px 6px rgba(0, 0, 0, 0.4))'
                }}
                data-testid="nav-brand-logo"
              />
              <div className="h-12 w-24"></div>
            </Link>
            <div className="hidden lg:flex items-center space-x-0.5 xl:space-x-1" data-testid="nav-desktop-links">
              {[
                { href: '/', label: t('nav.home', language), testId: 'nav-home-link' },
                { href: '/properties', label: t('nav.properties', language), testId: 'nav-properties-link' },
                { href: '/regions', label: t('nav.regions', language), testId: 'nav-regions-link' },
                { href: '/process', label: language === 'cs' ? 'Jak koupit' : language === 'it' ? 'Come acquistare' : t('nav.process', language), testId: 'nav-process-link' },
                { href: '/blog', label: language === 'cs' ? 'Články' : language === 'it' ? 'Articoli' : 'Articles', testId: 'nav-blog-link' },
                { href: '/about', label: t('nav.about', language), testId: 'nav-about-link' },
                { href: '/contact', label: t('nav.contact', language), testId: 'nav-contact-link' },
              ].map(({ href, label, testId }) => (
                <Link 
                  key={href}
                  href={href} 
                  className={`relative px-2 xl:px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap ${
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
                    <Avatar className="h-7 w-7 sm:h-8 sm:w-8 border border-white/20">
                      <AvatarImage src={user.user_metadata?.avatar_url} />
                      <AvatarFallback className="bg-white/10 text-white text-sm">
                        {(user.user_metadata?.name || user.email || 'U').charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
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
                      <span>{t('nav.dashboard', language)}</span>
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem className="focus:bg-white/10 focus:text-white cursor-pointer" asChild>
                      <Link href="/admin" className="flex w-full items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>{t('nav.admin', language)}</span>
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
                onClick={() => setIsAuthModalOpen(true)}
                className="hidden sm:flex items-center gap-1.5 bg-white/10 backdrop-blur-md rounded-full px-3 py-1.5 lg:px-4 lg:py-2 text-xs lg:text-sm font-medium text-white/90 hover:text-white hover:bg-white/20 border border-white/15 transition-all duration-200"
                data-testid="login-button"
              >
                <User className="h-3.5 w-3.5" />
                <span className="hidden lg:inline">{language === 'cs' ? 'Přihlásit' : (language === 'it' ? 'Accedi' : 'Login')}</span>
                <span className="lg:hidden">{language === 'cs' ? 'Přihlásit' : (language === 'it' ? 'Accedi' : 'Login')}</span>
              </button>
            )}
            
            {/* Mobile menu button */}
            <button
              className="lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              data-testid="mobile-menu-button"
            >
              {isMenuOpen ? <X className="h-6 w-6 text-gray-200" /> : <Menu className="h-6 w-6 text-gray-200" />}
            </button>
          </div>
        </div>
        
        {/* Mobile menu */}
        <div 
          className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
          }`}
          data-testid="mobile-menu"
        >
          <div className="flex flex-col space-y-1 pt-4 pb-4 mt-3 border-t border-white/10" data-testid="mobile-menu-links">
            {[
              { href: '/', label: t('nav.home', language), testId: 'mobile-home-link' },
              { href: '/properties', label: t('nav.properties', language), testId: 'mobile-properties-link' },
              { href: '/regions', label: t('nav.regions', language), testId: 'mobile-regions-link' },
              { href: '/process', label: language === 'cs' ? 'Jak koupit' : language === 'it' ? 'Come acquistare' : t('nav.process', language), testId: 'mobile-process-link' },
              { href: '/blog', label: language === 'cs' ? 'Články' : language === 'it' ? 'Articoli' : 'Articles', testId: 'mobile-blog-link' },
              { href: '/faq', label: 'FAQ', testId: 'mobile-faq-link' },
              { href: '/about', label: t('nav.about', language), testId: 'mobile-about-link' },
              { href: '/contact', label: t('nav.contact', language), testId: 'mobile-contact-link' },
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
                {t('nav.dashboard', language)}
              </Link>
            )}
            {user && isAdmin && (
              <Link 
                href="/admin" 
                className="px-3 py-2.5 rounded-lg text-base text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                onClick={() => setIsMenuOpen(false)}
                data-testid="mobile-admin-link"
              >
                {t('nav.admin', language)}
              </Link>
            )}
            {!user && (
              <button
                onClick={() => {
                  setIsMenuOpen(false)
                  setIsAuthModalOpen(true)
                }}
                className="px-3 py-2.5 rounded-lg text-base text-copper-300 hover:text-copper-200 hover:bg-white/5 transition-colors text-left font-medium"
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
                  onClick={() => handleLanguageChange(lang)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
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
      />
      
      {/* Premium Club Popup Bar - inside nav so it flows directly below */}
      {isPopupBarVisible && (
        <div 
          className="w-full shadow-sm backdrop-blur-md transition-all duration-300"
          style={{ 
            background: 'linear-gradient(to right, rgba(199, 137, 91, 0.95), rgba(153, 105, 69, 0.95))',
          }}
        >
          <div className="container mx-auto px-4 py-2">
            <div className="flex items-center justify-center relative">
              <Link 
                href="/club" 
                className="flex items-center gap-2 sm:gap-3 group hover:opacity-90 transition-opacity"
              >
                <Crown className="h-4 w-4 sm:h-5 sm:w-5 text-white flex-shrink-0" />
                <span className="text-white font-semibold text-xs sm:text-sm md:text-base">
                  {language === 'cs' ? 'Premium Club - Zaregistrujte se zdarma nyní' :
                   language === 'it' ? 'Club Premium - Registrati gratuitamente ora' :
                   'Premium Club - Register for Free Now'}
                </span>
              </Link>
              <button
                onClick={handleClosePopup}
                className="absolute right-0 p-1 hover:bg-white/20 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
                aria-label="Close popup"
              >
                <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
    </>
  )
}
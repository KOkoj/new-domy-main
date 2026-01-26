'use client'

import { useState, useEffect } from 'react'
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
  }, [])

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
    <nav className="shadow-sm overflow-visible" style={{ backgroundColor: 'rgba(14, 21, 46, 0.9)', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)' }} data-testid="navigation-component">
      <div className="container mx-auto px-4 pt-4 pb-2 overflow-visible" data-testid="nav-container">
        <div className="flex items-center justify-between" data-testid="nav-content">
          <div className="flex items-center space-x-2 sm:space-x-4 md:space-x-8" data-testid="nav-brand-links">
            <Link href="/" data-testid="nav-brand-link" className="relative overflow-visible">
              <img 
                src="/logo domy.svg" 
                alt="Domy v Italii"
                className="h-20 md:h-32 w-auto cursor-pointer absolute top-0 left-0 z-30 transition-all duration-300" 
                style={{ 
                  transform: 'translateY(-2px)',
                  filter: 'drop-shadow(0 2px 6px rgba(0, 0, 0, 0.4))'
                }}
                data-testid="nav-brand-logo"
              />
              <div className="h-12 w-24"></div>
            </Link>
            <div className="hidden md:flex space-x-6" data-testid="nav-desktop-links">
              <Link href="/" className={`text-gray-200 hover:text-copper-400 transition-colors ${isActive('/') ? 'border-b-2 border-white pb-1' : ''}`} data-testid="nav-home-link">
                {t('nav.home', language)}
              </Link>
              <Link href="/properties" className={`text-gray-200 hover:text-copper-400 transition-colors ${isActive('/properties') ? 'border-b-2 border-white pb-1' : ''}`} data-testid="nav-properties-link">
                {t('nav.properties', language)}
              </Link>
              <Link href="/regions" className={`text-gray-200 hover:text-copper-400 transition-colors ${isActive('/regions') ? 'border-b-2 border-white pb-1' : ''}`} data-testid="nav-regions-link">
                {t('nav.regions', language)}
              </Link>
              <Link href="/about" className={`text-gray-200 hover:text-copper-400 transition-colors ${isActive('/about') ? 'border-b-2 border-white pb-1' : ''}`} data-testid="nav-about-link">
                {t('nav.about', language)}
              </Link>
              <Link href="/process" className={`text-gray-200 hover:text-copper-400 transition-colors ${isActive('/process') ? 'border-b-2 border-white pb-1' : ''}`} data-testid="nav-process-link">
                {t('nav.process', language)}
              </Link>
              <Link href="/contact" className={`text-gray-200 hover:text-copper-400 transition-colors ${isActive('/contact') ? 'border-b-2 border-white pb-1' : ''}`} data-testid="nav-contact-link">
                {t('nav.contact', language)}
              </Link>
            </div>
          </div>
          
          <div className="flex items-center gap-1 sm:gap-2 md:gap-4" data-testid="nav-user-controls">
            {/* Language Selector - Simplified on mobile */}
            <div className="hidden sm:flex group items-center bg-white/10 backdrop-blur-md rounded-full px-2 py-1.5 sm:px-3 sm:py-2 shadow-lg border border-white/20 transition-all duration-300 hover:shadow-xl hover:bg-white/20 md:hover:px-6 w-auto gap-1 sm:gap-2">
              <button
                onClick={() => handleLanguageChange('en')}
                className={`px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-sm sm:text-base font-medium transition-all duration-200 ease-in-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-400 ${
                  language === 'en' 
                    ? 'bg-white/20 text-white shadow-md backdrop-blur-sm' 
                    : 'text-white/60 hover:text-white/90 hover:bg-white/5 hidden md:block md:opacity-0 md:group-hover:opacity-100 md:absolute md:group-hover:relative md:group-hover:mx-1'
                }`}
                data-testid="language-option-en"
              >
                EN
              </button>
              <button
                onClick={() => handleLanguageChange('cs')}
                className={`px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-sm sm:text-base font-medium transition-all duration-200 ease-in-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-400 ${
                  language === 'cs' 
                    ? 'bg-white/20 text-white shadow-md backdrop-blur-sm' 
                    : 'text-white/60 hover:text-white/90 hover:bg-white/5 hidden md:block md:opacity-0 md:group-hover:opacity-100 md:absolute md:group-hover:relative md:group-hover:mx-1'
                }`}
                data-testid="language-option-cs"
              >
                CS
              </button>
              <button
                onClick={() => handleLanguageChange('it')}
                className={`px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-sm sm:text-base font-medium transition-all duration-200 ease-in-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-400 ${
                  language === 'it' 
                    ? 'bg-white/20 text-white shadow-md backdrop-blur-sm' 
                    : 'text-white/60 hover:text-white/90 hover:bg-white/5 hidden md:block md:opacity-0 md:group-hover:opacity-100 md:absolute md:group-hover:relative md:group-hover:mx-1'
                }`}
                data-testid="language-option-it"
              >
                IT
              </button>
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
                    <span className="text-sm sm:text-base font-medium hidden md:inline-block max-w-[100px] truncate">
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
              <div className="hidden sm:flex bg-white/10 backdrop-blur-md rounded-full px-2 sm:px-4 py-1.5 sm:py-2 shadow-lg border border-white/20 transition-all duration-300 hover:shadow-xl hover:bg-white/20">
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="text-sm sm:text-base font-medium text-white/90 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 rounded-full px-1 sm:px-2 py-0.5 sm:py-1 hover:bg-white/5"
                  data-testid="login-button"
                >
                  {language === 'cs' ? 'Přihlásit' : (language === 'it' ? 'Accedi' : 'Login')}
                </button>
                <span className="text-white/40 mx-0.5 sm:mx-1">/</span>
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="text-sm sm:text-base font-medium text-white/90 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 rounded-full px-1 sm:px-2 py-0.5 sm:py-1 hover:bg-white/5"
                  data-testid="register-button"
                >
                  {language === 'cs' ? 'Registrovat' : (language === 'it' ? 'Registrati' : 'Register')}
                </button>
              </div>
            )}
            
            {/* Mobile menu button */}
            <button
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              data-testid="mobile-menu-button"
            >
              {isMenuOpen ? <X className="h-6 w-6 text-gray-200" /> : <Menu className="h-6 w-6 text-gray-200" />}
            </button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-[#0e152e]" data-testid="mobile-menu">
            <div className="flex flex-col space-y-4" data-testid="mobile-menu-links">
              <Link 
                href="/properties" 
                className="text-gray-200 hover:text-white transition-colors"
                onClick={() => setIsMenuOpen(false)}
                data-testid="mobile-properties-link"
              >
                {t('nav.properties', language)}
              </Link>
              <Link 
                href="/regions" 
                className="text-gray-200 hover:text-white transition-colors"
                onClick={() => setIsMenuOpen(false)}
                data-testid="mobile-regions-link"
              >
                {t('nav.regions', language)}
              </Link>
              <Link 
                href="/about" 
                className="text-gray-200 hover:text-white transition-colors"
                onClick={() => setIsMenuOpen(false)}
                data-testid="mobile-about-link"
              >
                {t('nav.about', language)}
              </Link>
              <Link 
                href="/process" 
                className="text-gray-200 hover:text-white transition-colors"
                onClick={() => setIsMenuOpen(false)}
                data-testid="mobile-process-link"
              >
                {t('nav.process', language)}
              </Link>
              <Link 
                href="/contact" 
                className="text-gray-200 hover:text-white transition-colors"
                onClick={() => setIsMenuOpen(false)}
                data-testid="mobile-contact-link"
              >
                {t('nav.contact', language)}
              </Link>
              {user && (
                <Link 
                  href="/dashboard" 
                  className="text-gray-200 hover:text-white transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                  data-testid="mobile-dashboard-link"
                >
                  {t('nav.dashboard', language)}
                </Link>
              )}
              {user && isAdmin && (
                <Link 
                  href="/admin" 
                  className="text-gray-200 hover:text-white transition-colors"
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
                  className="text-gray-200 hover:text-white transition-colors text-left"
                  data-testid="mobile-login-link"
                >
                  {language === 'cs' ? 'Přihlásit / Registrovat' : (language === 'it' ? 'Accedi / Registrati' : 'Login / Register')}
                </button>
              )}
              {/* Language selector for mobile */}
              <div className="flex gap-2 pt-2 border-t border-white/10 mt-2">
                <button
                  onClick={() => handleLanguageChange('en')}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${language === 'en' ? 'bg-white/20 text-white' : 'text-gray-400'}`}
                >
                  EN
                </button>
                <button
                  onClick={() => handleLanguageChange('cs')}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${language === 'cs' ? 'bg-white/20 text-white' : 'text-gray-400'}`}
                >
                  CS
                </button>
                <button
                  onClick={() => handleLanguageChange('it')}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${language === 'it' ? 'bg-white/20 text-white' : 'text-gray-400'}`}
                >
                  IT
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </nav>
    
    {/* Premium Club Popup Bar */}
    {isPopupBarVisible && (
      <div 
        className="fixed left-0 right-0 z-40 shadow-lg backdrop-blur-md transition-all duration-300"
        style={{ 
          background: 'linear-gradient(to right, rgba(199, 137, 91, 0.9), rgba(153, 105, 69, 0.9))',
          top: '80px'
        }}
      >
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-center relative">
            <Link 
              href="/club" 
              className="flex items-center gap-3 group hover:opacity-90 transition-opacity"
            >
              <Crown className="h-5 w-5 text-white" />
              <span className="text-white font-semibold text-sm md:text-base whitespace-nowrap">
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
              <XCircle className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  )
}
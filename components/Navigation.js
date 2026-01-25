'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Menu, X, User, XCircle, Crown } from 'lucide-react'
import { t } from '../lib/translations'
import AuthModal from './AuthModal'
import { supabase } from '@/lib/supabase'

export default function Navigation() {
  const [user, setUser] = useState(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [language, setLanguage] = useState('en')
  const [isPopupBarVisible, setIsPopupBarVisible] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

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
          <div className="flex items-center space-x-8" data-testid="nav-brand-links">
            <Link href="/" data-testid="nav-brand-link" className="relative overflow-visible">
              <img 
                src="/logo domy.svg" 
                alt="Domy v Italii"
                className="h-32 w-auto cursor-pointer absolute top-0 left-0 z-30" 
                style={{ 
                  transform: 'translateY(-2px)',
                  filter: 'drop-shadow(0 2px 6px rgba(0, 0, 0, 0.4))'
                }}
                data-testid="nav-brand-logo"
              />
              <div className="h-12 w-24"></div>
            </Link>
            <div className="hidden md:flex space-x-6" data-testid="nav-desktop-links">
              <Link href="/" className="text-gray-200 hover:text-copper-400 transition-colors border-b-2 border-white pb-1" data-testid="nav-home-link">
                {t('nav.home', language)}
              </Link>
              <Link href="/properties" className="text-gray-200 hover:text-copper-400 transition-colors" data-testid="nav-properties-link">
                {t('nav.properties', language)}
              </Link>
              <Link href="/regions" className="text-gray-200 hover:text-copper-400 transition-colors" data-testid="nav-regions-link">
                {t('nav.regions', language)}
              </Link>
              <Link href="/about" className="text-gray-200 hover:text-copper-400 transition-colors" data-testid="nav-about-link">
                {t('nav.about', language)}
              </Link>
              <Link href="/process" className="text-gray-200 hover:text-copper-400 transition-colors" data-testid="nav-process-link">
                {t('nav.process', language)}
              </Link>
              <Link href="/contact" className="text-gray-200 hover:text-copper-400 transition-colors" data-testid="nav-contact-link">
                {t('nav.contact', language)}
              </Link>
              {user && (
                <Link href="/dashboard" className="text-gray-200 hover:text-copper-400 transition-colors" data-testid="nav-dashboard-link">
                  {t('nav.dashboard', language)}
                </Link>
              )}
              {user && isAdmin && (
                <Link href="/admin" className="text-gray-200 hover:text-copper-400 transition-colors" data-testid="nav-admin-link">
                  {t('nav.admin', language)}
                </Link>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4" data-testid="nav-user-controls">
            {/* Language Selector */}
            <div className="group flex items-center bg-white/10 backdrop-blur-md rounded-full px-3 py-2 shadow-lg border border-white/20 transition-all duration-300 hover:shadow-xl hover:bg-white/20 hover:px-6 w-auto gap-2">
              <button
                onClick={() => handleLanguageChange('en')}
                className={`px-3 py-1 rounded-full text-base font-medium transition-all duration-200 ease-in-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-400 ${
                  language === 'en' 
                    ? 'bg-white/20 text-white shadow-md backdrop-blur-sm' 
                    : 'text-white/60 hover:text-white/90 hover:bg-white/5 opacity-0 group-hover:opacity-100 absolute group-hover:relative group-hover:mx-1'
                }`}
                data-testid="language-option-en"
              >
                EN
              </button>
              <button
                onClick={() => handleLanguageChange('cs')}
                className={`px-3 py-1 rounded-full text-base font-medium transition-all duration-200 ease-in-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-400 ${
                  language === 'cs' 
                    ? 'bg-white/20 text-white shadow-md backdrop-blur-sm' 
                    : 'text-white/60 hover:text-white/90 hover:bg-white/5 opacity-0 group-hover:opacity-100 absolute group-hover:relative group-hover:mx-1'
                }`}
                data-testid="language-option-cs"
              >
                CS
              </button>
              <button
                onClick={() => handleLanguageChange('it')}
                className={`px-3 py-1 rounded-full text-base font-medium transition-all duration-200 ease-in-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-400 ${
                  language === 'it' 
                    ? 'bg-white/20 text-white shadow-md backdrop-blur-sm' 
                    : 'text-white/60 hover:text-white/90 hover:bg-white/5 opacity-0 group-hover:opacity-100 absolute group-hover:relative group-hover:mx-1'
                }`}
                data-testid="language-option-it"
              >
                IT
              </button>
            </div>

            {/* User Authentication */}
            {user ? (
              <div className="flex items-center space-x-3" data-testid="user-authenticated-section">
                <div className="flex items-center space-x-2" data-testid="user-info">
                  <User className="h-4 w-4 text-gray-200" />
                  <span className="text-base text-gray-200" data-testid="user-name">
                    {user.user_metadata?.name || user.email}
                  </span>
                </div>
                <Button 
                  variant="outline" 
                  onClick={handleLogout} 
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/50 transition-all duration-200 rounded-full px-6 py-4 text-base font-medium"
                  data-testid="logout-button"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <div className="bg-white/10 backdrop-blur-md rounded-full px-4 py-2 shadow-lg border border-white/20 transition-all duration-300 hover:shadow-xl hover:bg-white/20">
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="text-base font-medium text-white/90 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 rounded-full px-2 py-1 hover:bg-white/5"
                  data-testid="login-button"
                >
                  {language === 'cs' ? 'Přihlásit' : (language === 'it' ? 'Accedi' : 'Login')}
                </button>
                <span className="text-white/40 mx-1">/</span>
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="text-base font-medium text-white/90 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 rounded-full px-2 py-1 hover:bg-white/5"
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
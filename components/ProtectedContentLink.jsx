'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import AuthModal from '@/components/AuthModal'

const AUTH_COPY = {
  en: {
    title: 'Login required',
    message: 'To read this content, please log in or create a free account.'
  },
  cs: {
    title: 'Vyžaduje se přihlášení',
    message: 'Pro čtení tohoto obsahu se prosím přihlaste nebo si vytvořte bezplatný účet.'
  },
  it: {
    title: 'Accesso richiesto',
    message: 'Per leggere questo contenuto devi accedere o creare un account gratuito.'
  }
}

export default function ProtectedContentLink({
  href,
  language = 'en',
  children,
  className = '',
  ...props
}) {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const copy = AUTH_COPY[language] || AUTH_COPY.en

  useEffect(() => {
    let mounted = true

    fetch('/api/auth/session', { cache: 'no-store' })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        if (mounted) setIsAuthenticated(Boolean(payload?.authenticated))
      })
      .catch(() => {
        if (mounted) setIsAuthenticated(false)
      })

    return () => {
      mounted = false
    }
  }, [])

  const handleClick = async (event) => {
    event.preventDefault()

    const authenticated = await fetch('/api/auth/session', { cache: 'no-store' })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => Boolean(payload?.authenticated))
      .catch(() => false)

    if (authenticated || isAuthenticated) {
      setIsAuthenticated(true)
      router.push(href)
      return
    }

    setAuthOpen(true)
  }

  const handleAuthSuccess = () => {
    setAuthOpen(false)
    setIsAuthenticated(true)
    router.push(href)
  }

  return (
    <>
      <Link href={href} className={className} onClick={handleClick} {...props}>
        {children}
      </Link>
      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        title={copy.title}
        message={copy.message}
      />
    </>
  )
}

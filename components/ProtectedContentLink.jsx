'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const AuthModal = dynamic(() => import('@/components/AuthModal'), { ssr: false })
const KlubInfoModal = dynamic(() => import('@/components/KlubInfoModal'), { ssr: false })

export default function ProtectedContentLink({
  href,
  language = 'en',
  children,
  className = '',
  ...props
}) {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [klubOpen, setKlubOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [authTab, setAuthTab] = useState('signup')

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

    setKlubOpen(true)
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

      <KlubInfoModal
        isOpen={klubOpen}
        language={language}
        onClose={() => setKlubOpen(false)}
        onRegister={() => {
          setKlubOpen(false)
          setAuthTab('signup')
          setAuthOpen(true)
        }}
        onLogin={() => {
          setKlubOpen(false)
          setAuthTab('login')
          setAuthOpen(true)
        }}
      />

      <AuthModal
        isOpen={authOpen}
        defaultTab={authTab}
        onClose={() => setAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </>
  )
}

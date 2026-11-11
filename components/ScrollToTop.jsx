'use client'

import { useState, useEffect } from 'react'
import { ArrowUp } from 'lucide-react'
import { usePathname } from 'next/navigation'

export default function ScrollToTop() {
  const isHomepage = usePathname() === '/'
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isHomepage) return
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 400)
    }

    window.addEventListener('scroll', toggleVisibility, { passive: true })
    return () => window.removeEventListener('scroll', toggleVisibility)
  }, [isHomepage])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (isHomepage) return null

  return (
    <button
      onClick={scrollToTop}
      aria-label="Scroll to top"
      data-testid="scroll-to-top"
      className={`fixed bottom-6 right-6 z-40 p-3 rounded-full shadow-lg transition-all duration-300 ease-out
        bg-white/90 backdrop-blur-md border border-gray-200 text-slate-700 
        hover:bg-white hover:shadow-xl hover:-translate-y-0.5
        active:scale-95
        ${isVisible ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'}
      `}
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  )
}

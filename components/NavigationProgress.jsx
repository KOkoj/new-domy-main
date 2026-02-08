'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { usePathname } from 'next/navigation'

export default function NavigationProgress() {
  const pathname = usePathname()
  const [state, setState] = useState('idle') // 'idle' | 'loading' | 'finishing'
  const [progress, setProgress] = useState(0)
  const intervalRef = useRef(null)
  const prevPathname = useRef(pathname)

  // Cleanup interval
  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  // When pathname changes → navigation is complete
  useEffect(() => {
    if (prevPathname.current !== pathname) {
      prevPathname.current = pathname

      // Finish the bar
      clearTimer()
      setProgress(100)
      setState('finishing')

      const timeout = setTimeout(() => {
        setState('idle')
        setProgress(0)
      }, 500)

      return () => clearTimeout(timeout)
    }
  }, [pathname, clearTimer])

  // Listen for link clicks to detect navigation start
  useEffect(() => {
    const handleClick = (e) => {
      // Find the closest anchor tag
      const anchor = e.target.closest('a')
      if (!anchor) return

      const href = anchor.getAttribute('href')
      if (!href) return

      // Skip external links, hash links, mailto, tel, etc.
      if (
        href.startsWith('http') ||
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('javascript:') ||
        anchor.target === '_blank' ||
        anchor.download
      ) {
        return
      }

      // Skip if same page
      if (href === pathname || href === pathname + '/') return

      // Start loading
      clearTimer()
      setState('loading')
      setProgress(15)
    }

    document.addEventListener('click', handleClick, { capture: true })
    return () => document.removeEventListener('click', handleClick, { capture: true })
  }, [pathname, clearTimer])

  // Animate progress while in loading state
  useEffect(() => {
    if (state !== 'loading') return

    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        // Slow down as we approach 90%
        if (prev >= 85) return prev + 0.5
        if (prev >= 70) return prev + 1
        if (prev >= 50) return prev + 2
        return prev + 3 + Math.random() * 5
      })
    }, 200)

    return () => clearTimer()
  }, [state, clearTimer])

  // Don't render when idle and no progress
  if (state === 'idle' && progress === 0) return null

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[100] pointer-events-none"
      style={{ height: '3px' }}
    >
      <div
        className="h-full rounded-r-full"
        style={{
          width: `${progress}%`,
          background: 'linear-gradient(90deg, #c48759, #d4a574)',
          boxShadow: state === 'loading' ? '0 0 12px rgba(196, 135, 89, 0.6), 0 0 4px rgba(196, 135, 89, 0.4)' : 'none',
          transition: state === 'finishing'
            ? 'width 0.2s ease-out, opacity 0.4s ease 0.2s'
            : 'width 0.3s ease',
          opacity: state === 'finishing' ? 0 : 1,
        }}
      />
    </div>
  )
}

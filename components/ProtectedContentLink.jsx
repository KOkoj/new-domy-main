'use client'

import Link from 'next/link'

/**
 * Compatibility wrapper for editorial links. Articles and guides are public,
 * so this always behaves like a normal Next.js Link.
 *
 * The `language` prop is accepted for backwards compatibility with existing
 * callers but is ignored.
 */
export default function ProtectedContentLink({
  href,
  children,
  className = '',
  language: _language,
  ...props
}) {
  return (
    <Link href={href} className={className} {...props}>
      {children}
    </Link>
  )
}

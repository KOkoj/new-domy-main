'use client'

import Link from 'next/link'

/**
 * Renders a normal Link to a klub-required article. The teaser + paywall
 * experience for logged-out visitors is handled globally by
 * <ArticlePaywallGate /> on the destination page, so we no longer intercept
 * clicks here to show a klub-info modal.
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

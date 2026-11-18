'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

const LABELS = { cs: 'Zpět', it: 'Indietro', en: 'Back' }

// Small back link to the client zone, shown at the top of every zone subpage.
export default function ZoneBackLink({ language = 'cs', className = '' }) {
  return (
    <Link
      href="/dashboard"
      className={`inline-flex min-h-[44px] items-center gap-1.5 text-[15px] font-medium text-[#1b2333] hover:underline ${className}`}
      data-testid="zone-back-link"
    >
      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
      {LABELS[language] || LABELS.cs}
    </Link>
  )
}

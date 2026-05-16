'use client'

const LABELS = {
  en: 'New',
  it: 'Novita',
  cs: 'Novinka',
}

export function getNewPropertyLabel(language = 'en') {
  return LABELS[language] || LABELS.en
}

export default function NewPropertyRibbon({ language = 'en', className = '' }) {
  return (
    <div className={`pointer-events-none absolute right-[-36px] top-[14px] z-10 w-36 rotate-45 bg-red-600 py-1.5 text-center text-[11px] font-extrabold uppercase tracking-[0.2em] text-white shadow-[0_8px_18px_rgba(220,38,38,0.35)] ring-1 ring-white/50 ${className}`}>
      {getNewPropertyLabel(language)}
    </div>
  )
}

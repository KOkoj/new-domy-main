'use client'

const LABELS = {
  en: 'New',
  it: 'Novità',
  cs: 'Novinka',
}

export function getNewPropertyLabel(language = 'en') {
  return LABELS[language] || LABELS.en
}

export default function NewPropertyRibbon({ language = 'en', className = '' }) {
  return (
    <div className={`pointer-events-none absolute right-0 bottom-7 z-20 min-w-32 rounded-l-full bg-red-600 px-5 py-2 text-center text-xs font-extrabold uppercase tracking-[0.18em] text-white shadow-[0_10px_22px_rgba(220,38,38,0.38)] ring-1 ring-white/45 ${className}`}>
      {getNewPropertyLabel(language)}
    </div>
  )
}

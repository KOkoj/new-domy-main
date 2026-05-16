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
    <div className={`pointer-events-none absolute right-[-38px] top-[18px] z-30 w-36 rotate-45 bg-emerald-600 py-1.5 text-center text-[11px] font-bold uppercase tracking-[0.18em] text-white shadow-lg ring-1 ring-white/30 ${className}`}>
      {getNewPropertyLabel(language)}
    </div>
  )
}

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
    <div className={`pointer-events-none absolute right-0 bottom-7 z-20 flex items-stretch drop-shadow-[0_10px_18px_rgba(15,23,42,0.28)] ${className}`}>
      <div className="relative bg-slate-800 px-5 py-2 text-center text-xs font-extrabold uppercase tracking-[0.18em] text-amber-300 ring-1 ring-white/35">
        {getNewPropertyLabel(language)}
        <span className="absolute -right-4 top-0 h-1/2 w-4 bg-slate-800 [clip-path:polygon(0_0,100%_0,0_100%)]" />
        <span className="absolute -right-4 bottom-0 h-1/2 w-4 bg-slate-800 [clip-path:polygon(0_0,100%_100%,0_100%)]" />
      </div>
    </div>
  )
}

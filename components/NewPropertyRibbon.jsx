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
    <div className={`pointer-events-none absolute right-4 bottom-7 z-20 flex items-stretch drop-shadow-[0_12px_22px_rgba(15,23,42,0.34)] ${className}`}>
      <div className="relative rounded-xl bg-slate-800 px-7 py-3 text-center text-[15px] font-black uppercase tracking-[0.18em] text-yellow-200 ring-1 ring-white/40 [text-shadow:0_1px_0_rgba(0,0,0,0.55),0_0_14px_rgba(253,224,71,0.55)]">
        {getNewPropertyLabel(language)}
        <span className="absolute -right-4 top-1 h-[calc(50%-0.25rem)] w-4 rounded-tr-lg bg-slate-800 [clip-path:polygon(0_0,100%_0,0_100%)]" />
        <span className="absolute -right-4 bottom-1 h-[calc(50%-0.25rem)] w-4 rounded-br-lg bg-slate-800 [clip-path:polygon(0_0,100%_100%,0_100%)]" />
      </div>
    </div>
  )
}

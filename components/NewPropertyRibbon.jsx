'use client'

const LABELS = {
  en: 'New',
  it: 'Novit\u00e0',
  cs: 'Novinka',
}

export function getNewPropertyLabel(language = 'en') {
  return LABELS[language] || LABELS.en
}

export default function NewPropertyRibbon({ language = 'en', className = '' }) {
  return (
    <div className={`pointer-events-none absolute right-4 bottom-7 z-20 flex items-stretch drop-shadow-[0_12px_22px_rgba(15,23,42,0.34)] ${className}`}>
      <div className="relative rounded-xl bg-slate-800 px-7 py-3 text-center text-[15px] font-black uppercase tracking-[0.18em] text-yellow-200 ring-2 ring-yellow-300/85 [text-shadow:0_1px_0_rgba(0,0,0,0.55),0_0_14px_rgba(253,224,71,0.55)]">
        {getNewPropertyLabel(language)}
      </div>
    </div>
  )
}

import { Facebook, Instagram } from 'lucide-react'
import { SOCIAL_PROFILES } from '@/lib/socialProfiles'

const ICONS = { facebook: Facebook, instagram: Instagram }

const APPEARANCE = {
  hero: {
    facebook: 'border-[#85b9ff]/45 bg-[#1877f2]/20 text-[#d7e9ff] hover:bg-[#1877f2]/30 focus-visible:ring-[#85b9ff]',
    instagram: 'border-[#f8a5c3]/45 bg-[#d62976]/20 text-[#ffe0ed] hover:bg-[#d62976]/30 focus-visible:ring-[#f8a5c3]',
  },
  dark: {
    facebook: 'border-[#85b9ff]/55 bg-[#1877f2]/30 text-white hover:bg-[#1877f2]/45 focus-visible:ring-[#85b9ff]',
    instagram: 'border-[#f8a5c3]/55 bg-[#d62976]/30 text-white hover:bg-[#d62976]/45 focus-visible:ring-[#f8a5c3]',
  },
  light: {
    facebook: 'border-[#1877f2]/30 bg-[#eff6ff] text-[#155fc1] hover:bg-[#dcecff] focus-visible:ring-[#1877f2]',
    instagram: 'border-[#dd2a7b]/30 bg-[#fff0f5] text-[#ae276b] hover:bg-[#ffe0ed] focus-visible:ring-[#dd2a7b]',
  },
  region: {
    facebook: 'border-[#1269d3] bg-[#1269d3] text-white shadow-sm hover:bg-[#0866d8] focus-visible:ring-[#1877f2]',
    instagram: 'border-[#c51f69] bg-gradient-to-r from-[#b94a16] via-[#c51f69] to-[#8134af] text-white shadow-sm hover:brightness-110 focus-visible:ring-[#dd2a7b]',
  },
}

export default function SocialLinks({ className = '', tone = 'light', testIdPrefix = 'social' }) {
  const appearance = APPEARANCE[tone] || APPEARANCE.light

  return (
    <div className={`flex flex-wrap items-center gap-2.5 ${className}`}>
      {SOCIAL_PROFILES.map(({ id, name, url }) => {
        const Icon = ICONS[id]
        return (
          <a
            key={id}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${name} · Domy v Itálii`}
            data-testid={`${testIdPrefix}-${id}`}
            className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${appearance[id]}`}
          >
            <Icon aria-hidden="true" className="h-[18px] w-[18px]" />
            <span>{name}</span>
          </a>
        )
      })}
    </div>
  )
}

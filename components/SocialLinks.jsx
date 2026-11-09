import { Facebook, Instagram } from 'lucide-react'
import { SOCIAL_PROFILES } from '@/lib/socialProfiles'

const ICONS = { facebook: Facebook, instagram: Instagram }

export default function SocialLinks({ className = '', tone = 'light', testIdPrefix = 'social' }) {
  const appearance = tone === 'dark'
    ? 'border-white/25 bg-white/10 text-white hover:border-white/50 hover:bg-white/20 focus-visible:ring-white'
    : 'border-[#1b2642]/15 bg-white text-[#1b2642] hover:border-[#c7895b] hover:bg-[#fff9f3] focus-visible:ring-[#c7895b]'

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
            className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${appearance}`}
          >
            <Icon aria-hidden="true" className="h-[18px] w-[18px]" />
            <span>{name}</span>
          </a>
        )
      })}
    </div>
  )
}

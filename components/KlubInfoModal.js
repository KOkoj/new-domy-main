'use client'

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Crown, BookOpen, LayoutDashboard, MessageCircle, Video, X } from 'lucide-react'

const t = {
  cs: {
    badge: 'Zdarma navždy',
    heading: 'Klub pro klienty',
    sub: 'Exkluzivní prostor pro každého, kdo uvažuje o nemovitosti v Itálii.',
    free: 'Registrace je zcela bezplatná a zůstane bezplatná navždy — žádné skryté poplatky, žádné předplatné.',
    benefitsTitle: 'Co získáte přístupem do klubu',
    benefits: [
      { icon: BookOpen,       text: 'Podrobné průvodce a exkluzivní články' },
      { icon: LayoutDashboard, text: 'Osobní dashboard s uloženými nemovitostmi' },
      { icon: MessageCircle,  text: 'Prioritní komunikace s naším týmem' },
      { icon: Video,          text: 'Nahrávky webinářů a odborné materiály' },
    ],
    cta: 'Registrovat se zdarma',
    login: 'Již mám účet — přihlásit se',
  },
  en: {
    badge: 'Free forever',
    heading: 'Client Club',
    sub: 'An exclusive space for everyone thinking about buying property in Italy.',
    free: 'Registration is completely free and will remain free forever — no hidden fees, no subscription.',
    benefitsTitle: 'What you get with club access',
    benefits: [
      { icon: BookOpen,       text: 'In-depth guides and exclusive articles' },
      { icon: LayoutDashboard, text: 'Personal dashboard with saved properties' },
      { icon: MessageCircle,  text: 'Priority communication with our team' },
      { icon: Video,          text: 'Webinar recordings and expert materials' },
    ],
    cta: 'Register for free',
    login: 'I already have an account — log in',
  },
  it: {
    badge: 'Gratuito per sempre',
    heading: 'Club per clienti',
    sub: 'Uno spazio esclusivo per chi sta pensando di acquistare un immobile in Italia.',
    free: 'La registrazione è completamente gratuita e lo rimarrà per sempre — nessuna commissione nascosta, nessun abbonamento.',
    benefitsTitle: 'Cosa ottieni con l\'accesso al club',
    benefits: [
      { icon: BookOpen,       text: 'Guide approfondite e articoli esclusivi' },
      { icon: LayoutDashboard, text: 'Dashboard personale con proprietà salvate' },
      { icon: MessageCircle,  text: 'Comunicazione prioritaria con il nostro team' },
      { icon: Video,          text: 'Registrazioni di webinar e materiali di esperti' },
    ],
    cta: 'Registrati gratuitamente',
    login: 'Ho già un account — accedi',
  },
}

export default function KlubInfoModal({ isOpen, onClose, onRegister, onLogin, language = 'cs' }) {
  const lang = t[language] ?? t.cs

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="max-w-lg w-full p-0 overflow-hidden border-0 bg-transparent shadow-2xl [&>button]:right-3 [&>button]:top-3 [&>button]:h-10 [&>button]:w-10 [&>button]:rounded-full [&>button]:bg-white/10 [&>button]:text-white [&>button]:opacity-80 [&>button]:hover:bg-white/20 [&>button]:hover:opacity-100">
        <DialogTitle className="sr-only">{lang.heading}</DialogTitle>
        <div className="bg-[#1a1a2e] rounded-2xl overflow-hidden">

          {/* Top accent bar */}
          <div className="h-1 w-full bg-gradient-to-r from-[#c48759] via-[#e0a96d] to-[#c48759]" />

          <div className="p-7 sm:p-9">

            {/* Badge + icon */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#c48759]/15 border border-[#c48759]/30">
                <Crown className="h-5 w-5 text-[#c48759]" />
              </div>
              <span className="text-xs font-semibold tracking-widest uppercase text-[#c48759] bg-[#c48759]/10 px-3 py-1 rounded-full border border-[#c48759]/25">
                {lang.badge}
              </span>
            </div>

            {/* Heading */}
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              {lang.heading}
            </h2>
            <p className="text-gray-400 text-sm sm:text-base mb-5 leading-relaxed">
              {lang.sub}
            </p>

            {/* Free forever callout */}
            <div className="bg-[#c48759]/10 border border-[#c48759]/20 rounded-xl px-4 py-3 mb-6 text-sm text-[#e0c099] leading-relaxed">
              {lang.free}
            </div>

            {/* Benefits */}
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3">
              {lang.benefitsTitle}
            </p>
            <ul className="space-y-2.5 mb-8">
              {lang.benefits.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3">
                  <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#c48759]/15">
                    <Icon className="h-3.5 w-3.5 text-[#c48759]" />
                  </span>
                  <span className="text-sm text-gray-300">{text}</span>
                </li>
              ))}
            </ul>

            {/* CTAs */}
            <button
              onClick={onRegister}
              className="w-full py-3 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-[#c48759] to-[#e0a96d] hover:from-[#b3794f] hover:to-[#c48759] transition-all duration-200 shadow-lg shadow-[#c48759]/20 mb-3"
            >
              {lang.cta}
            </button>
            <button
              onClick={onLogin}
              className="w-full py-2.5 rounded-xl font-medium text-sm text-gray-400 hover:text-white border border-white/10 hover:border-white/20 transition-colors duration-200"
            >
              {lang.login}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

'use client'

import Link from 'next/link'
import { Phone, Mail, MapPin, MessageCircle, ArrowUpRight } from 'lucide-react'
import { t } from '../lib/translations'

export default function Footer({ language = 'en' }) {
  return (
    <footer className="relative bg-gradient-to-b from-slate-900 to-slate-950 text-white mt-8 sm:mt-12 overflow-hidden" data-testid="main-footer">
      {/* Subtle top border accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-copper-400/40 to-transparent" />
      
      <div className="container mx-auto px-4 pt-12 sm:pt-16 pb-8" data-testid="footer-container">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10" data-testid="footer-content">
          {/* Brand & Company Info */}
          <div className="col-span-2 sm:col-span-2 md:col-span-1" data-testid="footer-brand-section">
            <img 
              src="/logo domy.svg" 
              alt={t('nav.brand', language)}
              className="h-16 sm:h-20 w-auto mb-5" 
              data-testid="footer-brand-logo"
            />
            <p className="text-gray-400 text-sm sm:text-base mb-5 leading-relaxed" data-testid="footer-brand-description">{t('footer.brandDescription', language)}</p>
            <div className="space-y-2.5 text-gray-400 text-sm">
              <p className="font-semibold text-gray-200 tracking-wide">Creavita s.r.o.</p>
              <div className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-copper-400/70" />
                <span className="leading-relaxed">Láskova 1802/3<br />148 00 Praha 4 - Chodov</span>
              </div>
              <p className="text-xs text-gray-500 pt-1">
                {language === 'cs' ? 'IČ' : language === 'it' ? 'P.IVA' : 'ID'}: 07136943 | {language === 'cs' ? 'DIČ' : language === 'it' ? 'C.F.' : 'VAT'}: CZ07136943
              </p>
            </div>
          </div>

          {/* Contact Info */}
          <div data-testid="footer-contact-section">
            <h5 className="font-semibold mb-4 sm:mb-5 text-sm sm:text-base uppercase tracking-wider text-gray-300">
              {language === 'cs' ? 'Kontakt' : language === 'it' ? 'Contatto' : 'Contact'}
            </h5>
            <ul className="space-y-4 text-gray-400 text-sm">
              <li>
                <p className="text-gray-200 font-medium mb-1.5">Lucie Kučerová</p>
                <a href="tel:+420731450001" className="hover:text-copper-300 flex items-center gap-2 transition-colors duration-200">
                  <Phone className="h-3.5 w-3.5 text-copper-400/60" />+420 731 450 001
                </a>
                <a href="mailto:lucie@domyvitalii.cz" className="hover:text-copper-300 flex items-center gap-2 mt-1 transition-colors duration-200">
                  <Mail className="h-3.5 w-3.5 text-copper-400/60" />lucie@domyvitalii.cz
                </a>
              </li>
              <li>
                <p className="text-gray-200 font-medium mb-1.5">Luca Croce</p>
                <a href="tel:+420720363136" className="hover:text-copper-300 flex items-center gap-2 transition-colors duration-200">
                  <Phone className="h-3.5 w-3.5 text-copper-400/60" />+420 720 363 136
                </a>
                <a href="mailto:luca.croce@domyvitalii.cz" className="hover:text-copper-300 flex items-center gap-2 mt-1 transition-colors duration-200">
                  <Mail className="h-3.5 w-3.5 text-copper-400/60" />luca.croce@domyvitalii.cz
                </a>
              </li>
              <li className="flex items-center gap-3 pt-1">
                <a href="mailto:info@domyvitalii.cz" className="hover:text-copper-300 flex items-center gap-2 transition-colors duration-200">
                  <Mail className="h-3.5 w-3.5 text-copper-400/60" />info@domyvitalii.cz
                </a>
              </li>
              <li>
                <a href="https://wa.me/420731450001" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-900/30 text-green-400 hover:bg-green-900/50 transition-colors duration-200 text-xs font-medium">
                  <MessageCircle className="h-3.5 w-3.5" />
                  WhatsApp
                </a>
              </li>
              <li className="text-xs text-gray-500">
                {language === 'cs' ? 'Po–Pá 9:00–18:00' : language === 'it' ? 'Lun–Ven 9:00–18:00' : 'Mon–Fri 9:00–18:00'}
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div data-testid="footer-links-section">
            <h5 className="font-semibold mb-4 sm:mb-5 text-sm sm:text-base uppercase tracking-wider text-gray-300">
              {language === 'cs' ? 'Nabídka' : language === 'it' ? 'Offerta' : 'Explore'}
            </h5>
            <ul className="space-y-2.5 text-gray-400 text-sm">
              {[
                { href: '/properties', label: t('footer.properties', language) },
                { href: '/regions', label: t('footer.regions', language) },
                { href: '/process', label: t('footer.buyingGuide', language) },
                { href: '/blog', label: language === 'cs' ? 'Články' : language === 'it' ? 'Articoli' : 'Articles' },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="group flex items-center gap-1 hover:text-white transition-colors duration-200">
                    {label}
                    <ArrowUpRight className="h-3 w-3 opacity-0 -translate-y-0.5 translate-x-0 group-hover:opacity-60 group-hover:translate-y-0 transition-all duration-200" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div data-testid="footer-support-section">
            <h5 className="font-semibold mb-4 sm:mb-5 text-sm sm:text-base uppercase tracking-wider text-gray-300" data-testid="footer-support-title">{t('footer.support', language)}</h5>
            <ul className="space-y-2.5 text-gray-400 text-sm" data-testid="footer-support-links">
              {[
                { href: '/contact', label: t('footer.contactUs', language), testId: 'footer-contact-link' },
                { href: '/about', label: language === 'cs' ? 'O nás' : language === 'it' ? 'Chi siamo' : 'About Us', testId: 'footer-about-link' },
                { href: '/faq', label: t('footer.faq', language), testId: 'footer-faq-link' },
                { href: '/guides/costs', label: language === 'cs' ? 'Náklady koupě' : language === 'it' ? 'Costi acquisto' : 'Purchase Costs' },
                { href: '/guides/mistakes', label: language === 'cs' ? 'Časté chyby' : language === 'it' ? 'Errori comuni' : 'Common Mistakes' },
              ].map(({ href, label, testId }) => (
                <li key={href}>
                  <Link href={href} className="group flex items-center gap-1 hover:text-white transition-colors duration-200" data-testid={testId}>
                    {label}
                    <ArrowUpRight className="h-3 w-3 opacity-0 -translate-y-0.5 translate-x-0 group-hover:opacity-60 group-hover:translate-y-0 transition-all duration-200" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Bottom bar */}
        <div className="border-t border-white/5 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-gray-500 text-sm" data-testid="footer-copyright">
          <p data-testid="footer-copyright-text">&copy; 2026 Creavita s.r.o.</p>
          <a href="https://www.domyvitalii.cz" className="text-gray-500 hover:text-gray-300 transition-colors duration-200">www.domyvitalii.cz</a>
        </div>
      </div>
    </footer>
  )
}

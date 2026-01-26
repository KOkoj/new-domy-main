'use client'

import { t } from '../lib/translations'

export default function Footer({ language = 'en' }) {
  return (
    <footer className="bg-gray-900 text-white py-8 sm:py-12 mt-8 sm:mt-12" data-testid="main-footer">
      <div className="container mx-auto px-4" data-testid="footer-container">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8" data-testid="footer-content">
          <div className="col-span-2 sm:col-span-2 md:col-span-1" data-testid="footer-brand-section">
            <img 
              src="/logo domy.svg" 
              alt={t('nav.brand', language)}
              className="h-16 sm:h-20 w-auto mb-4" 
              data-testid="footer-brand-logo"
            />
            <p className="text-gray-400 text-sm sm:text-base" data-testid="footer-brand-description">{t('footer.brandDescription', language)}</p>
          </div>
          <div data-testid="footer-properties-section">
            <h5 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base" data-testid="footer-properties-title">{t('footer.properties', language)}</h5>
            <ul className="space-y-1.5 sm:space-y-2 text-gray-400 text-sm" data-testid="footer-properties-links">
              <li><a href="#" className="hover:text-white" data-testid="footer-luxury-villas-link">{t('footer.luxuryVillas', language)}</a></li>
              <li><a href="#" className="hover:text-white" data-testid="footer-apartments-link">{t('footer.apartments', language)}</a></li>
              <li><a href="#" className="hover:text-white" data-testid="footer-farmhouses-link">{t('footer.farmhouses', language)}</a></li>
              <li><a href="#" className="hover:text-white" data-testid="footer-commercial-link">{t('footer.commercial', language)}</a></li>
            </ul>
          </div>
          <div data-testid="footer-regions-section">
            <h5 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base" data-testid="footer-regions-title">{t('footer.regions', language)}</h5>
            <ul className="space-y-1.5 sm:space-y-2 text-gray-400 text-sm" data-testid="footer-regions-links">
              <li><a href="#" className="hover:text-white" data-testid="footer-tuscany-link">{t('footer.tuscany', language)}</a></li>
              <li><a href="#" className="hover:text-white" data-testid="footer-lake-como-link">{t('footer.lakeComo', language)}</a></li>
              <li><a href="#" className="hover:text-white" data-testid="footer-amalfi-coast-link">{t('footer.amalfiCoast', language)}</a></li>
              <li><a href="#" className="hover:text-white" data-testid="footer-sicily-link">{t('footer.sicily', language)}</a></li>
            </ul>
          </div>
          <div data-testid="footer-support-section">
            <h5 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base" data-testid="footer-support-title">{t('footer.support', language)}</h5>
            <ul className="space-y-1.5 sm:space-y-2 text-gray-400 text-sm" data-testid="footer-support-links">
              <li><a href="#" className="hover:text-white" data-testid="footer-contact-link">{t('footer.contactUs', language)}</a></li>
              <li><a href="#" className="hover:text-white" data-testid="footer-buying-guide-link">{t('footer.buyingGuide', language)}</a></li>
              <li><a href="#" className="hover:text-white" data-testid="footer-legal-services-link">{t('footer.legalServices', language)}</a></li>
              <li><a href="#" className="hover:text-white" data-testid="footer-faq-link">{t('footer.faq', language)}</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400" data-testid="footer-copyright">
          <p data-testid="footer-copyright-text">{t('footer.copyright', language)}</p>
        </div>
      </div>
    </footer>
  )
}

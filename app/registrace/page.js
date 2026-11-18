'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Heart, Search, MessageSquare, ClipboardList, Check, ChevronDown, MailWarning } from 'lucide-react'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import EmailCodeSignIn from '@/components/auth/EmailCodeSignIn'
import FormPrivacyNotice from '@/components/legal/FormPrivacyNotice'
import { t } from '@/lib/translations'
import { getSafeRedirectPath } from '@/lib/safeRedirect'
import { DEFAULT_LANGUAGE, readLanguageFromBrowser } from '@/lib/userPreferences'

// Sender of the Supabase auth e-mails (custom SMTP via Resend, see
// docs/supabase-email-templates/README.md) and the contact for account removal.
const AUTH_EMAIL_SENDER = 'info@domyvitalii.cz'
const CONTACT_EMAIL = 'info@domyvitalii.cz'

const BENEFIT_ICONS = [Heart, Search, MessageSquare, ClipboardList]

export default function RegistrationPage() {
  const [language, setLanguage] = useState(DEFAULT_LANGUAGE)
  const [nextPath, setNextPath] = useState('/dashboard')
  const [openFaq, setOpenFaq] = useState(null)

  useEffect(() => {
    setLanguage(readLanguageFromBrowser())
    const params = new URLSearchParams(window.location.search)
    setNextPath(getSafeRedirectPath(params.get('redirect'), '/dashboard'))

    const handleLanguageChange = (event) => setLanguage(event.detail)
    window.addEventListener('languageChange', handleLanguageChange)
    return () => window.removeEventListener('languageChange', handleLanguageChange)
  }, [])

  const tr = (key) => t(`registrationPage.${key}`, language)
  const benefits = tr('benefits')
  const steps = tr('steps')
  const faq = tr('faq')
  const loginHref = `/login?redirect=${encodeURIComponent(nextPath)}`

  return (
    <div className="site-page min-h-screen bg-[#f7f4ed]">
      <Navigation />

      <main className="pb-16 pt-40 sm:pt-44">
        <div className="container mx-auto px-6">
          <header className="mb-10 max-w-3xl">
            <p className="mb-3 text-sm font-semibold tracking-wide text-[#c78b5a]">{tr('eyebrow')}</p>
            <h1 className="mb-4 text-pretty">{tr('title')}</h1>
            <p className="text-lg leading-[1.75] text-gray-600">{tr('intro')}</p>
            <p className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Check className="h-4 w-4 text-[#c78b5a]" aria-hidden="true" />
              {tr('freeNote')}
            </p>
          </header>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-12">
            {/* Steps */}
            <section className="lg:col-start-1 lg:row-start-1" aria-labelledby="registrace-steps">
              <h2 id="registrace-steps" className="mb-5 text-2xl font-bold text-slate-800">{tr('stepsTitle')}</h2>
              <ol className="space-y-3">
                {Array.isArray(steps) && steps.map((step, index) => (
                  <li key={step.title} className="flex items-start gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                    <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-slate-800 text-sm font-bold text-white">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-semibold text-slate-800">{step.title}</p>
                      <p className="mt-1 text-sm leading-relaxed text-gray-600">{step.text}</p>
                    </div>
                  </li>
                ))}
              </ol>

              <div className="mt-4 flex items-start gap-3 rounded-xl border border-[#e7d9c9] bg-[#faf6f3] p-4">
                <MailWarning className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#aa6a3f]" aria-hidden="true" />
                <div>
                  <p className="font-semibold text-slate-800">{tr('spamTitle')}</p>
                  <p className="mt-1 text-sm leading-relaxed text-gray-700">
                    {tr('spamText').replace('{sender}', AUTH_EMAIL_SENDER)}
                  </p>
                </div>
              </div>
            </section>

            {/* Form */}
            <aside className="lg:col-start-2 lg:row-span-2 lg:row-start-1">
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xl sm:p-8 lg:sticky lg:top-32" id="formular">
                <h2 className="text-xl font-bold text-slate-800">{tr('formTitle')}</h2>
                <p className="mb-5 mt-1 text-sm text-gray-600">{tr('formSubtitle')}</p>
                <EmailCodeSignIn
                  language={language}
                  nextPath={nextPath}
                  variant="light"
                  idPrefix="registrace"
                  footer={<FormPrivacyNotice language={language} purpose="account" />}
                />
                <p className="mt-4 text-center text-sm">
                  <Link href={loginHref} className="text-slate-600 underline hover:text-slate-900">
                    {tr('loginLink')}
                  </Link>
                </p>
              </div>
            </aside>

            {/* Benefits */}
            <section className="lg:col-start-1 lg:row-start-2" aria-labelledby="registrace-benefits">
              <h2 id="registrace-benefits" className="mb-5 text-2xl font-bold text-slate-800">{tr('benefitsTitle')}</h2>
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {Array.isArray(benefits) && benefits.map((benefit, index) => {
                  const Icon = BENEFIT_ICONS[index] || Check
                  return (
                    <li key={benefit.title} className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                      <Icon className="mb-3 h-5 w-5 text-[#c78b5a]" aria-hidden="true" />
                      <p className="font-semibold text-slate-800">{benefit.title}</p>
                      <p className="mt-1 text-sm leading-relaxed text-gray-600">{benefit.text}</p>
                    </li>
                  )
                })}
              </ul>
            </section>
          </div>

          {/* FAQ */}
          <section className="mx-auto mt-16 max-w-3xl" aria-labelledby="registrace-faq">
            <h2 id="registrace-faq" className="mb-5 text-2xl font-bold text-slate-800">{tr('faqTitle')}</h2>
            <div className="space-y-3">
              {Array.isArray(faq) && faq.map((item, index) => {
                const isOpen = openFaq === index
                const isLast = index === faq.length - 1
                return (
                  <div
                    key={item.q}
                    className={`overflow-hidden rounded-xl border bg-white transition-all duration-300 ${
                      isOpen ? 'border-slate-200 shadow-md' : 'border-gray-100 shadow-sm hover:border-gray-200'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                      className="flex w-full items-start justify-between gap-4 p-5 text-left md:p-6"
                      aria-expanded={isOpen}
                    >
                      <span className="text-base font-semibold leading-snug text-slate-800 md:text-lg">{item.q}</span>
                      <ChevronDown
                        className={`mt-1 h-5 w-5 flex-shrink-0 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                        aria-hidden="true"
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-6 md:px-6">
                        <p className="text-base leading-[1.75] text-gray-600">
                          {item.a.replace('{email}', CONTACT_EMAIL)}
                          {isLast && (
                            <>
                              {' '}
                              <Link href="/gdpr" className="underline hover:text-slate-900">
                                {tr('faqPrivacyLink')}
                              </Link>
                              .
                            </>
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        </div>
      </main>

      <Footer language={language} />
    </div>
  )
}

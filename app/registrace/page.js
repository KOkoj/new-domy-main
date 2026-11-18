'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Heart, Search, MessageSquare, ClipboardList, Check, ChevronDown, MailWarning } from 'lucide-react'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import PasswordAuthForm from '@/components/auth/PasswordAuthForm'
import { t } from '@/lib/translations'
import { getSafeRedirectPath } from '@/lib/safeRedirect'
import { DEFAULT_LANGUAGE, readLanguageFromBrowser } from '@/lib/userPreferences'

// Sender of the password e-mails (Resend, lib/passwordEmail.js) and the
// contact for account removal.
const AUTH_EMAIL_SENDER = 'info@domyvitalii.cz'
const CONTACT_EMAIL = 'info@domyvitalii.cz'

const BENEFIT_ICONS = [Heart, Search, MessageSquare, ClipboardList]

// Figma 1a (desktop): form on the left; eyebrow, title and the four benefits
// on the right; steps + "E-mail nepřišel?" and FAQ below.
// Figma 1b (mobile): eyebrow, title, form, benefits, steps, FAQ.
export default function RegistrationPage() {
  const [language, setLanguage] = useState(DEFAULT_LANGUAGE)
  const [nextPath, setNextPath] = useState('/dashboard')
  const [openFaq, setOpenFaq] = useState(0)

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

  return (
    <div className="site-page min-h-screen bg-[#f7f4ed]">
      <Navigation />

      <main className="pb-16 pt-32 sm:pt-40">
        <div className="container mx-auto max-w-6xl px-5 sm:px-6">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)] lg:gap-14">
            <header className="lg:col-start-2 lg:row-start-1" data-testid="registrace-header">
              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.12em] text-[#c78b5a]">{tr('eyebrow')}</p>
              <h1 className="text-pretty">{tr('title')}</h1>
            </header>

            {/* Form */}
            <div className="lg:col-start-1 lg:row-span-2 lg:row-start-1">
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xl sm:p-8" id="formular">
                <PasswordAuthForm
                  language={language}
                  nextPath={nextPath}
                  variant="light"
                  idPrefix="registrace"
                  initialMode="register"
                />
              </div>
            </div>

            {/* Benefits */}
            <section className="lg:col-start-2 lg:row-start-2" aria-labelledby="registrace-benefits">
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

          {/* Steps */}
          <section className="mx-auto mt-16 max-w-3xl" aria-labelledby="registrace-steps">
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

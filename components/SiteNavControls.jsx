'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'

const MENU_EVENT = 'site-nav-menu'

function text(language, cs, it, en) {
  if (language === 'cs') return cs
  if (language === 'it') return it
  return en
}

export function getSiteNav(language) {
  return [
    { type: 'link', href: '/', label: text(language, 'Domů', 'Casa', 'Home'), testId: 'home' },
    { type: 'link', href: '/properties', label: text(language, 'Nemovitosti', 'Proprietà', 'Properties'), testId: 'properties' },
    { type: 'link', href: '/regions', label: text(language, 'Regiony', 'Regioni', 'Regions'), testId: 'regions' },
    { type: 'link', href: '/process', label: text(language, 'Náš proces', 'Il nostro processo', 'Our Process'), testId: 'process' },
    {
      type: 'group',
      id: 'guide',
      label: text(language, 'Průvodce', 'Guida', 'Guide'),
      items: [
        { href: '/blog', label: text(language, 'Články', 'Articoli', 'Articles'), testId: 'blog' },
        { href: '/faq', label: 'FAQ', testId: 'faq' },
      ],
    },
    {
      type: 'group',
      id: 'about',
      label: text(language, 'O nás', 'Chi siamo', 'About'),
      items: [
        { href: '/about', label: text(language, 'O nás', 'Chi siamo', 'About'), testId: 'about' },
        { href: '/reference', label: text(language, 'Reference', 'Referenze', 'References'), testId: 'reference' },
      ],
    },
    { type: 'link', href: '/contact', label: text(language, 'Kontakt', 'Contatto', 'Contact'), testId: 'contact' },
  ]
}

function useExclusiveMenu(id) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const closeTimer = useRef(null)

  const setOpenExclusive = (next) => {
    setOpen(next)
    if (next) window.dispatchEvent(new CustomEvent(MENU_EVENT, { detail: id }))
  }

  useEffect(() => {
    const onOther = (event) => {
      if (event.detail !== id) setOpen(false)
    }
    const onPointer = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false)
    }
    const onKey = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener(MENU_EVENT, onOther)
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      clearTimeout(closeTimer.current)
      window.removeEventListener(MENU_EVENT, onOther)
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [id])

  const openNow = () => {
    clearTimeout(closeTimer.current)
    setOpenExclusive(true)
  }

  const scheduleClose = () => {
    clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => setOpen(false), 140)
  }

  return { open, setOpen: setOpenExclusive, ref, openNow, scheduleClose }
}

function linkClass(active, tone) {
  if (active) return 'text-white'
  return tone === 'hero' ? 'text-white/80 hover:text-white' : 'text-gray-300 hover:text-white'
}

function NavGroup({ group, isActive, tone, testIdPrefix }) {
  const menu = useExclusiveMenu(`nav-${testIdPrefix}${group.id}`)
  const active = group.items.some((item) => isActive(item.href))

  return (
    <div
      ref={menu.ref}
      className="relative"
      onMouseEnter={menu.openNow}
      onMouseLeave={menu.scheduleClose}
    >
      <button
        type="button"
        className={`relative inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap px-2 py-2 text-base font-medium leading-none transition-colors ${linkClass(active, tone)}`}
        aria-expanded={menu.open}
        aria-haspopup="menu"
        onClick={() => menu.setOpen(!menu.open)}
      >
        {group.label}
        <ChevronDown className={`h-6 w-6 shrink-0 transition-transform duration-200 ${menu.open ? 'rotate-180' : ''}`} />
        {active && <span className="absolute -bottom-0.5 left-2 right-2 h-0.5 rounded-full bg-copper-400" />}
      </button>
      {menu.open && (
        <div className="absolute left-0 top-full z-50 pt-3">
          <div className="flex min-w-[11rem] flex-col gap-0.5 rounded-2xl border-0 bg-white p-1.5 shadow-[0_18px_40px_rgba(8,14,32,0.22)]" role="menu">
            {group.items.map((item) => {
              const activeItem = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  role="menuitem"
                  className={`block whitespace-nowrap rounded-xl px-3.5 py-2 text-base font-medium transition-colors ${
                    activeItem
                      ? 'bg-[#f6f1ea] text-[#0e152e] shadow-[inset_2px_0_0_0_#c48759]'
                      : 'text-[#0e152e] hover:bg-[#f6f1ea]'
                  }`}
                  aria-current={activeItem ? 'page' : undefined}
                  data-testid={testIdPrefix ? `${testIdPrefix}${item.testId}-link` : undefined}
                  onClick={() => menu.setOpen(false)}
                >
                  {item.label}
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export function SiteNavMenu({ language, isActive, tone = 'bar', testIdPrefix = '', className = '' }) {
  const items = getSiteNav(language)
  const Tag = tone === 'hero' ? 'nav' : 'div'

  return (
    <Tag className={`w-max shrink-0 gap-3 ${className}`} data-testid={tone === 'hero' ? 'hero-nav' : 'nav-desktop-links'}>
      {items.map((item) => (
        item.type === 'group' ? (
          <NavGroup key={item.id} group={item} isActive={isActive} tone={tone} testIdPrefix={testIdPrefix} />
        ) : (
          <Link
            key={item.href}
            href={item.href}
            className={`relative whitespace-nowrap px-2 py-2 text-base font-medium leading-none transition-colors ${linkClass(isActive(item.href), tone)}`}
            aria-current={isActive(item.href) ? 'page' : undefined}
            data-testid={testIdPrefix ? `${testIdPrefix}${item.testId}-link` : undefined}
          >
            {item.label}
            {isActive(item.href) && (
              <span className="absolute -bottom-0.5 left-2 right-2 h-0.5 rounded-full bg-copper-400" />
            )}
          </Link>
        )
      ))}
    </Tag>
  )
}

const LANGUAGE_OPTIONS = [
  { id: 'cs', label: 'Čeština' },
  { id: 'en', label: 'English' },
  { id: 'it', label: 'Italiano' },
]

export function LanguageMenu({ language, onChange, testIdPrefix, className = '' }) {
  const menu = useExclusiveMenu(`language-${testIdPrefix}`)
  const current = LANGUAGE_OPTIONS.find((option) => option.id === language) || LANGUAGE_OPTIONS[0]

  return (
    <div ref={menu.ref} className={`relative ${className}`}>
      <button
        type="button"
        className="inline-flex items-center gap-1.5 rounded-full border-0 bg-white/10 px-3 py-2 text-base font-medium leading-none text-white transition-colors hover:bg-white/20"
        aria-label={current.label}
        aria-haspopup="listbox"
        aria-expanded={menu.open}
        onClick={() => menu.setOpen(!menu.open)}
        data-testid={`${testIdPrefix}button`}
      >
        <span>{language.toUpperCase()}</span>
        <ChevronDown className={`h-5 w-5 shrink-0 transition-transform duration-200 ${menu.open ? 'rotate-180' : ''}`} />
      </button>
      {menu.open && (
        <div className="absolute right-0 top-full z-50 pt-3">
          <div className="flex min-w-[11rem] flex-col gap-0.5 rounded-2xl border-0 bg-white p-1.5 shadow-[0_18px_40px_rgba(8,14,32,0.22)]" role="listbox" aria-label={current.label}>
            {LANGUAGE_OPTIONS.map((option) => {
              const selected = option.id === language
              return (
                <button
                  key={option.id}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  className={`block w-full whitespace-nowrap rounded-xl border-0 px-3.5 py-2 text-left text-base font-medium transition-colors ${
                    selected
                      ? 'bg-[#f6f1ea] text-[#0e152e] shadow-[inset_2px_0_0_0_#c48759]'
                      : 'bg-transparent text-[#0e152e] hover:bg-[#f6f1ea]'
                  }`}
                  data-testid={`${testIdPrefix}${option.id}`}
                  onClick={() => {
                    onChange(option.id)
                    menu.setOpen(false)
                  }}
                >
                  {option.label}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

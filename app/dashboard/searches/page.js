'use client'

import { useState } from 'react'
import { CheckCircle } from 'lucide-react'
import ZoneBackLink from '@/components/zone/ZoneBackLink'
import ZoneShell, { ZoneSkeleton } from '@/components/zone/ZoneShell'
import { formatSearchSummary, useZoneData } from '@/components/zone/useZoneData'
import { REGION_LABELS, toRegionSlug } from '@/app/properties/filterConfig'
import { PROPERTY_TYPE_LABELS } from '@/lib/propertyDisplay'

// Figma C "Nastavte, co hledáte": one search per client. Saving updates the
// newest saved search (or creates the first one) through /api/saved-searches;
// the summary then shows in the sidebar under "Vaše hledání".

const REGION_OPTIONS = Object.entries(REGION_LABELS)
  .map(([slug, labels]) => ({ slug, label: labels.cs }))
  .sort((a, b) => a.label.localeCompare(b.label, 'cs'))

const TYPE_OPTIONS = ['house', 'villa', 'apartment'].map((value) => ({
  value,
  label: PROPERTY_TYPE_LABELS[value].cs
}))

function regionSlugFromFilters(filters) {
  if (!filters) return ''
  const fromSlug = toRegionSlug(filters.region || '')
  if (fromSlug && REGION_LABELS[fromSlug]) return fromSlug
  const location = String(filters.location || '').trim().toLowerCase()
  if (!location) return ''
  const match = Object.entries(REGION_LABELS).find(([, labels]) =>
    [labels.cs, labels.en, labels.it].some((label) => String(label).toLowerCase() === location)
  )
  return match ? match[0] : ''
}

const digitsOnly = (value) => String(value ?? '').replace(/\D/g, '').slice(0, 10)
const formatAmount = (digits) => (digits ? Number(digits).toLocaleString('cs-CZ') : '')

async function saveSearchRequest(existing, payload) {
  const response = await fetch('/api/saved-searches', {
    method: existing ? 'PATCH' : 'POST',
    cache: 'no-store',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(existing ? { id: existing.id, ...payload } : payload)
  })
  const body = await response.json().catch(() => ({}))
  if (!response.ok || !body?.search) throw new Error(body?.error || `HTTP ${response.status}`)
  return body.search
}

function Chip({ selected, onClick, children, testId }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      data-testid={testId}
      className={`rounded-full border px-3.5 py-1.5 text-[14px] transition ${
        selected
          ? 'border-[#c78b5a] bg-[#fdf6ef] text-[#a8642f]'
          : 'border-[#e3ddd2] bg-white text-[#1b2333] hover:border-[#c9bfae]'
      }`}
    >
      {children}
    </button>
  )
}

function SearchForm({ savedSearch, onSaved }) {
  const initial = savedSearch?.filters || {}
  const [region, setRegion] = useState(() => regionSlugFromFilters(initial))
  const [maxPrice, setMaxPrice] = useState(() => digitsOnly(initial.maxPrice))
  const [type, setType] = useState(() => (PROPERTY_TYPE_LABELS[initial.type] ? initial.type : ''))
  const [status, setStatus] = useState(null)

  const filters = {
    location: region ? REGION_LABELS[region].cs : '',
    region,
    maxPrice: maxPrice ? Number(maxPrice) : '',
    type
  }
  const summary = formatSearchSummary(filters)
  const changed = () => setStatus(null)

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!summary || status === 'saving') return
    setStatus('saving')
    try {
      // Criteria the old form stored (bedrooms, minPrice…) are kept as they were.
      const saved = await saveSearchRequest(savedSearch, {
        name: summary,
        filters: { ...(savedSearch?.filters || {}), ...filters }
      })
      setStatus('saved')
      onSaved(saved)
    } catch (error) {
      console.error('Saved search save failed:', error)
      setStatus('error')
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-7 space-y-6 rounded-2xl border border-[#ebe5da] bg-white p-6 sm:p-8"
      data-testid="zone-search-form"
    >
      <fieldset>
        <legend className="text-[15px] font-medium text-[#1b2333]">Region</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {REGION_OPTIONS.map((option) => (
            <Chip
              key={option.slug}
              selected={region === option.slug}
              testId={`zone-search-region-${option.slug}`}
              onClick={() => {
                setRegion((current) => (current === option.slug ? '' : option.slug))
                changed()
              }}
            >
              {option.label}
            </Chip>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="zone-search-max-price" className="text-[15px] font-medium text-[#1b2333]">
          Maximální cena
        </label>
        <div className="relative mt-2">
          <input
            id="zone-search-max-price"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={formatAmount(maxPrice)}
            onChange={(event) => {
              setMaxPrice(digitsOnly(event.target.value))
              changed()
            }}
            className="h-11 w-full rounded-lg border border-[#e3ddd2] bg-white px-3.5 pr-10 text-[15px] text-[#1b2333] outline-none focus:border-[#c78b5a] focus:ring-2 focus:ring-[#c78b5a]/20"
          />
          <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[15px] text-gray-500" aria-hidden="true">
            €
          </span>
        </div>
      </div>

      <fieldset>
        <legend className="text-[15px] font-medium text-[#1b2333]">Typ nemovitosti</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {TYPE_OPTIONS.map((option) => (
            <Chip
              key={option.value}
              selected={type === option.value}
              testId={`zone-search-type-${option.value}`}
              onClick={() => {
                setType((current) => (current === option.value ? '' : option.value))
                changed()
              }}
            >
              {option.label}
            </Chip>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        <button
          type="submit"
          disabled={!summary || status === 'saving'}
          className="h-11 w-full rounded-lg bg-[#2d5a27] px-8 text-[15px] font-medium text-white transition hover:bg-[#234a1f] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-[240px]"
          data-testid="zone-search-save"
        >
          {status === 'saving' ? 'Ukládáme...' : 'Uložit hledání'}
        </button>
        {status === 'saved' ? (
          <span role="status" className="flex items-center gap-1.5 text-[14px] font-medium text-[#2d5a27]" data-testid="zone-search-saved">
            <CheckCircle className="h-4 w-4" aria-hidden="true" />
            Uloženo
          </span>
        ) : null}
        {status === 'error' ? (
          <span role="alert" className="text-[14px] text-red-700" data-testid="zone-search-error">
            Vyhledávání se nepodařilo uložit. Zkuste to prosím znovu.
          </span>
        ) : null}
      </div>
    </form>
  )
}

export default function ZoneSearchPage() {
  const data = useZoneData()

  if (data.loading) {
    return (
      <ZoneShell data={data}>
        <ZoneSkeleton variant="form" />
      </ZoneShell>
    )
  }

  return (
    <ZoneShell data={data}>
      <div className="max-w-3xl" data-testid="zone-search-page">
        <ZoneBackLink className="-mt-2 mb-3" />
        <h1 className="text-[32px] font-bold leading-tight text-[#1b2333] sm:text-[38px]">Nastavte, co hledáte</h1>
        <SearchForm
          key={data.user?.id || 'anon'}
          savedSearch={data.savedSearch}
          onSaved={(savedSearch) => data.update({ savedSearch })}
        />
      </div>
    </ZoneShell>
  )
}

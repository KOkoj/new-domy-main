'use client'

import Link from 'next/link'
import ZoneSidebar from './ZoneSidebar'
import { formatListedAt, formatPrice } from './useZoneData'

// Centered 1344px layout: main column (thread) + sticky ~340px sidebar.
// On mobile the contact sidebar stacks above the thread.
export default function ZoneShell({ data, children }) {
  return (
    <div className="mx-auto w-full max-w-[1344px] px-4 pb-16 pt-8 sm:px-6 lg:pt-12" data-testid="zone-shell">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-12">
        <aside className="order-first lg:order-last lg:sticky lg:top-28 lg:w-[340px] lg:flex-shrink-0">
          <ZoneSidebar savedCount={data.savedHouses.length} savedSearch={data.savedSearch} />
        </aside>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  )
}

export function StatusBadge({ status }) {
  if (status !== 'reserved' && status !== 'sold') return null
  return (
    <span className="inline-block rounded-full border border-[#ecd3bd] bg-[#fdf6ef] px-2.5 py-0.5 text-[12px] text-[#a8642f]">
      {status === 'sold' ? 'Prodáno' : 'Rezervováno'}
    </span>
  )
}

export function houseHref(house) {
  return house.slug ? `/properties/${house.slug}` : '/properties'
}

// Row card used inside thread items.
export function HouseRow({ house }) {
  return (
    <Link
      href={houseHref(house)}
      className="flex gap-4 rounded-xl border border-[#ebe5da] bg-white p-2.5 transition hover:border-[#d9cfbf]"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={house.image} alt="" loading="lazy" className="h-[84px] w-[116px] flex-shrink-0 rounded-lg object-cover sm:h-[84px]" />
      <div className="min-w-0 py-0.5">
        <p className="text-[15px] font-medium leading-snug text-[#1b2333]">{house.title}</p>
        {house.region ? <p className="mt-1 text-[12.5px] text-gray-500">{house.region}</p> : null}
        {house.price ? <p className="mt-1 text-[14px] font-semibold text-[#1b2333]">{formatPrice(house.price, house.currency)}</p> : null}
        {house.listedAt ? <p className="mt-1 text-[12px] text-gray-400">{formatListedAt(house.listedAt)}</p> : null}
      </div>
    </Link>
  )
}

// Shown immediately while the zone data loads: real layout + sidebar, grey
// placeholders in the main column (no spinner-only screen).
export function ZoneSkeleton({ variant = 'thread' }) {
  return (
    <div className="animate-pulse" data-testid="zone-skeleton" aria-busy="true">
      <div className="h-9 w-64 rounded-lg bg-[#ebe5da] sm:h-10" />
      {variant === 'grid' ? (
        <div className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="overflow-hidden rounded-xl border border-[#ebe5da] bg-white">
              <div className="h-[180px] bg-[#f1ece3]" />
              <div className="space-y-2 p-4">
                <div className="h-4 w-3/4 rounded bg-[#f1ece3]" />
                <div className="h-4 w-1/3 rounded bg-[#f1ece3]" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex gap-4 rounded-xl border border-[#ebe5da] bg-white p-2.5">
              <div className="h-[84px] w-[116px] flex-shrink-0 rounded-lg bg-[#f1ece3]" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 w-2/3 rounded bg-[#f1ece3]" />
                <div className="h-3 w-1/3 rounded bg-[#f1ece3]" />
                <div className="h-4 w-1/4 rounded bg-[#f1ece3]" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

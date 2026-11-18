'use client'

import Link from 'next/link'
import ZoneShell, { StatusBadge, houseHref } from '@/components/zone/ZoneShell'
import { formatListedAt, formatPrice, useZoneData } from '@/components/zone/useZoneData'

export default function SavedHousesPage() {
  const data = useZoneData()

  if (data.loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#2d5a27]" />
      </div>
    )
  }

  return (
    <ZoneShell data={data}>
      <h1 className="text-[32px] font-bold leading-tight text-[#1b2333] sm:text-[38px]">Uložené domy</h1>

      <div className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2" data-testid="zone-saved-grid">
        {data.savedHouses.map((house) => (
          <Link
            key={house.id}
            href={houseHref(house)}
            className="overflow-hidden rounded-xl border border-[#ebe5da] bg-white transition hover:border-[#d9cfbf]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={house.image} alt="" loading="lazy" className="h-[180px] w-full object-cover" />
            <div className="p-4">
              <p className="text-[15px] font-medium leading-snug text-[#1b2333]">{house.title}</p>
              {house.status === 'reserved' || house.status === 'sold' ? (
                <div className="mt-1.5">
                  <StatusBadge status={house.status} />
                </div>
              ) : null}
              <div className="mt-5">
                {house.region ? <p className="text-[13px] text-gray-500">{house.region}</p> : null}
                {house.price ? (
                  <p className="text-[18px] font-bold text-[#1b2333]">{formatPrice(house.price, house.currency)}</p>
                ) : null}
                {house.listedAt ? <p className="text-[12.5px] text-gray-400">{formatListedAt(house.listedAt)}</p> : null}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </ZoneShell>
  )
}

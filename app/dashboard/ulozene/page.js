'use client'

import Link from 'next/link'
import ZoneBackLink from '@/components/zone/ZoneBackLink'
import ZoneShell, { ZoneSkeleton, StatusBadge, houseHref } from '@/components/zone/ZoneShell'
import { formatListedAt, formatPrice, useZoneData } from '@/components/zone/useZoneData'

export default function SavedHousesPage() {
  const data = useZoneData()

  if (data.loading) {
    return (
      <ZoneShell data={data}>
        <ZoneSkeleton variant="grid" />
      </ZoneShell>
    )
  }

  return (
    <ZoneShell data={data}>
      <ZoneBackLink className="-mt-2 mb-3" />
      <h1 className="text-[32px] font-bold leading-tight text-[#1b2333] sm:text-[38px]">Uložené domy</h1>

      {data.savedHouses.length === 0 ? (
        <section className="mt-7 rounded-2xl border border-[#ebe5da] bg-white p-6 sm:p-8" data-testid="zone-saved-empty">
          <p className="text-[16px] text-gray-600">Zatím nemáte uložené žádné domy.</p>
          <Link
            href="/properties"
            className="mt-5 inline-flex items-center rounded-lg bg-[#2d5a27] px-6 py-3 text-[15px] font-medium text-white transition hover:bg-[#234a1f]"
          >
            Prohlédnout nemovitosti
          </Link>
        </section>
      ) : null}

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

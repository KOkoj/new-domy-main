'use client'

import Link from 'next/link'
import ZoneShell, { ZoneSkeleton, HouseRow, StatusBadge, houseHref } from '@/components/zone/ZoneShell'
import { TeamAvatars } from '@/components/zone/ZoneSidebar'
import { useZoneData } from '@/components/zone/useZoneData'

function SavedStrip({ houses }) {
  return (
    <section className="mt-8" data-testid="zone-saved-strip">
      <div className="mb-3 flex items-baseline justify-between gap-4">
        <Link href="/dashboard/ulozene" className="text-[17px] font-semibold text-[#1b2333] hover:underline">
          Vaše uložené domy ({houses.length})
        </Link>
        <Link
          href="/dashboard/searches"
          className="flex-shrink-0 text-[15px] font-medium text-[#a8642f] underline-offset-4 hover:underline"
          data-testid="zone-saved-search-link"
        >
          Nastavit hledání
        </Link>
      </div>
      {/* Cards in a row stretch to the tallest one; titles wrap in full. */}
      <div className="-mx-4 flex items-stretch gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
        {houses.map((house) => (
          <Link
            key={house.id}
            href={houseHref(house)}
            className="flex w-[160px] flex-shrink-0 flex-col overflow-hidden rounded-lg border border-[#ebe5da] bg-white transition hover:border-[#d9cfbf]"
            data-testid="zone-saved-strip-card"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={house.image} alt="" loading="lazy" className="h-[96px] w-full flex-shrink-0 object-cover" />
            <div className="flex-1 p-2.5">
              <p className="break-words text-[12.5px] leading-snug text-[#1b2333] [hyphens:auto]" lang="cs">{house.title}</p>
              {house.price ? (
                <p className="mt-1 text-[12px] text-gray-600">{Number(house.price).toLocaleString('cs-CZ')} €</p>
              ) : null}
              {house.status === 'reserved' || house.status === 'sold' ? (
                <div className="mt-1.5">
                  <StatusBadge status={house.status} />
                </div>
              ) : null}
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

function UnavailableCard({ house }) {
  const sold = house.status === 'sold'
  return (
    <article className="rounded-2xl border border-[#ebe5da] bg-white p-5 sm:p-6" data-testid="zone-thread-unavailable">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <TeamAvatars size={34} />
          <p className="text-[14px] text-[#1b2333]">Lucie a Luca</p>
        </div>
        <StatusBadge status={house.status} />
      </div>
      <h2 className="mt-4 text-[18px] font-semibold text-[#1b2333]">
        {sold ? 'Dům, který máte uložený, je prodaný' : 'Dům, který máte uložený, je rezervovaný'}
      </h2>
      <p className="mt-2 text-[14.5px] text-gray-600">
        {house.title} už není volný. Pokud chcete, pomůžeme vám najít podobný.
      </p>
      <div className="mt-4">
        <HouseRow house={house} />
      </div>
    </article>
  )
}

function WelcomeCard() {
  return (
    <section className="rounded-2xl border border-[#ebe5da] bg-white p-6 sm:p-8" data-testid="zone-welcome">
      <h2 className="text-[28px] font-bold leading-tight text-[#1b2333] sm:text-[34px]">Nastavte, co hledáte</h2>
      <p className="mt-4 text-[16px] text-gray-600">
        Zatím tu nic není. Prohlédněte si nabídku a domy, které se vám líbí, si uložte srdíčkem. Uvidíte je tady a Lucie s Lucou vám k nim rádi poradí.
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
        <Link
          href="/properties"
          className="inline-flex items-center rounded-lg bg-[#2d5a27] px-6 py-3 text-[15px] font-medium text-white transition hover:bg-[#234a1f]"
          data-testid="zone-welcome-properties"
        >
          Prohlédnout nemovitosti
        </Link>
        <Link
          href="/dashboard/searches"
          className="text-[15px] font-medium text-[#1b2333] underline-offset-4 hover:underline"
          data-testid="zone-welcome-search"
        >
          Nastavit hledání
        </Link>
      </div>
    </section>
  )
}

export default function DashboardThread() {
  const data = useZoneData()

  if (data.loading) {
    return (
      <ZoneShell data={data}>
        <ZoneSkeleton variant="thread" />
      </ZoneShell>
    )
  }

  const isNewUser = !data.savedSearch && data.savedHouses.length === 0
  const unavailable = data.savedHouses
    .filter((house) => house.status === 'reserved' || house.status === 'sold')
    .sort((a, b) => String(b.savedAt || '').localeCompare(String(a.savedAt || '')))

  return (
    <ZoneShell data={data}>
      <header>
        <h1 className="text-[32px] font-bold leading-tight text-[#1b2333] sm:text-[38px]">
          {data.firstName ? `Dobrý den, ${data.firstName}` : 'Dobrý den'}
        </h1>
      </header>

      {isNewUser ? (
        <div className="mt-8">
          <WelcomeCard />
        </div>
      ) : (
        <>
          {data.savedHouses.length > 0 ? <SavedStrip houses={data.savedHouses} /> : null}
          {unavailable.length > 0 ? (
            <div className="mt-8 space-y-5" data-testid="zone-thread">
              {unavailable.map((house) => (
                <UnavailableCard key={house.id} house={house} />
              ))}
            </div>
          ) : null}
        </>
      )}

      {data.hasPurchases ? (
        <p className="mt-8 text-[14px]" data-testid="zone-purchases">
          <Link href="/premium" className="text-[#1b2333] hover:underline">
            Vaše zakoupené materiály
          </Link>
        </p>
      ) : null}
    </ZoneShell>
  )
}

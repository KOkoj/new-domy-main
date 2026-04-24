import Link from 'next/link'

export const metadata = {
  title: 'Stand-by | Domy v Italii',
  description: 'Web je dočasně nedostupný, zatímco dokončujeme finální úpravy.',
  robots: {
    index: false,
    follow: false
  }
}

export default function MaintenancePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 py-16 text-center">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-copper-300">
          Dočasný režim stand-by
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          Dokončujeme nový web.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
          Domy v Itálii jsou dočasně nedostupné, zatímco dokončujeme finální obsah, SEO a kontrolu před
          spuštěním. Web bude brzy znovu dostupný.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-sm text-slate-300">
          <a
            href="mailto:info@domyvitalii.cz"
            className="rounded-md border border-white/15 px-4 py-2 transition hover:border-copper-300 hover:text-white"
          >
            info@domyvitalii.cz
          </a>
          <Link
            href="/admin"
            className="rounded-md border border-white/15 px-4 py-2 transition hover:border-copper-300 hover:text-white"
          >
            Admin
          </Link>
        </div>
      </div>
    </main>
  )
}

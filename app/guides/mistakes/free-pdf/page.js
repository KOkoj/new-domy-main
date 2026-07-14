import Link from 'next/link'
import { ArrowLeft, CheckCircle2, FileText } from 'lucide-react'
import EmailGateModal from '@/components/EmailGateModal'
import Footer from '@/components/Footer'
import Navigation from '@/components/Navigation'
import InformationalDisclaimer from '@/components/legal/InformationalDisclaimer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function MistakesFreePdfPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f7f4ed] via-amber-50/20 to-slate-50">
      <Navigation />
      <main className="mx-auto max-w-2xl px-6 pb-20 pt-32">
        <Link
          href="/guides/mistakes"
          className="mb-6 inline-flex items-center gap-2 text-sm text-slate-700 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Zpět na celý článek pro členy Klubu
        </Link>

        <Card className="border-slate-200 bg-white/95 shadow-lg">
          <CardHeader>
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
              <FileText className="h-3.5 w-3.5" />
              PDF zdarma
            </div>
            <CardTitle className="mt-3 text-2xl font-bold text-slate-900">
              Nejčastější chyby při koupi nemovitosti v Itálii
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="leading-relaxed text-slate-700">
              Stručný praktický přehled, který vám pomůže odhalit rizika dřív, než se z nich stanou drahé problémy.
            </p>
            <ul className="space-y-3 text-sm text-slate-700">
              {[
                'náklady, které kupující často přehlédnou',
                'právní a technické kontroly před podpisem',
                'praktické kroky pro bezpečnější rozhodování'
              ].map((benefit) => (
                <li key={benefit} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>

            <EmailGateModal source="pdf_mistakes" assetKey="mistakes" />
            <InformationalDisclaimer language="cs" variant="pdf" />
          </CardContent>
        </Card>
      </main>
      <Footer language="cs" />
    </div>
  )
}

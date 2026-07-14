import Link from 'next/link'
import { FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { getLeadAssetByKey } from '@/lib/leadAssets'
import { getLeadMagnetCopy } from '@/lib/leadMagnetCopy'

export default function LeadMagnetBanner({ assetKey = 'mistakes', language = 'cs', className = '' }) {
  const asset = getLeadAssetByKey(assetKey)
  const copy = getLeadMagnetCopy(assetKey, language)

  if (!asset || !copy) return null

  return (
    <Card className={`border-blue-200 bg-blue-50 ${className}`.trim()}>
      <CardContent className="p-6 md:p-8">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-3 py-1 text-xs font-medium text-blue-800">
          <FileText className="h-3.5 w-3.5" aria-hidden="true" />
          PDF
        </div>
        <p className="mb-3 text-lg font-semibold leading-relaxed text-blue-900">{copy.headline}</p>
        <p className="mb-5 leading-relaxed text-blue-800/90">{copy.description}</p>
        <Button
          asChild
          className="border border-blue-400/40 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm hover:from-blue-500 hover:to-indigo-500"
        >
          <Link href={asset.landingPath}>{copy.cta}</Link>
        </Button>
      </CardContent>
    </Card>
  )
}

'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { PROPERTY_IMAGE_FALLBACK } from '@/lib/getPropertyImage'

/**
 * Wrapper around next/image for property photos.
 *
 * Two important deviations from a plain <Image>:
 *
 * 1. `unoptimized` is forced on. Property images come from a high-volume mix
 *    of Idealista/im-cdn.it CDN URLs and self-hosted /uploads paths. Routing
 *    them through Vercel's Image Optimization endpoint exhausts the project's
 *    transformation quota almost instantly (one gallery render = dozens of
 *    transformations) and the optimizer then returns 402 Payment Required for
 *    every subsequent request, including local /uploads files. Bypassing the
 *    optimizer keeps the gallery loading reliably; we trade off responsive
 *    srcset for a working hero, which is the right trade for this site.
 *
 * 2. On load failure we swap to a generic fallback URL and notify the parent
 *    via `onUpstreamError`, so a containing gallery can mark the slot as bad
 *    and keep every renderer of that slot (hero, thumbnails, lightbox) in
 *    sync — the previous bug where the hero showed the fallback while the
 *    lightbox still tried the dead URL is impossible once the parent owns
 *    that state.
 */
export default function PropertyImage({
  src,
  fallbackSrc = PROPERTY_IMAGE_FALLBACK,
  alt = '',
  onUpstreamError,
  unoptimized = true,
  ...props
}) {
  const initialSrc = src || fallbackSrc
  const [currentSrc, setCurrentSrc] = useState(initialSrc)

  useEffect(() => {
    setCurrentSrc(src || fallbackSrc)
  }, [src, fallbackSrc])

  return (
    <Image
      {...props}
      src={currentSrc}
      alt={alt}
      unoptimized={unoptimized}
      onError={() => {
        if (currentSrc === fallbackSrc) return
        setCurrentSrc(fallbackSrc)
        if (typeof onUpstreamError === 'function') {
          onUpstreamError()
        }
      }}
    />
  )
}

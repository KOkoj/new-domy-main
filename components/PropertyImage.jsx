'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

/**
 * Wrapper around next/image for property photos.
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
 * 2. On load failure we do not swap in a stock photo. The slot becomes a
 *    clean empty tile and the parent is notified via `onUpstreamError`, so a
 *    gallery can drop the dead URL and show the next real photo — or an
 *    empty state when none remain.
 */
export default function PropertyImage({
  src,
  fallbackSrc = null,
  alt = '',
  onUpstreamError,
  unoptimized = true,
  className,
  ...props
}) {
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setFailed(false)
  }, [src, fallbackSrc])

  const currentSrc = (!failed && src) || fallbackSrc || null

  if (!currentSrc) {
    return (
      <div
        className={className}
        data-testid="property-image-empty"
        aria-hidden="true"
        style={props.fill ? { position: 'absolute', inset: 0 } : undefined}
      />
    )
  }

  return (
    <Image
      {...props}
      className={className}
      src={currentSrc}
      alt={alt}
      unoptimized={unoptimized}
      onError={() => {
        setFailed(true)
        if (typeof onUpstreamError === 'function') {
          onUpstreamError()
        }
      }}
    />
  )
}

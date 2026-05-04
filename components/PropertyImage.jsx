'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { PROPERTY_IMAGE_FALLBACK } from '@/lib/getPropertyImage'

/**
 * Wrapper around next/image that transparently swaps to a fallback URL when
 * the upstream image 404s, hotlink-blocks, or otherwise fails to load. Used in
 * property cards and galleries so dead CDN URLs never leave a blank slot.
 *
 * Behaviour on failure:
 *   1. First failure on the original src → retry once with a cache-busting
 *      query param. External CDNs (im-cdn.it, idealista) and the Next.js image
 *      optimizer will both occasionally hiccup on the first hit, especially
 *      when the request was emitted as a `priority` preload before hydration;
 *      a fresh request usually succeeds.
 *   2. Retry also failed → fall back to PROPERTY_IMAGE_FALLBACK and call
 *      `onUpstreamError` so the parent (e.g. ImageGallery) can keep the rest
 *      of the UI in sync (so the hero and the lightbox at the same index
 *      don't disagree about whether that slot is showing the fallback).
 */
export default function PropertyImage({
  src,
  fallbackSrc = PROPERTY_IMAGE_FALLBACK,
  alt = '',
  onUpstreamError,
  ...props
}) {
  const initialSrc = src || fallbackSrc
  const [currentSrc, setCurrentSrc] = useState(initialSrc)
  const attemptRef = useRef(0)

  useEffect(() => {
    setCurrentSrc(src || fallbackSrc)
    attemptRef.current = 0
  }, [src, fallbackSrc])

  return (
    <Image
      {...props}
      src={currentSrc}
      alt={alt}
      onError={() => {
        if (currentSrc === fallbackSrc) return

        if (attemptRef.current === 0 && src) {
          attemptRef.current = 1
          const sep = src.includes('?') ? '&' : '?'
          setCurrentSrc(`${src}${sep}_pi_retry=1`)
          return
        }

        setCurrentSrc(fallbackSrc)
        if (typeof onUpstreamError === 'function') {
          onUpstreamError()
        }
      }}
    />
  )
}

'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { PROPERTY_IMAGE_FALLBACK } from '@/lib/getPropertyImage'

/**
 * Wrapper around next/image that transparently swaps to a fallback URL when
 * the upstream image 404s, hotlink-blocks, or otherwise fails to load. Used in
 * property cards and galleries so dead CDN URLs never leave a blank slot.
 */
export default function PropertyImage({
  src,
  fallbackSrc = PROPERTY_IMAGE_FALLBACK,
  alt = '',
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
      onError={() => {
        if (currentSrc !== fallbackSrc) {
          setCurrentSrc(fallbackSrc)
        }
      }}
    />
  )
}

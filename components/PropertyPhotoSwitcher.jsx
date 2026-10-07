'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import PropertyImage from '@/components/PropertyImage';

const LABELS = {
  cs: { previous: 'Předchozí fotka', next: 'Další fotka' },
  en: { previous: 'Previous photo', next: 'Next photo' },
  it: { previous: 'Foto precedente', next: 'Foto successiva' },
}

function preload(src) {
  if (!src || typeof window === 'undefined') return
  const image = new window.Image()
  image.decoding = 'async'
  image.src = src
}

export default function PropertyPhotoSwitcher({
  photos = [],
  alt = '',
  href,
  onActivate,
  language = 'cs',
  reveal = 'hover',
  children,
  imageTestId = 'property-image',
}) {
  const list = photos.filter(Boolean)
  const [index, setIndex] = useState(0)
  const photoKey = list.join('|')
  useEffect(() => {
    setIndex(0)
  }, [photoKey])
  const safeIndex = list.length ? index % list.length : 0
  const multiple = list.length > 1
  const labels = LABELS[language] || LABELS.en
  const arrowsHidden = reveal === 'hover'
    ? 'pointer-events-none opacity-0 [@media(hover:hover)]:group-hover:pointer-events-auto [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:none)]:pointer-events-auto [@media(hover:none)]:opacity-100'
    : 'pointer-events-auto opacity-100'

  const step = (direction, event) => {
    event.preventDefault()
    event.stopPropagation()
    if (!multiple) return
    const nextIndex = (safeIndex + direction + list.length) % list.length
    setIndex(nextIndex)
    preload(list[(nextIndex + direction + list.length) % list.length])
  }

  return (
    <div
      className="relative aspect-[4/3] overflow-hidden"
      data-testid="property-image-container"
      onMouseEnter={() => {
        if (multiple) preload(list[(safeIndex + 1) % list.length])
      }}
    >
      <PropertyImage
        src={list[safeIndex]}
        alt={alt}
        fill
        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        className="object-cover"
        data-testid={imageTestId}
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-2/5"
        style={{ background: 'linear-gradient(to bottom, rgba(14,21,46,0.34) 0%, rgba(14,21,46,0.08) 55%, rgba(14,21,46,0) 100%)' }}
        aria-hidden="true"
      />
      {children}
      {href ? (
        <Link href={href} tabIndex={-1} aria-hidden className="absolute inset-0 z-10" />
      ) : null}
      {onActivate ? (
        <button
          type="button"
          tabIndex={-1}
          aria-hidden
          onClick={onActivate}
          className="absolute inset-0 z-10"
        />
      ) : null}
      {multiple ? (
        <>
          <button
            type="button"
            aria-label={labels.previous}
            onClick={(event) => step(-1, event)}
            className={`absolute left-2 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[#0e152e] shadow-[0_4px_14px_rgba(14,21,46,0.16)] transition-[opacity,background-color] duration-300 ease-out hover:bg-[#f6f1ea] ${arrowsHidden}`}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label={labels.next}
            onClick={(event) => step(1, event)}
            className={`absolute right-2 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[#0e152e] shadow-[0_4px_14px_rgba(14,21,46,0.16)] transition-[opacity,background-color] duration-300 ease-out hover:bg-[#f6f1ea] ${arrowsHidden}`}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </>
      ) : null}
    </div>
  )
}

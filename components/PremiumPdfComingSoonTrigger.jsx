'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

const COPY = {
  it: {
    title: 'Disponibile prossimamente',
    message: 'I PDF premium non sono ancora disponibili. Torna presto per accedere ai nuovi materiali.',
    close: 'Chiudi'
  },
  en: {
    title: 'Available soon',
    message: 'Premium PDFs are not available yet. Please come back soon to access the new materials.',
    close: 'Close'
  },
  cs: {
    title: 'Brzy dostupné',
    message: 'Prémiové PDF zatím nejsou dostupné. Vraťte se brzy pro nové materiály.',
    close: 'Zavřít'
  }
}

export default function PremiumPdfComingSoonTrigger({
  language = 'it',
  children,
  className = '',
  disabled = false,
  type = 'button'
}) {
  const [open, setOpen] = useState(false)
  const copy = COPY[language] || COPY.it

  return (
    <>
      <button
        type={type}
        className={className}
        disabled={disabled}
        onClick={(event) => {
          event.preventDefault()
          setOpen(true)
        }}
      >
        {children}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">
              {copy.title}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-slate-700 leading-relaxed">{copy.message}</p>
            <Button
              type="button"
              onClick={() => setOpen(false)}
              className="bg-slate-900 hover:bg-slate-800 text-white"
            >
              {copy.close}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

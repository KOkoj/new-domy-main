'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

export default function Error({ error, reset }) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Club section error:', error)
  }, [error])

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mb-6">
        <AlertCircle className="h-8 w-8 text-red-500" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">Something went wrong!</h2>
      <p className="text-gray-400 mb-6 max-w-md">
        We encountered an error while loading the Club section. This might be caused by a browser extension or a temporary connection issue.
      </p>
      <div className="flex gap-4">
        <Button
          onClick={() => window.location.reload()}
          variant="outline"
          className="border-copper-400/20 text-copper-400 hover:bg-copper-400/10"
        >
          Reload Page
        </Button>
        <Button
          onClick={() => reset()}
          className="bg-copper-600 hover:bg-copper-700"
        >
          Try Again
        </Button>
      </div>
    </div>
  )
}

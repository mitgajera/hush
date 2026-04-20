'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCcw } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-6">
      <div className="max-w-md space-y-5 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-danger/10 text-danger">
          <AlertTriangle className="h-6 w-6" aria-hidden="true" />
        </div>
        <div className="space-y-1.5">
          <h1 className="text-xl font-medium text-fg">Something went wrong.</h1>
          <p className="text-sm text-fg-muted">
            Hush hit an unexpected error. Retry or return to the dashboard — your local
            data is safe.
          </p>
        </div>
        {error.digest && (
          <p className="font-mono text-2xs text-fg-subtle">Error ID: {error.digest}</p>
        )}
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="secondary"
            leftIcon={<RefreshCcw className="h-4 w-4" />}
            onClick={reset}
          >
            Retry
          </Button>
          <a href="/" className="btn btn-ghost">
            Go home
          </a>
        </div>
      </div>
    </div>
  )
}

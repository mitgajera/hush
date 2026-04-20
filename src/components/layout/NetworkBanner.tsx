'use client'

import Link from 'next/link'
import { AlertTriangle, ExternalLink } from 'lucide-react'
import { useNetworkStatus } from '@/hooks/useNetworkStatus'

function pretty(network: string): string {
  if (network === 'mainnet-beta') return 'mainnet'
  return network
}

export function NetworkBanner() {
  const status = useNetworkStatus()
  if (!status.mismatch || status.actual === null) return null

  return (
    <div
      role="alert"
      className="flex items-center justify-between gap-3 border-b border-warning/30 bg-warning/10 px-6 py-2 text-xs text-warning"
    >
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span>
          Hush is configured for <strong>{pretty(status.expected)}</strong>. The RPC
          endpoint is responding on <strong>{pretty(String(status.actual))}</strong>.
        </span>
      </div>
      <Link
        href="/settings"
        className="inline-flex items-center gap-1 text-warning hover:underline"
      >
        Switch network <ExternalLink className="h-3 w-3" />
      </Link>
    </div>
  )
}

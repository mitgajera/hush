'use client'

import { format, parseISO } from 'date-fns'
import { Lock, ShieldCheck, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

type Props = {
  timestamp?: string
  assetId?: string
  onChain?: boolean
  preview?: boolean
  className?: string
}

export function CredentialCard({
  timestamp,
  assetId,
  onChain,
  preview,
  className,
}: Props) {
  const iso = timestamp ?? new Date().toISOString()
  const displayDate = format(parseISO(iso), 'yyyy-MM-dd')

  return (
    <div
      className={cn(
        'relative mx-auto w-full max-w-sm overflow-hidden rounded-2xl border border-border bg-bg-elevated p-6 shadow-xl',
        className
      )}
    >
      {/* Corner badge */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/15 text-accent">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
            <p className="text-2xs uppercase tracking-wider text-fg-subtle">
              Hush credential
            </p>
            <p className="text-sm font-medium text-fg">Professional payment received</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-2xs font-medium text-accent">
          <ShieldCheck className="h-3 w-3" />
          Verified
        </span>
      </div>

      {/* Privacy affirmation */}
      <div className="mt-6 space-y-2 rounded-lg border border-border bg-bg/60 p-4">
        <p className="text-2xs uppercase tracking-wider text-fg-subtle">Discloses</p>
        <ul className="space-y-1 text-sm text-fg">
          <li className="flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-fg-subtle" />
            That a professional payment was received
          </li>
        </ul>
        <p className="pt-2 text-2xs uppercase tracking-wider text-fg-subtle">Does not reveal</p>
        <ul className="space-y-1 text-sm text-fg-muted">
          <li className="flex items-center gap-2">
            <Lock className="h-3 w-3 text-fg-subtle" /> Amounts
          </li>
          <li className="flex items-center gap-2">
            <Lock className="h-3 w-3 text-fg-subtle" /> Wallet links
          </li>
          <li className="flex items-center gap-2">
            <Lock className="h-3 w-3 text-fg-subtle" /> Employer or counterparty names
          </li>
        </ul>
      </div>

      {/* Asset id */}
      {assetId && (
        <div className="mt-4 space-y-1">
          <p className="text-2xs uppercase tracking-wider text-fg-subtle">Asset</p>
          <p className="truncate font-mono text-2xs text-fg-muted">{assetId}</p>
        </div>
      )}

      {/* Footer */}
      <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
        <div className="flex items-center gap-3 text-2xs text-fg-subtle">
          <span className="font-medium text-fg">hush.</span>
          <span className="text-fg-subtle">·</span>
          <span>Umbra</span>
        </div>
        <div className="text-right">
          <p className="font-mono text-2xs text-fg-muted">{displayDate}</p>
          {preview ? (
            <p className="text-2xs text-fg-subtle">Preview</p>
          ) : onChain ? (
            <p className="text-2xs text-accent">On-chain</p>
          ) : (
            <p className="text-2xs text-fg-subtle">Local</p>
          )}
        </div>
      </div>
    </div>
  )
}

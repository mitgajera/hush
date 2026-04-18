'use client'

import Link from 'next/link'
import { CheckCircle2, ExternalLink, Sparkles } from 'lucide-react'
import { formatUsdc } from '@/lib/utils/format'
import { UMBRA_WALLET_URL } from '@/constants/content'

export function ClaimSuccess({
  amountUsdc,
  token,
  txSignature,
  network = 'devnet',
}: {
  amountUsdc: number
  token: string
  txSignature?: string
  network?: 'devnet' | 'mainnet-beta'
}) {
  return (
    <div className="space-y-6 text-center">
      <div className="flex justify-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success/15 text-success">
          <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
        </div>
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-medium text-fg sm:text-3xl">Payment received.</h1>
        <p className="font-mono text-4xl text-fg tabular-nums sm:text-5xl">
          {formatUsdc(amountUsdc)}
          <span className="ml-2 text-lg text-fg-subtle">USDC</span>
        </p>
      </div>

      {txSignature && (
        <a
          href={`https://solscan.io/tx/${txSignature}?cluster=${network}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-fg-muted hover:text-fg"
        >
          View transaction <ExternalLink className="h-3 w-3" />
        </a>
      )}

      <div className="space-y-2">
        <a
          href={UMBRA_WALLET_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-secondary h-11 w-full text-sm"
        >
          <ExternalLink className="h-4 w-4" />
          View in Umbra Wallet
        </a>
        <Link
          href={`/credential/mint?payment=${encodeURIComponent(token)}`}
          className="btn btn-primary h-11 w-full text-sm"
        >
          <Sparkles className="h-4 w-4" />
          Mint your Hush credential
        </Link>
      </div>
    </div>
  )
}

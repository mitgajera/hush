'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { ArrowLeft, ExternalLink, ShieldCheck } from 'lucide-react'
import { CredentialCard } from '@/components/features/credential/CredentialCard'
import { PrivateBadge } from '@/components/ui/PrivateBadge'
import { CopyButton } from '@/components/ui/CopyButton'
import { useCredentials } from '@/hooks/useCredentials'

function explorerUrl(signature: string, network: string) {
  const cluster = network === 'mainnet-beta' ? '' : `?cluster=${network}`
  return `https://solscan.io/tx/${signature}${cluster}`
}

export default function CredentialViewerPage({
  params,
}: {
  params: { id: string }
}) {
  const credentials = useCredentials()
  const credential = useMemo(
    () => credentials.find((c) => c.id === params.id) ?? null,
    [credentials, params.id]
  )

  const shareUrl =
    typeof window !== 'undefined'
      ? window.location.href
      : `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/credential/${params.id}`

  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b border-border">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-sm font-medium text-fg">
            hush.
          </Link>
          <PrivateBadge />
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl space-y-8 px-6 py-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-xs text-fg-muted hover:text-fg"
        >
          <ArrowLeft className="h-3 w-3" /> Back to Hush
        </Link>

        <section className="space-y-2 text-center">
          <h1 className="text-2xl font-medium text-fg sm:text-3xl">
            Hush credential
          </h1>
          <p className="text-sm text-fg-muted">
            A privacy-preserving proof of payment. Verifiable on Solana.
          </p>
        </section>

        <CredentialCard
          timestamp={credential?.timestamp}
          assetId={credential?.id ?? params.id}
          onChain={credential?.onChain ?? false}
        />

        <section className="space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {credential?.onChain && credential.mintTxSignature ? (
              <a
                href={explorerUrl(credential.mintTxSignature, process.env.NEXT_PUBLIC_SOLANA_NETWORK ?? 'devnet')}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-md border border-border bg-bg-surface px-3 py-2 text-sm text-fg hover:bg-bg-elevated"
              >
                <ShieldCheck className="h-4 w-4 text-accent" />
                Verified on Solana
                <ExternalLink className="h-3 w-3 text-fg-subtle" />
              </a>
            ) : (
              <div className="flex items-center justify-center gap-2 rounded-md border border-dashed border-border bg-bg-surface px-3 py-2 text-sm text-fg-muted">
                <ShieldCheck className="h-4 w-4 text-fg-subtle" />
                {credential ? 'Demo credential' : 'Not found in this browser'}
              </div>
            )}

            <div className="flex items-center justify-center gap-2 rounded-md border border-border bg-bg-surface px-3 py-2 text-sm text-fg">
              <span className="truncate text-xs text-fg-muted">{shareUrl}</span>
              <CopyButton value={shareUrl} label="Share" className="shrink-0" />
            </div>
          </div>

          {!credential && (
            <p className="text-center text-xs text-fg-subtle">
              The on-chain record exists if the asset id is valid — Hush only indexes
              credentials minted in your browser.
            </p>
          )}
        </section>
      </main>

      <footer className="mx-auto w-full max-w-3xl px-6 py-8 text-center text-2xs text-fg-subtle">
        Powered by Umbra · Bubblegum cNFTs
      </footer>
    </div>
  )
}

'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { PrivateBadge } from '@/components/ui/PrivateBadge'
import { MintCredentialPanel } from '@/components/features/credential/MintCredentialPanel'

function MintRoute() {
  const params = useSearchParams()
  const payment = params.get('payment') ?? undefined

  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b border-border">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <Link href="/" className="text-sm font-medium text-fg">
              hush.
            </Link>
          </div>
          <PrivateBadge />
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl space-y-6 px-6 py-10">
        <div className="space-y-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs text-fg-muted hover:text-fg"
          >
            <ArrowLeft className="h-3 w-3" /> Back
          </Link>
          <h1 className="text-2xl font-medium text-fg sm:text-3xl">
            Mint your Hush credential
          </h1>
          <p className="max-w-xl text-sm text-fg-muted">
            A privacy-preserving reputation primitive. Anyone can verify you received a
            professional payment without seeing the amount, counterparty, or any wallet
            link.
          </p>
        </div>

        <MintCredentialPanel paymentToken={payment} />
      </main>

      <footer className="mx-auto w-full max-w-4xl px-6 py-8 text-center text-2xs text-fg-subtle">
        Powered by Umbra · Bubblegum cNFTs
      </footer>
    </div>
  )
}

export default function MintCredentialPage() {
  return (
    <Suspense fallback={null}>
      <MintRoute />
    </Suspense>
  )
}

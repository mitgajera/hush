'use client'

import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { ArrowRight, Download } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { UMBRA_INSTALL_URL } from '@/constants/content'

export function NoWalletPrompt() {
  const { setVisible } = useWalletModal()

  return (
    <div className="space-y-5 text-center">
      <div className="space-y-2">
        <h1 className="text-2xl font-medium text-fg sm:text-3xl">
          A Hush payment is waiting for you.
        </h1>
        <p className="text-sm text-fg-muted">
          You need Umbra Wallet to claim this privately.
        </p>
      </div>

      <div className="font-mono text-4xl text-fg-subtle tabular-nums sm:text-5xl">
        ●●●●● USDC
      </div>

      <div className="space-y-2">
        <a
          href={UMBRA_INSTALL_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary h-11 w-full text-sm"
        >
          <Download className="h-4 w-4" />
          Get Umbra Wallet
        </a>
        <Button
          variant="ghost"
          size="sm"
          rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
          onClick={() => setVisible(true)}
          className="w-full"
        >
          Already have it? Connect
        </Button>
      </div>
    </div>
  )
}

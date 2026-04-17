'use client'

import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { LockIcon } from '@/components/ui/LockIcon'
import { UMBRA_INSTALL_URL } from '@/constants/content'

export function NotConnectedState() {
  const { setVisible } = useWalletModal()

  return (
    <Card variant="elevated" className="flex flex-col items-center gap-4 py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
        <LockIcon state="active" size={22} />
      </div>
      <div className="space-y-1.5">
        <h2 className="text-lg font-medium text-fg">
          Connect Umbra Wallet to continue
        </h2>
        <p className="max-w-md text-sm text-fg-muted">
          Hush uses the Umbra Wallet to manage keys, sign transactions, and display
          private balances.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Button onClick={() => setVisible(true)}>Connect wallet</Button>
        <a
          href={UMBRA_INSTALL_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-fg-muted hover:text-fg"
        >
          What is Umbra Wallet? <ArrowRight className="h-3.5 w-3.5" />
        </a>
      </div>
    </Card>
  )
}

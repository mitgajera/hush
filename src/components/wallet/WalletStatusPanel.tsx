'use client'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { useEffect, useState } from 'react'
import { ExternalLink } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { TruncatedAddress } from '@/components/ui/TruncatedAddress'
import { MaskedAmount } from '@/components/ui/MaskedAmount'
import { getPrivateBalance } from '@/lib/umbra/balance'
import { createUmbraClient } from '@/lib/umbra/client'
import { UMBRA_WALLET_URL } from '@/constants/content'

export function WalletStatusPanel() {
  const { connection } = useConnection()
  const wallet = useWallet()
  const { setVisible } = useWalletModal()
  const [balance, setBalance] = useState<number | null>(null)

  const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet'
  const connected = wallet.connected && wallet.publicKey
  const address = wallet.publicKey?.toBase58() ?? ''

  useEffect(() => {
    if (!connected) {
      setBalance(null)
      return
    }
    const client = createUmbraClient(wallet, connection)
    getPrivateBalance(client, 'USDC')
      .then(setBalance)
      .catch(() => setBalance(0))
  }, [connected, wallet, connection])

  if (!connected) {
    return (
      <Card className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <span aria-hidden="true" className="h-2 w-2 rounded-full bg-fg-subtle" />
          <span className="text-fg-muted">Not connected</span>
        </div>
        <p className="text-sm text-fg-muted">
          Connect your Umbra Wallet to view your private balance.
        </p>
        <Button size="sm" onClick={() => setVisible(true)}>
          Connect wallet
        </Button>
      </Card>
    )
  }

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <span
            aria-hidden="true"
            className="h-2 w-2 rounded-full bg-accent shadow-[0_0_0_2px_rgba(74,200,158,0.2)]"
          />
          <span className="text-fg">Connected</span>
        </div>
        <span className="text-2xs uppercase tracking-wide text-fg-subtle">{network}</span>
      </div>

      <div className="space-y-1.5">
        <p className="text-xs text-fg-muted">Address</p>
        <TruncatedAddress address={address} />
      </div>

      <div className="space-y-1.5">
        <p className="text-xs text-fg-muted">Private balance</p>
        <div className="flex items-baseline gap-1.5">
          <MaskedAmount id="wallet-status-balance" amount={balance ?? 0} />
          <span className="text-xs text-fg-subtle">USDC</span>
        </div>
      </div>

      <a
        href={UMBRA_WALLET_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-xs text-accent hover:opacity-80"
      >
        Open Umbra Wallet <ExternalLink className="h-3 w-3" />
      </a>
    </Card>
  )
}

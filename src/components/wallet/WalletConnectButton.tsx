'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { ExternalLink, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Dropdown, DropdownItem, DropdownSeparator } from '@/components/ui/Dropdown'
import { TruncatedAddress } from '@/components/ui/TruncatedAddress'
import { UMBRA_WALLET_URL } from '@/constants/content'

export function WalletConnectButton() {
  const { setVisible } = useWalletModal()
  const { connected, publicKey, disconnect, connecting } = useWallet()

  if (!connected || !publicKey) {
    return (
      <Button
        variant="secondary"
        size="sm"
        loading={connecting}
        onClick={() => setVisible(true)}
      >
        Connect Wallet
      </Button>
    )
  }

  const address = publicKey.toBase58()

  return (
    <Dropdown
      trigger={
        <button
          type="button"
          className="inline-flex h-8 items-center gap-2 rounded-md border border-border bg-bg-surface px-2.5 text-sm hover:bg-bg-elevated transition-colors"
        >
          <span
            aria-hidden="true"
            className="h-2 w-2 rounded-full bg-accent shadow-[0_0_0_2px_rgba(74,200,158,0.18)]"
          />
          <span className="font-mono tabular-nums text-xs text-fg">
            <TruncatedAddress
              address={address}
              prefixLen={4}
              suffixLen={4}
              showCopy={false}
            />
          </span>
        </button>
      }
    >
      <DropdownItem
        onSelect={() => {
          navigator.clipboard.writeText(address).catch(() => {})
        }}
      >
        Copy address
      </DropdownItem>
      <DropdownItem
        onSelect={() => {
          window.open(UMBRA_WALLET_URL, '_blank', 'noopener,noreferrer')
        }}
      >
        <ExternalLink className="h-3.5 w-3.5" />
        Open Umbra Wallet
      </DropdownItem>
      <DropdownSeparator />
      <DropdownItem destructive onSelect={() => disconnect()}>
        <LogOut className="h-3.5 w-3.5" />
        Disconnect
      </DropdownItem>
    </Dropdown>
  )
}

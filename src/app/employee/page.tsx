'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { Wallet } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { HushLogo } from '@/components/ui/HushLogo'
import { RevealProvider } from '@/contexts/RevealContext'
import { WalletAddressCard } from '@/components/features/employee/WalletAddressCard'
import { ReceivedPaymentsTable } from '@/components/features/employee/ReceivedPaymentsTable'
import { UmbraRegistration } from '@/components/features/settings/UmbraRegistration'

function PortalContent() {
  const wallet = useWallet()
  const { setVisible } = useWalletModal()

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border bg-bg-surface px-6 py-3">
        <div className="flex items-center gap-2.5">
          <HushLogo size="sm" />
          <span className="hidden text-xs text-fg-subtle sm:inline">· Employee portal</span>
        </div>
        <div className="flex items-center gap-3">
          {wallet.connected && wallet.publicKey ? (
            <button
              type="button"
              onClick={() => wallet.disconnect()}
              className="text-xs text-fg-muted hover:text-fg"
            >
              {wallet.publicKey.toBase58().slice(0, 6)}…{wallet.publicKey.toBase58().slice(-4)}
            </button>
          ) : (
            <Button size="sm" onClick={() => setVisible(true)}>
              <Wallet className="h-3.5 w-3.5" />
              Connect wallet
            </Button>
          )}
        </div>
      </header>

      <main className="flex-1 px-6 py-8">
        {!wallet.connected || !wallet.publicKey ? (
          /* Not connected */
          <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-bg-elevated text-fg-muted">
              <Wallet className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <h1 className="text-xl font-medium text-fg">Your payment portal</h1>
              <p className="max-w-xs text-sm text-fg-muted">
                Connect your wallet to view your payment history and share your address with employers.
              </p>
            </div>
            <Button onClick={() => setVisible(true)}>Connect wallet</Button>
            <p className="text-2xs text-fg-subtle">
              Everything stays in this browser. Nothing is stored on any server.
            </p>
          </div>
        ) : (
          /* Connected */
          <div className="mx-auto max-w-2xl space-y-8">
            <div>
              <h1 className="text-xl font-medium text-fg">My payment portal</h1>
              <p className="mt-1 text-xs text-fg-muted">
                Private payments received via Hush. Only visible in this browser.
              </p>
            </div>

            <UmbraRegistration />
            <WalletAddressCard address={wallet.publicKey.toBase58()} />
            <ReceivedPaymentsTable />
          </div>
        )}
      </main>

      <footer className="border-t border-border px-6 py-4 text-center text-2xs text-fg-subtle">
        Powered by Umbra · All payments are private by default
      </footer>
    </div>
  )
}

export default function EmployeePage() {
  return (
    <RevealProvider>
      <PortalContent />
    </RevealProvider>
  )
}

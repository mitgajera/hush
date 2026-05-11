'use client'

import { ReactNode, useMemo } from 'react'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets'
import { Toaster } from 'sonner'
import { RevealProvider } from '@/contexts/RevealContext'
import { TooltipProvider } from '@/components/ui/Tooltip'
import '@solana/wallet-adapter-react-ui/styles.css'

export function Providers({ children }: { children: ReactNode }) {
  // Use explicit env var if set; otherwise route through the server-side proxy
  // so the Helius API key is never exposed in the client bundle.
  const endpoint =
    process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
    (typeof window !== 'undefined'
      ? `${window.location.origin}/api/rpc`
      : 'https://api.devnet.solana.com')

  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    []
  )

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <RevealProvider>
            <TooltipProvider>{children}</TooltipProvider>
            <Toaster theme="dark" position="top-right" richColors closeButton />
          </RevealProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}

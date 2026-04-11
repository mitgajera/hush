'use client'

import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets'
import { useMemo } from 'react'
import '@solana/wallet-adapter-react-ui/styles.css'

// Wallet adapter FC types predate @types/react 18.3's stricter ReactNode; bypass via any.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CP = ConnectionProvider as any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const WP = WalletProvider as any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const WMP = WalletModalProvider as any

export function Providers({ children }: { children: React.ReactNode }) {
  const network = WalletAdapterNetwork.Devnet
  void network
  const endpoint = process.env.NEXT_PUBLIC_SOLANA_RPC_URL!

  const wallets = useMemo(() => [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
  ], [])

  return (
    <CP endpoint={endpoint}>
      <WP wallets={wallets} autoConnect>
        <WMP>
          {children}
        </WMP>
      </WP>
    </CP>
  )
}

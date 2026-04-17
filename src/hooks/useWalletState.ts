'use client'

import { useWallet } from '@solana/wallet-adapter-react'

export function useWalletState() {
  const { connected, connecting, disconnecting, publicKey, wallet, disconnect, select } =
    useWallet()
  return {
    connected,
    connecting,
    disconnecting,
    address: publicKey?.toBase58() ?? null,
    walletName: wallet?.adapter.name ?? null,
    disconnect,
    select,
  }
}

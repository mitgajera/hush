'use client'

import { useMemo } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { createUmbraClient, UmbraClient } from '@/lib/umbra/client'

export function useUmbra(): UmbraClient | null {
  const { connection } = useConnection()
  const wallet = useWallet()

  return useMemo(() => {
    if (!wallet.connected || !wallet.publicKey) return null
    return createUmbraClient(wallet, connection)
  }, [wallet.connected, wallet.publicKey, wallet, connection])
}

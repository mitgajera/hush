'use client'

import { useEffect, useState } from 'react'
import { useConnection } from '@solana/wallet-adapter-react'
import type { Network } from '@/types'

// Known cluster genesis hashes — authoritative network identifiers on Solana.
const GENESIS: Record<string, Network | 'testnet'> = {
  EtWTRABZaYq6iMfeYKouRu166VU2xqa1wcaWoxPkrZBG: 'devnet',
  '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d': 'mainnet-beta',
  '4uhcVJyU9pJkvQyS88uRDiswHXSCkY3zQawwpjk2NsNY': 'testnet',
}

export type NetworkStatus = {
  expected: Network
  actual: Network | 'testnet' | 'unknown' | null
  mismatch: boolean
}

export function useNetworkStatus(): NetworkStatus {
  const { connection } = useConnection()
  const expected =
    (process.env.NEXT_PUBLIC_SOLANA_NETWORK as Network | undefined) ?? 'devnet'
  const [actual, setActual] = useState<NetworkStatus['actual']>(null)

  useEffect(() => {
    let cancelled = false
    connection
      .getGenesisHash()
      .then((hash) => {
        if (cancelled) return
        setActual(GENESIS[hash] ?? 'unknown')
      })
      .catch(() => {
        if (cancelled) return
        setActual('unknown')
      })
    return () => {
      cancelled = true
    }
  }, [connection])

  return {
    expected,
    actual,
    mismatch: actual !== null && actual !== 'unknown' && actual !== expected,
  }
}

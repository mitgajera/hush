'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { createUmbraClient, clearUmbraClient } from '@shieldpay/umbra-client'
import { createSignerFromWalletAccount } from '@umbra-privacy/sdk'
import type { IUmbraClient } from '@shieldpay/umbra-client'

function getStdWalletAndAccount(adapter: unknown): {
  wallet: object
  account: object
} | null {
  if (adapter && typeof adapter === 'object' && 'wallet' in adapter) {
    const a = adapter as { wallet: { accounts?: unknown[] } }
    if (Array.isArray(a.wallet?.accounts) && a.wallet.accounts.length > 0) {
      return { wallet: a.wallet as object, account: a.wallet.accounts[0] as object }
    }
  }
  return null
}

export function useUmbra() {
  const { wallet, connected } = useWallet()
  const [client, setClient] = useState<IUmbraClient | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!connected || !wallet) {
      clearUmbraClient()
      setClient(null)
      return
    }

    const stdPair = getStdWalletAndAccount(wallet.adapter)
    if (!stdPair) {
      setError('Wallet does not implement Wallet Standard — use Phantom or Solflare')
      return
    }

    setLoading(true)
    setError(null)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const signer = createSignerFromWalletAccount(stdPair.wallet as any, stdPair.account as any)

    createUmbraClient(signer)
      .then(setClient)
      .catch((err: Error) => {
        const msg = err.message
        setError(msg.includes('network') ? 'Connection error — check your wallet is on devnet' : msg)
      })
      .finally(() => setLoading(false))
  }, [connected, wallet])

  return { client, loading, error }
}

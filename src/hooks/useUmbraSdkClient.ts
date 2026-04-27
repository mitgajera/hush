'use client'

import { useEffect, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import type { getUmbraClient } from '@umbra-privacy/sdk'
type IUmbraClient = Awaited<ReturnType<typeof getUmbraClient>>
import { createRealUmbraClient } from '@/lib/umbra/realClient'

export type UmbraSdkState =
  | { status: 'idle'; client: null; error: null }
  | { status: 'loading'; client: null; error: null }
  | { status: 'ready'; client: IUmbraClient; error: null }
  | { status: 'error'; client: null; error: Error }

const IDLE: UmbraSdkState = { status: 'idle', client: null, error: null }

/**
 * Initializes a real Umbra SDK client tied to the connected wallet.
 * Returns `idle` when no wallet is connected, `loading` during init,
 * `ready` with a usable client, or `error` with the failure reason.
 *
 * Re-initializes when the wallet address or adapter changes.
 */
export function useUmbraSdkClient(): UmbraSdkState {
  const wallet = useWallet()
  const [state, setState] = useState<UmbraSdkState>(IDLE)

  useEffect(() => {
    if (!wallet.connected || !wallet.publicKey) {
      setState(IDLE)
      return
    }

    let cancelled = false
    setState({ status: 'loading', client: null, error: null })

    createRealUmbraClient(wallet)
      .then((client) => {
        if (cancelled) return
        setState({ status: 'ready', client, error: null })
      })
      .catch((err: unknown) => {
        if (cancelled) return
        const error = err instanceof Error ? err : new Error('Umbra init failed')
        setState({ status: 'error', client: null, error })
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet.connected, wallet.publicKey?.toBase58(), wallet.wallet?.adapter.name])

  return state
}

'use client'

import { useEffect, useState } from 'react'
import { queryEncryptedUsdcBalance, EncryptedBalanceState } from '@/lib/umbra/realBalance'
import { useUmbraSdkClient } from './useUmbraSdkClient'

export type EncryptedBalanceResult = {
  loading: boolean
  amountUsdc: number | null
  state: EncryptedBalanceState['state'] | 'no_client'
  error: Error | null
  refresh: () => void
}

export function useEncryptedUsdcBalance(): EncryptedBalanceResult {
  const sdk = useUmbraSdkClient()
  const [result, setResult] = useState<Omit<EncryptedBalanceResult, 'refresh'>>(() => ({
    loading: false,
    amountUsdc: null,
    state: 'no_client',
    error: null,
  }))
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (sdk.status !== 'ready') {
      setResult({ loading: sdk.status === 'loading', amountUsdc: null, state: 'no_client', error: sdk.status === 'error' ? sdk.error : null })
      return
    }

    let cancelled = false
    setResult((prev) => ({ ...prev, loading: true, error: null }))

    queryEncryptedUsdcBalance(sdk.client)
      .then((b) => {
        if (cancelled) return
        setResult({
          loading: false,
          amountUsdc: b.state === 'shared' ? b.amountUsdc : 0,
          state: b.state,
          error: null,
        })
      })
      .catch((err: unknown) => {
        if (cancelled) return
        const error = err instanceof Error ? err : new Error('Balance query failed')
        setResult({ loading: false, amountUsdc: null, state: 'no_client', error })
      })

    return () => {
      cancelled = true
    }
  }, [sdk, tick])

  return { ...result, refresh: () => setTick((t) => t + 1) }
}

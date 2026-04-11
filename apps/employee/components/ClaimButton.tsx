'use client'

import { useState } from 'react'
import { scanAndClaimUtxos } from '@shieldpay/umbra-client'
import type { IUmbraClient } from '@shieldpay/umbra-client'

interface ClaimResult {
  claimed: number
  utxos?: unknown[]
}

interface Props {
  client: IUmbraClient
  onClaimed: (result: ClaimResult) => void
}

export function ClaimButton({ client, onClaimed }: Props) {
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleScan() {
    setScanning(true)
    setError(null)
    try {
      const result = await scanAndClaimUtxos(client)
      onClaimed(result)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      setError(msg.includes('network') ? 'Connection error — check your wallet is on devnet' : msg)
    } finally {
      setScanning(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <button
        onClick={handleScan}
        disabled={scanning}
        style={{
          background: scanning ? 'var(--umbra-primary-dim)' : 'var(--umbra-primary)',
          color: '#001a26',
          border: 'none',
          borderRadius: 0,
          fontWeight: 600,
          padding: '14px 28px',
          cursor: scanning ? 'not-allowed' : 'pointer',
          fontSize: 14,
        }}
      >
        {scanning ? 'Scanning...' : 'Scan for payments'}
      </button>
      {error && <p style={{ color: 'var(--error)', fontSize: 12, fontFamily: 'Space Mono, monospace' }}>{error}</p>}
    </div>
  )
}

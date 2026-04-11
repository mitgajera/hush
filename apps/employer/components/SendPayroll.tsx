'use client'

import { useState } from 'react'
import {
  batchPrivateTransfer,
  formatUsdc,
  getUsdcMint,
  usdcToLamports,
} from '@shieldpay/umbra-client'
import type { IUmbraClient, BatchTransferResult, PayrollEntry } from '@shieldpay/umbra-client'

interface Props {
  client: IUmbraClient
  entries: PayrollEntry[]
  onComplete: (results: BatchTransferResult[]) => void
}

export function SendPayroll({ client, entries, onComplete }: Props) {
  const [sending, setSending] = useState(false)
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null)

  const total = entries.reduce((s, e) => s + e.amount, 0)
  const mint = getUsdcMint(process.env.NEXT_PUBLIC_UMBRA_NETWORK ?? 'devnet')

  async function handleSend() {
    setSending(true)
    setProgress({ done: 0, total: entries.length })

    try {
      const results = await batchPrivateTransfer(
        client,
        entries.map(e => ({
          name: e.name,
          recipientAddress: e.wallet,
          mint,
          amount: usdcToLamports(e.amount),
        })),
        (done, total) => setProgress({ done, total }),
      )
      onComplete(results)
    } catch (err: unknown) {
      console.error('Batch transfer error:', err)
    } finally {
      setSending(false)
      setProgress(null)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', gap: 24 }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--bd)', padding: '12px 20px' }}>
          <p style={{ color: 'var(--text-3)', fontSize: 10, fontFamily: 'Space Mono, monospace', margin: 0 }}>RECIPIENTS</p>
          <p style={{ color: 'var(--text-1)', fontSize: 20, fontFamily: 'Syne, sans-serif', fontWeight: 700, margin: '4px 0 0' }}>{entries.length}</p>
        </div>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--bd)', padding: '12px 20px' }}>
          <p style={{ color: 'var(--text-3)', fontSize: 10, fontFamily: 'Space Mono, monospace', margin: 0 }}>TOTAL USDC</p>
          <p style={{ color: 'var(--umbra-primary)', fontSize: 20, fontFamily: 'Space Mono, monospace', fontWeight: 700, margin: '4px 0 0' }}>{formatUsdc(total)}</p>
        </div>
      </div>

      {progress && (
        <div style={{ background: 'var(--surface2)', border: '1px solid var(--bd)', padding: '12px 16px' }}>
          <p style={{ color: 'var(--text-2)', fontSize: 12, fontFamily: 'Space Mono, monospace', margin: '0 0 8px' }}>
            Sending {progress.done} of {progress.total}...
          </p>
          <div style={{ background: 'var(--bd2)', height: 4 }}>
            <div
              style={{
                background: 'var(--umbra-primary)',
                height: '100%',
                width: `${(progress.done / progress.total) * 100}%`,
                transition: 'width 0.3s',
              }}
            />
          </div>
        </div>
      )}

      <button
        onClick={handleSend}
        disabled={sending}
        style={{
          background: sending ? 'var(--umbra-primary-dim)' : 'var(--umbra-primary)',
          color: '#001a26',
          border: 'none',
          borderRadius: 0,
          fontWeight: 600,
          padding: '14px 28px',
          cursor: sending ? 'not-allowed' : 'pointer',
          fontSize: 14,
          alignSelf: 'flex-start',
        }}
      >
        {sending ? 'Sending...' : `Send Payroll to ${entries.length} recipients`}
      </button>
    </div>
  )
}

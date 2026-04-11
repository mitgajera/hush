'use client'

import { useState } from 'react'
import { generateMonthlyViewingKey, formatUsdc, truncateAddress } from '@shieldpay/umbra-client'
import type { IUmbraClient, BatchTransferResult } from '@shieldpay/umbra-client'

interface Props {
  client: IUmbraClient
  results: BatchTransferResult[]
}

export function KeyExport({ client, results }: Props) {
  const [exporting, setExporting] = useState(false)

  const succeeded = results.filter(r => r.status === 'success')
  const failed = results.filter(r => r.status === 'failed')
  const totalUsdc = succeeded.reduce((s, r) => s + Number(r.amount) / 1_000_000, 0)

  async function handleExport() {
    setExporting(true)
    try {
      const now = new Date()
      const mint = process.env.NEXT_PUBLIC_USDC_MINT!
      const { hex } = await generateMonthlyViewingKey(client, mint, now.getFullYear(), now.getMonth() + 1)

      const pad = (n: number) => String(n).padStart(2, '0')
      const runId = `run_${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}`

      const bundle = {
        runId,
        date: now.toISOString(),
        network: process.env.NEXT_PUBLIC_UMBRA_NETWORK ?? 'devnet',
        totalRecipients: succeeded.length,
        totalUsdc,
        monthlyViewingKey: hex,
        recipients: succeeded.map(r => ({
          name: r.name,
          wallet: truncateAddress(r.recipientAddress),
          amountUsdc: Number(r.amount) / 1_000_000,
          signatures: r.signatures,
        })),
      }

      const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `shieldpay-run-${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}.json`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--bd)', padding: '20px 24px' }}>
        <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 16, fontWeight: 700, margin: '0 0 12px', color: 'var(--text-1)' }}>
          Payroll Complete
        </h3>
        <p style={{ color: 'var(--text-2)', fontSize: 14, margin: '0 0 4px' }}>
          {succeeded.length} sent · {formatUsdc(totalUsdc)} USDC
          {failed.length > 0 && <span style={{ color: 'var(--error)', marginLeft: 12 }}>{failed.length} failed</span>}
        </p>
      </div>

      {failed.length > 0 && (
        <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid var(--error)', padding: '12px 16px' }}>
          <p style={{ color: 'var(--error)', fontSize: 12, fontFamily: 'Space Mono, monospace', margin: '0 0 8px', fontWeight: 700 }}>FAILED TRANSFERS</p>
          {failed.map((r, i) => (
            <p key={i} style={{ color: 'var(--error)', fontSize: 11, fontFamily: 'Space Mono, monospace', margin: '2px 0' }}>
              {r.name} — {r.error ?? 'Unknown error'}
            </p>
          ))}
        </div>
      )}

      <button
        onClick={handleExport}
        disabled={exporting}
        style={{
          background: 'transparent',
          color: 'var(--umbra-primary)',
          border: '1px solid var(--umbra-primary-bd2)',
          borderRadius: 0,
          padding: '12px 24px',
          cursor: exporting ? 'not-allowed' : 'pointer',
          fontWeight: 600,
          fontSize: 14,
          alignSelf: 'flex-start',
        }}
      >
        {exporting ? 'Generating...' : 'Export Viewing Key Bundle'}
      </button>

      <p style={{ color: 'var(--text-3)', fontSize: 12, margin: 0, fontFamily: 'Space Mono, monospace' }}>
        Store the monthly viewing key securely and share it with your accountant.
      </p>
    </div>
  )
}

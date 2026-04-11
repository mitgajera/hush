'use client'

import { formatUsdc, truncateAddress, explorerUrl } from '@shieldpay/umbra-client'

export interface RunRecipient {
  name: string
  wallet: string
  amountUsdc: number
  signatures: string[]
}

export interface RunBundle {
  runId: string
  date: string
  network: string
  totalRecipients: number
  totalUsdc: number
  monthlyViewingKey: string
  recipients: RunRecipient[]
}

interface Props {
  bundle: RunBundle
}

export function RunSummaryTable({ bundle }: Props) {
  const total = bundle.recipients.reduce((s, r) => s + r.amountUsdc, 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <div style={{ overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--bd2)' }}>
              {['Contributor', 'Wallet', 'Amount (USDC)', 'Tx Signature', 'Date'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--text-3)', fontFamily: 'Space Mono, monospace', fontSize: 10, fontWeight: 700 }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bundle.recipients.map((r, i) => {
              const sig = r.signatures?.[0] ?? ''
              const date = new Date(bundle.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
              return (
                <tr key={i} style={{ borderBottom: '1px solid var(--bd)' }}>
                  <td style={{ padding: '10px 12px', color: 'var(--text-1)', fontSize: 14 }}>{r.name}</td>
                  <td style={{ padding: '10px 12px', fontFamily: 'Space Mono, monospace', fontSize: 12, color: 'var(--text-2)' }}>
                    {truncateAddress(r.wallet)}
                  </td>
                  <td style={{ padding: '10px 12px', fontFamily: 'Space Mono, monospace', fontSize: 13, color: 'var(--umbra-primary)' }}>
                    {formatUsdc(r.amountUsdc)}
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    {sig ? (
                      <a href={explorerUrl(sig)} target="_blank" rel="noopener noreferrer"
                        style={{ color: 'var(--umbra-primary)', fontSize: 11, fontFamily: 'Space Mono, monospace', textDecoration: 'none' }}>
                        {sig.slice(0, 6)}...{sig.slice(-6)} ↗
                      </a>
                    ) : <span style={{ color: 'var(--text-3)', fontSize: 11 }}>—</span>}
                  </td>
                  <td style={{ padding: '10px 12px', fontFamily: 'Space Mono, monospace', fontSize: 11, color: 'var(--text-3)' }}>
                    {date}
                  </td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr style={{ borderTop: '1px solid var(--bd2)' }}>
              <td colSpan={2} style={{ padding: '10px 12px', color: 'var(--text-2)', fontFamily: 'Space Mono, monospace', fontSize: 11, fontWeight: 700 }}>TOTAL</td>
              <td style={{ padding: '10px 12px', fontFamily: 'Space Mono, monospace', fontSize: 13, color: 'var(--umbra-primary)', fontWeight: 700 }}>
                {formatUsdc(total)}
              </td>
              <td colSpan={2} />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}

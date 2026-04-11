'use client'

import { truncateAddress, formatUsdc } from '@shieldpay/umbra-client'
import type { PayrollEntry } from '@shieldpay/umbra-client'

function isValidSolanaAddress(addr: string): boolean {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(addr)
}

interface Props {
  entries: PayrollEntry[]
}

export function RosterTable({ entries }: Props) {
  return (
    <div style={{ overflow: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--bd2)' }}>
            {['Contributor', 'Wallet', 'Amount (USDC)', 'Status'].map(h => (
              <th key={h} style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--text-3)', fontFamily: 'Space Mono, monospace', fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, i) => {
            const valid = isValidSolanaAddress(entry.wallet)
            return (
              <tr key={i} style={{ borderBottom: '1px solid var(--bd)' }}>
                <td style={{ padding: '10px 12px', color: 'var(--text-1)', fontSize: 14 }}>{entry.name}</td>
                <td style={{ padding: '10px 12px', fontFamily: 'Space Mono, monospace', fontSize: 12, color: 'var(--text-2)' }}>
                  {truncateAddress(entry.wallet)}
                </td>
                <td style={{ padding: '10px 12px', fontFamily: 'Space Mono, monospace', fontSize: 13, color: 'var(--umbra-primary)' }}>
                  {formatUsdc(entry.amount)}
                </td>
                <td style={{ padding: '10px 12px' }}>
                  {valid ? (
                    <span style={{ background: 'var(--umbra-primary-bg)', border: '1px solid var(--umbra-primary-bd)', color: 'var(--umbra-primary)', padding: '3px 10px', fontSize: 10, fontFamily: 'Space Mono, monospace' }}>
                      READY
                    </span>
                  ) : (
                    <span style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid var(--error)', color: 'var(--error)', padding: '3px 10px', fontSize: 10, fontFamily: 'Space Mono, monospace' }}>
                      INVALID ADDRESS
                    </span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

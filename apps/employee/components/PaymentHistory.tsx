'use client'

import { explorerUrl } from '@shieldpay/umbra-client'

interface UtxoEntry {
  signatures?: string[]
  timestamp?: string
}

interface Props {
  utxos: UtxoEntry[]
}

export function PaymentHistory({ utxos }: Props) {
  if (utxos.length === 0) {
    return (
      <div style={{ background: 'var(--surface)', border: '1px solid var(--bd)', padding: '24px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-3)', fontFamily: 'Space Mono, monospace', fontSize: 12, margin: 0 }}>
          No payments claimed yet.
        </p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0, border: '1px solid var(--bd)' }}>
      {utxos.map((utxo, i) => {
        const sig = utxo.signatures?.[0] ?? ''
        return (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              borderBottom: i < utxos.length - 1 ? '1px solid var(--bd)' : 'none',
              background: 'var(--surface)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {/* Privacy pill */}
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--umbra-primary-bg)', border: '1px solid var(--umbra-primary-bd2)', padding: '4px 11px', fontFamily: 'Space Mono, monospace', fontSize: 10, color: 'var(--umbra-primary)', borderRadius: 0 }}>
                <span style={{ width: 5, height: 5, background: 'var(--umbra-primary)', flexShrink: 0, display: 'inline-block' }} />
                Encrypted on-chain
              </span>
              <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 11, color: 'var(--text-3)' }}>
                {utxo.timestamp ?? new Date().toLocaleDateString()}
              </span>
            </div>
            {sig && (
              <a
                href={explorerUrl(sig)}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--umbra-primary)', fontSize: 11, fontFamily: 'Space Mono, monospace', textDecoration: 'none' }}
              >
                {sig.slice(0, 8)}...{sig.slice(-8)} ↗
              </a>
            )}
          </div>
        )
      })}
    </div>
  )
}

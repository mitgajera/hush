'use client'

import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useUmbra } from '@/hooks/useUmbra'
import { WalletConnect } from '@/components/WalletConnect'
import { CSVUpload } from '@/components/CSVUpload'
import { RosterTable } from '@/components/RosterTable'
import { SendPayroll } from '@/components/SendPayroll'
import { KeyExport } from '@/components/KeyExport'
import type { PayrollEntry, BatchTransferResult } from '@shieldpay/umbra-client'

type Step = 'connect' | 'upload' | 'review' | 'send' | 'export'

const STEPS: { id: Step; label: string }[] = [
  { id: 'connect', label: 'Connect' },
  { id: 'upload', label: 'Upload' },
  { id: 'review', label: 'Review' },
  { id: 'send', label: 'Send' },
  { id: 'export', label: 'Export' },
]

export default function EmployerPage() {
  const { connected } = useWallet()
  const { client } = useUmbra()
  const [step, setStep] = useState<Step>('connect')
  const [entries, setEntries] = useState<PayrollEntry[]>([])
  const [results, setResults] = useState<BatchTransferResult[]>([])

  const currentIdx = STEPS.findIndex(s => s.id === step)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '40px 24px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 32, fontWeight: 700, color: 'var(--text-1)', margin: 0 }}>
            ShieldPay
          </h1>
          <p style={{ color: 'var(--text-3)', fontSize: 12, fontFamily: 'Space Mono, monospace', marginTop: 4 }}>
            Private payroll infrastructure · devnet
          </p>
        </div>

        {/* Stepper */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 40, borderBottom: '1px solid var(--bd)' }}>
          {STEPS.map((s, i) => {
            const active = s.id === step
            const done = i < currentIdx
            return (
              <div
                key={s.id}
                style={{
                  padding: '10px 20px',
                  borderBottom: active ? '2px solid var(--umbra-primary)' : '2px solid transparent',
                  color: active ? 'var(--umbra-primary)' : done ? 'var(--text-2)' : 'var(--text-3)',
                  fontFamily: 'Space Mono, monospace',
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase' as const,
                  cursor: done ? 'pointer' : 'default',
                }}
                onClick={() => done && setStep(s.id)}
              >
                {i + 1}. {s.label}
              </div>
            )
          })}
        </div>

        {/* Step content */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--bd)', padding: '32px' }}>
          {step === 'connect' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 700, margin: 0, color: 'var(--text-1)' }}>
                Connect treasury wallet
              </h2>
              <WalletConnect />
              {connected && client && (
                <button
                  onClick={() => setStep('upload')}
                  style={{ background: 'var(--umbra-primary)', color: '#001a26', border: 'none', borderRadius: 0, fontWeight: 600, padding: '12px 24px', cursor: 'pointer', fontSize: 14, alignSelf: 'flex-start' }}
                >
                  Continue
                </button>
              )}
            </div>
          )}

          {step === 'upload' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 700, margin: 0, color: 'var(--text-1)' }}>
                Upload payroll CSV
              </h2>
              <CSVUpload onParsed={(e) => { setEntries(e); }} />
              {entries.length > 0 && (
                <button
                  onClick={() => setStep('review')}
                  style={{ background: 'var(--umbra-primary)', color: '#001a26', border: 'none', borderRadius: 0, fontWeight: 600, padding: '12px 24px', cursor: 'pointer', fontSize: 14, alignSelf: 'flex-start' }}
                >
                  Review Roster
                </button>
              )}
            </div>
          )}

          {step === 'review' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 700, margin: 0, color: 'var(--text-1)' }}>
                Review roster
              </h2>
              <RosterTable entries={entries} />
              <button
                onClick={() => setStep('send')}
                style={{ background: 'var(--umbra-primary)', color: '#001a26', border: 'none', borderRadius: 0, fontWeight: 600, padding: '12px 24px', cursor: 'pointer', fontSize: 14, alignSelf: 'flex-start' }}
              >
                Proceed to Send
              </button>
            </div>
          )}

          {step === 'send' && client && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 700, margin: 0, color: 'var(--text-1)' }}>
                Send payroll
              </h2>
              <SendPayroll
                client={client}
                entries={entries}
                onComplete={(r) => { setResults(r); setStep('export') }}
              />
            </div>
          )}

          {step === 'export' && client && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 700, margin: 0, color: 'var(--text-1)' }}>
                Export viewing keys
              </h2>
              <KeyExport client={client} results={results} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

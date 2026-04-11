import { ViewingKeyDashboard } from '@/components/ViewingKeyDashboard'

export default function CompliancePage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '40px 24px' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 40 }}>
        <div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 32, fontWeight: 700, color: 'var(--text-1)', margin: '0 0 4px' }}>
            Compliance Dashboard
          </h1>
          <p style={{ color: 'var(--text-3)', fontSize: 12, fontFamily: 'Space Mono, monospace', margin: 0 }}>
            ShieldPay · No wallet required · devnet
          </p>
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--bd)', padding: '32px' }}>
          <ViewingKeyDashboard />
        </div>
      </div>
    </div>
  )
}

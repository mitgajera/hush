export default function HistoryPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '40px 24px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 32, fontWeight: 700, color: 'var(--text-1)', margin: '0 0 8px' }}>
          Payroll History
        </h1>
        <p style={{ color: 'var(--text-3)', fontSize: 12, fontFamily: 'Space Mono, monospace' }}>
          Past payroll runs — upload a run bundle to compliance dashboard to inspect
        </p>
        <div style={{ marginTop: 40, background: 'var(--surface)', border: '1px solid var(--bd)', padding: '32px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-3)', fontFamily: 'Space Mono, monospace', fontSize: 12 }}>
            No history yet. Complete a payroll run to see it here.
          </p>
        </div>
      </div>
    </div>
  )
}

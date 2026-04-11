'use client'

import { formatUsdc } from '@shieldpay/umbra-client'
import type { RunBundle } from './RunSummaryTable'

interface Props {
  bundle: RunBundle
}

export function ExportReports({ bundle }: Props) {
  function exportCsv() {
    const header = 'Contributor,Wallet,Amount (USDC),Tx Signature,Date'
    const date = new Date(bundle.date).toLocaleDateString()
    const rows = bundle.recipients.map(r =>
      `${r.name},${r.wallet},${r.amountUsdc},${r.signatures[0] ?? ''},${date}`
    )
    const csv = [header, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${bundle.runId}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  function exportPdf() {
    const date = new Date(bundle.date).toLocaleDateString()
    const rows = bundle.recipients.map(r => `
      <tr>
        <td>${r.name}</td>
        <td style="font-family:monospace">${r.wallet}</td>
        <td style="font-family:monospace">${formatUsdc(r.amountUsdc)}</td>
        <td style="font-family:monospace">${r.signatures[0] ?? '—'}</td>
        <td>${date}</td>
      </tr>`).join('')

    const html = `<!DOCTYPE html>
<html>
<head><title>ShieldPay Payroll Report — ${bundle.runId}</title>
<style>
  body { font-family: sans-serif; padding: 40px; color: #111; }
  h1 { font-size: 24px; margin-bottom: 4px; }
  p { color: #555; font-size: 13px; }
  table { width: 100%; border-collapse: collapse; margin-top: 20px; }
  th { text-align: left; padding: 8px; background: #f0f0f0; font-size: 11px; text-transform: uppercase; }
  td { padding: 8px; border-bottom: 1px solid #eee; font-size: 13px; }
  tfoot td { font-weight: bold; border-top: 2px solid #ccc; }
</style>
</head>
<body>
<h1>ShieldPay Payroll Report</h1>
<p>Run: ${bundle.runId} · Network: ${bundle.network} · Generated: ${new Date().toLocaleString()}</p>
<table>
  <thead><tr><th>Contributor</th><th>Wallet</th><th>Amount (USDC)</th><th>Tx Signature</th><th>Date</th></tr></thead>
  <tbody>${rows}</tbody>
  <tfoot><tr><td colspan="2">Total</td><td>${formatUsdc(bundle.totalUsdc)}</td><td colspan="2"></td></tr></tfoot>
</table>
</body>
</html>`

    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(html)
    win.document.close()
    win.print()
  }

  return (
    <div style={{ display: 'flex', gap: 12 }}>
      <button
        onClick={exportCsv}
        style={{ background: 'transparent', color: 'var(--umbra-primary)', border: '1px solid var(--umbra-primary-bd2)', borderRadius: 0, padding: '10px 20px', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}
      >
        Export CSV
      </button>
      <button
        onClick={exportPdf}
        style={{ background: 'transparent', color: 'var(--umbra-primary)', border: '1px solid var(--umbra-primary-bd2)', borderRadius: 0, padding: '10px 20px', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}
      >
        Export PDF
      </button>
    </div>
  )
}

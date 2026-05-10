'use client'

import { ExternalLink, Download } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { MaskedAmount } from '@/components/ui/MaskedAmount'
import { useStorageList } from '@/hooks/useLocalStorage'
import { claimedPaymentsStorage, type ClaimedPayment } from '@/lib/storage/claimedPayments'
import { fullTimestamp, relativeTime, formatUsdc } from '@/lib/utils/format'
import Papa from 'papaparse'

function downloadCsv(payments: ClaimedPayment[]) {
  const rows = payments.map((p) => ({
    date: new Date(p.claimedAt).toISOString(),
    description: p.description ?? '',
    amount_usdc: p.amountUsdc,
    tx_signature: p.txSignature,
    network: p.network,
  }))
  const csv = Papa.unparse(rows)
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'hush-payments.csv'
  a.click()
  URL.revokeObjectURL(url)
}

export function ReceivedPaymentsTable() {
  const payments = useStorageList(claimedPaymentsStorage.getAll)

  const totalUsdc = payments.reduce((s, p) => s + p.amountUsdc, 0)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-fg">Payment history</h2>
        {payments.length > 0 && (
          <button
            type="button"
            onClick={() => downloadCsv(payments)}
            className="inline-flex items-center gap-1 text-xs text-fg-muted hover:text-fg"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </button>
        )}
      </div>

      {payments.length === 0 ? (
        <EmptyState
          title="No payments yet"
          description="Payments you claim via Hush links will appear here."
        />
      ) : (
        <Card padding="none" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-bg-surface text-fg-muted">
                <tr>
                  <th className="px-3 py-2 text-left text-2xs font-medium uppercase tracking-wide">Date</th>
                  <th className="px-3 py-2 text-left text-2xs font-medium uppercase tracking-wide">Description</th>
                  <th className="px-3 py-2 text-right text-2xs font-medium uppercase tracking-wide">Amount</th>
                  <th className="px-3 py-2 text-left text-2xs font-medium uppercase tracking-wide">Tx</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} className="border-t border-border align-middle">
                    <td className="px-3 py-2 text-xs text-fg-muted" title={fullTimestamp(p.claimedAt)}>
                      {relativeTime(p.claimedAt)}
                    </td>
                    <td className="px-3 py-2 text-fg">
                      {p.description ?? <span className="text-fg-subtle">—</span>}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <MaskedAmount id={`pay-${p.id}`} amount={p.amountUsdc} />
                    </td>
                    <td className="px-3 py-2">
                      <a
                        href={`https://solscan.io/tx/${p.txSignature}?cluster=${p.network}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-mono text-2xs text-accent hover:opacity-80"
                      >
                        {p.txSignature.slice(0, 8)}…
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-bg-surface">
                <tr>
                  <td colSpan={2} className="px-3 py-2 text-xs text-fg-muted">
                    {payments.length} payment{payments.length === 1 ? '' : 's'}
                  </td>
                  <td className="px-3 py-2 text-right text-sm font-medium text-fg">
                    <span className="mr-2 text-2xs font-normal uppercase tracking-wide text-fg-subtle">Total</span>
                    {formatUsdc(totalUsdc)}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}

'use client'

import Link from 'next/link'
import { MaskedAmount } from '@/components/ui/MaskedAmount'
import { TruncatedAddress } from '@/components/ui/TruncatedAddress'
import { StatusPill } from '@/components/ui/StatusPill'
import { Button } from '@/components/ui/Button'
import { generateRunReceiptCsv } from '@/lib/utils/csv'
import { downloadBlob } from '@/lib/utils/download'
import { fullTimestamp, relativeTime } from '@/lib/utils/format'
import type { PayrollRun } from '@/types'

export function PayrollRunDetail({ run }: { run: PayrollRun }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
        <div>
          <p className="text-fg-subtle">Created</p>
          <p className="text-fg" title={fullTimestamp(run.createdAt)}>
            {relativeTime(run.createdAt)}
          </p>
        </div>
        {run.completedAt && (
          <div>
            <p className="text-fg-subtle">Completed</p>
            <p className="text-fg" title={fullTimestamp(run.completedAt)}>
              {relativeTime(run.completedAt)}
            </p>
          </div>
        )}
        <div>
          <p className="text-fg-subtle">Recipients</p>
          <p className="text-fg">{run.recipients.length}</p>
        </div>
        <div>
          <p className="text-fg-subtle">Total</p>
          <p className="flex items-baseline gap-1 text-fg">
            <MaskedAmount id={`run-${run.id}-total`} amount={run.totalUsdc} />
            <span className="text-fg-subtle">USDC</span>
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-md border border-border">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-bg-surface text-fg-muted">
            <tr>
              <th className="px-3 py-2 text-left text-2xs font-medium uppercase tracking-wide">Recipient</th>
              <th className="px-3 py-2 text-left text-2xs font-medium uppercase tracking-wide">Address</th>
              <th className="px-3 py-2 text-right text-2xs font-medium uppercase tracking-wide">Amount</th>
              <th className="px-3 py-2 text-left text-2xs font-medium uppercase tracking-wide">Status</th>
              <th className="px-3 py-2 text-left text-2xs font-medium uppercase tracking-wide">Tx</th>
            </tr>
          </thead>
          <tbody>
            {run.recipients.map((r) => (
              <tr key={r.id} className="border-t border-border align-middle">
                <td className="px-3 py-2 text-fg">{r.name}</td>
                <td className="px-3 py-2">
                  <TruncatedAddress address={r.umbraAddress} />
                </td>
                <td className="px-3 py-2 text-right">
                  <MaskedAmount id={`detail-${run.id}-${r.id}`} amount={r.amountUsdc} />
                </td>
                <td className="px-3 py-2">
                  <StatusPill status={r.status} />
                </td>
                <td className="px-3 py-2 font-mono text-2xs text-fg-subtle">
                  {r.txSignature ? r.txSignature.slice(0, 10) + '…' : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
        <Button
          variant="secondary"
          size="sm"
          onClick={() =>
            downloadBlob(generateRunReceiptCsv(run), `payroll-${run.id}.csv`, 'text/csv')
          }
        >
          Download receipt (CSV)
        </Button>
        <Link
          href={`/audit?run=${run.id}`}
          className="btn btn-primary text-xs h-8"
        >
          Generate audit key
        </Link>
      </div>
    </div>
  )
}

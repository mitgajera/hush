'use client'

import { Fragment, useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { MaskedAmount } from '@/components/ui/MaskedAmount'
import { StatusPill } from '@/components/ui/StatusPill'
import { usePayrollRuns } from '@/hooks/usePayrollRuns'
import { relativeTime, fullTimestamp } from '@/lib/utils/format'
import { PayrollRunDetail } from './PayrollRunDetail'
import { cn } from '@/lib/utils/cn'

export function PayrollHistory() {
  const runs = usePayrollRuns()
  const [expanded, setExpanded] = useState<string | null>(null)

  if (runs.length === 0) {
    return (
      <EmptyState
        title="No payroll runs yet"
        description="Your completed runs will appear here. Upload a CSV or add recipients below to send your first private batch."
      />
    )
  }

  return (
    <Card padding="none" className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-bg-surface text-fg-muted">
            <tr>
              <th className="w-6 px-2 py-2" aria-label="Expand" />
              <th className="px-3 py-2 text-left text-2xs font-medium uppercase tracking-wide">Run</th>
              <th className="px-3 py-2 text-left text-2xs font-medium uppercase tracking-wide">Created</th>
              <th className="px-3 py-2 text-right text-2xs font-medium uppercase tracking-wide">Recipients</th>
              <th className="px-3 py-2 text-right text-2xs font-medium uppercase tracking-wide">Total</th>
              <th className="px-3 py-2 text-left text-2xs font-medium uppercase tracking-wide">Status</th>
            </tr>
          </thead>
          <tbody>
            {runs.map((run) => {
              const isOpen = expanded === run.id
              return (
                <Fragment key={run.id}>
                  <tr
                    className={cn(
                      'border-t border-border cursor-pointer align-middle hover:bg-bg-elevated/40',
                      isOpen && 'bg-bg-elevated/40'
                    )}
                    onClick={() => setExpanded(isOpen ? null : run.id)}
                  >
                    <td className="px-2 py-2 text-fg-muted">
                      {isOpen ? (
                        <ChevronDown className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <ChevronRight className="h-4 w-4" aria-hidden="true" />
                      )}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs text-fg">
                      {run.id}
                    </td>
                    <td className="px-3 py-2 text-fg" title={fullTimestamp(run.createdAt)}>
                      {relativeTime(run.createdAt)}
                    </td>
                    <td className="px-3 py-2 text-right font-mono tabular-nums text-fg">
                      {run.recipients.length}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <MaskedAmount
                        id={`history-${run.id}-total`}
                        amount={run.totalUsdc}
                        showToggle={false}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <StatusPill status={run.status} />
                    </td>
                  </tr>
                  {isOpen && (
                    <tr className="border-t border-border bg-bg-elevated/20">
                      <td colSpan={6} className="p-4">
                        <PayrollRunDetail run={run} />
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

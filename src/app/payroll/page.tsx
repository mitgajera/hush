'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Shell } from '@/components/layout/Shell'
import { PageHeader } from '@/components/layout/PageHeader'
import { WalletGate } from '@/components/wallet/WalletGate'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { CsvUploader } from '@/components/features/payroll/CsvUploader'
import { RecipientPreviewTable } from '@/components/features/payroll/RecipientPreviewTable'
import { ManualEntryTable } from '@/components/features/payroll/ManualEntryTable'
import { RunPayrollButton } from '@/components/features/payroll/RunPayrollButton'
import { PayrollProgressModal } from '@/components/features/payroll/PayrollProgressModal'
import { PayrollHistory } from '@/components/features/payroll/PayrollHistory'
import { cn } from '@/lib/utils/cn'
import type { DraftRecipient } from '@/types'

type Mode = 'csv' | 'manual'

function PayrollContent() {
  const [mode, setMode] = useState<Mode>('csv')
  const [recipients, setRecipients] = useState<DraftRecipient[]>([])
  const [activeRunId, setActiveRunId] = useState<string | null>(null)

  function patchRecipient(id: string, patch: Partial<DraftRecipient>) {
    setRecipients((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  }

  function removeRecipient(id: string) {
    setRecipients((prev) => prev.filter((r) => r.id !== id))
  }

  function onRunCreated(runId: string) {
    toast.success('Payroll run created.')
    setActiveRunId(runId)
  }

  function closeModal() {
    setActiveRunId(null)
    setRecipients([])
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Hush Payroll"
        description="Upload a CSV or enter recipients manually. Every transfer is encrypted end-to-end."
      />

      <section className="space-y-3">
        <h3 className="text-sm font-medium text-fg">History</h3>
        <PayrollHistory />
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-medium text-fg">New payroll run</h3>
          <div className="inline-flex items-center gap-1 rounded-md border border-border bg-bg-surface p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setMode('csv')}
              className={cn(
                'rounded px-2.5 py-1 transition-colors',
                mode === 'csv' ? 'bg-bg-elevated text-fg' : 'text-fg-muted hover:text-fg'
              )}
            >
              CSV upload
            </button>
            <button
              type="button"
              onClick={() => setMode('manual')}
              className={cn(
                'rounded px-2.5 py-1 transition-colors',
                mode === 'manual' ? 'bg-bg-elevated text-fg' : 'text-fg-muted hover:text-fg'
              )}
            >
              Manual entry
            </button>
          </div>
        </div>

        {mode === 'csv' ? (
          <div className="space-y-3">
            <CsvUploader onRows={(rows) => setRecipients(rows)} />
            <RecipientPreviewTable
              recipients={recipients}
              onChange={patchRecipient}
              onRemove={removeRecipient}
            />
          </div>
        ) : (
          <ManualEntryTable recipients={recipients} onChange={setRecipients} />
        )}

        {recipients.length > 0 && (
          <Card className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-sm text-fg-muted">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setRecipients([])}
                disabled={recipients.length === 0}
              >
                Clear
              </Button>
            </div>
            <RunPayrollButton recipients={recipients} onRunCreated={onRunCreated} />
          </Card>
        )}
      </section>

      <PayrollProgressModal runId={activeRunId} onClose={closeModal} />
    </div>
  )
}

export default function PayrollPage() {
  return (
    <Shell>
      <WalletGate>
        <PayrollContent />
      </WalletGate>
    </Shell>
  )
}

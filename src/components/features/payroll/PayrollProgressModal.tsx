'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Check, Key, Loader2, RefreshCw, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { Progress } from '@/components/ui/Progress'
import { MaskedAmount } from '@/components/ui/MaskedAmount'
import { TruncatedAddress } from '@/components/ui/TruncatedAddress'
import { usePayrollRuns } from '@/hooks/usePayrollRuns'
import { useUmbra } from '@/hooks/useUmbra'
import { runPayroll } from '@/lib/payroll/runPayroll'
import { generateRunReceiptCsv } from '@/lib/utils/csv'
import { downloadBlob } from '@/lib/utils/download'
import { cn } from '@/lib/utils/cn'
import type { PayrollRecipient } from '@/types'

function StatusIcon({ status }: { status: PayrollRecipient['status'] }) {
  if (status === 'success')
    return <Check className="h-4 w-4 text-success" aria-label="Sent" />
  if (status === 'failed')
    return <X className="h-4 w-4 text-danger" aria-label="Failed" />
  if (status === 'sending')
    return (
      <Loader2 className="h-4 w-4 animate-spin text-accent" aria-label="Sending" />
    )
  return (
    <span className="h-1.5 w-1.5 rounded-full bg-fg-subtle" aria-label="Pending" />
  )
}

type Props = {
  runId: string | null
  onClose: () => void
}

export function PayrollProgressModal({ runId, onClose }: Props) {
  const umbra = useUmbra()
  const runs = usePayrollRuns()
  const run = runId ? runs.find((r) => r.id === runId) ?? null : null
  const triggeredRef = useRef<string | null>(null)
  const [retrying, setRetrying] = useState(false)

  const isOpen = Boolean(run)
  const isRunning = run?.status === 'running' || retrying

  useEffect(() => {
    if (!run || !umbra) return
    if (triggeredRef.current === run.id) return
    if (run.status !== 'running') return
    triggeredRef.current = run.id

    runPayroll(umbra, run.id, {
      onRecipientFailure: (r) => {
        toast.error(`Payment to ${r.name || 'recipient'} failed — retry?`)
      },
    })
      .then((finished) => {
        const success = finished.recipients.filter((r) => r.status === 'success').length
        const total = finished.recipients.length
        if (finished.status === 'completed') {
          toast.success(
            `${success} payment${success === 1 ? '' : 's'} hushed.`
          )
        } else if (finished.status === 'partial') {
          toast.warning(`${success} of ${total} completed.`)
        } else {
          toast.error('Payroll run failed.')
        }
      })
      .catch((err) => {
        toast.error(err instanceof Error ? err.message : 'Payroll failed')
      })
  }, [run, umbra])

  async function retry() {
    if (!run || !umbra) return
    setRetrying(true)
    try {
      const finished = await runPayroll(umbra, run.id)
      const success = finished.recipients.filter((r) => r.status === 'success').length
      const total = finished.recipients.length
      if (finished.status === 'completed') {
        toast.success(`All ${success} payments hushed.`)
      } else if (finished.status === 'partial') {
        toast.warning(`${success} of ${total} completed.`)
      } else {
        toast.error('Retry failed.')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Retry failed')
    } finally {
      setRetrying(false)
    }
  }

  function download() {
    if (!run) return
    const csv = generateRunReceiptCsv(run)
    downloadBlob(csv, `payroll-${run.id}.csv`, 'text/csv')
  }

  const counts = useMemo(() => {
    if (!run) return { done: 0, sent: 0, failed: 0, total: 0 }
    const sent = run.recipients.filter((r) => r.status === 'success').length
    const failed = run.recipients.filter((r) => r.status === 'failed').length
    return {
      done: sent + failed,
      sent,
      failed,
      total: run.recipients.length,
    }
  }, [run])

  const progressPct = counts.total ? (counts.done / counts.total) * 100 : 0

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(o) => {
        if (o) return
        if (isRunning) return
        onClose()
      }}
      hideClose={isRunning}
      title={
        isRunning
          ? 'Sending private payments…'
          : run?.status === 'completed'
          ? 'All payments hushed'
          : run?.status === 'partial'
          ? `${counts.sent} of ${counts.total} completed`
          : 'Payroll run failed'
      }
      description={
        isRunning
          ? 'Each payment is encrypted and signed through your Umbra wallet.'
          : undefined
      }
      className="max-w-lg"
    >
      {run && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Progress value={progressPct} label="payroll progress" />
            <div className="flex items-center justify-between text-2xs text-fg-subtle">
              <span>
                {counts.done}/{counts.total} processed
              </span>
              <span>
                {counts.sent} sent · {counts.failed} failed
              </span>
            </div>
          </div>

          <ul className="max-h-72 divide-y divide-border overflow-y-auto rounded-md border border-border">
            {run.recipients.map((r) => (
              <li
                key={r.id}
                className={cn(
                  'flex items-center gap-3 px-3 py-2',
                  r.status === 'failed' && 'bg-danger/5',
                  r.status === 'success' && 'bg-success/5'
                )}
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                  <StatusIcon status={r.status} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-fg">{r.name}</p>
                  <div className="flex items-center gap-2 text-2xs text-fg-subtle">
                    <TruncatedAddress
                      address={r.walletAddress}
                      showCopy={false}
                      monospace
                    />
                    {r.error && <span className="text-danger">· {r.error}</span>}
                  </div>
                </div>
                <MaskedAmount
                  id={`progress-${run.id}-${r.id}`}
                  amount={r.amountUsdc}
                  showToggle={false}
                />
              </li>
            ))}
          </ul>

          {!isRunning && (
            <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
              {counts.failed > 0 && (
                <Button
                  variant="secondary"
                  leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
                  onClick={retry}
                  loading={retrying}
                >
                  Retry failed
                </Button>
              )}
              <Button
                variant="secondary"
                onClick={download}
              >
                Download receipt (CSV)
              </Button>
              <Link
                href={`/audit?run=${run.id}`}
                className="btn btn-primary"
                onClick={onClose}
              >
                <Key className="h-3.5 w-3.5" />
                Generate audit key
              </Link>
              <Button variant="ghost" onClick={onClose}>
                Done
              </Button>
            </div>
          )}
        </div>
      )}
    </Dialog>
  )
}

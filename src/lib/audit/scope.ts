import { format } from 'date-fns'
import type { AuditKeyScope, PayrollRun } from '@/types'

export function describeScope(scope: AuditKeyScope, runs: PayrollRun[]): string {
  if (scope.type === 'all') return 'All payments'
  if (scope.type === 'run') {
    const run = runs.find((r) => r.id === scope.runId)
    if (!run) return `Payroll ${scope.runId}`
    const date = format(new Date(run.createdAt), 'MMM d, yyyy')
    return `Payroll ${scope.runId.slice(0, 12)}… · ${run.recipients.length} recipients · ${date}`
  }
  const from = format(new Date(scope.from), 'MMM d, yyyy')
  const to = format(new Date(scope.to), 'MMM d, yyyy')
  return `From ${from} to ${to}`
}

export function scopeToUmbra(scope: AuditKeyScope):
  | { type: 'run'; runId: string }
  | { type: 'dateRange'; from: Date; to: Date }
  | { type: 'all' } {
  if (scope.type === 'dateRange') {
    return { type: 'dateRange', from: new Date(scope.from), to: new Date(scope.to) }
  }
  return scope
}

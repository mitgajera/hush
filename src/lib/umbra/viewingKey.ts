import { nanoid } from 'nanoid'
import { UmbraClient } from './client'
import { DecryptedTransfer, ViewingKeyResult, ViewingKeyScope } from './types'
import { auditKeysStorage } from '@/lib/storage/auditKeys'
import { payrollStorage } from '@/lib/storage/payrollRuns'
import type { AuditKeyScope, PayrollRun } from '@/types'

export async function generateViewingKey(
  _client: UmbraClient,
  _scope: ViewingKeyScope
): Promise<ViewingKeyResult> {
  // Real:
  //   return umbra.generateViewingKey({ scope })
  return { key: 'vk_' + nanoid(48) }
}

function matchesScope(run: PayrollRun, scope: AuditKeyScope): boolean {
  if (scope.type === 'all') return true
  if (scope.type === 'run') return run.id === scope.runId
  if (scope.type === 'dateRange') {
    const ts = new Date(run.completedAt ?? run.createdAt).getTime()
    return (
      ts >= new Date(scope.from).getTime() &&
      ts <= new Date(scope.to).getTime()
    )
  }
  return false
}

export async function decryptWithViewingKey(
  _client: UmbraClient,
  key: string
): Promise<DecryptedTransfer[]> {
  // Real:
  //   return umbra.decryptWithViewingKey({ key })
  if (!key.startsWith('vk_')) throw new Error('Invalid viewing key')

  // Dev stub: look up the scope this key was generated with and return the
  // matching payroll recipients so the demo flow has real data to show.
  const record = auditKeysStorage.getAll().find((k) => k.key === key)
  if (record) {
    auditKeysStorage.update(record.id, { lastUsedAt: new Date().toISOString() })
  }
  if (!record) return []

  const runs = payrollStorage.getAll()
  const matching = runs.filter((r) => matchesScope(r, record.scope))

  const transfers: DecryptedTransfer[] = []
  for (const run of matching) {
    for (const recipient of run.recipients) {
      if (recipient.status !== 'success') continue
      transfers.push({
        from: run.senderAddress,
        to: recipient.umbraAddress,
        amountUsdc: recipient.amountUsdc,
        timestamp: run.completedAt ?? run.createdAt,
        memo: recipient.name,
        txSignature: recipient.txSignature ?? '',
      })
    }
  }

  return transfers.sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  )
}

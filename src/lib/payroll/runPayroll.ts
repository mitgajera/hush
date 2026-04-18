import { PayrollRecipient, PayrollRun } from '@/types'
import { UmbraClient } from '@/lib/umbra/client'
import { sendConfidentialTransfer } from '@/lib/umbra/transfer'
import { payrollStorage } from '@/lib/storage/payrollRuns'

export type PayrollRunnerCallbacks = {
  onRecipientStart?: (recipient: PayrollRecipient) => void
  onRecipientSuccess?: (recipient: PayrollRecipient) => void
  onRecipientFailure?: (recipient: PayrollRecipient, error: Error) => void
}

function replace(recipients: PayrollRecipient[], updated: PayrollRecipient) {
  return recipients.map((r) => (r.id === updated.id ? updated : r))
}

export async function runPayroll(
  client: UmbraClient,
  runId: string,
  callbacks?: PayrollRunnerCallbacks
): Promise<PayrollRun> {
  const initial = payrollStorage.get(runId)
  if (!initial) throw new Error('Payroll run not found')

  const toProcess = initial.recipients.filter(
    (r) => r.status === 'pending' || r.status === 'failed'
  )

  let current = payrollStorage.update(runId, {
    status: 'running',
    recipients: initial.recipients.map((r) =>
      toProcess.some((t) => t.id === r.id)
        ? { ...r, status: 'pending', error: undefined }
        : r
    ),
  })
  if (!current) throw new Error('Payroll run vanished')

  for (const recipient of toProcess) {
    const sending: PayrollRecipient = { ...recipient, status: 'sending', error: undefined }
    current = payrollStorage.update(runId, {
      recipients: replace(current.recipients, sending),
    })!
    callbacks?.onRecipientStart?.(sending)

    try {
      const result = await sendConfidentialTransfer(client, {
        to: recipient.umbraAddress,
        amountUsdc: recipient.amountUsdc,
        token: 'USDC',
      })
      const succeeded: PayrollRecipient = {
        ...sending,
        status: 'success',
        txSignature: result.txSignature,
      }
      current = payrollStorage.update(runId, {
        recipients: replace(current.recipients, succeeded),
      })!
      callbacks?.onRecipientSuccess?.(succeeded)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Transfer failed')
      const failed: PayrollRecipient = {
        ...sending,
        status: 'failed',
        error: error.message,
      }
      current = payrollStorage.update(runId, {
        recipients: replace(current.recipients, failed),
      })!
      callbacks?.onRecipientFailure?.(failed, error)
    }
  }

  const all = current.recipients
  const everyOk = all.every((r) => r.status === 'success')
  const everyFail = all.every((r) => r.status === 'failed')
  const finalStatus: PayrollRun['status'] = everyOk
    ? 'completed'
    : everyFail
    ? 'failed'
    : 'partial'

  const finished = payrollStorage.update(runId, {
    status: finalStatus,
    completedAt: new Date().toISOString(),
  })
  return finished!
}

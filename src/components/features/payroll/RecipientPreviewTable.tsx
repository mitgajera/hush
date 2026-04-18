'use client'

import { Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { MaskedAmount } from '@/components/ui/MaskedAmount'
import { TruncatedAddress } from '@/components/ui/TruncatedAddress'
import { draftRecipientSchema } from '@/lib/utils/validation'
import { cn } from '@/lib/utils/cn'
import type { DraftRecipient } from '@/types'

type RowIssue = { field: 'name' | 'umbraAddress' | 'amountUsdc'; message: string }

export function validateRecipient(r: DraftRecipient): RowIssue | null {
  const parsed = draftRecipientSchema.safeParse(r)
  if (parsed.success) return null
  const issue = parsed.error.issues[0]
  const field = (issue.path[0] as RowIssue['field']) ?? 'name'
  return { field, message: issue.message }
}

export function RecipientPreviewTable({
  recipients,
  onChange,
  onRemove,
  editable = true,
}: {
  recipients: DraftRecipient[]
  onChange?: (id: string, patch: Partial<DraftRecipient>) => void
  onRemove?: (id: string) => void
  editable?: boolean
}) {
  if (recipients.length === 0) return null

  const total = recipients.reduce((sum, r) => sum + (Number.isFinite(r.amountUsdc) ? r.amountUsdc : 0), 0)

  return (
    <Card padding="none" className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-bg-surface text-fg-muted">
            <tr>
              <th className="px-3 py-2 text-left text-2xs font-medium uppercase tracking-wide">Name</th>
              <th className="px-3 py-2 text-left text-2xs font-medium uppercase tracking-wide">Umbra address</th>
              <th className="px-3 py-2 text-right text-2xs font-medium uppercase tracking-wide">Amount (USDC)</th>
              {editable && onRemove && <th className="w-10 px-3 py-2" aria-label="Remove" />}
            </tr>
          </thead>
          <tbody>
            {recipients.map((r, idx) => {
              const issue = validateRecipient(r)
              return (
                <tr
                  key={r.id}
                  className={cn(
                    'border-t border-border align-middle',
                    issue && 'bg-danger/5'
                  )}
                >
                  <td className="px-3 py-2">
                    {editable && onChange ? (
                      <input
                        value={r.name}
                        onChange={(e) => onChange(r.id, { name: e.target.value })}
                        className={cn(
                          'h-8 w-full rounded-md border bg-bg px-2 text-sm text-fg outline-none transition-colors focus:border-border-strong',
                          issue?.field === 'name' ? 'border-danger' : 'border-border'
                        )}
                        placeholder={`Recipient ${idx + 1}`}
                      />
                    ) : (
                      <span className="text-fg">{r.name}</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {editable && onChange ? (
                      <input
                        value={r.umbraAddress}
                        onChange={(e) =>
                          onChange(r.id, { umbraAddress: e.target.value.trim() })
                        }
                        className={cn(
                          'h-8 w-full rounded-md border bg-bg px-2 font-mono text-xs text-fg outline-none transition-colors focus:border-border-strong',
                          issue?.field === 'umbraAddress' ? 'border-danger' : 'border-border'
                        )}
                        placeholder="umb1…"
                      />
                    ) : (
                      <TruncatedAddress address={r.umbraAddress} />
                    )}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {editable && onChange ? (
                      <input
                        type="number"
                        inputMode="decimal"
                        min={0}
                        step="0.01"
                        value={Number.isFinite(r.amountUsdc) ? r.amountUsdc : ''}
                        onChange={(e) =>
                          onChange(r.id, {
                            amountUsdc: e.target.value === '' ? 0 : Number(e.target.value),
                          })
                        }
                        className={cn(
                          'h-8 w-32 rounded-md border bg-bg px-2 text-right font-mono text-sm text-fg outline-none transition-colors focus:border-border-strong',
                          issue?.field === 'amountUsdc' ? 'border-danger' : 'border-border'
                        )}
                      />
                    ) : (
                      <MaskedAmount id={`row-${r.id}`} amount={r.amountUsdc} />
                    )}
                  </td>
                  {editable && onRemove && (
                    <td className="px-3 py-2 text-right">
                      <button
                        type="button"
                        onClick={() => onRemove(r.id)}
                        aria-label={`Remove ${r.name || 'recipient'}`}
                        className="inline-flex h-7 w-7 items-center justify-center rounded text-fg-subtle hover:bg-bg-elevated hover:text-danger"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
          <tfoot className="bg-bg-surface">
            <tr>
              <td className="px-3 py-2 text-xs text-fg-muted" colSpan={2}>
                {recipients.length} recipient{recipients.length === 1 ? '' : 's'}
              </td>
              <td className="px-3 py-2 text-right text-sm text-fg">
                <span className="mr-2 text-2xs uppercase tracking-wide text-fg-subtle">Total</span>
                <MaskedAmount id="preview-total" amount={total} />
              </td>
              {editable && onRemove && <td />}
            </tr>
          </tfoot>
        </table>
      </div>
    </Card>
  )
}

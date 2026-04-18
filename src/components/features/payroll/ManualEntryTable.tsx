'use client'

import { Plus } from 'lucide-react'
import { nanoid } from 'nanoid'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { RecipientPreviewTable } from './RecipientPreviewTable'
import type { DraftRecipient } from '@/types'

type Props = {
  recipients: DraftRecipient[]
  onChange: (recipients: DraftRecipient[]) => void
}

function makeRow(): DraftRecipient {
  return { id: nanoid(8), name: '', umbraAddress: '', amountUsdc: 0 }
}

export function ManualEntryTable({ recipients, onChange }: Props) {
  function addRow() {
    onChange([...recipients, makeRow()])
  }

  function patchRow(id: string, patch: Partial<DraftRecipient>) {
    onChange(recipients.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  }

  function removeRow(id: string) {
    onChange(recipients.filter((r) => r.id !== id))
  }

  if (recipients.length === 0) {
    return (
      <EmptyState
        title="Add recipients manually"
        description="Start a row to send a private payment to each recipient."
        action={
          <Button leftIcon={<Plus className="h-3.5 w-3.5" />} onClick={addRow}>
            Add recipient
          </Button>
        }
      />
    )
  }

  return (
    <div className="space-y-3">
      <RecipientPreviewTable
        recipients={recipients}
        onChange={patchRow}
        onRemove={removeRow}
      />
      <div className="flex justify-end">
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<Plus className="h-3.5 w-3.5" />}
          onClick={addRow}
        >
          Add recipient
        </Button>
      </div>
    </div>
  )
}

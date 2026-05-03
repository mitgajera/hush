'use client'

import { DragEvent, useRef, useState } from 'react'
import { nanoid } from 'nanoid'
import { FileUp, Upload } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { parsePayrollCsv } from '@/lib/utils/csv'
import { cn } from '@/lib/utils/cn'
import type { DraftRecipient } from '@/types'

type Props = {
  onRows: (rows: DraftRecipient[]) => void
}

export function CsvUploader({ onRows }: Props) {
  const [dragging, setDragging] = useState(false)
  const [parseErrors, setParseErrors] = useState<{ row: number; message: string }[]>([])
  const [fileName, setFileName] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setParseErrors([{ row: 0, message: 'Only .csv files are supported' }])
      setFileName(file.name)
      return
    }
    const text = await file.text()
    const { rows, errors } = parsePayrollCsv(text)
    setParseErrors(errors)
    setFileName(file.name)
    if (rows.length) {
      onRows(
        rows.map((r) => ({
          id: nanoid(8),
          name: r.name,
          walletAddress: r.wallet_address,
          amountUsdc: r.amount,
        }))
      )
    }
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) void handleFile(file)
  }

  return (
    <Card className="space-y-3">
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          'flex flex-col items-center gap-2 rounded-md border border-dashed px-6 py-10 text-center transition-colors',
          dragging
            ? 'border-accent/60 bg-accent/5'
            : parseErrors.length
            ? 'border-danger/40 bg-danger/5'
            : 'border-border bg-bg-elevated/40'
        )}
      >
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-bg-elevated text-fg-muted">
          <FileUp className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="space-y-1">
          <p className="text-sm text-fg">
            Drop a CSV here or <span className="text-accent">browse</span>
          </p>
          <p className="text-xs text-fg-subtle">
            Columns required: <span className="font-mono">name, wallet_address, amount</span>
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          leftIcon={<Upload className="h-3.5 w-3.5" />}
          onClick={() => inputRef.current?.click()}
        >
          Select file
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) void handleFile(file)
            e.target.value = ''
          }}
        />
        {fileName && (
          <p className="mt-1 text-2xs text-fg-subtle">
            {fileName}
          </p>
        )}
      </div>

      {parseErrors.length > 0 && (
        <div className="rounded-md border border-danger/30 bg-danger/5 p-3 text-xs text-danger">
          <p className="font-medium">
            {parseErrors.length} row{parseErrors.length === 1 ? '' : 's'} rejected:
          </p>
          <ul className="mt-1.5 list-disc pl-4">
            {parseErrors.slice(0, 5).map((err, i) => (
              <li key={i}>
                Row {err.row}: {err.message}
              </li>
            ))}
            {parseErrors.length > 5 && (
              <li className="text-fg-subtle">…and {parseErrors.length - 5} more</li>
            )}
          </ul>
        </div>
      )}
    </Card>
  )
}

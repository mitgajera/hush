import Papa from 'papaparse'
import { PayrollRun } from '@/types'
import { payrollRecipientSchema } from './validation'

export type CsvRow = {
  name: string
  umbra_address: string
  amount: number
}

export function parsePayrollCsv(text: string): {
  rows: CsvRow[]
  errors: { row: number; message: string }[]
} {
  const parsed = Papa.parse<Record<string, unknown>>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim().toLowerCase(),
  })

  const rows: CsvRow[] = []
  const errors: { row: number; message: string }[] = []

  parsed.data.forEach((raw, i) => {
    const result = payrollRecipientSchema.safeParse(raw)
    if (result.success) rows.push(result.data)
    else errors.push({ row: i + 2, message: result.error.issues[0].message })
  })

  return { rows, errors }
}

export function generateRunReceiptCsv(run: PayrollRun): string {
  const headers = [
    'run_id',
    'recipient_name',
    'umbra_address',
    'amount_usdc',
    'status',
    'tx_signature',
  ]
  const rows = run.recipients.map((r) => [
    run.id,
    r.name,
    r.umbraAddress,
    String(r.amountUsdc),
    r.status,
    r.txSignature ?? '',
  ])
  return Papa.unparse([headers, ...rows])
}

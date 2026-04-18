'use client'

import { useMemo, useState } from 'react'
import { format, parseISO } from 'date-fns'
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Download,
  ExternalLink,
  FileText,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { TruncatedAddress } from '@/components/ui/TruncatedAddress'
import { formatUsdc } from '@/lib/utils/format'
import { downloadBlob } from '@/lib/utils/download'
import { generateAuditPdf } from '@/lib/pdf/auditReport'
import { cn } from '@/lib/utils/cn'
import type { DecryptedTransfer } from '@/lib/umbra/types'

type SortKey = 'index' | 'recipient' | 'amount' | 'date' | 'memo'
type SortDir = 'asc' | 'desc'

type Props = {
  records: DecryptedTransfer[]
  scope: string
  network?: 'devnet' | 'mainnet-beta'
}

function toCsv(records: DecryptedTransfer[]): string {
  const header = ['#', 'recipient', 'amount_usdc', 'date', 'time', 'memo', 'tx_signature']
  const rows = records.map((r, i) => [
    String(i + 1),
    r.to,
    r.amountUsdc.toFixed(2),
    format(parseISO(r.timestamp), 'yyyy-MM-dd'),
    format(parseISO(r.timestamp), 'HH:mm:ss'),
    (r.memo ?? '').replace(/"/g, '""'),
    r.txSignature,
  ])
  return [header, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(','))
    .join('\n')
}

export function DecryptedRecordsTable({ records, scope, network = 'devnet' }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('date')
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  const sorted = useMemo(() => {
    const copy = [...records]
    copy.sort((a, b) => {
      let cmp = 0
      if (sortKey === 'recipient') cmp = a.to.localeCompare(b.to)
      else if (sortKey === 'amount') cmp = a.amountUsdc - b.amountUsdc
      else if (sortKey === 'memo') cmp = (a.memo ?? '').localeCompare(b.memo ?? '')
      else if (sortKey === 'date')
        cmp = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      return sortDir === 'asc' ? cmp : -cmp
    })
    return copy
  }, [records, sortKey, sortDir])

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir(key === 'date' ? 'asc' : 'desc')
    }
  }

  const total = records.reduce((sum, r) => sum + r.amountUsdc, 0)
  const range =
    records.length === 0
      ? '—'
      : (() => {
          const times = records.map((r) => new Date(r.timestamp).getTime())
          const min = format(new Date(Math.min(...times)), 'MMM d, yyyy')
          const max = format(new Date(Math.max(...times)), 'MMM d, yyyy')
          return min === max ? min : `${min} → ${max}`
        })()

  function exportCsv() {
    const csv = toCsv(sorted)
    downloadBlob(csv, `hush-audit-${Date.now()}.csv`, 'text/csv')
  }

  function exportPdf() {
    generateAuditPdf(sorted, scope)
  }

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <Card variant="elevated" className="flex flex-wrap items-center gap-x-6 gap-y-3 py-3">
        <SummaryStat label="Payments" value={records.length.toString()} />
        <SummaryStat
          label="Total"
          value={
            <>
              <span className="font-mono tabular-nums">{formatUsdc(total)}</span>
              <span className="ml-1 text-xs text-fg-subtle">USDC</span>
            </>
          }
        />
        <SummaryStat label="Range" value={range} />
        <SummaryStat label="Source" value={scope} ellipsis />

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Download className="h-3.5 w-3.5" />}
            onClick={exportCsv}
            disabled={records.length === 0}
          >
            Export CSV
          </Button>
          <Button
            size="sm"
            leftIcon={<FileText className="h-3.5 w-3.5" />}
            onClick={exportPdf}
            disabled={records.length === 0}
          >
            Export PDF
          </Button>
        </div>
      </Card>

      {/* Records table */}
      {records.length === 0 ? (
        <Card className="py-12 text-center">
          <p className="text-sm text-fg-muted">
            This key decrypts to no records in its scope.
          </p>
        </Card>
      ) : (
        <Card padding="none" className="overflow-hidden">
          <div className="max-h-[68vh] overflow-auto">
            <table className="w-full border-collapse text-sm">
              <thead className="sticky top-0 z-10 bg-bg-surface text-fg-muted">
                <tr>
                  <Th align="right" width="w-10" onClick={() => toggleSort('index')}>
                    #
                  </Th>
                  <Th onClick={() => toggleSort('recipient')} active={sortKey === 'recipient'} dir={sortDir}>
                    Recipient
                  </Th>
                  <Th
                    align="right"
                    onClick={() => toggleSort('amount')}
                    active={sortKey === 'amount'}
                    dir={sortDir}
                  >
                    Amount (USDC)
                  </Th>
                  <Th onClick={() => toggleSort('date')} active={sortKey === 'date'} dir={sortDir}>
                    Date
                  </Th>
                  <Th>Time</Th>
                  <Th onClick={() => toggleSort('memo')} active={sortKey === 'memo'} dir={sortDir}>
                    Memo
                  </Th>
                  <Th>Tx</Th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((r, idx) => {
                  const ts = parseISO(r.timestamp)
                  return (
                    <tr
                      key={`${r.txSignature}-${idx}`}
                      className="border-t border-border align-middle hover:bg-bg-elevated/30"
                    >
                      <td className="px-3 py-2.5 text-right font-mono text-xs text-fg-subtle">
                        {idx + 1}
                      </td>
                      <td className="px-3 py-2.5">
                        <TruncatedAddress address={r.to} prefixLen={6} suffixLen={4} />
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono tabular-nums text-fg">
                        {formatUsdc(r.amountUsdc)}
                      </td>
                      <td className="px-3 py-2.5 font-mono text-xs text-fg">
                        {format(ts, 'yyyy-MM-dd')}
                      </td>
                      <td className="px-3 py-2.5 font-mono text-xs text-fg-subtle">
                        {format(ts, 'HH:mm:ss')}
                      </td>
                      <td className="px-3 py-2.5 text-fg">
                        {r.memo || <span className="text-fg-subtle">—</span>}
                      </td>
                      <td className="px-3 py-2.5">
                        {r.txSignature ? (
                          <a
                            href={`https://solscan.io/tx/${r.txSignature}?cluster=${network}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 font-mono text-2xs text-accent hover:underline"
                          >
                            {r.txSignature.slice(0, 8)}…
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-fg-subtle">—</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot className="bg-bg-surface">
                <tr>
                  <td colSpan={2} className="px-3 py-2 text-2xs uppercase tracking-wide text-fg-subtle">
                    Total
                  </td>
                  <td className="px-3 py-2 text-right font-mono tabular-nums text-fg">
                    {formatUsdc(total)}
                  </td>
                  <td colSpan={4} />
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}

function Th({
  children,
  align = 'left',
  width,
  onClick,
  active,
  dir,
}: {
  children: React.ReactNode
  align?: 'left' | 'right'
  width?: string
  onClick?: () => void
  active?: boolean
  dir?: SortDir
}) {
  const clickable = Boolean(onClick)
  const Icon = !active ? ArrowUpDown : dir === 'asc' ? ArrowUp : ArrowDown
  return (
    <th
      className={cn(
        'border-b border-border px-3 py-2 text-2xs font-medium uppercase tracking-wide',
        align === 'right' ? 'text-right' : 'text-left',
        width
      )}
    >
      {clickable ? (
        <button
          type="button"
          onClick={onClick}
          className={cn(
            'inline-flex items-center gap-1 hover:text-fg',
            align === 'right' && 'ml-auto',
            active && 'text-fg'
          )}
        >
          {children}
          <Icon
            className={cn(
              'h-3 w-3 transition-opacity',
              active ? 'opacity-100' : 'opacity-40'
            )}
            aria-hidden="true"
          />
        </button>
      ) : (
        <span className={cn(align === 'right' && 'ml-auto block')}>{children}</span>
      )}
    </th>
  )
}

function SummaryStat({
  label,
  value,
  ellipsis,
}: {
  label: string
  value: React.ReactNode
  ellipsis?: boolean
}) {
  return (
    <div className="space-y-0.5">
      <p className="text-2xs uppercase tracking-wide text-fg-subtle">{label}</p>
      <p className={cn('text-sm text-fg', ellipsis && 'max-w-[280px] truncate')}>
        {value}
      </p>
    </div>
  )
}

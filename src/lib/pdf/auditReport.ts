import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { format, parseISO } from 'date-fns'
import type { DecryptedTransfer } from '@/lib/umbra/types'

function truncate(addr: string, head = 10, tail = 6): string {
  if (addr.length <= head + tail) return addr
  return `${addr.slice(0, head)}…${addr.slice(-tail)}`
}

export function generateAuditPdf(
  records: DecryptedTransfer[],
  scope: string
): void {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 40

  // Header
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.setTextColor(20)
  doc.text('hush.', margin, 50)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.setTextColor(90)
  doc.text('Audit Report', margin, 66)

  // Meta block
  const total = records.reduce((sum, r) => sum + r.amountUsdc, 0)
  const range =
    records.length === 0
      ? '—'
      : (() => {
          const times = records.map((r) => new Date(r.timestamp).getTime())
          const min = format(new Date(Math.min(...times)), 'MMM d, yyyy')
          const max = format(new Date(Math.max(...times)), 'MMM d, yyyy')
          return min === max ? min : `${min} – ${max}`
        })()

  const metaY = 100
  doc.setFontSize(9)
  doc.setTextColor(120)
  doc.text('SCOPE', margin, metaY)
  doc.text('PAYMENTS', margin + 220, metaY)
  doc.text('TOTAL (USDC)', margin + 320, metaY)
  doc.text('RANGE', margin + 430, metaY)

  doc.setFontSize(11)
  doc.setTextColor(20)
  doc.text(scope, margin, metaY + 14, { maxWidth: 210 })
  doc.text(String(records.length), margin + 220, metaY + 14)
  doc.text(
    new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(total),
    margin + 320,
    metaY + 14
  )
  doc.text(range, margin + 430, metaY + 14, { maxWidth: pageWidth - margin - 430 })

  // Table
  autoTable(doc, {
    startY: metaY + 36,
    margin: { left: margin, right: margin },
    head: [['#', 'Recipient', 'Amount (USDC)', 'Date', 'Time', 'Memo', 'Tx']],
    body: records.map((r, i) => {
      const ts = parseISO(r.timestamp)
      return [
        String(i + 1),
        truncate(r.to),
        new Intl.NumberFormat('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(r.amountUsdc),
        format(ts, 'yyyy-MM-dd'),
        format(ts, 'HH:mm:ss'),
        r.memo ?? '',
        truncate(r.txSignature, 10, 6),
      ]
    }),
    styles: {
      fontSize: 9,
      cellPadding: 5,
      textColor: 30,
    },
    headStyles: {
      fillColor: [240, 240, 240],
      textColor: 80,
      fontStyle: 'bold',
      fontSize: 8,
    },
    alternateRowStyles: {
      fillColor: [250, 250, 250],
    },
    columnStyles: {
      0: { halign: 'right', cellWidth: 26 },
      1: { font: 'courier' },
      2: { halign: 'right', font: 'courier' },
      3: { font: 'courier' },
      4: { font: 'courier', textColor: 120 },
      6: { font: 'courier', textColor: 120 },
    },
  })

  // Footer
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(140)
    doc.text(
      `Generated via Hush Audit · Powered by Umbra · ${new Date().toISOString()}`,
      margin,
      doc.internal.pageSize.getHeight() - 20
    )
    doc.text(
      `Page ${i} / ${pageCount}`,
      pageWidth - margin,
      doc.internal.pageSize.getHeight() - 20,
      { align: 'right' }
    )
  }

  doc.save(`hush-audit-${Date.now()}.pdf`)
}

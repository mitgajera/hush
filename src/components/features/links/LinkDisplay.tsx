'use client'

import { useState } from 'react'
import { QrCode, RotateCcw } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { CopyButton } from '@/components/ui/CopyButton'
import { QRCode } from '@/components/ui/QRCode'
import { MaskedAmount } from '@/components/ui/MaskedAmount'
import { relativeTime, fullTimestamp } from '@/lib/utils/format'
import type { HushLink } from '@/types'

export function LinkDisplay({
  link,
  onCreateAnother,
}: {
  link: HushLink
  onCreateAnother: () => void
}) {
  const [showQr, setShowQr] = useState(false)

  return (
    <Card variant="elevated" className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-fg-subtle">Link created</p>
          <p className="text-sm text-fg" title={fullTimestamp(link.createdAt)}>
            {relativeTime(link.createdAt)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-fg-subtle">Amount</p>
          <p className="text-fg">
            <MaskedAmount id={`display-${link.id}`} amount={link.amountUsdc} />
            <span className="ml-1 text-xs text-fg-subtle">USDC</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-md border border-border bg-bg px-3 py-2">
        <code className="truncate font-mono text-xs text-fg">{link.url}</code>
        <CopyButton value={link.url} label="Copy link" className="shrink-0" />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<QrCode className="h-3.5 w-3.5" />}
          onClick={() => setShowQr((v) => !v)}
        >
          {showQr ? 'Hide QR' : 'Show QR'}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
          onClick={onCreateAnother}
        >
          Create another
        </Button>
      </div>

      {showQr && (
        <div className="flex justify-center">
          <QRCode value={link.url} size={180} />
        </div>
      )}

      <p className="text-xs text-fg-muted">
        Share this link. Recipient claims via Umbra Wallet.
      </p>
    </Card>
  )
}

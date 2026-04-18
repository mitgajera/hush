'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { QrCode, ShieldOff } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { CopyButton } from '@/components/ui/CopyButton'
import { QRCode } from '@/components/ui/QRCode'
import { Badge } from '@/components/ui/Badge'
import { Dialog } from '@/components/ui/Dialog'
import { auditKeysStorage } from '@/lib/storage/auditKeys'
import type { AuditKey } from '@/types'

function secureLink(key: string) {
  const base = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  return `${base}/audit?key=${encodeURIComponent(key)}`
}

export function KeyDisplay({
  record,
  onRevoked,
}: {
  record: AuditKey
  onRevoked: () => void
}) {
  const [showQr, setShowQr] = useState(false)
  const [revokeOpen, setRevokeOpen] = useState(false)

  function revoke() {
    auditKeysStorage.delete(record.id)
    toast.success('Audit key revoked locally.')
    setRevokeOpen(false)
    onRevoked()
  }

  const link = secureLink(record.key)

  return (
    <Card variant="elevated" className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <Badge variant="accent">Audit key</Badge>
          <p className="text-sm text-fg">{record.scopeDescription}</p>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-2xs uppercase tracking-wide text-fg-subtle">Key</p>
        <div className="rounded-md border border-border bg-bg p-3">
          <code className="block break-all font-mono text-xs text-fg">
            {record.key}
          </code>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-2xs uppercase tracking-wide text-fg-subtle">
          Secure share link
        </p>
        <div className="flex items-center gap-2 rounded-md border border-border bg-bg px-3 py-2">
          <code className="truncate font-mono text-xs text-fg">{link}</code>
          <CopyButton value={link} label="Copy link" className="shrink-0" />
        </div>
        <p className="text-2xs text-fg-subtle">
          Send this link to your accountant. They decrypt without a wallet.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <div className="flex items-center gap-2">
          <CopyButton value={record.key} label="Copy key" />
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<QrCode className="h-3.5 w-3.5" />}
            onClick={() => setShowQr((v) => !v)}
          >
            {showQr ? 'Hide QR' : 'Show QR'}
          </Button>
        </div>
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<ShieldOff className="h-3.5 w-3.5" />}
          onClick={() => setRevokeOpen(true)}
        >
          Revoke (local)
        </Button>
      </div>

      {showQr && (
        <div className="flex justify-center pt-1">
          <QRCode value={link} size={200} />
        </div>
      )}

      <Dialog
        open={revokeOpen}
        onOpenChange={setRevokeOpen}
        title="Revoke this key locally?"
        description="The key is removed from your history. Real revocation on-chain is a future feature — the accountant could still use a copy they already have."
        footer={
          <>
            <Button variant="ghost" onClick={() => setRevokeOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={revoke}>
              Revoke
            </Button>
          </>
        }
      />
    </Card>
  )
}

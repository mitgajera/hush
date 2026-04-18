'use client'

import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { ExternalLink, QrCode, RefreshCw, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { CopyButton } from '@/components/ui/CopyButton'
import { Dialog } from '@/components/ui/Dialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { MaskedAmount } from '@/components/ui/MaskedAmount'
import { QRCode } from '@/components/ui/QRCode'
import { LinkStatusPill } from './LinkStatusPill'
import { effectiveStatus, expiryLabel } from '@/lib/links/helpers'
import { hushLinksStorage } from '@/lib/storage/hushLinks'
import { useHushLinks } from '@/hooks/useHushLinks'
import { relativeTime, fullTimestamp } from '@/lib/utils/format'
import { cn } from '@/lib/utils/cn'
import type { HushLink } from '@/types'

type Filter = 'all' | 'active' | 'claimed' | 'expired'

const FILTERS: Array<{ key: Filter; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Unclaimed' },
  { key: 'claimed', label: 'Claimed' },
  { key: 'expired', label: 'Expired' },
]

export function ActiveLinksTable() {
  const links = useHushLinks()
  const [filter, setFilter] = useState<Filter>('all')
  const [qrLink, setQrLink] = useState<HushLink | null>(null)
  const [revokeLink, setRevokeLink] = useState<HushLink | null>(null)

  const filtered = useMemo(() => {
    if (filter === 'all') return links
    return links.filter((l) => effectiveStatus(l) === filter)
  }, [links, filter])

  function onRevokeConfirm() {
    if (!revokeLink) return
    hushLinksStorage.update(revokeLink.id, { status: 'revoked' })
    toast.success('Link revoked.')
    setRevokeLink(null)
  }

  function renew(link: HushLink) {
    const sevenDaysFromNow = new Date(Date.now() + 7 * 86_400_000).toISOString()
    hushLinksStorage.update(link.id, {
      status: 'active',
      expiresAt: sevenDaysFromNow,
    })
    toast.success('Link renewed for 7 days.')
  }

  return (
    <Card padding="none" className="overflow-hidden">
      <div className="flex items-center gap-2 border-b border-border px-3 py-2">
        {FILTERS.map((f) => {
          const active = f.key === filter
          const count =
            f.key === 'all'
              ? links.length
              : links.filter((l) => effectiveStatus(l) === f.key).length
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs transition-colors',
                active
                  ? 'border-border-strong bg-bg-elevated text-fg'
                  : 'border-border bg-bg-surface text-fg-muted hover:text-fg'
              )}
            >
              {f.label}
              <span className="text-2xs text-fg-subtle">{count}</span>
            </button>
          )
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="p-4">
          <EmptyState
            title="No links here yet"
            description="Generate a Hush link above to share a private payment."
          />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-bg-surface text-fg-muted">
              <tr>
                <th className="px-3 py-2 text-left text-2xs font-medium uppercase tracking-wide">Description</th>
                <th className="px-3 py-2 text-right text-2xs font-medium uppercase tracking-wide">Amount</th>
                <th className="px-3 py-2 text-left text-2xs font-medium uppercase tracking-wide">Created</th>
                <th className="px-3 py-2 text-left text-2xs font-medium uppercase tracking-wide">Expires</th>
                <th className="px-3 py-2 text-left text-2xs font-medium uppercase tracking-wide">Status</th>
                <th className="px-3 py-2 text-right text-2xs font-medium uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((link) => {
                const status = effectiveStatus(link)
                const strike = status === 'revoked'
                return (
                  <tr
                    key={link.id}
                    className={cn(
                      'border-t border-border align-middle',
                      strike && 'text-fg-subtle line-through'
                    )}
                  >
                    <td className="px-3 py-2 text-fg">
                      {link.description || (
                        <span className="text-fg-subtle">Untitled</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <MaskedAmount
                        id={`table-${link.id}`}
                        amount={link.amountUsdc}
                        showToggle={false}
                      />
                    </td>
                    <td className="px-3 py-2 text-fg" title={fullTimestamp(link.createdAt)}>
                      {relativeTime(link.createdAt)}
                    </td>
                    <td className="px-3 py-2 text-fg-muted">{expiryLabel(link)}</td>
                    <td className="px-3 py-2">
                      <LinkStatusPill link={link} />
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center justify-end gap-1">
                        {status === 'active' && (
                          <>
                            <CopyButton value={link.url} label="Copy" iconOnly />
                            <Button
                              variant="secondary"
                              size="sm"
                              leftIcon={<QrCode className="h-3.5 w-3.5" />}
                              onClick={() => setQrLink(link)}
                            >
                              QR
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              leftIcon={<Trash2 className="h-3.5 w-3.5" />}
                              onClick={() => setRevokeLink(link)}
                            >
                              Revoke
                            </Button>
                          </>
                        )}
                        {status === 'claimed' && link.claimTxSignature && (
                          <a
                            href={`https://solscan.io/tx/${link.claimTxSignature}?cluster=${link.network}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-accent hover:underline"
                          >
                            View tx <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                        {status === 'expired' && (
                          <Button
                            variant="secondary"
                            size="sm"
                            leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
                            onClick={() => renew(link)}
                          >
                            Renew
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <Dialog
        open={Boolean(qrLink)}
        onOpenChange={(o) => !o && setQrLink(null)}
        title="Scan to claim"
        description="Point a phone camera at the QR to open the claim page."
      >
        {qrLink && (
          <div className="flex flex-col items-center gap-3">
            <QRCode value={qrLink.url} size={220} />
            <code className="max-w-full truncate font-mono text-2xs text-fg-subtle">
              {qrLink.url}
            </code>
            <CopyButton value={qrLink.url} label="Copy link" />
          </div>
        )}
      </Dialog>

      <Dialog
        open={Boolean(revokeLink)}
        onOpenChange={(o) => !o && setRevokeLink(null)}
        title="Revoke this link?"
        description="Anyone who already has the link will see a 'no longer valid' message."
        footer={
          <>
            <Button variant="ghost" onClick={() => setRevokeLink(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={onRevokeConfirm}>
              Revoke
            </Button>
          </>
        }
      />
    </Card>
  )
}

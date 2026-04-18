'use client'

import { toast } from 'sonner'
import { Link2, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { CopyButton } from '@/components/ui/CopyButton'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { useAuditKeys } from '@/hooks/useAuditKeys'
import { auditKeysStorage } from '@/lib/storage/auditKeys'
import { relativeTime, fullTimestamp } from '@/lib/utils/format'

function secureLink(key: string) {
  const base = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  return `${base}/audit?key=${encodeURIComponent(key)}`
}

export function KeyHistoryList() {
  const keys = useAuditKeys()

  if (keys.length === 0) {
    return (
      <EmptyState
        title="No audit keys yet"
        description="Generated keys appear here. Revoking a key only removes it from this list."
      />
    )
  }

  function copyLink(key: string) {
    navigator.clipboard.writeText(secureLink(key)).catch(() => {})
    toast.success('Secure link copied.')
  }

  function remove(id: string) {
    auditKeysStorage.delete(id)
    toast.success('Audit key removed.')
  }

  return (
    <Card padding="none" className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-bg-surface text-fg-muted">
            <tr>
              <th className="px-3 py-2 text-left text-2xs font-medium uppercase tracking-wide">
                Scope
              </th>
              <th className="px-3 py-2 text-left text-2xs font-medium uppercase tracking-wide">
                Created
              </th>
              <th className="px-3 py-2 text-left text-2xs font-medium uppercase tracking-wide">
                Last used
              </th>
              <th className="px-3 py-2 text-right text-2xs font-medium uppercase tracking-wide">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {keys.map((k) => (
              <tr key={k.id} className="border-t border-border align-middle">
                <td className="px-3 py-2 text-fg">{k.scopeDescription}</td>
                <td
                  className="px-3 py-2 text-fg-muted"
                  title={fullTimestamp(k.createdAt)}
                >
                  {relativeTime(k.createdAt)}
                </td>
                <td
                  className="px-3 py-2 text-fg-muted"
                  title={k.lastUsedAt ? fullTimestamp(k.lastUsedAt) : undefined}
                >
                  {k.lastUsedAt ? relativeTime(k.lastUsedAt) : (
                    <span className="text-fg-subtle">Never</span>
                  )}
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center justify-end gap-1">
                    <CopyButton value={k.key} label="Copy" iconOnly />
                    <Button
                      variant="secondary"
                      size="sm"
                      leftIcon={<Link2 className="h-3.5 w-3.5" />}
                      onClick={() => copyLink(k.key)}
                    >
                      Share
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<Trash2 className="h-3.5 w-3.5" />}
                      onClick={() => remove(k.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

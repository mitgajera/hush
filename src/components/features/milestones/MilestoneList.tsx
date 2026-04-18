'use client'

import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Check, ExternalLink, Loader2, Link2, RefreshCw, Send, X } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { MaskedAmount } from '@/components/ui/MaskedAmount'
import { StatusPill } from '@/components/ui/StatusPill'
import { ApproveMilestoneDialog } from './ApproveMilestoneDialog'
import { useHushLinks } from '@/hooks/useHushLinks'
import { effectiveStatus } from '@/lib/links/helpers'
import { relativeTime, fullTimestamp } from '@/lib/utils/format'
import { cn } from '@/lib/utils/cn'
import type { HushLink, Milestone, Project } from '@/types'

export function MilestoneList({ project }: { project: Project }) {
  const links = useHushLinks()
  const [approving, setApproving] = useState<Milestone | null>(null)
  const [retrying, setRetrying] = useState<Milestone | null>(null)

  const linkById = useMemo(() => {
    const map = new Map<string, HushLink>()
    for (const l of links) map.set(l.id, l)
    return map
  }, [links])

  if (project.milestones.length === 0) {
    return (
      <EmptyState
        title="No milestones yet"
        description="Break the engagement into milestones. Each one triggers a private payment on approval."
      />
    )
  }

  const active = retrying ?? approving

  return (
    <Card padding="none" className="overflow-hidden">
      <ul className="divide-y divide-border">
        {project.milestones.map((m) => {
          const link = m.hushLinkId ? linkById.get(m.hushLinkId) : undefined
          const claimStatus = link ? effectiveStatus(link) : null

          return (
            <li
              key={m.id}
              className={cn(
                'flex items-start gap-4 px-4 py-3',
                m.status === 'paid' && 'bg-success/5',
                m.status === 'failed' && 'bg-danger/5'
              )}
            >
              <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-bg-elevated text-xs font-mono text-fg-muted">
                #{m.number}
              </span>

              <div className="min-w-0 flex-1 space-y-1.5">
                <p className="text-sm text-fg">{m.description}</p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-2xs text-fg-subtle">
                  <MaskedAmount id={`milestone-${m.id}`} amount={m.amountUsdc} />
                  <span>USDC</span>
                  <StatusPill status={m.status} />
                  {m.paidAt && (
                    <span title={fullTimestamp(m.paidAt)}>
                      paid {relativeTime(m.paidAt)}
                    </span>
                  )}
                  {m.error && <span className="text-danger">· {m.error}</span>}
                </div>

                {m.status === 'paid' && link && (
                  <div className="mt-2 flex items-center gap-2 rounded-md border border-border bg-bg px-2.5 py-1.5">
                    <Link2 className="h-3.5 w-3.5 shrink-0 text-fg-subtle" />
                    <code className="truncate font-mono text-2xs text-fg">{link.url}</code>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="shrink-0"
                      onClick={() => {
                        navigator.clipboard.writeText(link.url).catch(() => {})
                        toast.success('Hush link copied.')
                      }}
                    >
                      Copy
                    </Button>
                    {claimStatus === 'claimed' && link.claimTxSignature && (
                      <a
                        href={`https://solscan.io/tx/${link.claimTxSignature}?cluster=${link.network}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 text-2xs text-accent hover:underline inline-flex items-center gap-1"
                      >
                        Claimed <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    {claimStatus === 'active' && (
                      <span className="shrink-0 text-2xs text-fg-subtle">Unclaimed</span>
                    )}
                  </div>
                )}
              </div>

              <div className="shrink-0">
                {m.status === 'pending' && (
                  <Button
                    size="sm"
                    leftIcon={<Send className="h-3.5 w-3.5" />}
                    onClick={() => setApproving(m)}
                  >
                    Approve &amp; send
                  </Button>
                )}
                {m.status === 'sending' && (
                  <span className="inline-flex items-center gap-1.5 text-2xs text-accent">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Sending…
                  </span>
                )}
                {m.status === 'paid' && (
                  <span className="inline-flex items-center gap-1.5 text-2xs text-success">
                    <Check className="h-3.5 w-3.5" /> Paid
                  </span>
                )}
                {m.status === 'failed' && (
                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
                    onClick={() => setRetrying(m)}
                  >
                    Retry
                  </Button>
                )}
                {m.status === 'approved' && (
                  <span className="inline-flex items-center gap-1.5 text-2xs text-info">
                    <X className="h-3.5 w-3.5" /> Queued
                  </span>
                )}
              </div>
            </li>
          )
        })}
      </ul>

      <ApproveMilestoneDialog
        open={active !== null}
        project={project}
        milestone={active}
        onOpenChange={(o) => {
          if (!o) {
            setApproving(null)
            setRetrying(null)
          }
        }}
      />
    </Card>
  )
}

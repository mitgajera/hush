'use client'

import Link from 'next/link'
import { ReactNode, useMemo } from 'react'
import {
  CheckCircle2,
  Key,
  LinkIcon as LinkLucide,
  type LucideIcon,
  Users,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { MaskedAmount } from '@/components/ui/MaskedAmount'
import { StatusPill } from '@/components/ui/StatusPill'
import { relativeTime, fullTimestamp } from '@/lib/utils/format'
import { usePayrollRuns } from '@/hooks/usePayrollRuns'
import { useHushLinks } from '@/hooks/useHushLinks'
import { useProjects } from '@/hooks/useProjects'
import { useAuditKeys } from '@/hooks/useAuditKeys'

type ActivityKind = 'payroll' | 'link' | 'milestone' | 'audit'

type ActivityItem = {
  id: string
  kind: ActivityKind
  icon: LucideIcon
  title: string
  status: string
  timestamp: string
  href: string
  trailing?: ReactNode
}

const KIND_LABEL: Record<ActivityKind, string> = {
  payroll: 'Payroll',
  link: 'Link',
  milestone: 'Milestone',
  audit: 'Audit key',
}

export function RecentActivity() {
  const runs = usePayrollRuns()
  const links = useHushLinks()
  const projects = useProjects()
  const auditKeys = useAuditKeys()

  const items = useMemo<ActivityItem[]>(() => {
    const all: ActivityItem[] = []

    for (const run of runs) {
      all.push({
        id: `run-${run.id}`,
        kind: 'payroll',
        icon: Users,
        title: `Payroll run · ${run.recipients.length} ${
          run.recipients.length === 1 ? 'recipient' : 'recipients'
        }`,
        status: run.status,
        timestamp: run.completedAt ?? run.createdAt,
        href: '/payroll',
        trailing: (
          <MaskedAmount
            id={`activity-run-${run.id}`}
            amount={run.totalUsdc}
            showToggle={false}
          />
        ),
      })
    }

    for (const link of links) {
      all.push({
        id: `link-${link.id}`,
        kind: 'link',
        icon: LinkLucide,
        title: link.description ? `Link · ${link.description}` : 'Hush link',
        status: link.status,
        timestamp: link.claimedAt ?? link.createdAt,
        href: '/links',
        trailing: (
          <MaskedAmount
            id={`activity-link-${link.id}`}
            amount={link.amountUsdc}
            showToggle={false}
          />
        ),
      })
    }

    for (const project of projects) {
      for (const m of project.milestones) {
        const time = m.paidAt ?? m.approvedAt
        if (!time) continue
        all.push({
          id: `milestone-${project.id}-${m.id}`,
          kind: 'milestone',
          icon: CheckCircle2,
          title: `${project.name} · Milestone ${m.number}`,
          status: m.status,
          timestamp: time,
          href: `/milestones/${project.id}`,
          trailing: (
            <MaskedAmount
              id={`activity-m-${project.id}-${m.id}`}
              amount={m.amountUsdc}
              showToggle={false}
            />
          ),
        })
      }
    }

    for (const key of auditKeys) {
      all.push({
        id: `audit-${key.id}`,
        kind: 'audit',
        icon: Key,
        title: `Audit key · ${key.scopeDescription}`,
        status: 'active',
        timestamp: key.lastUsedAt ?? key.createdAt,
        href: '/audit',
      })
    }

    return all
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5)
  }, [runs, links, projects, auditKeys])

  return (
    <Card className="flex h-full flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-fg">Recent activity</h3>
        <span className="text-2xs uppercase tracking-wide text-fg-subtle">
          latest {items.length || 0}
        </span>
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="No activity yet"
          description="Your payroll runs, links, milestones, and audit keys will appear here."
        />
      ) : (
        <ul className="divide-y divide-border">
          {items.map((item) => {
            const Icon = item.icon
            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className="flex items-center gap-3 py-3 transition-colors hover:bg-bg-elevated/40"
                >
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-bg-elevated text-fg-muted">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-fg">{item.title}</p>
                    <p className="text-2xs text-fg-subtle">
                      <span className="uppercase tracking-wide">{KIND_LABEL[item.kind]}</span>
                      <span className="mx-1">·</span>
                      <span title={fullTimestamp(item.timestamp)}>
                        {relativeTime(item.timestamp)}
                      </span>
                    </p>
                  </div>
                  {item.trailing && (
                    <span className="hidden text-sm text-fg-muted sm:block">
                      {item.trailing}
                    </span>
                  )}
                  <StatusPill status={item.status} />
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}

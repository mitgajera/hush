'use client'

import { ReactNode } from 'react'
import { CheckCircle2, LinkIcon, Lock, Users } from 'lucide-react'
import { MaskedAmount } from '@/components/ui/MaskedAmount'
import { usePayrollRuns } from '@/hooks/usePayrollRuns'
import { useHushLinks } from '@/hooks/useHushLinks'
import { useProjects } from '@/hooks/useProjects'
import { cn } from '@/lib/utils/cn'

function Metric({
  icon,
  label,
  value,
  accent,
}: {
  icon: ReactNode
  label: string
  value: ReactNode
  accent?: boolean
}) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border p-5 transition-all duration-200',
        accent
          ? 'border-accent/20 bg-accent/[0.04]'
          : 'border-white/[0.07] bg-bg-surface hover:border-white/[0.12]'
      )}
    >
      {accent && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-accent/10 blur-2xl"
        />
      )}
      <div className="relative flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-2xs font-medium uppercase tracking-widest text-fg-subtle">
            {label}
          </span>
          <span
            className={cn(
              'inline-flex h-7 w-7 items-center justify-center rounded-lg',
              accent ? 'bg-accent/15 text-accent' : 'bg-bg-elevated text-fg-muted'
            )}
          >
            {icon}
          </span>
        </div>
        <div className={cn('text-fg', accent ? 'text-accent' : '')}>{value}</div>
      </div>
    </div>
  )
}

export function MetricCards() {
  const runs = usePayrollRuns()
  const links = useHushLinks()
  const projects = useProjects()

  const totalHushed = runs
    .filter((r) => r.status === 'completed' || r.status === 'partial')
    .reduce((sum, r) => sum + r.totalUsdc, 0)

  const activeLinks = links.filter((l) => l.status === 'active').length
  const completedRuns = runs.filter((r) => r.status === 'completed').length
  const pendingMilestones = projects.reduce(
    (acc, p) => acc + p.milestones.filter((m) => m.status === 'pending').length,
    0
  )

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <Metric
        accent
        icon={<Lock className="h-3.5 w-3.5" />}
        label="Total hushed"
        value={
          <MaskedAmount
            id="metric-total-hushed"
            amount={totalHushed}
            size="xl"
            showCurrency
            showToggle={false}
          />
        }
      />
      <Metric
        icon={<LinkIcon className="h-3.5 w-3.5" />}
        label="Active links"
        value={
          <span className="font-mono text-2xl font-semibold tabular-nums text-fg">
            {activeLinks}
          </span>
        }
      />
      <Metric
        icon={<Users className="h-3.5 w-3.5" />}
        label="Payroll runs"
        value={
          <span className="font-mono text-2xl font-semibold tabular-nums text-fg">
            {completedRuns}
          </span>
        }
      />
      <Metric
        icon={<CheckCircle2 className="h-3.5 w-3.5" />}
        label="Pending milestones"
        value={
          <span className="font-mono text-2xl font-semibold tabular-nums text-fg">
            {pendingMilestones}
          </span>
        }
      />
    </div>
  )
}

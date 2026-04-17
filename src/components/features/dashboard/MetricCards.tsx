'use client'

import { ReactNode } from 'react'
import { CheckCircle2, LinkIcon, Lock, Users } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { MaskedAmount } from '@/components/ui/MaskedAmount'
import { usePayrollRuns } from '@/hooks/usePayrollRuns'
import { useHushLinks } from '@/hooks/useHushLinks'
import { useProjects } from '@/hooks/useProjects'

function Metric({
  icon,
  label,
  value,
}: {
  icon: ReactNode
  label: string
  value: ReactNode
}) {
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center gap-2 text-fg-muted">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-bg-elevated text-fg-muted">
          {icon}
        </span>
        <span className="text-2xs uppercase tracking-wide">{label}</span>
      </div>
      <div className="text-xl text-fg">{value}</div>
    </Card>
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
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Metric
        icon={<Lock className="h-3.5 w-3.5" />}
        label="Total hushed"
        value={
          <span className="flex items-baseline gap-1.5">
            <MaskedAmount id="metric-total-hushed" amount={totalHushed} />
            <span className="text-xs text-fg-subtle">USDC</span>
          </span>
        }
      />
      <Metric
        icon={<LinkIcon className="h-3.5 w-3.5" />}
        label="Active links"
        value={<span className="font-mono tabular-nums">{activeLinks}</span>}
      />
      <Metric
        icon={<Users className="h-3.5 w-3.5" />}
        label="Payroll runs"
        value={<span className="font-mono tabular-nums">{completedRuns}</span>}
      />
      <Metric
        icon={<CheckCircle2 className="h-3.5 w-3.5" />}
        label="Pending milestones"
        value={<span className="font-mono tabular-nums">{pendingMilestones}</span>}
      />
    </div>
  )
}

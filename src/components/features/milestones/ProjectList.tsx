'use client'

import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { MaskedAmount } from '@/components/ui/MaskedAmount'
import { TruncatedAddress } from '@/components/ui/TruncatedAddress'
import { StatusPill } from '@/components/ui/StatusPill'
import { Progress } from '@/components/ui/Progress'
import { EmptyState } from '@/components/ui/EmptyState'
import { useProjects } from '@/hooks/useProjects'
import {
  computeProgress,
  computeTotalBudget,
  deriveProjectStatus,
} from '@/lib/milestones/helpers'

export function ProjectList() {
  const projects = useProjects()

  if (projects.length === 0) {
    return (
      <EmptyState
        title="No projects yet"
        description="Start a project to pay your contractor by milestone — each payment encrypted end-to-end."
      />
    )
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {projects.map((project) => {
        const progress = computeProgress(project)
        const budget = computeTotalBudget(project)
        const status = deriveProjectStatus(project)

        return (
          <Link
            key={project.id}
            href={`/milestones/${project.id}`}
            className="group block"
          >
            <Card className="flex h-full flex-col gap-3 transition-colors group-hover:border-border-strong group-hover:bg-bg-elevated">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 space-y-0.5">
                  <p className="truncate text-sm font-medium text-fg">{project.name}</p>
                  {project.clientDescription && (
                    <p className="truncate text-xs text-fg-muted">
                      {project.clientDescription}
                    </p>
                  )}
                </div>
                <ArrowUpRight className="h-4 w-4 text-fg-subtle transition-all group-hover:translate-x-0.5 group-hover:text-fg" />
              </div>

              <div className="space-y-1">
                <p className="text-2xs uppercase tracking-wide text-fg-subtle">
                  Contractor
                </p>
                <TruncatedAddress address={project.contractorAddress} showCopy={false} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-0.5">
                  <p className="text-2xs uppercase tracking-wide text-fg-subtle">
                    Budget
                  </p>
                  <p className="flex items-baseline gap-1 text-sm text-fg">
                    <MaskedAmount
                      id={`project-${project.id}-budget`}
                      amount={budget}
                      showToggle={false}
                    />
                    <span className="text-2xs text-fg-subtle">USDC</span>
                  </p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-2xs uppercase tracking-wide text-fg-subtle">
                    Milestones
                  </p>
                  <p className="text-sm text-fg">
                    <span className="font-mono tabular-nums">
                      {progress.paid}/{progress.total}
                    </span>
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <Progress value={progress.pct} label="milestones paid" />
                <div className="flex items-center justify-between text-2xs text-fg-subtle">
                  <span>{progress.pct}% paid</span>
                  <StatusPill status={status} />
                </div>
              </div>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}

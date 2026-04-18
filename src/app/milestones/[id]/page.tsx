'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { toast } from 'sonner'
import { ArrowLeft, Pencil } from 'lucide-react'
import { Shell } from '@/components/layout/Shell'
import { WalletGate } from '@/components/wallet/WalletGate'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { MaskedAmount } from '@/components/ui/MaskedAmount'
import { Progress } from '@/components/ui/Progress'
import { StatusPill } from '@/components/ui/StatusPill'
import { TruncatedAddress } from '@/components/ui/TruncatedAddress'
import { MilestoneList } from '@/components/features/milestones/MilestoneList'
import { AddMilestoneForm } from '@/components/features/milestones/AddMilestoneForm'
import { useProjects } from '@/hooks/useProjects'
import { projectsStorage } from '@/lib/storage/projects'
import {
  computeProgress,
  computeTotalBudget,
  deriveProjectStatus,
} from '@/lib/milestones/helpers'
import { relativeTime, fullTimestamp } from '@/lib/utils/format'

function ProjectDetail({ projectId }: { projectId: string }) {
  const projects = useProjects()
  const project = useMemo(
    () => projects.find((p) => p.id === projectId),
    [projects, projectId]
  )
  const [editingName, setEditingName] = useState(false)
  const [draftName, setDraftName] = useState('')

  if (!project) {
    return (
      <div className="space-y-4">
        <Link
          href="/milestones"
          className="inline-flex items-center gap-1 text-xs text-fg-muted hover:text-fg"
        >
          <ArrowLeft className="h-3 w-3" /> Back to projects
        </Link>
        <Card className="text-center py-12">
          <p className="text-sm text-fg-muted">Project not found.</p>
        </Card>
      </div>
    )
  }

  const progress = computeProgress(project)
  const budget = computeTotalBudget(project)
  const status = deriveProjectStatus(project)

  function saveName() {
    const trimmed = draftName.trim()
    if (!trimmed || trimmed === project!.name) {
      setEditingName(false)
      return
    }
    projectsStorage.update(project!.id, { name: trimmed })
    toast.success('Project renamed.')
    setEditingName(false)
  }

  return (
    <div className="space-y-6">
      <Link
        href="/milestones"
        className="inline-flex items-center gap-1 text-xs text-fg-muted hover:text-fg"
      >
        <ArrowLeft className="h-3 w-3" /> All projects
      </Link>

      <Card className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-1">
            {editingName ? (
              <div className="flex items-center gap-2">
                <Input
                  autoFocus
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveName()
                    if (e.key === 'Escape') setEditingName(false)
                  }}
                  className="max-w-md"
                />
                <Button size="sm" onClick={saveName}>
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setEditingName(false)}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="truncate text-xl font-medium text-fg">{project.name}</h1>
                <button
                  type="button"
                  onClick={() => {
                    setDraftName(project.name)
                    setEditingName(true)
                  }}
                  aria-label="Rename project"
                  className="inline-flex h-7 w-7 items-center justify-center rounded text-fg-subtle hover:bg-bg-elevated hover:text-fg"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
            {project.clientDescription && (
              <p className="text-sm text-fg-muted">{project.clientDescription}</p>
            )}
          </div>
          <StatusPill status={status} />
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="space-y-0.5">
            <p className="text-2xs uppercase tracking-wide text-fg-subtle">Contractor</p>
            <TruncatedAddress address={project.contractorAddress} />
          </div>
          <div className="space-y-0.5">
            <p className="text-2xs uppercase tracking-wide text-fg-subtle">Budget</p>
            <p className="flex items-baseline gap-1 text-sm text-fg">
              <MaskedAmount id={`detail-${project.id}-budget`} amount={budget} />
              <span className="text-2xs text-fg-subtle">USDC</span>
            </p>
          </div>
          <div className="space-y-0.5">
            <p className="text-2xs uppercase tracking-wide text-fg-subtle">Milestones</p>
            <p className="text-sm text-fg">
              <span className="font-mono tabular-nums">
                {progress.paid}/{progress.total}
              </span>
            </p>
          </div>
          <div className="space-y-0.5">
            <p className="text-2xs uppercase tracking-wide text-fg-subtle">Created</p>
            <p
              className="text-sm text-fg"
              title={fullTimestamp(project.createdAt)}
            >
              {relativeTime(project.createdAt)}
            </p>
          </div>
        </div>

        <div>
          <Progress value={progress.pct} label="project progress" />
          <p className="mt-1 text-2xs text-fg-subtle">{progress.pct}% paid</p>
        </div>
      </Card>

      <section className="space-y-3">
        <h3 className="text-sm font-medium text-fg">Milestones</h3>
        <MilestoneList project={project} />
      </section>

      <AddMilestoneForm project={project} />
    </div>
  )
}

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  if (!params.id) notFound()
  return (
    <Shell>
      <WalletGate>
        <ProjectDetail projectId={params.id} />
      </WalletGate>
    </Shell>
  )
}

import type { Project, Milestone } from '@/types'

export type ProjectProgress = {
  paid: number
  total: number
  pct: number
}

export function computeProgress(project: Project): ProjectProgress {
  const total = project.milestones.length
  const paid = project.milestones.filter((m) => m.status === 'paid').length
  return {
    paid,
    total,
    pct: total === 0 ? 0 : Math.round((paid / total) * 100),
  }
}

export function computeTotalBudget(project: Project): number {
  return project.milestones.reduce((sum, m) => sum + m.amountUsdc, 0)
}

export function nextMilestoneNumber(project: Project): number {
  if (project.milestones.length === 0) return 1
  return Math.max(...project.milestones.map((m) => m.number)) + 1
}

export function deriveProjectStatus(project: Project): Project['status'] {
  if (project.status === 'archived') return 'archived'
  if (project.milestones.length === 0) return 'active'
  return project.milestones.every((m) => m.status === 'paid') ? 'completed' : 'active'
}

export function patchMilestone(
  project: Project,
  id: string,
  patch: Partial<Milestone>
): Milestone[] {
  return project.milestones.map((m) => (m.id === id ? { ...m, ...patch } : m))
}

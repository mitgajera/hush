'use client'

import { useState } from 'react'
import { nanoid } from 'nanoid'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { projectsStorage } from '@/lib/storage/projects'
import { milestoneSchema } from '@/lib/utils/validation'
import { nextMilestoneNumber } from '@/lib/milestones/helpers'
import type { Milestone, Project } from '@/types'

export function AddMilestoneForm({ project }: { project: Project }) {
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [error, setError] = useState<{ field: 'description' | 'amountUsdc'; message: string } | null>(null)

  function add() {
    const parsed = milestoneSchema.safeParse({
      description: description.trim(),
      amountUsdc: Number(amount),
    })
    if (!parsed.success) {
      const issue = parsed.error.issues[0]
      setError({
        field: issue.path[0] === 'amountUsdc' ? 'amountUsdc' : 'description',
        message: issue.message,
      })
      return
    }

    const milestone: Milestone = {
      id: 'ms_' + nanoid(8),
      number: nextMilestoneNumber(project),
      description: parsed.data.description,
      amountUsdc: parsed.data.amountUsdc,
      status: 'pending',
    }
    const nextMilestones = [...project.milestones, milestone]
    projectsStorage.update(project.id, {
      milestones: nextMilestones,
      totalBudgetUsdc: nextMilestones.reduce((sum, m) => sum + m.amountUsdc, 0),
    })
    toast.success(`Milestone #${milestone.number} added.`)
    setDescription('')
    setAmount('')
    setError(null)
  }

  return (
    <Card className="space-y-3">
      <h3 className="text-sm font-medium text-fg">Add milestone</h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_160px_auto] sm:items-end">
        <Input
          label="Description"
          placeholder="Design review, sprint 2, etc."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          error={error?.field === 'description' ? error.message : undefined}
        />
        <Input
          label="Amount (USDC)"
          type="number"
          inputMode="decimal"
          min={0}
          step="0.01"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          error={error?.field === 'amountUsdc' ? error.message : undefined}
        />
        <Button
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={add}
          className="sm:h-9"
        >
          Add
        </Button>
      </div>
    </Card>
  )
}

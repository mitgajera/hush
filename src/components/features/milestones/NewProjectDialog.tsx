'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { nanoid } from 'nanoid'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { projectsStorage } from '@/lib/storage/projects'
import { projectSchema } from '@/lib/utils/validation'
import type { Project } from '@/types'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NewProjectDialog({ open, onOpenChange }: Props) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [clientDescription, setClientDescription] = useState('')
  const [contractorAddress, setContractorAddress] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [errorField, setErrorField] = useState<'name' | 'contractorAddress' | null>(null)

  function reset() {
    setName('')
    setClientDescription('')
    setContractorAddress('')
    setError(null)
    setErrorField(null)
  }

  function submit() {
    const parsed = projectSchema.safeParse({
      name: name.trim(),
      clientDescription: clientDescription.trim() || undefined,
      contractorAddress: contractorAddress.trim(),
    })
    if (!parsed.success) {
      const issue = parsed.error.issues[0]
      setError(issue.message)
      setErrorField(issue.path[0] === 'contractorAddress' ? 'contractorAddress' : 'name')
      return
    }

    const project: Project = {
      id: 'prj_' + nanoid(10),
      name: parsed.data.name,
      clientDescription: parsed.data.clientDescription,
      contractorAddress: parsed.data.contractorAddress,
      createdAt: new Date().toISOString(),
      status: 'active',
      milestones: [],
      totalBudgetUsdc: 0,
    }
    projectsStorage.save(project)
    toast.success('Project created.')
    reset()
    onOpenChange(false)
    router.push(`/milestones/${project.id}`)
  }

  function handleOpenChange(next: boolean) {
    if (!next) reset()
    onOpenChange(next)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
      title="New project"
      description="Set up a contractor engagement paid milestone-by-milestone."
      footer={
        <>
          <Button variant="ghost" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit}>Create project</Button>
        </>
      }
    >
      <div className="space-y-3">
        <Input
          label="Project name"
          placeholder="Q2 website redesign"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errorField === 'name' ? error ?? undefined : undefined}
        />
        <Textarea
          label="Client description (optional)"
          placeholder="What this engagement is for"
          value={clientDescription}
          onChange={(e) => setClientDescription(e.target.value)}
          rows={2}
          maxLength={240}
        />
        <Input
          label="Contractor wallet address"
          placeholder="Solana wallet address…"
          value={contractorAddress}
          onChange={(e) => setContractorAddress(e.target.value.trim())}
          className="font-mono text-xs"
          valid={/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(contractorAddress)}
          error={errorField === 'contractorAddress' ? error ?? undefined : undefined}
        />
      </div>
    </Dialog>
  )
}

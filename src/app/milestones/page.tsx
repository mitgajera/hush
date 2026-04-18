'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Shell } from '@/components/layout/Shell'
import { PageHeader } from '@/components/layout/PageHeader'
import { WalletGate } from '@/components/wallet/WalletGate'
import { Button } from '@/components/ui/Button'
import { ProjectList } from '@/components/features/milestones/ProjectList'
import { NewProjectDialog } from '@/components/features/milestones/NewProjectDialog'

function MilestonesContent() {
  const [newOpen, setNewOpen] = useState(false)

  return (
    <div className="space-y-8">
      <PageHeader
        title="Milestones"
        description="Pay contractors by milestone. Each approval sends a private transfer and generates a Hush link."
        actions={
          <Button
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => setNewOpen(true)}
          >
            New project
          </Button>
        }
      />
      <ProjectList />
      <NewProjectDialog open={newOpen} onOpenChange={setNewOpen} />
    </div>
  )
}

export default function MilestonesPage() {
  return (
    <Shell>
      <WalletGate>
        <MilestonesContent />
      </WalletGate>
    </Shell>
  )
}

'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Shell } from '@/components/layout/Shell'
import { PageHeader } from '@/components/layout/PageHeader'
import { WalletGate } from '@/components/wallet/WalletGate'
import { GenerateKeyPanel } from '@/components/features/audit/GenerateKeyPanel'
import { KeyDisplay } from '@/components/features/audit/KeyDisplay'
import { KeyHistoryList } from '@/components/features/audit/KeyHistoryList'
import { AccountantPortal } from '@/components/features/audit/AccountantPortal'
import type { AuditKey } from '@/types'

function EmployerMode({ defaultRunId }: { defaultRunId?: string }) {
  const [latest, setLatest] = useState<AuditKey | null>(null)

  return (
    <div className="space-y-8">
      <PageHeader
        title="Hush Audit"
        description="Grant read-only access to your accountant for a specific run, date range, or everything. Revoke any time."
      />

      {latest ? (
        <KeyDisplay record={latest} onRevoked={() => setLatest(null)} />
      ) : (
        <GenerateKeyPanel defaultRunId={defaultRunId} onGenerated={setLatest} />
      )}

      <section className="space-y-3">
        <h3 className="text-sm font-medium text-fg">Key history</h3>
        <KeyHistoryList />
      </section>
    </div>
  )
}

function AuditRouter() {
  const params = useSearchParams()
  const key = params.get('key')
  const runId = params.get('run') ?? undefined

  if (key) {
    return <AccountantPortal initialKey={key} />
  }

  return (
    <Shell>
      <WalletGate>
        <EmployerMode defaultRunId={runId} />
      </WalletGate>
    </Shell>
  )
}

export default function AuditPage() {
  return (
    <Suspense fallback={null}>
      <AuditRouter />
    </Suspense>
  )
}

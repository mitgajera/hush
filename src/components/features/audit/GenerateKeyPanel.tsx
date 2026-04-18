'use client'

import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { nanoid } from 'nanoid'
import { Key } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { useUmbra } from '@/hooks/useUmbra'
import { usePayrollRuns } from '@/hooks/usePayrollRuns'
import { generateViewingKey } from '@/lib/umbra/viewingKey'
import { auditKeysStorage } from '@/lib/storage/auditKeys'
import { describeScope, scopeToUmbra } from '@/lib/audit/scope'
import { cn } from '@/lib/utils/cn'
import type { AuditKey, AuditKeyScope } from '@/types'

type ScopeType = AuditKeyScope['type']

type Props = {
  defaultRunId?: string
  onGenerated: (key: AuditKey) => void
}

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

function monthAgoIso() {
  const d = new Date()
  d.setMonth(d.getMonth() - 1)
  return d.toISOString().slice(0, 10)
}

export function GenerateKeyPanel({ defaultRunId, onGenerated }: Props) {
  const umbra = useUmbra()
  const runs = usePayrollRuns()

  const [scopeType, setScopeType] = useState<ScopeType>(defaultRunId ? 'run' : 'all')
  const [runId, setRunId] = useState<string>(defaultRunId ?? runs[0]?.id ?? '')
  const [from, setFrom] = useState(monthAgoIso())
  const [to, setTo] = useState(todayIso())
  const [generating, setGenerating] = useState(false)

  const buildScope = useMemo<AuditKeyScope | null>(() => {
    if (scopeType === 'all') return { type: 'all' }
    if (scopeType === 'run') {
      if (!runId) return null
      return { type: 'run', runId }
    }
    if (!from || !to) return null
    return {
      type: 'dateRange',
      from: new Date(from).toISOString(),
      to: new Date(to + 'T23:59:59').toISOString(),
    }
  }, [scopeType, runId, from, to])

  async function generate() {
    if (!umbra || !buildScope) return
    setGenerating(true)
    try {
      const result = await generateViewingKey(umbra, scopeToUmbra(buildScope))
      const record: AuditKey = {
        id: 'key_' + nanoid(10),
        key: result.key,
        scope: buildScope,
        scopeDescription: describeScope(buildScope, runs),
        createdAt: new Date().toISOString(),
      }
      auditKeysStorage.save(record)
      toast.success('Audit key generated.')
      onGenerated(record)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to generate key')
    } finally {
      setGenerating(false)
    }
  }

  const canGenerate = Boolean(umbra) && Boolean(buildScope)

  return (
    <Card className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-fg">Generate audit key</h3>
        <p className="mt-1 text-xs text-fg-muted">
          Share this key with your accountant. They see only transactions within the
          scope you choose — nothing else.
        </p>
      </div>

      <fieldset className="space-y-2">
        <legend className="text-2xs uppercase tracking-wide text-fg-subtle">
          Scope
        </legend>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <ScopeCard
            label="Specific payroll run"
            description="One run, one set of recipients."
            active={scopeType === 'run'}
            onClick={() => setScopeType('run')}
            disabled={runs.length === 0}
          />
          <ScopeCard
            label="Date range"
            description="All runs completed in the window."
            active={scopeType === 'dateRange'}
            onClick={() => setScopeType('dateRange')}
          />
          <ScopeCard
            label="All time"
            description="Every private transfer sent by this wallet."
            active={scopeType === 'all'}
            onClick={() => setScopeType('all')}
          />
        </div>
      </fieldset>

      {scopeType === 'run' && (
        <Select
          label="Payroll run"
          value={runId}
          onChange={(e) => setRunId(e.target.value)}
          disabled={runs.length === 0}
        >
          {runs.length === 0 ? (
            <option value="">No runs yet</option>
          ) : (
            runs.map((r) => (
              <option key={r.id} value={r.id}>
                {r.id} · {r.recipients.length} recipient
                {r.recipients.length === 1 ? '' : 's'}
              </option>
            ))
          )}
        </Select>
      )}

      {scopeType === 'dateRange' && (
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="From"
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            max={to}
          />
          <Input
            label="To"
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            min={from}
            max={todayIso()}
          />
        </div>
      )}

      <div className="flex items-center justify-end">
        <Button
          leftIcon={<Key className="h-4 w-4" />}
          onClick={generate}
          loading={generating}
          disabled={!canGenerate}
        >
          Generate audit key
        </Button>
      </div>
    </Card>
  )
}

function ScopeCard({
  label,
  description,
  active,
  onClick,
  disabled,
}: {
  label: string
  description: string
  active: boolean
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'rounded-md border px-3 py-2.5 text-left transition-colors',
        active
          ? 'border-accent/50 bg-accent/10'
          : 'border-border bg-bg hover:bg-bg-elevated',
        disabled && 'cursor-not-allowed opacity-50 hover:bg-bg'
      )}
    >
      <p className="text-sm font-medium text-fg">{label}</p>
      <p className="mt-0.5 text-xs text-fg-muted">{description}</p>
    </button>
  )
}

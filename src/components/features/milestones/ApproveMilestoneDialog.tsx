'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { TruncatedAddress } from '@/components/ui/TruncatedAddress'
import { CopyButton } from '@/components/ui/CopyButton'
import { useUmbra } from '@/hooks/useUmbra'
import { generatePaymentLink } from '@/lib/umbra/paymentLink'
import { projectsStorage } from '@/lib/storage/projects'
import { hushLinksStorage } from '@/lib/storage/hushLinks'
import { patchMilestone } from '@/lib/milestones/helpers'
import { formatUsdc } from '@/lib/utils/format'
import type { HushLink, Milestone, Network, Project } from '@/types'

type Phase = 'idle' | 'sending' | 'success' | 'error'

type Props = {
  open: boolean
  project: Project
  milestone: Milestone | null
  onOpenChange: (open: boolean) => void
}

export function ApproveMilestoneDialog({
  open,
  project,
  milestone,
  onOpenChange,
}: Props) {
  const umbra = useUmbra()
  const wallet = useWallet()
  const [phase, setPhase] = useState<Phase>('idle')
  const [generatedLink, setGeneratedLink] = useState<HushLink | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function approve() {
    if (!milestone || !umbra || !wallet.publicKey) return
    setPhase('sending')
    setError(null)

    // Mark milestone as sending
    projectsStorage.update(project.id, {
      milestones: patchMilestone(project, milestone.id, {
        status: 'sending',
        approvedAt: new Date().toISOString(),
        error: undefined,
      }),
    })

    try {
      // Send privately at generation time; recipient just opens the link
      const linkResult = await generatePaymentLink(umbra, {
        amountUsdc: milestone.amountUsdc,
        token: 'USDC',
        description: `${project.name} · Milestone #${milestone.number}`,
        senderAddress: wallet.publicKey.toBase58(),
        recipientAddress: project.contractorAddress,
      })

      const network =
        (process.env.NEXT_PUBLIC_SOLANA_NETWORK as Network | undefined) ?? 'devnet'
      const link: HushLink = {
        id: linkResult.linkId,
        linkToken: linkResult.token,
        url: linkResult.url,
        amountUsdc: milestone.amountUsdc,
        description: `${project.name} · Milestone #${milestone.number}`,
        createdAt: new Date().toISOString(),
        status: 'active',
        network,
        senderAddress: wallet.publicKey.toBase58(),
      }
      hushLinksStorage.save(link)

      // Mark milestone paid + store tx sig + link id
      projectsStorage.update(project.id, {
        milestones: patchMilestone(project, milestone.id, {
          status: 'paid',
          paidAt: new Date().toISOString(),
          txSignature: linkResult.txSignature,
          hushLinkId: link.id,
        }),
      })

      setGeneratedLink(link)
      setPhase('success')
      toast.success('Milestone paid. Share the Hush link with your contractor.')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Transfer failed'
      projectsStorage.update(project.id, {
        milestones: patchMilestone(project, milestone.id, {
          status: 'failed',
          error: message,
        }),
      })
      setPhase('error')
      setError(message)
      toast.error(message)
    }
  }

  function handleOpenChange(next: boolean) {
    if (phase === 'sending') return
    if (!next) {
      setPhase('idle')
      setGeneratedLink(null)
      setError(null)
    }
    onOpenChange(next)
  }

  if (!milestone) return null

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
      hideClose={phase === 'sending'}
      title={
        phase === 'success'
          ? 'Milestone paid'
          : `Approve milestone #${milestone.number}`
      }
      description={phase === 'success' ? undefined : milestone.description}
      footer={
        phase === 'idle' ? (
          <>
            <Button variant="ghost" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={approve}>Approve &amp; send</Button>
          </>
        ) : phase === 'error' ? (
          <>
            <Button variant="ghost" onClick={() => handleOpenChange(false)}>
              Close
            </Button>
            <Button variant="danger" onClick={approve}>
              Retry
            </Button>
          </>
        ) : phase === 'success' ? (
          <Button onClick={() => handleOpenChange(false)}>Done</Button>
        ) : undefined
      }
    >
      {phase === 'idle' && (
        <div className="space-y-4">
          <div className="rounded-md border border-border bg-bg p-4">
            <p className="text-2xs uppercase tracking-wide text-fg-subtle">Amount</p>
            <p className="mt-1 font-mono text-2xl tabular-nums text-fg">
              {formatUsdc(milestone.amountUsdc)}
              <span className="ml-2 text-sm text-fg-subtle">USDC</span>
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-2xs uppercase tracking-wide text-fg-subtle">
              Contractor
            </p>
            <TruncatedAddress address={project.contractorAddress} />
          </div>

          <div className="flex items-start gap-2 rounded-md border border-warning/30 bg-warning/5 p-3 text-xs text-warning">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <p>
              This will send {formatUsdc(milestone.amountUsdc)} USDC privately. This
              cannot be undone.
            </p>
          </div>
        </div>
      )}

      {phase === 'sending' && (
        <div className="flex items-center gap-3 text-sm text-fg-muted">
          <Loader2 className="h-4 w-4 animate-spin text-accent" aria-hidden="true" />
          Sending privately and generating the Hush link…
        </div>
      )}

      {phase === 'error' && (
        <p className="text-sm text-danger">{error ?? 'Transfer failed.'}</p>
      )}

      {phase === 'success' && generatedLink && (
        <div className="space-y-4">
          <p className="text-sm text-fg">
            Share this link with your contractor. They claim via Umbra Wallet.
          </p>
          <div className="flex items-center gap-2 rounded-md border border-border bg-bg px-3 py-2">
            <code className="truncate font-mono text-xs text-fg">
              {generatedLink.url}
            </code>
            <CopyButton value={generatedLink.url} label="Copy link" className="shrink-0" />
          </div>
        </div>
      )}
    </Dialog>
  )
}

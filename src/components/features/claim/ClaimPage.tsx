'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useWallet } from '@solana/wallet-adapter-react'
import { toast } from 'sonner'
import { Clock, Loader2, ShieldAlert, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { PrivateBadge } from '@/components/ui/PrivateBadge'
import { NoWalletPrompt } from './NoWalletPrompt'
import { ClaimSuccess } from './ClaimSuccess'
import { useUmbraSdkClient } from '@/hooks/useUmbraSdkClient'
import { claimPaymentLink, inspectPaymentLink, type UrlLinkParams } from '@/lib/umbra/paymentLink'
import { hushLinksStorage } from '@/lib/storage/hushLinks'
import { claimedPaymentsStorage } from '@/lib/storage/claimedPayments'
import { effectiveStatus } from '@/lib/links/helpers'
import { formatUsdc } from '@/lib/utils/format'
import type { HushLink } from '@/types'
import type { PaymentLinkInspection } from '@/lib/umbra/types'

type PhaseKey =
  | 'loading'
  | 'ready'
  | 'claiming'
  | 'success'
  | 'already'
  | 'expired'
  | 'revoked'

type ClaimedResult = { amountUsdc: number; txSignature: string }

type LinkData = {
  amountUsdc: number
  description?: string
  status: HushLink['status']
  network?: HushLink['network']
  local?: HushLink
}

export function ClaimPage({ token }: { token: string }) {
  const wallet = useWallet()
  const sdk = useUmbraSdkClient()
  const searchParams = useSearchParams()

  // Parse link metadata from URL — present for any browser, not just the sender's.
  const urlParams = useMemo<UrlLinkParams | null>(() => {
    const a = searchParams.get('a')
    const s = searchParams.get('s')
    if (!a || !s || !Number.isFinite(Number(a))) return null
    return {
      amountUsdc: Number(a),
      description: searchParams.get('d') ?? undefined,
      senderAddress: s,
      recipientAddress: searchParams.get('r') ?? undefined,
      txSignature: searchParams.get('tx') ?? undefined,
      expiresAt: searchParams.get('e') ?? undefined,
    }
  }, [searchParams])

  const [phase, setPhase] = useState<PhaseKey>('loading')
  const [data, setData] = useState<LinkData | null>(null)
  const [claimed, setClaimed] = useState<ClaimedResult | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setPhase('loading')
      const local = hushLinksStorage.getAll().find((l) => l.linkToken === token) ?? null

      let remote: PaymentLinkInspection | null = null
      try {
        if (sdk.status === 'ready') {
          remote = await inspectPaymentLink(sdk.client, token, urlParams ?? undefined)
        }
      } catch {
        remote = null
      }

      if (cancelled) return

      // Show "revoked" only if there's absolutely no data — not even URL params.
      if (!local && !remote && !urlParams) {
        setData(null)
        setPhase('revoked')
        return
      }

      // Determine effective status: local record wins, then SDK, then URL params.
      let effective: HushLink['status']
      if (local) {
        effective = effectiveStatus(local)
      } else if (remote) {
        effective = remote.status
      } else if (urlParams?.expiresAt && new Date(urlParams.expiresAt) < new Date()) {
        effective = 'expired'
      } else {
        effective = 'active'
      }

      const merged: LinkData = {
        amountUsdc: local?.amountUsdc ?? remote?.amountUsdc ?? urlParams?.amountUsdc ?? 0,
        description: local?.description ?? remote?.description ?? urlParams?.description,
        status: effective,
        network: local?.network,
        local: local ?? undefined,
      }
      setData(merged)

      switch (effective) {
        case 'claimed':
          setPhase('already')
          break
        case 'expired':
          setPhase('expired')
          break
        case 'revoked':
          setPhase('revoked')
          break
        default:
          setPhase('ready')
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [token, sdk, urlParams])

  async function onClaim() {
    if (!wallet.connected || !wallet.publicKey || !data || sdk.status !== 'ready') return
    setPhase('claiming')
    try {
      const result = await claimPaymentLink(
        sdk.client,
        token,
        urlParams ?? undefined
      )
      const amount = result.amountUsdc > 0 ? result.amountUsdc : data.amountUsdc
      const record: ClaimedResult = {
        amountUsdc: amount,
        txSignature: result.txSignature,
      }
      setClaimed(record)

      // Persist to employee payment history so the portal can show this claim.
      const network = (data?.network ?? process.env.NEXT_PUBLIC_SOLANA_NETWORK ?? 'devnet') as import('@/types').Network
      claimedPaymentsStorage.save({
        id: result.txSignature,
        linkToken: token,
        amountUsdc: amount,
        description: data?.description,
        txSignature: result.txSignature,
        claimedAt: new Date().toISOString(),
        senderAddress: urlParams?.senderAddress,
        network,
      })

      setPhase('success')
      toast.success('Payment claimed privately.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Claim failed')
      setPhase('ready')
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-bg px-5 py-6">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="h-2 w-2 rounded-full bg-accent shadow-[0_0_0_2px_rgba(74,200,158,0.2)]"
          />
          <span className="text-sm font-medium text-fg">hush.</span>
        </div>
        <PrivateBadge />
      </header>

      <main className="flex flex-1 items-center justify-center">
        <div className="w-full max-w-md py-6">
          {phase === 'loading' && <LoadingState />}

          {phase === 'revoked' && (
            <TerminalState
              icon={<ShieldAlert className="h-7 w-7" />}
              title="This Hush link is no longer valid."
              description="Contact the sender if you think this is a mistake."
              tone="danger"
            />
          )}

          {phase === 'expired' && (
            <TerminalState
              icon={<Clock className="h-7 w-7" />}
              title="This Hush link has expired."
              description="Contact the sender for a new one."
              tone="warning"
            />
          )}

          {phase === 'already' && (
            <TerminalState
              icon={<ShieldCheck className="h-7 w-7" />}
              title="This Hush link has already been claimed."
              tone="neutral"
            />
          )}

          {phase === 'ready' && data && (
            <>
              {!wallet.connected ? (
                <NoWalletPrompt />
              ) : (
                <ReadyToClaim
                  amountUsdc={data.amountUsdc}
                  description={data.description}
                  onClaim={onClaim}
                />
              )}
            </>
          )}

          {phase === 'claiming' && <ClaimingState />}

          {phase === 'success' && claimed && (
            <ClaimSuccess
              amountUsdc={claimed.amountUsdc}
              token={token}
              txSignature={claimed.txSignature}
              network={data?.network ?? 'devnet'}
            />
          )}
        </div>
      </main>

      <footer className="pt-6 text-center text-2xs text-fg-subtle">
        Powered by Umbra
      </footer>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center gap-3 text-fg-muted">
      <Loader2 className="h-7 w-7 animate-spin" aria-hidden="true" />
      <p className="text-sm">Fetching payment…</p>
    </div>
  )
}

function ClaimingState() {
  return (
    <div className="flex flex-col items-center gap-3 text-fg-muted">
      <Loader2 className="h-7 w-7 animate-spin text-accent" aria-hidden="true" />
      <p className="text-sm">Claiming privately…</p>
    </div>
  )
}

function ReadyToClaim({
  amountUsdc,
  description,
  onClaim,
}: {
  amountUsdc: number
  description?: string
  onClaim: () => void
}) {
  return (
    <div className="space-y-6 text-center">
      <div className="space-y-1.5">
        <p className="text-xs uppercase tracking-wide text-fg-subtle">You have a Hush payment</p>
        <p className="font-mono text-4xl text-fg tabular-nums sm:text-5xl">
          {formatUsdc(amountUsdc)}
          <span className="ml-2 text-lg text-fg-subtle">USDC</span>
        </p>
        {description && <p className="text-sm text-fg-muted">{description}</p>}
      </div>
      <Button className="h-11 w-full text-sm" onClick={onClaim}>
        Claim payment
      </Button>
    </div>
  )
}

function TerminalState({
  icon,
  title,
  description,
  tone,
}: {
  icon: React.ReactNode
  title: string
  description?: string
  tone: 'danger' | 'warning' | 'neutral'
}) {
  const color =
    tone === 'danger'
      ? 'text-danger bg-danger/10'
      : tone === 'warning'
      ? 'text-warning bg-warning/10'
      : 'text-fg-muted bg-bg-elevated'
  return (
    <div className="space-y-4 text-center">
      <div className="flex justify-center">
        <div className={`flex h-14 w-14 items-center justify-center rounded-full ${color}`}>
          {icon}
        </div>
      </div>
      <h1 className="text-xl font-medium text-fg">{title}</h1>
      {description && <p className="text-sm text-fg-muted">{description}</p>}
    </div>
  )
}

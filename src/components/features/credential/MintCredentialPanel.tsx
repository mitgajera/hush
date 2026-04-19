'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { toast } from 'sonner'
import { CheckCircle2, ExternalLink, Link2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { CopyButton } from '@/components/ui/CopyButton'
import { CredentialCard } from './CredentialCard'
import { mintHushCredential } from '@/lib/cnft/mint'
import type { HushCredential } from '@/types'

type Attribute = { label: string; value: string; mono?: boolean }

const PREVIEW_ATTRIBUTES: Attribute[] = [
  { label: 'type', value: 'professional_payment', mono: true },
  { label: 'verified', value: 'true', mono: true },
  { label: 'threshold', value: 'received', mono: true },
  { label: 'issuer', value: 'hush', mono: true },
  { label: 'network', value: 'solana', mono: true },
]

function credentialShareUrl(id: string) {
  const base = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  return `${base}/credential/${id}`
}

export function MintCredentialPanel({ paymentToken }: { paymentToken?: string }) {
  const wallet = useWallet()
  const { connection } = useConnection()
  const [minting, setMinting] = useState(false)
  const [credential, setCredential] = useState<HushCredential | null>(null)
  const [explorerUrl, setExplorerUrl] = useState<string | null>(null)

  async function mint() {
    setMinting(true)
    try {
      const result = await mintHushCredential(wallet, connection, { paymentToken })
      setCredential(result.credential)
      setExplorerUrl(result.explorerTxUrl)
      toast.success(
        result.credential.onChain ? 'Credential minted.' : 'Credential issued (demo).'
      )
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Mint failed')
    } finally {
      setMinting(false)
    }
  }

  if (credential) {
    const shareUrl = credentialShareUrl(credential.id)
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center gap-2 text-sm text-success">
          <CheckCircle2 className="h-4 w-4" />
          <span>
            {credential.onChain ? 'Minted on Solana.' : 'Demo credential issued locally.'}
          </span>
        </div>

        <CredentialCard
          timestamp={credential.timestamp}
          assetId={credential.id}
          onChain={credential.onChain}
        />

        <Card className="space-y-3">
          <div className="flex items-center gap-2 rounded-md border border-border bg-bg px-3 py-2">
            <Link2 className="h-3.5 w-3.5 shrink-0 text-fg-subtle" />
            <code className="truncate font-mono text-xs text-fg">{shareUrl}</code>
            <CopyButton value={shareUrl} label="Copy" className="shrink-0" />
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            {explorerUrl && credential.onChain && (
              <a
                href={explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary h-9 text-xs"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Verified on Solana
              </a>
            )}
            <Link href={`/credential/${credential.id}`} className="btn btn-primary h-9 text-xs">
              <Sparkles className="h-3.5 w-3.5" />
              View credential page
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
      <div className="space-y-4">
        <Card className="space-y-3">
          <div>
            <h3 className="text-sm font-medium text-fg">What gets minted</h3>
            <p className="mt-1 text-xs text-fg-muted">
              A compressed NFT (cNFT) on Solana. It proves you received a professional
              payment without disclosing amounts, counterparties, or wallet links.
            </p>
          </div>
          <dl className="grid grid-cols-1 gap-0 divide-y divide-border rounded-md border border-border bg-bg">
            {PREVIEW_ATTRIBUTES.map((attr) => (
              <div
                key={attr.label}
                className="flex items-center justify-between px-3 py-2 text-sm"
              >
                <dt className="text-2xs uppercase tracking-wide text-fg-subtle">
                  {attr.label}
                </dt>
                <dd className={attr.mono ? 'font-mono text-xs text-fg' : 'text-fg'}>
                  {attr.value}
                </dd>
              </div>
            ))}
            <div className="flex items-center justify-between px-3 py-2 text-sm">
              <dt className="text-2xs uppercase tracking-wide text-fg-subtle">
                timestamp
              </dt>
              <dd className="font-mono text-xs text-fg-muted">on mint</dd>
            </div>
          </dl>
        </Card>

        {paymentToken && (
          <Card className="text-xs text-fg-muted">
            Linked to claim token{' '}
            <code className="font-mono text-fg">
              {paymentToken.slice(0, 10)}…{paymentToken.slice(-6)}
            </code>
          </Card>
        )}

        <Button
          className="w-full h-11 text-sm"
          onClick={mint}
          loading={minting}
          disabled={!wallet.connected}
          leftIcon={<Sparkles className="h-4 w-4" />}
        >
          Mint Hush credential
        </Button>
        {!wallet.connected && (
          <p className="text-center text-2xs text-fg-subtle">
            Connect your wallet to mint.
          </p>
        )}
      </div>

      <CredentialCard preview />
    </div>
  )
}

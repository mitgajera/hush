'use client'

import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { toast } from 'sonner'
import { Link2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { MaskedAmount } from '@/components/ui/MaskedAmount'
import { useUmbra } from '@/hooks/useUmbra'
import { useEncryptedUsdcBalance } from '@/hooks/useEncryptedBalance'
import { generatePaymentLink } from '@/lib/umbra/paymentLink'
import { hushLinksStorage } from '@/lib/storage/hushLinks'
import { hushLinkSchema } from '@/lib/utils/validation'
import { EXPIRY_OPTIONS, expirySeconds, type ExpiryKey } from '@/lib/links/helpers'
import type { HushLink, Network } from '@/types'

type Props = {
  onGenerated: (link: HushLink) => void
}

export function LinkGenerator({ onGenerated }: Props) {
  const umbra = useUmbra()
  const wallet = useWallet()
  const balanceResult = useEncryptedUsdcBalance()
  const [amount, setAmount] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [expiry, setExpiry] = useState<ExpiryKey>('7d')
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const balance = balanceResult.amountUsdc

  async function generate() {
    setError(null)

    const expiresInSeconds = expirySeconds(expiry)
    const parsed = hushLinkSchema.safeParse({
      amountUsdc: Number(amount),
      description: description.trim() || undefined,
      expiresInSeconds,
    })
    if (!parsed.success) {
      setError(parsed.error.issues[0].message)
      return
    }

    if (!umbra || !wallet.publicKey) {
      setError('Connect your wallet to generate a link.')
      return
    }

    setGenerating(true)
    try {
      const result = await generatePaymentLink(umbra, {
        amountUsdc: parsed.data.amountUsdc,
        token: 'USDC',
        description: parsed.data.description,
        expiresInSeconds,
        senderAddress: wallet.publicKey.toBase58(),
      })

      const network = (process.env.NEXT_PUBLIC_SOLANA_NETWORK as Network | undefined) ?? 'devnet'
      const link: HushLink = {
        id: result.linkId,
        linkToken: result.token,
        url: result.url,
        amountUsdc: parsed.data.amountUsdc,
        description: parsed.data.description,
        createdAt: new Date().toISOString(),
        expiresAt: expiresInSeconds
          ? new Date(Date.now() + expiresInSeconds * 1000).toISOString()
          : undefined,
        status: 'active',
        network,
        senderAddress: wallet.publicKey.toBase58(),
      }
      hushLinksStorage.save(link)
      toast.success('Hush link generated.')
      onGenerated(link)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      toast.error(message)
    } finally {
      setGenerating(false)
    }
  }

  const parsedAmount = Number(amount)
  const canGenerate =
    Number.isFinite(parsedAmount) && parsedAmount > 0 && Boolean(umbra)

  return (
    <Card className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-medium text-fg">Generate Hush link</h3>
          <p className="mt-1 text-xs text-fg-muted">
            Share the link. The recipient claims privately via Umbra Wallet.
          </p>
        </div>
        {balance !== null && (
          <div className="text-right text-2xs text-fg-subtle">
            Available
            <div className="mt-0.5 text-fg-muted">
              <MaskedAmount id="link-generator-balance" amount={balance} showToggle={false} />
              <span className="ml-1">USDC</span>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input
          label="Amount (USDC)"
          type="number"
          inputMode="decimal"
          min={0}
          step="0.01"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <Select
          label="Expires"
          value={expiry}
          onChange={(e) => setExpiry(e.target.value as ExpiryKey)}
        >
          {EXPIRY_OPTIONS.map((opt) => (
            <option key={opt.key} value={opt.key}>
              {opt.label}
            </option>
          ))}
        </Select>
      </div>

      <Input
        label="Description (optional)"
        placeholder="Invoice #123"
        maxLength={80}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        hint={`${description.length}/80`}
      />

      {error && (
        <p className="text-xs text-danger" role="alert">
          {error}
        </p>
      )}

      <div className="flex items-center justify-end">
        <Button
          leftIcon={<Link2 className="h-4 w-4" />}
          onClick={generate}
          loading={generating}
          disabled={!canGenerate}
        >
          Generate Hush link
        </Button>
      </div>
    </Card>
  )
}

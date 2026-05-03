'use client'

import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { Send } from 'lucide-react'
import { nanoid } from 'nanoid'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { MaskedAmount } from '@/components/ui/MaskedAmount'
import { useUmbra } from '@/hooks/useUmbra'
import { useEncryptedUsdcBalance } from '@/hooks/useEncryptedBalance'
import { payrollStorage } from '@/lib/storage/payrollRuns'
import { validateRecipient } from './RecipientPreviewTable'
import type { DraftRecipient, PayrollRecipient, PayrollRun, Network } from '@/types'

const CONFIRM_THRESHOLD_USDC = 10_000

type Props = {
  recipients: DraftRecipient[]
  onRunCreated: (runId: string) => void
}

export function RunPayrollButton({ recipients, onRunCreated }: Props) {
  const umbra = useUmbra()
  const wallet = useWallet()
  const balanceResult = useEncryptedUsdcBalance()
  const [confirmOpen, setConfirmOpen] = useState(false)

  const balance = balanceResult.amountUsdc
  const total = recipients.reduce((sum, r) => sum + r.amountUsdc, 0)
  const invalidCount = recipients.filter((r) => validateRecipient(r) !== null).length
  const walletConnected = Boolean(umbra && wallet.publicKey)
  const canRun =
    recipients.length > 0 && invalidCount === 0 && walletConnected

  const insufficient = balance !== null && balance < total

  function createRun(): PayrollRun {
    const network =
      (process.env.NEXT_PUBLIC_SOLANA_NETWORK as Network | undefined) ?? 'devnet'
    const senderAddress = wallet.publicKey?.toBase58() ?? ''
    const run: PayrollRun = {
      id: 'run_' + nanoid(10),
      createdAt: new Date().toISOString(),
      totalUsdc: total,
      status: 'running',
      network,
      senderAddress,
      recipients: recipients.map<PayrollRecipient>((r) => ({
        id: r.id,
        name: r.name,
        walletAddress: r.walletAddress,
        amountUsdc: r.amountUsdc,
        status: 'pending',
      })),
    }
    payrollStorage.save(run)
    return run
  }

  function trigger() {
    if (total >= CONFIRM_THRESHOLD_USDC) {
      setConfirmOpen(true)
      return
    }
    startRun()
  }

  function startRun() {
    setConfirmOpen(false)
    const run = createRun()
    onRunCreated(run.id)
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      {insufficient && walletConnected && (
        <p className="text-2xs text-warning">
          Private balance below total. Transfers may fail.
        </p>
      )}
      <Button
        leftIcon={<Send className="h-4 w-4" />}
        onClick={trigger}
        disabled={!canRun}
      >
        Run payroll
      </Button>
      {!walletConnected && (
        <p className="text-2xs text-fg-subtle">Connect wallet to run</p>
      )}
      {invalidCount > 0 && walletConnected && (
        <p className="text-2xs text-danger">
          {invalidCount} row{invalidCount === 1 ? '' : 's'} invalid
        </p>
      )}

      <Dialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Confirm large payroll"
        description={`This run totals over ${CONFIRM_THRESHOLD_USDC.toLocaleString()} USDC across ${
          recipients.length
        } recipients.`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button onClick={startRun}>Send privately</Button>
          </>
        }
      >
        <div className="flex items-baseline gap-2">
          <span className="text-2xs uppercase tracking-wide text-fg-subtle">Total</span>
          <MaskedAmount id="confirm-total" amount={total} />
          <span className="text-xs text-fg-subtle">USDC</span>
        </div>
      </Dialog>
    </div>
  )
}

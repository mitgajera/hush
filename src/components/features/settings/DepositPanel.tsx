'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { ArrowDownToLine } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useUmbraSdkClient } from '@/hooks/useUmbraSdkClient'
import { useEncryptedUsdcBalance } from '@/hooks/useEncryptedBalance'
import { depositUsdcToEncryptedBalance } from '@/lib/umbra/deposit'
import { getTokenSymbol } from '@/lib/token'

export function DepositPanel() {
  const sdk = useUmbraSdkClient()
  const balance = useEncryptedUsdcBalance()
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)

  if (sdk.status !== 'ready') return null

  const symbol = getTokenSymbol()

  async function handleDeposit() {
    if (sdk.status !== 'ready') return
    const parsed = Number(amount)
    if (!Number.isFinite(parsed) || parsed <= 0) {
      toast.error('Enter a valid amount.')
      return
    }
    setLoading(true)
    try {
      const sig = await depositUsdcToEncryptedBalance(sdk.client, parsed)
      toast.success(`Deposited ${parsed} ${symbol} to encrypted balance.`, {
        description: sig.slice(0, 16) + '…',
      })
      setAmount('')
      balance.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Deposit failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-fg">Deposit to encrypted balance</h3>
        <p className="mt-1 text-xs text-fg-muted">
          Move public {symbol} from your wallet into your private Umbra balance. Required before
          sending private transfers or running payroll.
        </p>
      </div>

      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Input
            label={`Amount (${symbol})`}
            type="number"
            inputMode="decimal"
            min={0}
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <Button
          leftIcon={<ArrowDownToLine className="h-4 w-4" />}
          onClick={handleDeposit}
          loading={loading}
          disabled={!amount || Number(amount) <= 0}
          className="mb-0.5"
        >
          Deposit
        </Button>
      </div>
    </Card>
  )
}

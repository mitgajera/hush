export type PayrollRecipient = {
  id: string
  name: string
  umbraAddress: string
  amountUsdc: number
  status: 'pending' | 'sending' | 'success' | 'failed'
  txSignature?: string
  error?: string
}

export type DraftRecipient = {
  id: string
  name: string
  umbraAddress: string
  amountUsdc: number
}

export type PayrollRun = {
  id: string
  createdAt: string
  completedAt?: string
  recipients: PayrollRecipient[]
  totalUsdc: number
  status: 'draft' | 'running' | 'completed' | 'partial' | 'failed'
  network: 'devnet' | 'mainnet-beta'
  senderAddress: string
}

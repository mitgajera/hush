export type Milestone = {
  id: string
  number: number
  description: string
  amountUsdc: number
  status: 'pending' | 'approved' | 'sending' | 'paid' | 'failed'
  approvedAt?: string
  paidAt?: string
  txSignature?: string
  hushLinkId?: string
  error?: string
}

export type Project = {
  id: string
  name: string
  clientDescription?: string
  contractorAddress: string
  createdAt: string
  status: 'active' | 'completed' | 'archived'
  milestones: Milestone[]
  totalBudgetUsdc: number
}

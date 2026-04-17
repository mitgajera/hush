export type AuditKeyScope =
  | { type: 'run'; runId: string }
  | { type: 'dateRange'; from: string; to: string }
  | { type: 'all' }

export type AuditKey = {
  id: string
  key: string
  scope: AuditKeyScope
  scopeDescription: string
  createdAt: string
  lastUsedAt?: string
}

export type DecryptedRecord = {
  recipient: string
  amountUsdc: number
  timestamp: string
  memo?: string
  txSignature: string
}

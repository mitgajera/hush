export type UmbraAddress = string

export type ConfidentialTransferParams = {
  to: UmbraAddress
  amountUsdc: number
  token: 'USDC'
  memo?: string
}

export type ConfidentialTransferResult = {
  txSignature: string
  encryptedAmount: string
  blockTime?: number
}

export type PaymentLinkParams = {
  amountUsdc: number
  token: 'USDC'
  description?: string
  expiresInSeconds?: number
  senderAddress?: string
}

export type PaymentLinkResult = {
  linkId: string
  token: string
  url: string
}

export type ViewingKeyScope =
  | { type: 'run'; runId: string }
  | { type: 'dateRange'; from: Date; to: Date }
  | { type: 'all' }

export type ViewingKeyResult = {
  key: string
}

export type DecryptedTransfer = {
  from: string
  to: string
  amountUsdc: number
  timestamp: string
  memo?: string
  txSignature: string
}

export type PaymentLinkInspection = {
  amountUsdc: number
  description?: string
  status: 'active' | 'claimed' | 'expired' | 'revoked'
}

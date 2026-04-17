export type HushLink = {
  id: string
  linkToken: string
  url: string
  amountUsdc: number
  description?: string
  createdAt: string
  expiresAt?: string
  status: 'active' | 'claimed' | 'expired' | 'revoked'
  claimedAt?: string
  claimTxSignature?: string
  network: 'devnet' | 'mainnet-beta'
  senderAddress: string
}

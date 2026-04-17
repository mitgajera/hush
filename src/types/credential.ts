export type HushCredential = {
  id: string
  type: 'professional_payment'
  verified: true
  threshold: 'received'
  issuer: 'hush'
  timestamp: string
  network: 'solana'
  mintTxSignature: string
}

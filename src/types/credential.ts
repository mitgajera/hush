export type HushCredential = {
  id: string                // cNFT asset ID or demo id
  type: 'professional_payment'
  verified: true
  threshold: 'received'
  issuer: 'hush'
  timestamp: string
  network: 'solana'
  mintTxSignature: string
  ownerAddress?: string     // Solana wallet that owns the credential
  paymentToken?: string     // optional claim token used to mint
  onChain: boolean          // false when minted via dev stub
}

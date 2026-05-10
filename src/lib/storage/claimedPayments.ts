import { createListStorage } from './createListStorage'
import { STORAGE_KEYS } from './keys'
import type { Network } from '@/types'

export type ClaimedPayment = {
  id: string
  linkToken: string
  amountUsdc: number
  description?: string
  txSignature: string
  claimedAt: string
  senderAddress?: string
  network: Network
}

export const claimedPaymentsStorage = createListStorage<ClaimedPayment>(
  STORAGE_KEYS.claimedPayments
)

import { z } from 'zod'

// Solana base58 public key: 32–44 chars, no 0/O/I/l
export const solanaAddressRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/

export const solanaAddressSchema = z
  .string()
  .trim()
  .regex(solanaAddressRegex, 'Invalid Solana wallet address')

export const usdcAmountSchema = z.coerce
  .number()
  .positive('Must be greater than 0')

export const payrollRecipientSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  wallet_address: solanaAddressSchema,
  amount: usdcAmountSchema,
})

export const draftRecipientSchema = z.object({
  id: z.string(),
  name: z.string().trim().min(1, 'Name is required'),
  walletAddress: solanaAddressSchema,
  amountUsdc: usdcAmountSchema,
})

export const projectSchema = z.object({
  name: z.string().trim().min(1, 'Project name is required'),
  clientDescription: z.string().trim().max(240).optional(),
  contractorAddress: solanaAddressSchema,
})

export const milestoneSchema = z.object({
  description: z.string().trim().min(1, 'Description is required'),
  amountUsdc: usdcAmountSchema,
})

export const hushLinkSchema = z.object({
  amountUsdc: usdcAmountSchema,
  description: z.string().trim().max(80).optional(),
  expiresInSeconds: z.number().int().nonnegative().optional(),
})

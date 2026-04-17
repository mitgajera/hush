import { z } from 'zod'

export const umbraAddressRegex = /^umb1[a-zA-Z0-9]{38,}$/

export const umbraAddressSchema = z
  .string()
  .trim()
  .regex(umbraAddressRegex, 'Invalid Umbra address')

export const usdcAmountSchema = z.coerce
  .number()
  .positive('Must be greater than 0')

export const payrollRecipientSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  umbra_address: umbraAddressSchema,
  amount: usdcAmountSchema,
})

export const projectSchema = z.object({
  name: z.string().trim().min(1, 'Project name is required'),
  clientDescription: z.string().trim().max(240).optional(),
  contractorAddress: umbraAddressSchema,
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

'use client'

import type { getUmbraClient } from '@umbra-privacy/sdk'
type IUmbraClient = Awaited<ReturnType<typeof getUmbraClient>>

import { toRawUsdc } from '@/lib/utils/format'

function usdcMint(): string {
  return process.env.NEXT_PUBLIC_USDC_MINT ?? '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU'
}

export async function depositUsdcToEncryptedBalance(
  client: IUmbraClient,
  amountUsdc: number
): Promise<string> {
  const sdk = await import('@umbra-privacy/sdk')
  const deposit = sdk.getPublicBalanceToEncryptedBalanceDirectDepositorFunction({ client })
  const result = await deposit(
    client.signer.address as never,
    usdcMint() as never,
    toRawUsdc(amountUsdc) as never
  )
  return result.queueSignature
}

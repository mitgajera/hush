'use client'

import type { getUmbraClient } from '@umbra-privacy/sdk'
type IUmbraClient = Awaited<ReturnType<typeof getUmbraClient>>

import { getTokenMint, toRawAmount } from '@/lib/token'

export async function depositUsdcToEncryptedBalance(
  client: IUmbraClient,
  amountUsdc: number
): Promise<string> {
  const sdk = await import('@umbra-privacy/sdk')
  // Don't block on Arcium MPC finalization — return as soon as the queue tx confirms.
  // The encrypted balance updates asynchronously once the computation completes.
  const deposit = sdk.getPublicBalanceToEncryptedBalanceDirectDepositorFunction(
    { client },
    { arcium: { awaitComputationFinalization: false } }
  )
  try {
    const result = await deposit(
      client.signer.address as never,
      getTokenMint() as never,
      toRawAmount(amountUsdc) as never
    )
    return result.queueSignature
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    if (msg.includes('fee_schedule') && msg.includes('AccountNotInitialized')) {
      throw new Error(
        'Umbra devnet is missing fee_schedule accounts (not yet initialised by the protocol team). ' +
        'Deposit is unavailable until Umbra fixes their devnet setup. ' +
        'Contact dev@umbraprivacy.com or run: node scripts/init-umbra-devnet.mjs'
      )
    }
    // "already been processed" means the deposit transaction landed in a prior
    // attempt but the SDK didn't detect confirmation in time. The deposit succeeded.
    if (
      msg.includes('already been processed') ||
      msg.includes('AlreadyProcessed') ||
      msg.includes('already processed')
    ) {
      throw new Error(
        'Deposit was already submitted and processed. ' +
        'Refresh your encrypted balance — it should reflect the deposit.'
      )
    }
    throw err
  }
}

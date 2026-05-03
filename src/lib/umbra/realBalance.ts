'use client'

import type { getUmbraClient } from '@umbra-privacy/sdk'
type IUmbraClient = Awaited<ReturnType<typeof getUmbraClient>>
import { getTokenMint, fromRawAmount } from '@/lib/token'

export type EncryptedBalanceState =
  | { state: 'non_existent' }
  | { state: 'uninitialized' }
  | { state: 'mxe' }
  | { state: 'shared'; amountUsdc: number }

/**
 * Queries the user's encrypted USDC balance.
 *
 * Shared-mode balances are decrypted client-side with the user's X25519 key
 * and returned in USDC units. MXE-only balances cannot be decrypted here
 * (would require an Arcium roundtrip) and come back as `{ state: 'mxe' }`.
 *
 * First call may prompt the wallet for a master-seed signature since the
 * SDK client is created with deferMasterSeedSignature=true.
 */
export async function queryEncryptedUsdcBalance(
  client: IUmbraClient
): Promise<EncryptedBalanceState> {
  const sdk = await import('@umbra-privacy/sdk')
  const query = sdk.getEncryptedBalanceQuerierFunction({ client })
  // SDK uses Address (string) keys; our env value is already base58 text.
  const results = await query([getTokenMint() as never])

  for (const [, result] of results) {
    const state = result.state
    if (state === 'shared') {
      const raw = (result as { balance: bigint }).balance
      return { state: 'shared', amountUsdc: fromRawAmount(raw) }
    }
    if (state === 'mxe') return { state: 'mxe' }
    if (state === 'uninitialized') return { state: 'uninitialized' }
    if (state === 'non_existent') return { state: 'non_existent' }
  }

  return { state: 'non_existent' }
}

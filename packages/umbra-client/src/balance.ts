import { getEncryptedBalanceQuerierFunction } from '@umbra-privacy/sdk'
import type { IUmbraClient } from './client'
import { address } from '@solana/kit'

export async function getEncryptedBalance(client: IUmbraClient, mint: string): Promise<unknown> {
  const query = getEncryptedBalanceQuerierFunction({ client })
  const result = await query([address(mint)])
  return result
}

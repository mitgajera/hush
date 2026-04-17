import { UmbraClient } from './client'

export async function getPrivateBalance(
  _client: UmbraClient,
  _token: 'USDC' = 'USDC'
): Promise<number> {
  // Real: umbra.getPrivateBalance('USDC')
  return 0
}

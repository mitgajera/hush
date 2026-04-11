import { getUmbraClient } from '@umbra-privacy/sdk'
import type { GetUmbraClientArgs } from '@umbra-privacy/sdk'

// Derive the public client type from the factory rather than internal types
export type IUmbraClient = Awaited<ReturnType<typeof getUmbraClient>>
export type IUmbraSigner = GetUmbraClientArgs['signer']

let _client: IUmbraClient | null = null

export async function createUmbraClient(signer: IUmbraSigner): Promise<IUmbraClient> {
  if (_client) return _client

  _client = await getUmbraClient({
    signer,
    network: process.env.NEXT_PUBLIC_UMBRA_NETWORK as 'devnet' | 'mainnet',
    rpcUrl: process.env.NEXT_PUBLIC_SOLANA_RPC_URL!,
    rpcSubscriptionsUrl: process.env.NEXT_PUBLIC_SOLANA_RPC_WS_URL!,
    indexerApiEndpoint: process.env.NEXT_PUBLIC_UMBRA_INDEXER_URL!,
  })

  return _client
}

export function clearUmbraClient(): void {
  _client = null
}

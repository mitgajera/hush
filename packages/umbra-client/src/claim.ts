import {
  getClaimableUtxoScannerFunction,
  getReceiverClaimableUtxoToEncryptedBalanceClaimerFunction,
  getUmbraRelayer,
  getBatchMerkleProofFetcher,
} from '@umbra-privacy/sdk'
import { getClaimReceiverClaimableUtxoIntoEncryptedBalanceProver } from '@umbra-privacy/web-zk-prover'
import type { IUmbraClient } from './client'

// Extract branded U32 type from scanner function signature
type _ScannerFn = ReturnType<typeof getClaimableUtxoScannerFunction>
type SdkU32 = Parameters<_ScannerFn>[0]

export interface ClaimResult {
  claimed: number
  utxos?: unknown[]
  result?: unknown
}

export async function scanAndClaimUtxos(
  client: IUmbraClient,
  treeIndex = 0,
): Promise<ClaimResult> {
  const fetchUtxos = getClaimableUtxoScannerFunction({ client })
  const { received } = await fetchUtxos(
    BigInt(treeIndex) as unknown as SdkU32,
    BigInt(0) as unknown as SdkU32,
  )

  if (received.length === 0) return { claimed: 0, utxos: [] }

  const zkProver = getClaimReceiverClaimableUtxoIntoEncryptedBalanceProver()
  const relayer = getUmbraRelayer({
    apiEndpoint: process.env.NEXT_PUBLIC_UMBRA_RELAYER_URL!,
  })
  const fetchBatchMerkleProof = getBatchMerkleProofFetcher({
    apiEndpoint: process.env.NEXT_PUBLIC_UMBRA_INDEXER_URL!,
  })

  const claim = getReceiverClaimableUtxoToEncryptedBalanceClaimerFunction(
    { client },
    { zkProver, relayer, fetchBatchMerkleProof },
  )

  const result = await claim(received)

  return {
    claimed: received.length,
    utxos: received,
    result,
  }
}

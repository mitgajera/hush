'use client'

import type { getUmbraClient } from '@umbra-privacy/sdk'
type IUmbraClient = Awaited<ReturnType<typeof getUmbraClient>>

import type { ConfidentialTransferParams, ConfidentialTransferResult } from './types'
import { getTokenMint, toRawAmount } from '@/lib/token'

export async function sendConfidentialTransfer(
  client: IUmbraClient,
  params: ConfidentialTransferParams
): Promise<ConfidentialTransferResult> {
  const [sdk, proverPkg] = await Promise.all([
    import('@umbra-privacy/sdk'),
    import('@umbra-privacy/web-zk-prover'),
  ])

  const zkProver = proverPkg.getCreateReceiverClaimableUtxoFromEncryptedBalanceProver({
    assetProvider: proverPkg.getCdnZkAssetProvider(),
  })

  const createUtxo = sdk.getEncryptedBalanceToReceiverClaimableUtxoCreatorFunction(
    { client },
    { zkProver }
  )

  const result = await createUtxo({
    amount: toRawAmount(params.amountUsdc) as never,
    destinationAddress: params.to as never,
    mint: getTokenMint() as never,
  })

  return {
    txSignature: result.queueSignature,
    encryptedAmount: 'encrypted',
    blockTime: Math.floor(Date.now() / 1000),
  }
}

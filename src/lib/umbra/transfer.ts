'use client'

import type { getUmbraClient } from '@umbra-privacy/sdk'
type IUmbraClient = Awaited<ReturnType<typeof getUmbraClient>>

import type { ConfidentialTransferParams, ConfidentialTransferResult } from './types'
import { toRawUsdc } from '@/lib/utils/format'

function usdcMint(): string {
  return process.env.NEXT_PUBLIC_USDC_MINT ?? '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU'
}

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
    amount: toRawUsdc(params.amountUsdc) as never,
    destinationAddress: params.to as never,
    mint: usdcMint() as never,
  })

  return {
    txSignature: result.queueSignature,
    encryptedAmount: 'encrypted',
    blockTime: Math.floor(Date.now() / 1000),
  }
}

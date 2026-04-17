import { UmbraClient } from './client'
import {
  ConfidentialTransferParams,
  ConfidentialTransferResult,
} from './types'

export async function sendConfidentialTransfer(
  _client: UmbraClient,
  _params: ConfidentialTransferParams
): Promise<ConfidentialTransferResult> {
  // Real:
  //   const result = await umbra.sendConfidentialTransfer({
  //     to: params.to,
  //     amount: toRawUsdc(params.amountUsdc),
  //     token: USDC_MINT,
  //     memo: params.memo,
  //   })
  //   return {
  //     txSignature: result.signature,
  //     encryptedAmount: result.encryptedAmount,
  //     blockTime: result.blockTime,
  //   }
  await new Promise((r) => setTimeout(r, 1200))
  return {
    txSignature:
      'stub_' + Math.random().toString(36).slice(2, 10) + 'xxxxxxxxxxxx',
    encryptedAmount: 'enc_' + Math.random().toString(36).slice(2, 18),
    blockTime: Math.floor(Date.now() / 1000),
  }
}

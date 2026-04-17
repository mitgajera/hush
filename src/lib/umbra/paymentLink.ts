import { nanoid } from 'nanoid'
import { UmbraClient } from './client'
import {
  PaymentLinkInspection,
  PaymentLinkParams,
  PaymentLinkResult,
} from './types'

export async function generatePaymentLink(
  _client: UmbraClient,
  _params: PaymentLinkParams
): Promise<PaymentLinkResult> {
  // Real:
  //   const res = await umbra.createPaymentLink({...})
  //   const token = res.token
  const token = nanoid(22)
  const linkId = 'link_' + nanoid(12)
  const base = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  return {
    linkId,
    token,
    url: `${base}/claim/${token}`,
  }
}

export async function claimPaymentLink(
  _client: UmbraClient,
  _token: string
): Promise<{ txSignature: string; amountUsdc: number }> {
  // Real:
  //   return umbra.claimPaymentLink({ token })
  await new Promise((r) => setTimeout(r, 1000))
  return {
    txSignature: 'claim_' + nanoid(18),
    amountUsdc: 0,
  }
}

export async function inspectPaymentLink(
  _client: UmbraClient,
  _token: string
): Promise<PaymentLinkInspection> {
  // Real: look up link from chain or SDK
  return { amountUsdc: 0, status: 'active' }
}

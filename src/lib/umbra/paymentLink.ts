'use client'

import type { getUmbraClient } from '@umbra-privacy/sdk'
type IUmbraClient = Awaited<ReturnType<typeof getUmbraClient>>

import { nanoid } from 'nanoid'
import { hushLinksStorage } from '@/lib/storage/hushLinks'
import type { PaymentLinkInspection, PaymentLinkParams, PaymentLinkResult } from './types'
import { sendConfidentialTransfer } from './transfer'

export async function generatePaymentLink(
  _client: IUmbraClient,
  _params: PaymentLinkParams
): Promise<PaymentLinkResult> {
  const token = nanoid(22)
  const linkId = 'link_' + nanoid(12)
  const base = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  return { linkId, token, url: `${base}/claim/${token}` }
}

export async function claimPaymentLink(
  client: IUmbraClient,
  token: string
): Promise<{ txSignature: string; amountUsdc: number }> {
  const link = hushLinksStorage.getAll().find((l) => l.linkToken === token)
  if (!link) throw new Error('Payment link not found')
  if (link.status !== 'active') throw new Error(`Payment link is ${link.status}`)

  const result = await sendConfidentialTransfer(client, {
    to: link.senderAddress,
    amountUsdc: link.amountUsdc,
    token: 'USDC',
  })

  hushLinksStorage.update(link.id, {
    status: 'claimed',
    claimedAt: new Date().toISOString(),
    claimTxSignature: result.txSignature,
  })

  return { txSignature: result.txSignature, amountUsdc: link.amountUsdc }
}

export async function inspectPaymentLink(
  _client: IUmbraClient,
  token: string
): Promise<PaymentLinkInspection> {
  const link = hushLinksStorage.getAll().find((l) => l.linkToken === token)
  if (!link) throw new Error('Payment link not found')
  return { amountUsdc: link.amountUsdc, description: link.description, status: link.status }
}

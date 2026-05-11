'use client'

import type { getUmbraClient } from '@umbra-privacy/sdk'
type IUmbraClient = Awaited<ReturnType<typeof getUmbraClient>>

import { nanoid } from 'nanoid'
import { hushLinksStorage } from '@/lib/storage/hushLinks'
import type { PaymentLinkInspection, PaymentLinkParams, PaymentLinkResult } from './types'
import { sendConfidentialTransfer } from './transfer'

export type UrlLinkParams = {
  amountUsdc: number
  description?: string
  senderAddress: string
  recipientAddress?: string
  txSignature?: string
  expiresAt?: string
}

/**
 * Generate a Hush Link. The Umbra transfer is executed NOW (sender pays at
 * generation time) so the recipient only needs to confirm receipt — no
 * on-chain operation required at claim time.
 */
export async function generatePaymentLink(
  client: IUmbraClient,
  params: PaymentLinkParams
): Promise<PaymentLinkResult> {
  const token = nanoid(22)
  const linkId = 'link_' + nanoid(12)
  const base = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000')

  const qs = new URLSearchParams()
  qs.set('a', String(params.amountUsdc))
  if (params.description) qs.set('d', params.description)
  if (params.senderAddress) qs.set('s', params.senderAddress)
  if (params.recipientAddress) qs.set('r', params.recipientAddress)
  if (params.expiresInSeconds) {
    qs.set('e', new Date(Date.now() + params.expiresInSeconds * 1000).toISOString())
  }

  // Execute the private Umbra transfer now so the recipient can claim without
  // needing their own on-chain transaction.
  if (params.recipientAddress) {
    const transfer = await sendConfidentialTransfer(client, {
      to: params.recipientAddress,
      amountUsdc: params.amountUsdc,
      token: 'USDC',
    })
    qs.set('tx', transfer.txSignature)
  }

  return { linkId, token, url: `${base}/claim/${token}?${qs.toString()}` }
}

/**
 * "Claim" a Hush Link. Since the sender already executed the Umbra transfer
 * at generation time, claiming just verifies the URL data and returns the
 * receipt — no on-chain transaction needed.
 */
export async function claimPaymentLink(
  _client: IUmbraClient,
  token: string,
  urlParams?: UrlLinkParams
): Promise<{ txSignature: string; amountUsdc: number }> {
  const link = hushLinksStorage.getAll().find((l) => l.linkToken === token)

  const amountUsdc = link?.amountUsdc ?? urlParams?.amountUsdc
  const txSignature = link?.claimTxSignature ?? urlParams?.txSignature

  if (!amountUsdc) throw new Error('Payment link not found')
  if (link && link.status !== 'active') throw new Error(`Payment link is ${link.status}`)

  // Mark the link as claimed in the sender's browser if they have the record.
  if (link) {
    hushLinksStorage.update(link.id, {
      status: 'claimed',
      claimedAt: new Date().toISOString(),
    })
  }

  // The txSignature recorded at generation time is the receipt.
  // If no tx (link was generated without a recipient), fall back to the token.
  return {
    txSignature: txSignature ?? `hush:${token}`,
    amountUsdc,
  }
}

export async function inspectPaymentLink(
  _client: IUmbraClient,
  token: string,
  urlParams?: UrlLinkParams
): Promise<PaymentLinkInspection> {
  const link = hushLinksStorage.getAll().find((l) => l.linkToken === token)
  if (!link && !urlParams) throw new Error('Payment link not found')

  const amountUsdc = link?.amountUsdc ?? urlParams!.amountUsdc
  const description = link?.description ?? urlParams?.description

  let status: PaymentLinkInspection['status'] = 'active'
  if (link) {
    status = link.status
    if (status === 'active' && link.expiresAt && new Date(link.expiresAt) < new Date()) {
      status = 'expired'
    }
  } else if (urlParams?.expiresAt && new Date(urlParams.expiresAt) < new Date()) {
    status = 'expired'
  }

  return { amountUsdc, description, status }
}

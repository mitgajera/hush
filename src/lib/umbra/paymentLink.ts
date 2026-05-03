'use client'

import type { getUmbraClient } from '@umbra-privacy/sdk'
type IUmbraClient = Awaited<ReturnType<typeof getUmbraClient>>

import { nanoid } from 'nanoid'
import { hushLinksStorage } from '@/lib/storage/hushLinks'
import type { PaymentLinkInspection, PaymentLinkParams, PaymentLinkResult } from './types'
import { sendConfidentialTransfer } from './transfer'

// URL-encoded link metadata read by the claim page on any browser.
export type UrlLinkParams = {
  amountUsdc: number
  description?: string
  senderAddress: string
  expiresAt?: string
}

export async function generatePaymentLink(
  _client: IUmbraClient,
  params: PaymentLinkParams
): Promise<PaymentLinkResult> {
  const token = nanoid(22)
  const linkId = 'link_' + nanoid(12)
  const base = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  // Encode metadata in the URL so recipients on any browser can view and claim
  // the link without needing local storage from the sender's device.
  const qs = new URLSearchParams()
  qs.set('a', String(params.amountUsdc))
  if (params.description) qs.set('d', params.description)
  if (params.senderAddress) qs.set('s', params.senderAddress)
  if (params.expiresInSeconds) {
    qs.set('e', new Date(Date.now() + params.expiresInSeconds * 1000).toISOString())
  }

  return { linkId, token, url: `${base}/claim/${token}?${qs.toString()}` }
}

export async function claimPaymentLink(
  client: IUmbraClient,
  token: string,
  urlParams?: UrlLinkParams
): Promise<{ txSignature: string; amountUsdc: number }> {
  const link = hushLinksStorage.getAll().find((l) => l.linkToken === token)

  const amountUsdc = link?.amountUsdc ?? urlParams?.amountUsdc
  const senderAddress = link?.senderAddress ?? urlParams?.senderAddress

  if (!amountUsdc || !senderAddress) throw new Error('Payment link not found')
  if (link && link.status !== 'active') throw new Error(`Payment link is ${link.status}`)

  const result = await sendConfidentialTransfer(client, {
    to: senderAddress,
    amountUsdc,
    token: 'USDC',
  })

  // Update local record only if this is the sender's browser
  if (link) {
    hushLinksStorage.update(link.id, {
      status: 'claimed',
      claimedAt: new Date().toISOString(),
      claimTxSignature: result.txSignature,
    })
  }

  return { txSignature: result.txSignature, amountUsdc }
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

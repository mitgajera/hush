import type { HushCredential } from '@/types'

export type CredentialMetadataSeed = {
  timestamp: string
  ownerAddress?: string
  network?: string
}

/**
 * Builds the JSON blob that describes a Hush credential cNFT.
 * Mirrors the on-chain attributes from Section 15.7 so the stub preview
 * and the real metadata match byte-for-byte.
 */
export function buildCredentialJson(seed: CredentialMetadataSeed) {
  return {
    name: 'Hush Credential',
    symbol: 'HUSH',
    description:
      'Professional payment received via Hush. No amounts. No wallet links. No employer names.',
    image: 'https://umbraprivacy.com/og/hush-credential.png',
    external_url: 'https://hush.vercel.app',
    attributes: [
      { trait_type: 'type', value: 'professional_payment' },
      { trait_type: 'verified', value: 'true' },
      { trait_type: 'threshold', value: 'received' },
      { trait_type: 'issuer', value: 'hush' },
      { trait_type: 'timestamp', value: seed.timestamp },
      { trait_type: 'network', value: seed.network ?? 'solana' },
    ],
    properties: {
      category: 'image',
    },
  }
}

export function buildMetadataDataUri(seed: CredentialMetadataSeed): string {
  const json = JSON.stringify(buildCredentialJson(seed))
  // URL-encoded is safe for spaces + quotes and avoids base64 blowup
  return `data:application/json;charset=utf-8,${encodeURIComponent(json)}`
}

export function credentialToMetadataSeed(c: HushCredential): CredentialMetadataSeed {
  return {
    timestamp: c.timestamp,
    ownerAddress: c.ownerAddress,
    network: c.network,
  }
}

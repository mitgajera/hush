'use client'

import type { getUmbraClient } from '@umbra-privacy/sdk'
type IUmbraClient = Awaited<ReturnType<typeof getUmbraClient>>

export type RegistrationStatus =
  | { state: 'not_registered' }
  | { state: 'x25519_only' }
  | { state: 'commitment_only' }
  | { state: 'registered' }

/**
 * Reads the on-chain registration state for the connected wallet — no tx sent.
 * Returns `registered` only when both the X25519 encryption key and the user
 * commitment are published.
 */
export async function queryRegistrationStatus(
  client: IUmbraClient
): Promise<RegistrationStatus> {
  const sdk = await import('@umbra-privacy/sdk')
  const query = sdk.getUserAccountQuerierFunction({ client })
  const result = await query(client.signer.address)

  if (result.state !== 'exists') return { state: 'not_registered' }

  const x25519 = Boolean(result.data?.isUserAccountX25519KeyRegistered)
  const commitment = Boolean(result.data?.isUserCommitmentRegistered)
  if (x25519 && commitment) return { state: 'registered' }
  if (x25519) return { state: 'x25519_only' }
  if (commitment) return { state: 'commitment_only' }
  return { state: 'not_registered' }
}

/**
 * Drives the registration flow. Returns the list of signatures from the steps
 * that ran — empty if already fully registered, 1–3 otherwise.
 */
export async function registerUser(client: IUmbraClient): Promise<string[]> {
  const [sdk, proverPkg] = await Promise.all([
    import('@umbra-privacy/sdk'),
    import('@umbra-privacy/web-zk-prover'),
  ])
  const zkProver = proverPkg.getUserRegistrationProver({
    assetProvider: proverPkg.getCdnZkAssetProvider(),
  })
  const register = sdk.getUserRegistrationFunction({ client }, { zkProver })
  try {
    const signatures = await register({ confidential: true, anonymous: true })
    return signatures.map(String)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    // "already been processed" means the registration transaction landed in a
    // prior session. Treat it as success — the on-chain state IS registered.
    if (
      msg.includes('already been processed') ||
      msg.includes('AlreadyProcessed') ||
      msg.includes('already processed')
    ) {
      return []
    }
    throw err
  }
}

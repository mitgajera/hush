'use client'

import type { WalletContextState } from '@solana/wallet-adapter-react'
import type { getUmbraClient } from '@umbra-privacy/sdk'
type IUmbraClient = Awaited<ReturnType<typeof getUmbraClient>>

let sdkModulePromise: Promise<typeof import('@umbra-privacy/sdk')> | null = null
let walletStandardPromise: Promise<typeof import('@wallet-standard/app')> | null = null

function loadSdk() {
  if (!sdkModulePromise) sdkModulePromise = import('@umbra-privacy/sdk')
  return sdkModulePromise
}

function loadWalletStandard() {
  if (!walletStandardPromise) walletStandardPromise = import('@wallet-standard/app')
  return walletStandardPromise
}


/**
 * Creates a real Umbra SDK client wired to the currently-connected Solana
 * wallet-adapter wallet. Requires:
 *   - wallet.connected + wallet.publicKey
 *   - NEXT_PUBLIC_SOLANA_RPC_URL, NEXT_PUBLIC_SOLANA_WS_URL
 *   - NEXT_PUBLIC_UMBRA_NETWORK, NEXT_PUBLIC_UMBRA_INDEXER_URL
 *
 * Throws if the active wallet doesn't expose a Wallet Standard account for the
 * connected publicKey (e.g. an adapter predating the Wallet Standard).
 *
 * Uses deferMasterSeedSignature so instantiation doesn't immediately prompt
 * for a signature — the signature is deferred until the first op that needs
 * the user's master seed (balance query, transfer, registration).
 */
export async function createRealUmbraClient(
  wallet: WalletContextState
): Promise<IUmbraClient> {
  if (typeof window === 'undefined') {
    throw new Error('createRealUmbraClient is browser-only')
  }
  if (!wallet.connected || !wallet.publicKey) {
    throw new Error('Wallet is not connected')
  }
  const adapterName = wallet.wallet?.adapter.name
  if (!adapterName) throw new Error('No active wallet adapter')

  const [sdk, ws] = await Promise.all([loadSdk(), loadWalletStandard()])

  const walletStandardWallets = ws.getWallets().get()
  const standardWallet = walletStandardWallets.find((w) => w.name === adapterName)
  if (!standardWallet) {
    throw new Error(
      `Connected wallet "${adapterName}" does not expose Wallet Standard; Umbra cannot sign through it.`
    )
  }

  const address = wallet.publicKey.toBase58()
  const account = standardWallet.accounts.find((a) => a.address === address)
  if (!account) {
    throw new Error(
      `Active wallet account (${address}) is not exposed by the Wallet Standard interface.`
    )
  }

  const signer = sdk.createSignerFromWalletAccount(standardWallet, account)

  const network = (process.env.NEXT_PUBLIC_UMBRA_NETWORK ??
    process.env.NEXT_PUBLIC_SOLANA_NETWORK ??
    'devnet') as 'devnet' | 'mainnet' | 'localnet'

  const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL
  if (!rpcUrl) throw new Error('Missing env var: NEXT_PUBLIC_SOLANA_RPC_URL')
  const rpcSubscriptionsUrl =
    process.env.NEXT_PUBLIC_SOLANA_WS_URL ?? rpcUrl.replace(/^http/, 'ws')
  const indexerApiEndpoint = process.env.NEXT_PUBLIC_UMBRA_INDEXER_URL

  return sdk.getUmbraClient({
    signer,
    network,
    rpcUrl,
    rpcSubscriptionsUrl,
    indexerApiEndpoint,
    deferMasterSeedSignature: true,
  })
}

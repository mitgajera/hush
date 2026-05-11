'use client'

import type { WalletContextState } from '@solana/wallet-adapter-react'
import { Connection, VersionedTransaction } from '@solana/web3.js'
import type { getUmbraClient } from '@umbra-privacy/sdk'
type IUmbraClient = Awaited<ReturnType<typeof getUmbraClient>>

let sdkModulePromise: Promise<typeof import('@umbra-privacy/sdk')> | null = null
function loadSdk() {
  if (!sdkModulePromise) sdkModulePromise = import('@umbra-privacy/sdk')
  return sdkModulePromise
}

/**
 * Pre-simulate before showing the Phantom dialog.
 * Catches fee_schedule and other instruction errors early so the user never
 * sees Phantom's slow "simulation failed" dialog (which holds the page for
 * 30-60 s and causes the blockhash to expire).
 */
async function preSimulate(rpcUrl: string, wireBase64: string): Promise<void> {
  const res = await fetch(rpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0', id: 99,
      method: 'simulateTransaction',
      params: [wireBase64, {
        encoding: 'base64',
        sigVerify: false,
        replaceRecentBlockhash: true,
        commitment: 'confirmed',
      }],
    }),
  }).then(r => r.json()) as {
    result?: { value?: { err: unknown; logs: string[] } }
    error?: { message: string }
  }

  if (res.error) {
    console.warn('[Umbra] sim RPC error:', res.error.message)
    return
  }
  const val = res.result?.value
  if (!val) return
  if (val.err) {
    const logs = (val.logs ?? []).join('\n')
    console.error('[Umbra] simulation FAILED:', JSON.stringify(val.err), '\n', logs)

    if (logs.includes('fee_schedule') && logs.includes('AccountNotInitialized')) {
      throw new Error(
        'Umbra devnet fee_schedule missing for this token. ' +
        'The Umbra team needs to initialise it. Contact dev@umbraprivacy.com'
      )
    }
    if (logs.includes('depositor_token_account') && logs.includes('AccountNotInitialized')) {
      throw new Error(
        'The sender does not have a USDC token account on this network. ' +
        'They need to receive or airdrop USDC first so the account is initialized before creating Hush links.'
      )
    }
    if (logs.includes('AccountNotInitialized')) {
      throw new Error(
        'A required on-chain account is not initialized. ' +
        'Make sure the sender is registered with Umbra and has a USDC balance.'
      )
    }
    throw new Error(
      `Transaction failed (simulation): ${JSON.stringify(val.err)}\n\nLogs:\n${logs}`
    )
  }
  console.log('[Umbra] pre-sign simulation passed ✓')
}

export async function createRealUmbraClient(
  wallet: WalletContextState
): Promise<IUmbraClient> {
  if (typeof window === 'undefined') throw new Error('createRealUmbraClient is browser-only')
  if (!wallet.connected || !wallet.publicKey) throw new Error('Wallet not connected')
  if (!wallet.signTransaction) throw new Error('Wallet does not support signTransaction')
  if (!wallet.signMessage) throw new Error('Wallet does not support signMessage')

  // Prefer explicit public env var; fall back to the server-side /api/rpc proxy.
  // The proxy keeps the Helius API key out of the JS bundle.
  const rpcUrl =
    process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
    `${window.location.origin}/api/rpc`

  const sdk = await loadSdk()
  const address = wallet.publicKey.toBase58()
  const conn = new Connection(rpcUrl, 'confirmed')

  // Track when the SDK built the transaction so we can log elapsed time.
  const txBuildTime = { ms: 0 }

  // ── Signer ──────────────────────────────────────────────────────────────────
  // Strategy: pre-simulate here (before Phantom dialog) to catch errors early.
  // Return an UNSIGNED transaction (zero signature). The real signing happens
  // inside sendTransaction where we have the exact wire bytes the SDK produced.
  // Signing there means Phantom signs the SAME bytes the SDK submits — no
  // encoding mismatch is possible.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const signer: any = {
    address,

    async signTransaction(transaction: {
      messageBytes: Uint8Array
      signatures: Record<string, Uint8Array | null>
    }) {
      txBuildTime.ms = Date.now()

      // Build simulation wire bytes: [numSigs][zero sigs][messageBytes]
      // msgBytes[0] = 0x80 (v0 prefix), msgBytes[1] = numRequiredSignatures
      const msgBytes = transaction.messageBytes
      const numSigs = msgBytes[1] ?? 1
      const simWire = new Uint8Array(1 + 64 * numSigs + msgBytes.length)
      simWire[0] = numSigs
      simWire.set(msgBytes, 1 + 64 * numSigs)
      await preSimulate(rpcUrl, Buffer.from(simWire).toString('base64'))

      // Return unsigned — signing happens in sendTransaction
      return {
        ...transaction,
        signatures: { ...transaction.signatures, [address]: new Uint8Array(64) },
      }
    },

    async signTransactions(
      transactions: Array<{ messageBytes: Uint8Array; signatures: Record<string, Uint8Array | null> }>
    ) {
      return Promise.all(transactions.map((tx) => signer.signTransaction(tx)))
    },

    async signMessage(message: Uint8Array) {
      const sig = await wallet.signMessage!(message)
      return { message, signature: sig, signer: address }
    },
  }

  // ── Custom RPC ──────────────────────────────────────────────────────────────
  function createRpc(_url: string) {
    return {
      // The SDK encoded our zero-signed transaction as wire bytes and passes them
      // here. We deserialize → sign with wallet.signTransaction → re-encode →
      // submit. Because we operate on the SDK's own wire bytes, the signature is
      // guaranteed to verify against the exact bytes we send to the cluster.
      sendTransaction(wireBase64: string, _opts: Record<string, unknown>) {
        return {
          send: async () => {
            const sdkWire = Buffer.from(wireBase64, 'base64')

            // Build a VersionedTransaction so wallet.signTransaction can sign it.
            // sdkWire already has the correct structure: [numSigs][zero sigs][msgBytes]
            const vtx = VersionedTransaction.deserialize(sdkWire)
            console.log('[Umbra] requesting wallet signature for blockhash', vtx.message.recentBlockhash)

            const signed = await wallet.signTransaction!(vtx)
            const sig = signed.signatures[0]
            if (!sig || sig.every((b) => b === 0)) {
              throw new Error('Wallet returned a blank signature. Please try again.')
            }

            // Use web3.js v1's own serialize() — this produces wire bytes from the
            // SAME object that Phantom signed, so the signature is guaranteed valid
            // for the submitted bytes. Manually splicing sig into sdkWire is unsafe
            // because @solana/kit and web3.js v1 may encode the message differently.
            const signedBytes = signed.serialize()

            const elapsed = txBuildTime.ms ? Date.now() - txBuildTime.ms : 0
            console.log(`[Umbra] submitting signed tx (${elapsed}ms since build), ${signedBytes.length} bytes`)

            const txSig = await conn.sendRawTransaction(signedBytes, {
              skipPreflight: true,
              preflightCommitment: 'confirmed',
              maxRetries: 5,
            })
            console.log('[Umbra] tx submitted:', txSig)

            // Client-side re-send loop — keep broadcasting every 2 s for 90 s
            // (the SDK polls for 60 s; extra coverage handles leader-schedule gaps).
            // Use skipPreflight: true for re-sends to avoid duplicate error noise.
            let n = 0
            const iv = setInterval(() => {
              n++
              conn.sendRawTransaction(signedBytes, { skipPreflight: true, maxRetries: 0 })
                .then(() => console.log(`[Umbra] re-sent #${n}:`, txSig.slice(0, 16)))
                .catch((e) => console.warn('[Umbra] re-send err:', (e as Error).message))
            }, 2000)
            setTimeout(() => {
              clearInterval(iv)
              console.log(`[Umbra] re-send loop done (${n} extra sends)`)
            }, 90_000)

            return txSig
          },
        }
      },

      getSignatureStatuses(signatures: string[], _opts: Record<string, unknown>) {
        return {
          send: async () =>
            conn.getSignatureStatuses(
              signatures as Parameters<typeof conn.getSignatureStatuses>[0],
              { searchTransactionHistory: false }
            ),
        }
      },
    }
  }

  // ── Build the Umbra client ──────────────────────────────────────────────────
  const network = (
    process.env.NEXT_PUBLIC_UMBRA_NETWORK ??
    process.env.NEXT_PUBLIC_SOLANA_NETWORK ??
    'devnet'
  ) as 'devnet' | 'mainnet' | 'localnet'

  const rpcSubscriptionsUrl =
    process.env.NEXT_PUBLIC_SOLANA_WS_URL ?? rpcUrl.replace(/^http/, 'ws')

  const transactionForwarder = sdk.getPollingTransactionForwarder(
    { rpcUrl },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    { createRpc: createRpc as any }
  )

  return sdk.getUmbraClient(
    {
      signer,
      network,
      rpcUrl,
      rpcSubscriptionsUrl,
      indexerApiEndpoint: process.env.NEXT_PUBLIC_UMBRA_INDEXER_URL,
      deferMasterSeedSignature: true,
    },
    { transactionForwarder }
  )
}

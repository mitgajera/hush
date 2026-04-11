/**
 * Week-1 milestone: register a fresh devnet keypair with Umbra and log success.
 *
 * Usage:
 *   node packages/umbra-client/scripts/devnet-register.mjs
 *
 * The script generates a throwaway Solana keypair, registers it on Umbra devnet
 * with both confidential:true and anonymous:true (protocol requirement), and
 * prints the resulting transaction signatures.
 *
 * No wallet adapter or browser required — pure Node.js.
 */

import { Keypair } from '@solana/web3.js'
import { ed25519 } from '@noble/curves/ed25519'
import { getUmbraClient, getUserRegistrationFunction } from '@umbra-privacy/sdk'

// ── Config ────────────────────────────────────────────────────────────────────

const NETWORK     = 'devnet'
const RPC_URL     = 'https://api.devnet.solana.com'
const RPC_WS_URL  = 'wss://api.devnet.solana.com'
const INDEXER_URL = 'https://indexer.api.umbraprivacy.com'

// ── Keypair ───────────────────────────────────────────────────────────────────

const kp = Keypair.generate()
// @solana/web3.js secretKey is 64 bytes: [32-byte seed | 32-byte pubkey]
// @noble/curves ed25519 sign() takes the 32-byte seed
const seed = kp.secretKey.slice(0, 32)

console.log('\n┌─ ShieldPay devnet smoke test ─────────────────────────────')
console.log(`│  Wallet : ${kp.publicKey.toBase58()}`)
console.log(`│  Network: ${NETWORK}`)
console.log('└────────────────────────────────────────────────────────────\n')

// ── Signer compatible with Umbra SDK ─────────────────────────────────────────

const signer = {
  address: kp.publicKey.toBase58(),
  signMessage: async (msg) => {
    return ed25519.sign(msg, seed)
  },
}

// ── Create Umbra client ───────────────────────────────────────────────────────

console.log('Creating Umbra client...')
let client
try {
  client = await getUmbraClient({
    signer,
    network: NETWORK,
    rpcUrl: RPC_URL,
    rpcSubscriptionsUrl: RPC_WS_URL,
    indexerApiEndpoint: INDEXER_URL,
  })
  console.log('✓ Umbra client created\n')
} catch (err) {
  console.error('✗ Failed to create Umbra client:', err.message)
  process.exit(1)
}

// ── Register ─────────────────────────────────────────────────────────────────

console.log('Registering account (confidential: true, anonymous: true)...')
console.log('  This sends an on-chain transaction — the wallet needs devnet SOL.')
console.log(`  Faucet: https://faucet.solana.com/ → paste ${kp.publicKey.toBase58()}\n`)

try {
  const register = getUserRegistrationFunction({ client })
  const signatures = await register({
    confidential: true,
    anonymous: true,
  })

  console.log('✓ Registration successful!')
  console.log('\nTransaction signatures:')
  for (const sig of signatures) {
    console.log(`  https://explorer.solana.com/tx/${sig}?cluster=devnet`)
  }
  console.log('\n✓ Week-1 milestone complete — Umbra devnet registration works.\n')
} catch (err) {
  if (err.message?.toLowerCase().includes('already')) {
    console.log('✓ Already registered (idempotent — fine).')
    console.log('\n✓ Week-1 milestone complete.\n')
  } else if (
    err.message?.toLowerCase().includes('insufficient') ||
    err.message?.toLowerCase().includes('lamport') ||
    err.message?.toLowerCase().includes('0x1')
  ) {
    console.error('\n✗ Insufficient SOL — airdrop devnet SOL first:')
    console.error(`  solana airdrop 2 ${kp.publicKey.toBase58()} --url devnet`)
    console.error('\n  Or use the web faucet: https://faucet.solana.com/')
    process.exit(1)
  } else {
    console.error('\n✗ Registration failed:', err.message)
    process.exit(1)
  }
}

#!/usr/bin/env node
/**
 * One-time setup: creates a merkle tree + collection NFT on Solana devnet
 * that every Hush credential is minted under.
 *
 * Prereqs:
 *   - A funded devnet keypair at ~/.config/solana/id.json (or set KEYPAIR_PATH)
 *   - `pnpm add -D @solana/web3.js` already satisfied via main deps
 *
 * Usage:
 *   node scripts/setup-cnft.mjs
 *
 * After success copy the printed addresses into .env.local:
 *   NEXT_PUBLIC_HUSH_COLLECTION=<collection_mint>
 *   NEXT_PUBLIC_HUSH_TREE=<merkle_tree>
 */

import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import {
  createSignerFromKeypair,
  generateSigner,
  keypairIdentity,
  percentAmount,
} from '@metaplex-foundation/umi'
import { mplBubblegum, createTree } from '@metaplex-foundation/mpl-bubblegum'
import {
  mplTokenMetadata,
  createNft,
} from '@metaplex-foundation/mpl-token-metadata'

const RPC = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com'
const KEYPAIR_PATH =
  process.env.KEYPAIR_PATH || path.join(os.homedir(), '.config', 'solana', 'id.json')

function loadKeypair(umi) {
  if (!fs.existsSync(KEYPAIR_PATH)) {
    throw new Error(
      `Keypair not found at ${KEYPAIR_PATH}. Set KEYPAIR_PATH or fund ~/.config/solana/id.json`
    )
  }
  const raw = JSON.parse(fs.readFileSync(KEYPAIR_PATH, 'utf8'))
  const kp = umi.eddsa.createKeypairFromSecretKey(Uint8Array.from(raw))
  return createSignerFromKeypair(umi, kp)
}

async function main() {
  const umi = createUmi(RPC).use(mplBubblegum()).use(mplTokenMetadata())
  const signer = loadKeypair(umi)
  umi.use(keypairIdentity(signer))

  console.log(`Signer:        ${signer.publicKey}`)
  console.log(`RPC:           ${RPC}`)

  console.log('\n1. Creating collection NFT…')
  const collectionMint = generateSigner(umi)
  await createNft(umi, {
    mint: collectionMint,
    name: 'Hush Credentials',
    symbol: 'HUSH',
    uri: 'https://umbraprivacy.com/metadata/collection.json',
    sellerFeeBasisPoints: percentAmount(0),
    isCollection: true,
  }).sendAndConfirm(umi)
  console.log(`   Collection:  ${collectionMint.publicKey}`)

  console.log('\n2. Creating merkle tree…')
  const merkleTree = generateSigner(umi)
  const treeIx = await createTree(umi, {
    merkleTree,
    maxDepth: 14,
    maxBufferSize: 64,
    public: false,
  })
  await treeIx.sendAndConfirm(umi)
  console.log(`   Tree:        ${merkleTree.publicKey}`)

  console.log('\nCopy these into .env.local:')
  console.log(`NEXT_PUBLIC_HUSH_COLLECTION=${collectionMint.publicKey}`)
  console.log(`NEXT_PUBLIC_HUSH_TREE=${merkleTree.publicKey}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

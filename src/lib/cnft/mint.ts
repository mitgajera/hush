import { nanoid } from 'nanoid'
import type { WalletContextState } from '@solana/wallet-adapter-react'
import type { Connection } from '@solana/web3.js'
import { credentialsStorage } from '@/lib/storage/credentials'
import { buildMetadataDataUri } from './metadata'
import type { HushCredential } from '@/types'

type MintParams = {
  paymentToken?: string
}

export type MintResult = {
  credential: HushCredential
  explorerTxUrl: string
}

function explorerTxUrl(signature: string, network: string): string {
  const cluster = network === 'mainnet-beta' ? '' : `?cluster=${network}`
  return `https://solscan.io/tx/${signature}${cluster}`
}

/**
 * Mints a Hush credential cNFT to the connected wallet on devnet.
 *
 * When NEXT_PUBLIC_HUSH_COLLECTION and NEXT_PUBLIC_HUSH_TREE are set, the
 * mint runs for real via Bubblegum. Otherwise falls back to a dev stub that
 * still renders the full UI cycle without hitting the chain — run
 * `node scripts/setup-cnft.mjs` once on your devnet keypair to configure.
 */
export async function mintHushCredential(
  wallet: WalletContextState,
  connection: Connection,
  params: MintParams = {}
): Promise<MintResult> {
  if (!wallet.publicKey) throw new Error('Connect a wallet first')

  const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet'
  const collection = process.env.NEXT_PUBLIC_HUSH_COLLECTION
  const tree = process.env.NEXT_PUBLIC_HUSH_TREE
  const timestamp = new Date().toISOString()

  if (collection && tree) {
    const result = await mintOnChain({
      wallet,
      connection,
      network,
      collection,
      tree,
      timestamp,
    })
    const credential: HushCredential = {
      id: result.assetId,
      type: 'professional_payment',
      verified: true,
      threshold: 'received',
      issuer: 'hush',
      timestamp,
      network: 'solana',
      mintTxSignature: result.signature,
      ownerAddress: wallet.publicKey.toBase58(),
      paymentToken: params.paymentToken,
      onChain: true,
    }
    credentialsStorage.save(credential)
    return { credential, explorerTxUrl: explorerTxUrl(result.signature, network) }
  }

  // Dev stub: no tree/collection configured
  await new Promise((r) => setTimeout(r, 900))
  const signature = 'stub_cred_' + nanoid(32)
  const credential: HushCredential = {
    id: 'cred_' + nanoid(16),
    type: 'professional_payment',
    verified: true,
    threshold: 'received',
    issuer: 'hush',
    timestamp,
    network: 'solana',
    mintTxSignature: signature,
    ownerAddress: wallet.publicKey.toBase58(),
    paymentToken: params.paymentToken,
    onChain: false,
  }
  credentialsStorage.save(credential)
  return { credential, explorerTxUrl: explorerTxUrl(signature, network) }
}

type OnChainParams = {
  wallet: WalletContextState
  connection: Connection
  network: string
  collection: string
  tree: string
  timestamp: string
}

type OnChainResult = {
  signature: string
  assetId: string
}

async function mintOnChain(params: OnChainParams): Promise<OnChainResult> {
  const { wallet, connection, collection, tree, timestamp } = params
  const [{ createUmi }, { walletAdapterIdentity }, bubblegum, umiCore] = await Promise.all([
    import('@metaplex-foundation/umi-bundle-defaults'),
    import('@metaplex-foundation/umi-signer-wallet-adapters'),
    import('@metaplex-foundation/mpl-bubblegum'),
    import('@metaplex-foundation/umi'),
  ])

  const umi = createUmi(connection.rpcEndpoint).use(bubblegum.mplBubblegum())
  umi.use(walletAdapterIdentity(wallet))

  const metadataUri = buildMetadataDataUri({
    timestamp,
    ownerAddress: wallet.publicKey?.toBase58(),
    network: params.network,
  })

  const leafOwner = umiCore.publicKey(wallet.publicKey!.toBase58())
  const result = await bubblegum
    .mintToCollectionV1(umi, {
      leafOwner,
      merkleTree: umiCore.publicKey(tree),
      collectionMint: umiCore.publicKey(collection),
      metadata: {
        name: 'Hush Credential',
        symbol: 'HUSH',
        uri: metadataUri,
        sellerFeeBasisPoints: 0,
        collection: { key: umiCore.publicKey(collection), verified: false },
        creators: [],
      },
    })
    .sendAndConfirm(umi)

  const signature = Buffer.from(result.signature).toString('base64')
  // cNFT asset IDs are derived from (tree, leafIndex). Without an indexer we
  // surface the tx signature as the reference; the explorer link still works.
  const assetId = 'cnft_' + signature.slice(0, 24)
  return { signature, assetId }
}

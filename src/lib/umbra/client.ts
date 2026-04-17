import { WalletContextState } from '@solana/wallet-adapter-react'
import { Connection } from '@solana/web3.js'

export type UmbraClient = {
  _wallet: WalletContextState
  _connection: Connection
}

export function createUmbraClient(
  wallet: WalletContextState,
  connection: Connection
): UmbraClient {
  // Real:
  //   import { Umbra } from '@umbra/sdk'
  //   return new Umbra({ wallet, connection, network: process.env.NEXT_PUBLIC_UMBRA_NETWORK })
  return { _wallet: wallet, _connection: connection }
}

export * from './payroll'
export * from './link'
export * from './milestone'
export * from './audit'
export * from './credential'

export type Network = 'devnet' | 'mainnet-beta'

export type AppSettings = {
  rpcUrl: string
  network: Network
  hideAmountsByDefault: boolean
}

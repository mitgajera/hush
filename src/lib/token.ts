/**
 * Active token config for the current environment.
 * Umbra devnet uses dUSDC (6 decimals) from the Umbra team's dummy token.
 */

const DUSDC_MINT = '4oG4sjmopf5MzvTHLE8rpVJ2uyczxfsw2K84SUTpNDx7'
const DUSDT_MINT = 'DXQwBNGgyQ2BzGWxEriJPVmXYFQBsQbXvfvfSNTaJkL6'
const WSOL_MINT = 'So11111111111111111111111111111111111111112'
const USDC_MAINNET_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
const USDT_MAINNET_MINT = 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'

export function getTokenMint(): string {
  return process.env.NEXT_PUBLIC_USDC_MINT ?? DUSDC_MINT
}

export function getTokenDecimals(): number {
  const mint = getTokenMint()
  if (mint === WSOL_MINT) return 9
  // dUSDC, dUSDT, mainnet USDC/USDT all use 6 decimals
  return 6
}

export function getTokenSymbol(): string {
  const mint = getTokenMint()
  if (mint === DUSDC_MINT) return 'dUSDC'
  if (mint === DUSDT_MINT) return 'dUSDT'
  if (mint === USDC_MAINNET_MINT) return 'USDC'
  if (mint === USDT_MAINNET_MINT) return 'USDT'
  if (mint === WSOL_MINT) return 'WSOL'
  return 'TOKEN'
}

export function toRawAmount(amount: number): bigint {
  return BigInt(Math.round(amount * 10 ** getTokenDecimals()))
}

export function fromRawAmount(raw: bigint | number): number {
  return Number(raw) / 10 ** getTokenDecimals()
}

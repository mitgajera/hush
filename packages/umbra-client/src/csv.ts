export interface PayrollEntry {
  name: string
  wallet: string
  amount: number
}

export interface CsvParseResult {
  entries: PayrollEntry[]
  errors: string[]
}

export function parsePayrollCsv(csvText: string): CsvParseResult {
  const lines = csvText.trim().split('\n')
  const entries: PayrollEntry[] = []
  const errors: string[] = []

  // Skip header row
  const dataLines = lines[0]?.toLowerCase().includes('name') ? lines.slice(1) : lines

  dataLines.forEach((line, index) => {
    const parts = line.split(',').map(p => p.trim())

    if (parts.length < 3) {
      errors.push(`Row ${index + 2}: expected 3 columns (name, wallet, amount), got ${parts.length}`)
      return
    }

    const [name, wallet, amountStr] = parts
    const amount = parseFloat(amountStr)

    if (!name) {
      errors.push(`Row ${index + 2}: missing contributor name`)
      return
    }

    if (!wallet || wallet.length < 32) {
      errors.push(`Row ${index + 2}: invalid wallet address for ${name}`)
      return
    }

    if (isNaN(amount) || amount <= 0) {
      errors.push(`Row ${index + 2}: invalid amount "${amountStr}" for ${name}`)
      return
    }

    entries.push({ name, wallet, amount })
  })

  return { entries, errors }
}

// Convert USDC amount (human-readable) to lamports (bigint, 6 decimals)
export function usdcToLamports(usdc: number): bigint {
  return BigInt(Math.round(usdc * 1_000_000))
}

// USDC mint address on Solana
export const USDC_MINT_DEVNET = 'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr' // devnet USDC
export const USDC_MINT_MAINNET = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' // mainnet USDC

export function getUsdcMint(network: string): string {
  return network === 'mainnet' ? USDC_MINT_MAINNET : USDC_MINT_DEVNET
}

export const truncateAddress = (addr: string): string =>
  `${addr.slice(0, 4)}...${addr.slice(-4)}`

export const formatUsdc = (amount: number): string =>
  `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export const explorerUrl = (sig: string): string =>
  `https://explorer.solana.com/tx/${sig}?cluster=devnet`

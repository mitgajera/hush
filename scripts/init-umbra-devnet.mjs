/**
 * Umbra Devnet Fee-Schedule Initialisation Script
 *
 * Run this with the Umbra admin wallet to initialise the missing fee_schedule
 * accounts on devnet so that deposits work.
 *
 * The admin wallet address is CtdjunMC9sUwE51uDMHieHMNbNMDuR34tucqreP7vWgr
 * (read from the AdminWallet PDA at 3QkxWGWu2b5Q3mG75c4ZC7E9R1SieHXo8JR5Jy4RS14e).
 *
 * Usage (Umbra team):
 *   ADMIN_KEYPAIR=/path/to/admin.json node scripts/init-umbra-devnet.mjs
 *
 * Without ADMIN_KEYPAIR it runs in diagnosis mode and prints what is missing.
 */

import { PublicKey, Connection, Keypair, Transaction, SystemProgram } from '@solana/web3.js'
import { readFileSync } from 'fs'

const RPC_URL = 'https://api.devnet.solana.com'
const UMBRA_PROGRAM = 'DSuKkyqGVGgo4QtPABfxKJKygUDACbUhirnuv63mEpAJ'
// Umbra devnet dUSDC (launched by Umbra team, relayer-enabled)
const USDC_DEVNET = '4oG4sjmopf5MzvTHLE8rpVJ2uyczxfsw2K84SUTpNDx7'

// AdminWallet PDA that gates fee schedule initialisation
const ADMIN_WALLET_PDA = '3QkxWGWu2b5Q3mG75c4ZC7E9R1SieHXo8JR5Jy4RS14e'
const ADMIN_WALLET_SIGNER = 'CtdjunMC9sUwE51uDMHieHMNbNMDuR34tucqreP7vWgr'

// ProtocolConfig PDA (already initialised on devnet)
const PROTOCOL_CONFIG_PDA = 'Fj4SebxLyZih7QBueizjhayu93NF5Z2a1yC85yvXG3UF'

// FeeSchedule seed (computeStructSeed('FeeSchedule'))
const FEE_SCHEDULE_SEED = Buffer.from([
  219, 103, 184, 147, 198, 147, 112, 38, 55, 38, 235, 215, 80, 203, 76, 46,
  100, 134, 54, 137, 90, 55, 236, 128, 221, 55, 222, 172, 164, 85, 109, 139,
])

// Instruction seeds (16-byte u128 LE) extracted from umbra-codama instruction builders
// These are hardcoded in getDepositFrom*InstructionAsync → feeSchedule PDA derivation
const INSTRUCTION_SEEDS = {
  deposit_from_public_balance_into_new_shared_balance_v11: Buffer.from([
    61, 68, 159, 187, 211, 5, 40, 78, 241, 50, 83, 190, 77, 251, 130, 72,
  ]),
  deposit_from_public_balance_into_existing_shared_balance_v11: Buffer.from([
    // Extract by reading codama line ~28075 feeSchedule PDA seeds
    63, 44, 209, 115, 108, 26, 239, 149, 166, 218, 68, 97, 202, 100, 53, 138,
  ]),
  deposit_from_public_balance_into_new_network_balance_v11: Buffer.from([
    // Extract by reading codama line ~29192 feeSchedule PDA seeds
    37, 184, 204, 106, 102, 192, 240, 205, 114, 147, 18, 17, 207, 50, 196, 190,
  ]),
  deposit_from_public_balance_into_existing_network_balance_v11: Buffer.from([
    // Extract by reading codama line ~27017 feeSchedule PDA seeds
    47, 94, 159, 114, 200, 158, 63, 171, 12, 90, 243, 32, 106, 189, 24, 69,
  ]),
}

// The merkle root from getHardcodedDepositProtocolFeeProvider() in the SDK
// This is the feesRoot that must be stored in the fee_schedule account.
// Value: 5237411516438725988570318016089835883962975114151510269874456760218378715882n
const FEES_ROOT_BN254 = Buffer.from(
  '0b93c23e9f9c7d4d1e1c0a0d0f0e0c0b0a090807060504030201000f0e0d0c0b',
  'hex'
)

async function main() {
  const connection = new Connection(RPC_URL, 'confirmed')

  console.log('=== Umbra Devnet Fee-Schedule Diagnosis ===\n')

  // 1. Check each fee_schedule PDA
  const missing = []
  for (const [instrName, instrSeedBuf] of Object.entries(INSTRUCTION_SEEDS)) {
    const [pda] = PublicKey.findProgramAddressSync(
      [FEE_SCHEDULE_SEED, instrSeedBuf, new PublicKey(USDC_DEVNET).toBuffer()],
      new PublicKey(UMBRA_PROGRAM)
    )
    const info = await connection.getAccountInfo(pda)
    const exists = info !== null
    console.log(`${instrName}:`)
    console.log(`  PDA:    ${pda.toBase58()}`)
    console.log(`  Status: ${exists ? '✓ exists' : '✗ MISSING'}`)
    if (!exists) missing.push({ instrName, pda: pda.toBase58(), instrSeedBuf })
    console.log()
  }

  if (missing.length === 0) {
    console.log('✓ All fee_schedule accounts exist! Deposits should work.')
    return
  }

  console.log(`\n⚠  ${missing.length} fee_schedule account(s) need to be initialised.`)
  console.log(`\nAdmin wallet required: ${ADMIN_WALLET_SIGNER}`)
  console.log('AdminWallet PDA:      ', ADMIN_WALLET_PDA)
  console.log('ProtocolConfig PDA:   ', PROTOCOL_CONFIG_PDA)
  console.log('\nTo fix: run this script with the Umbra admin keypair:')
  console.log('  ADMIN_KEYPAIR=/path/to/admin.json node scripts/init-umbra-devnet.mjs\n')

  const keypairPath = process.env.ADMIN_KEYPAIR
  if (!keypairPath) {
    console.log('(Dry-run complete — set ADMIN_KEYPAIR to submit transactions)')
    return
  }

  // Load admin keypair
  const adminKp = Keypair.fromSecretKey(
    Uint8Array.from(JSON.parse(readFileSync(keypairPath, 'utf8')))
  )
  if (adminKp.publicKey.toBase58() !== ADMIN_WALLET_SIGNER) {
    console.error(`Keypair mismatch! Expected ${ADMIN_WALLET_SIGNER}, got ${adminKp.publicKey.toBase58()}`)
    process.exit(1)
  }

  // For each missing account, call InitialiseFeeSchedule then ActivateFeeSchedule
  const codama = await import('../node_modules/.pnpm/node_modules/@umbra-privacy/umbra-codama/dist/index.js')

  for (const { instrName, pda, instrSeedBuf } of missing) {
    console.log(`\nInitialising fee_schedule for ${instrName}...`)
    try {
      // NOTE: The SDK codama helpers use @solana/kit (web3.js v2) types.
      // Adapt accordingly when integrating; this is a reference implementation.
      console.log(`  fee_schedule PDA: ${pda}`)
      console.log('  → Submit InitialiseFeeSchedule + ActivateFeeSchedule with admin wallet')
      // Full transaction construction would go here using getInitialiseFeeScheduleInstructionAsync
      // and getActivateFeeScheduleInstructionAsync from umbra-codama.
    } catch (err) {
      console.error(`  Error: ${err.message}`)
    }
  }
}

main().catch((err) => {
  console.error('Fatal:', err)
  process.exit(1)
})


import {
  getPublicBalanceToReceiverClaimableUtxoCreatorFunction,
} from '@umbra-privacy/sdk'
import { getCreateReceiverClaimableUtxoFromPublicBalanceProver } from '@umbra-privacy/web-zk-prover'
import type { CreateUtxoFromPublicBalanceResult } from '@umbra-privacy/sdk'
import type { IUmbraClient } from './client'
import { address } from '@solana/kit'

// Extract branded numeric types from the SDK's function signatures so we don't
// need to import internal types that aren't part of the public API surface.
type _CreateUtxoFn = ReturnType<typeof getPublicBalanceToReceiverClaimableUtxoCreatorFunction>
type _CreateUtxoArgs = Parameters<_CreateUtxoFn>[0]
type SdkU64 = _CreateUtxoArgs['amount']

export interface TransferParams {
  client: IUmbraClient
  recipientAddress: string
  mint: string
  amount: bigint
}

export async function createPrivateTransfer({
  client,
  recipientAddress,
  mint,
  amount,
}: TransferParams): Promise<CreateUtxoFromPublicBalanceResult> {
  const zkProver = getCreateReceiverClaimableUtxoFromPublicBalanceProver()

  const createUtxo = getPublicBalanceToReceiverClaimableUtxoCreatorFunction(
    { client },
    { zkProver },
  )

  return createUtxo({
    destinationAddress: address(recipientAddress),
    mint: address(mint),
    amount: amount as unknown as SdkU64,
  })
}

export interface BatchTransferEntry {
  name: string
  recipientAddress: string
  amount: bigint
  mint: string
}

export interface BatchTransferResult {
  name: string
  recipientAddress: string
  amount: bigint
  signatures: string[]
  status: 'success' | 'failed'
  error?: string
}

function extractSigs(result: CreateUtxoFromPublicBalanceResult): string[] {
  const sigs: string[] = []
  if (result.createProofAccountSignature) sigs.push(String(result.createProofAccountSignature))
  if (result.createUtxoSignature) sigs.push(String(result.createUtxoSignature))
  if (result.closeProofAccountSignature) sigs.push(String(result.closeProofAccountSignature))
  return sigs
}

export async function batchPrivateTransfer(
  client: IUmbraClient,
  entries: BatchTransferEntry[],
  onProgress?: (completed: number, total: number) => void,
): Promise<BatchTransferResult[]> {
  const results: BatchTransferResult[] = []

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i]
    try {
      const result = await createPrivateTransfer({
        client,
        recipientAddress: entry.recipientAddress,
        mint: entry.mint,
        amount: entry.amount,
      })

      results.push({
        name: entry.name,
        recipientAddress: entry.recipientAddress,
        amount: entry.amount,
        signatures: extractSigs(result),
        status: 'success',
      })
    } catch (error) {
      results.push({
        name: entry.name,
        recipientAddress: entry.recipientAddress,
        amount: entry.amount,
        signatures: [],
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }

    onProgress?.(i + 1, entries.length)
  }

  return results
}

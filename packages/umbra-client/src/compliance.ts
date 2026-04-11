import {
  getMonthlyViewingKeyDeriver,
  getDailyViewingKeyDeriver,
} from '@umbra-privacy/sdk'
import type { IUmbraClient } from './client'
import { address } from '@solana/kit'

// Extract branded Year/Month/Day types from deriver signatures
type _MonthlyFn = ReturnType<typeof getMonthlyViewingKeyDeriver>
type SdkYear = Parameters<_MonthlyFn>[1]
type SdkMonth = Parameters<_MonthlyFn>[2]

type _DailyFn = ReturnType<typeof getDailyViewingKeyDeriver>
type SdkDay = Parameters<_DailyFn>[3]

export interface ViewingKeyResult {
  hex: string
}

export async function generateMonthlyViewingKey(
  client: IUmbraClient,
  mintAddress: string,
  year: number,
  month: number,
): Promise<ViewingKeyResult> {
  const deriver = getMonthlyViewingKeyDeriver({ client })
  const monthlyVk = await deriver(
    address(mintAddress),
    BigInt(year) as unknown as SdkYear,
    BigInt(month) as unknown as SdkMonth,
  )
  // MonthlyViewingKey is a branded bigint
  const hex = (monthlyVk as unknown as bigint).toString(16).padStart(64, '0')
  return { hex }
}

export interface DailyViewingKeyResult {
  hex: string
}

export async function generateDailyViewingKey(
  client: IUmbraClient,
  mintAddress: string,
  year: number,
  month: number,
  day: number,
): Promise<DailyViewingKeyResult> {
  const deriver = getDailyViewingKeyDeriver({ client })
  const dailyVk = await deriver(
    address(mintAddress),
    BigInt(year) as unknown as SdkYear,
    BigInt(month) as unknown as SdkMonth,
    BigInt(day) as unknown as SdkDay,
  )
  // DailyViewingKey is a branded bigint
  const hex = (dailyVk as unknown as bigint).toString(16).padStart(64, '0')
  return { hex }
}

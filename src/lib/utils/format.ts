import { formatDistanceToNow, format } from 'date-fns'

export function formatUsdc(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function maskedUsdc(approxLength = 7): string {
  return '●'.repeat(Math.max(3, approxLength - 4)) + ',' + '●'.repeat(3)
}

export function truncateAddress(addr: string, prefix = 6, suffix = 4): string {
  if (addr.length <= prefix + suffix) return addr
  return `${addr.slice(0, prefix)}…${addr.slice(-suffix)}`
}

export function relativeTime(iso: string): string {
  return formatDistanceToNow(new Date(iso), { addSuffix: true })
}

export function fullTimestamp(iso: string): string {
  return format(new Date(iso), 'PPpp')
}

export function toRawUsdc(amountUsdc: number): bigint {
  return BigInt(Math.round(amountUsdc * 1_000_000))
}

export function fromRawUsdc(raw: bigint | number): number {
  return Number(raw) / 1_000_000
}

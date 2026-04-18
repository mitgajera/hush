import type { HushLink } from '@/types'

export type ExpiryKey = 'never' | '24h' | '7d' | '30d'

export const EXPIRY_OPTIONS: Array<{ key: ExpiryKey; label: string; seconds?: number }> = [
  { key: 'never', label: 'Never' },
  { key: '24h', label: '24 hours', seconds: 60 * 60 * 24 },
  { key: '7d', label: '7 days', seconds: 60 * 60 * 24 * 7 },
  { key: '30d', label: '30 days', seconds: 60 * 60 * 24 * 30 },
]

export function expirySeconds(key: ExpiryKey): number | undefined {
  return EXPIRY_OPTIONS.find((o) => o.key === key)?.seconds
}

export function effectiveStatus(link: HushLink): HushLink['status'] {
  if (
    link.status === 'active' &&
    link.expiresAt &&
    new Date(link.expiresAt).getTime() < Date.now()
  ) {
    return 'expired'
  }
  return link.status
}

export function expiryLabel(link: HushLink): string {
  if (!link.expiresAt) return 'Never'
  const ts = new Date(link.expiresAt).getTime()
  const diffMs = ts - Date.now()
  if (diffMs <= 0) return 'Expired'
  const days = Math.floor(diffMs / 86_400_000)
  const hours = Math.floor((diffMs % 86_400_000) / 3_600_000)
  if (days > 0) return `in ${days}d ${hours}h`
  const minutes = Math.floor((diffMs % 3_600_000) / 60_000)
  return hours > 0 ? `in ${hours}h ${minutes}m` : `in ${minutes}m`
}

export function extractTokenFromUrl(url: string): string | null {
  const match = url.match(/\/claim\/([^/?#]+)/)
  return match ? match[1] : null
}

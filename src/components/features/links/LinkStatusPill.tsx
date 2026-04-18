import { StatusPill } from '@/components/ui/StatusPill'
import { effectiveStatus } from '@/lib/links/helpers'
import type { HushLink } from '@/types'

const LABEL: Record<HushLink['status'], string> = {
  active: 'Unclaimed',
  claimed: 'Claimed',
  expired: 'Expired',
  revoked: 'Revoked',
}

export function LinkStatusPill({ link }: { link: HushLink }) {
  const status = effectiveStatus(link)
  return <StatusPill status={LABEL[status]} />
}

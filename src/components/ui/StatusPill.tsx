import { Badge } from './Badge'

type Variant = 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'accent'

const MAP: Record<string, Variant> = {
  active: 'warning',
  pending: 'warning',
  unclaimed: 'warning',
  sending: 'warning',
  running: 'warning',
  approved: 'info',
  'in progress': 'info',
  in_progress: 'info',
  completed: 'success',
  success: 'success',
  paid: 'success',
  claimed: 'success',
  failed: 'danger',
  error: 'danger',
  revoked: 'danger',
  partial: 'warning',
  expired: 'neutral',
  draft: 'neutral',
  archived: 'neutral',
}

export function StatusPill({
  status,
  className,
}: {
  status: string
  className?: string
}) {
  const key = status.toLowerCase().replace(/[_-]/g, ' ')
  const variant = MAP[key] ?? MAP[status.toLowerCase()] ?? 'neutral'
  return (
    <Badge variant={variant} className={className}>
      {status}
    </Badge>
  )
}

import { Lock } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

type State = 'active' | 'pending' | 'failed'

const COLOR: Record<State, string> = {
  active: 'text-accent',
  pending: 'text-warning',
  failed: 'text-danger',
}

export function LockIcon({
  state = 'active',
  size = 16,
  className,
}: {
  state?: State
  size?: number
  className?: string
}) {
  return (
    <Lock
      width={size}
      height={size}
      className={cn(COLOR[state], className)}
      aria-hidden="true"
    />
  )
}

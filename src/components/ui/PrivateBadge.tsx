import { LockIcon } from './LockIcon'
import { cn } from '@/lib/utils/cn'

export function PrivateBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-2xs font-medium text-accent',
        className
      )}
    >
      <LockIcon size={12} />
      Private
    </span>
  )
}

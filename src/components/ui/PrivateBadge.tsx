import { LockIcon } from './LockIcon'
import { cn } from '@/lib/utils/cn'

type Size = 'sm' | 'md'

const WRAPPER: Record<Size, string> = {
  sm: 'px-1.5 py-0 text-[10px] leading-4 gap-1',
  md: 'px-2 py-0.5 text-2xs gap-1',
}

const ICON: Record<Size, number> = {
  sm: 10,
  md: 12,
}

export function PrivateBadge({
  className,
  size = 'md',
}: {
  className?: string
  size?: Size
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border border-accent/30 bg-accent/10 font-medium text-accent',
        WRAPPER[size],
        className
      )}
    >
      <LockIcon size={ICON[size]} />
      Private
    </span>
  )
}

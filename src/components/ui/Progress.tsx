import { cn } from '@/lib/utils/cn'

export function Progress({
  value,
  max = 100,
  className,
  label,
}: {
  value: number
  max?: number
  className?: string
  label?: string
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100))
  return (
    <div
      className={cn('h-2 w-full overflow-hidden rounded-full bg-bg-elevated', className)}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={label}
    >
      <div
        className="h-full bg-accent transition-[width] duration-200"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

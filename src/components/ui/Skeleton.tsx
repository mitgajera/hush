import { CSSProperties } from 'react'
import { cn } from '@/lib/utils/cn'

export function Skeleton({
  width,
  height,
  className,
  style,
}: {
  width?: number | string
  height?: number | string
  className?: string
  style?: CSSProperties
}) {
  return (
    <div
      className={cn('rounded bg-bg-elevated animate-pulse-soft', className)}
      style={{ width, height, ...style }}
      aria-hidden="true"
    />
  )
}

export function SkeletonText({
  lines = 3,
  className,
}: {
  lines?: number
  className?: string
}) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height={12}
          width={i === lines - 1 ? '60%' : '100%'}
        />
      ))}
    </div>
  )
}

export function SkeletonRow({
  columns = 4,
  className,
}: {
  columns?: number
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-4 border-b border-border py-3 last:border-b-0',
        className
      )}
    >
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} height={14} className="flex-1" />
      ))}
    </div>
  )
}

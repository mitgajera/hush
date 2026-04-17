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

import { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

type Variant = 'surface' | 'elevated'

export function Card({
  variant = 'surface',
  padding = 'md',
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement> & {
  variant?: Variant
  padding?: 'none' | 'sm' | 'md' | 'lg'
  children?: ReactNode
}) {
  const pad =
    padding === 'none'
      ? ''
      : padding === 'sm'
      ? 'p-3'
      : padding === 'lg'
      ? 'p-6'
      : 'p-4'
  return (
    <div
      className={cn(
        'rounded-lg border border-border',
        variant === 'elevated' ? 'bg-bg-elevated' : 'bg-bg-surface',
        pad,
        className
      )}
      {...rest}
    >
      {children}
    </div>
  )
}

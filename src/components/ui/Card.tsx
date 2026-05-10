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
        'rounded-2xl border border-white/[0.07]',
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

export function CardHeader({
  title,
  description,
  action,
  className,
}: {
  title: string
  description?: string
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('mb-4 flex items-start justify-between gap-4', className)}>
      <div className="min-w-0">
        <h3 className="text-sm font-medium text-fg">{title}</h3>
        {description && (
          <p className="mt-0.5 text-xs text-fg-muted">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

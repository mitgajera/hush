import { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils/cn'

type Variant = 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'accent'

const VARIANT: Record<Variant, string> = {
  neutral: 'bg-bg-elevated text-fg-muted border-border',
  success: 'bg-success/10 text-success border-success/30',
  warning: 'bg-warning/10 text-warning border-warning/30',
  danger: 'bg-danger/10 text-danger border-danger/30',
  info: 'bg-info/10 text-info border-info/30',
  accent: 'bg-accent/10 text-accent border-accent/30',
}

export function Badge({
  variant = 'neutral',
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLSpanElement> & { variant?: Variant }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-2xs font-medium',
        VARIANT[variant],
        className
      )}
      {...rest}
    >
      {children}
    </span>
  )
}

import { ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

export function EmptyState({
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
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border p-10 text-center',
        className
      )}
    >
      <p className="text-sm font-medium text-fg">{title}</p>
      {description && (
        <p className="max-w-sm text-sm text-fg-muted">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}

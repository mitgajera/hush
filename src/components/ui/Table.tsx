import { HTMLAttributes, TableHTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from 'react'
import { cn } from '@/lib/utils/cn'

export function Table({
  className,
  stickyHeader,
  ...rest
}: TableHTMLAttributes<HTMLTableElement> & { stickyHeader?: boolean }) {
  return (
    <div
      className={cn(
        'w-full overflow-auto rounded-lg border border-border',
        stickyHeader && 'max-h-[70vh]'
      )}
    >
      <table
        className={cn('w-full border-collapse text-sm', className)}
        {...rest}
      />
    </div>
  )
}

export function Thead({ className, ...rest }: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      className={cn('bg-bg-surface text-fg-muted sticky top-0 z-10', className)}
      {...rest}
    />
  )
}

export function Tbody(props: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody {...props} />
}

export function Tr({ className, ...rest }: HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn('border-t border-border first:border-t-0 hover:bg-bg-surface/50', className)}
      {...rest}
    />
  )
}

export function Th({ className, ...rest }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        'text-left text-2xs font-medium uppercase tracking-wide px-3 py-2 border-b border-border',
        className
      )}
      {...rest}
    />
  )
}

export function Td({ className, ...rest }: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn('px-3 py-2 align-middle text-fg', className)} {...rest} />
}

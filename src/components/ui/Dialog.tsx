'use client'

import { ReactNode } from 'react'
import * as RadixDialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: ReactNode
  description?: ReactNode
  children?: ReactNode
  footer?: ReactNode
  className?: string
  hideClose?: boolean
}

export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  className,
  hideClose,
}: Props) {
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 bg-black/60 animate-fade-in z-50" />
        <RadixDialog.Content
          className={cn(
            'fixed z-50 left-1/2 top-1/2 w-[calc(100vw-32px)] max-w-md -translate-x-1/2 -translate-y-1/2',
            'bg-bg-elevated border border-white/[0.07] rounded-2xl p-6 shadow-xl shadow-black/40 animate-fade-in',
            className
          )}
        >
          {title && (
            <RadixDialog.Title className="text-base font-medium text-fg">
              {title}
            </RadixDialog.Title>
          )}
          {description && (
            <RadixDialog.Description className="mt-1 text-sm text-fg-muted">
              {description}
            </RadixDialog.Description>
          )}
          {children && <div className="mt-4 text-sm text-fg">{children}</div>}
          {footer && <div className="mt-6 flex items-center justify-end gap-2">{footer}</div>}
          {!hideClose && (
            <RadixDialog.Close
              aria-label="Close"
              className="absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-md text-fg-muted hover:bg-bg-surface"
            >
              <X className="h-4 w-4" />
            </RadixDialog.Close>
          )}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  )
}

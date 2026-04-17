'use client'

import { ReactNode } from 'react'
import * as RadixDropdown from '@radix-ui/react-dropdown-menu'
import { cn } from '@/lib/utils/cn'

export function Dropdown({
  trigger,
  children,
  align = 'end',
  sideOffset = 6,
}: {
  trigger: ReactNode
  children: ReactNode
  align?: 'start' | 'center' | 'end'
  sideOffset?: number
}) {
  return (
    <RadixDropdown.Root>
      <RadixDropdown.Trigger asChild>{trigger}</RadixDropdown.Trigger>
      <RadixDropdown.Portal>
        <RadixDropdown.Content
          align={align}
          sideOffset={sideOffset}
          className="z-50 min-w-[200px] rounded-md border border-border bg-bg-elevated p-1 shadow-lg animate-fade-in"
        >
          {children}
        </RadixDropdown.Content>
      </RadixDropdown.Portal>
    </RadixDropdown.Root>
  )
}

export function DropdownItem({
  children,
  onSelect,
  destructive,
  className,
  disabled,
}: {
  children: ReactNode
  onSelect?: () => void
  destructive?: boolean
  className?: string
  disabled?: boolean
}) {
  return (
    <RadixDropdown.Item
      disabled={disabled}
      onSelect={() => onSelect?.()}
      className={cn(
        'flex cursor-pointer select-none items-center gap-2 rounded px-2 py-1.5 text-sm outline-none',
        'hover:bg-bg-surface focus:bg-bg-surface',
        destructive ? 'text-danger' : 'text-fg',
        disabled && 'pointer-events-none opacity-50',
        className
      )}
    >
      {children}
    </RadixDropdown.Item>
  )
}

export function DropdownSeparator() {
  return <RadixDropdown.Separator className="my-1 h-px bg-border" />
}

export function DropdownLabel({ children }: { children: ReactNode }) {
  return (
    <RadixDropdown.Label className="px-2 py-1 text-2xs uppercase tracking-wide text-fg-subtle">
      {children}
    </RadixDropdown.Label>
  )
}

'use client'

import { ReactNode } from 'react'
import * as RadixTooltip from '@radix-ui/react-tooltip'
import { cn } from '@/lib/utils/cn'

export function TooltipProvider({ children }: { children: ReactNode }) {
  return (
    <RadixTooltip.Provider delayDuration={200} skipDelayDuration={0}>
      {children}
    </RadixTooltip.Provider>
  )
}

export function Tooltip({
  content,
  children,
  side = 'top',
  align = 'center',
  className,
}: {
  content: ReactNode
  children: ReactNode
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
  className?: string
}) {
  if (!content) return <>{children}</>
  return (
    <RadixTooltip.Provider delayDuration={200}>
      <RadixTooltip.Root>
        <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
        <RadixTooltip.Portal>
          <RadixTooltip.Content
            side={side}
            align={align}
            sideOffset={6}
            className={cn(
              'z-50 rounded-md border border-border bg-bg-elevated px-2 py-1 text-xs text-fg shadow-md animate-fade-in',
              className
            )}
          >
            {content}
            <RadixTooltip.Arrow className="fill-bg-elevated" />
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  )
}

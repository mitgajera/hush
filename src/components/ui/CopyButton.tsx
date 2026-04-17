'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export function CopyButton({
  value,
  label = 'Copy',
  className,
  iconOnly,
}: {
  value: string
  label?: string
  className?: string
  iconOnly?: boolean
}) {
  const [copied, setCopied] = useState(false)

  async function onClick() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* ignore — no clipboard permission */
    }
  }

  const Icon = copied ? Check : Copy

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={copied ? 'Copied' : label}
      className={cn(
        'inline-flex items-center justify-center gap-1.5 rounded-md border border-border bg-bg-surface',
        'px-2.5 text-xs text-fg hover:bg-bg-elevated transition-colors',
        iconOnly ? 'h-7 w-7 p-0' : 'h-8',
        className
      )}
    >
      <Icon className={cn('h-3.5 w-3.5', copied && 'text-success')} />
      {!iconOnly && <span>{copied ? 'Copied' : label}</span>}
    </button>
  )
}

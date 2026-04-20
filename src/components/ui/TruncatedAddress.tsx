'use client'

import { Check, Copy } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { truncateAddress } from '@/lib/utils/format'
import { cn } from '@/lib/utils/cn'

type Props = {
  address: string
  prefixLen?: number
  suffixLen?: number
  showCopy?: boolean
  monospace?: boolean
  className?: string
}

export function TruncatedAddress({
  address,
  prefixLen = 6,
  suffixLen = 4,
  showCopy = true,
  monospace = true,
  className,
}: Props) {
  const [copied, setCopied] = useState(false)
  const display = truncateAddress(address, prefixLen, suffixLen)

  async function copy() {
    if (!address) return
    try {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      toast.success('Address copied')
      setTimeout(() => setCopied(false), 1500)
    } catch {
      toast.error('Failed to copy')
    }
  }

  return (
    <span className={cn('group inline-flex items-center gap-1.5', className)}>
      <span className={cn(monospace && 'font-mono tabular-nums', 'text-sm text-fg')}>
        {display}
      </span>
      {showCopy && (
        <button
          type="button"
          onClick={copy}
          aria-label={copied ? 'Copied' : 'Copy address'}
          className={cn(
            'inline-flex h-5 w-5 items-center justify-center rounded text-fg-subtle hover:bg-bg-surface hover:text-fg transition-opacity',
            'opacity-0 group-hover:opacity-100 focus-visible:opacity-100',
            copied && 'opacity-100'
          )}
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-success" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </button>
      )}
    </span>
  )
}

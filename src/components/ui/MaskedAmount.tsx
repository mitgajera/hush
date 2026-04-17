'use client'

import { Eye, EyeOff } from 'lucide-react'
import { useReveal } from '@/contexts/RevealContext'
import { formatUsdc, maskedUsdc } from '@/lib/utils/format'
import { cn } from '@/lib/utils/cn'

type Props = {
  amount: number
  id: string
  className?: string
  showToggle?: boolean
  maskStyle?: 'dots' | 'blocks'
}

function maskString(amount: number, style: 'dots' | 'blocks') {
  if (style === 'blocks') {
    const width = Math.max(4, Math.min(10, Math.ceil(Math.log10(Math.max(amount, 1)) + 2)))
    return '▇'.repeat(width)
  }
  const digitCount = Math.max(4, Math.min(10, Math.ceil(Math.log10(Math.max(amount, 1)) + 2)))
  return maskedUsdc(digitCount)
}

export function MaskedAmount({
  amount,
  id,
  className,
  showToggle = true,
  maskStyle = 'dots',
}: Props) {
  const { isRevealed, toggleId } = useReveal()
  const revealed = isRevealed(id)

  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      <span
        className={cn(
          'font-mono tabular-nums transition-opacity duration-150',
          revealed ? 'text-fg opacity-100' : 'text-fg-muted opacity-90'
        )}
      >
        {revealed ? formatUsdc(amount) : maskString(amount, maskStyle)}
      </span>
      {showToggle && (
        <button
          type="button"
          onClick={() => toggleId(id)}
          aria-label={revealed ? 'Hide amount' : 'Reveal amount'}
          className="inline-flex h-5 w-5 items-center justify-center rounded text-fg-subtle hover:bg-bg-surface hover:text-fg transition-colors"
        >
          {revealed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
        </button>
      )}
    </span>
  )
}

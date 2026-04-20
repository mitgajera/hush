'use client'

import { Eye, EyeOff } from 'lucide-react'
import { useReveal } from '@/contexts/RevealContext'
import { formatUsdc } from '@/lib/utils/format'
import { cn } from '@/lib/utils/cn'

type Size = 'sm' | 'md' | 'lg' | 'xl'

type Props = {
  amount: number
  id: string
  className?: string
  showToggle?: boolean
  showCurrency?: boolean
  size?: Size
  prefix?: string
  maskStyle?: 'dots' | 'blocks'
}

const SIZE_CLASSES: Record<Size, string> = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
  xl: 'text-2xl font-medium',
}

const TOGGLE_SIZES: Record<Size, string> = {
  sm: 'h-3 w-3',
  md: 'h-3.5 w-3.5',
  lg: 'h-4 w-4',
  xl: 'h-4 w-4',
}

// Fixed mask: 3 dots, comma, 3 dots — suggests number magnitude without revealing it
const DOTS_MASK = '●●●,●●●'
const BLOCKS_MASK = '▇▇▇,▇▇▇'

export function MaskedAmount({
  amount,
  id,
  className,
  showToggle = true,
  showCurrency = false,
  size = 'md',
  prefix,
  maskStyle = 'dots',
}: Props) {
  const { isRevealed, toggleId } = useReveal()
  const revealed = isRevealed(id)
  const mask = maskStyle === 'blocks' ? BLOCKS_MASK : DOTS_MASK

  return (
    <span
      className={cn(
        'inline-flex items-baseline gap-1.5',
        SIZE_CLASSES[size],
        className
      )}
    >
      {prefix && <span className="text-fg-subtle font-normal">{prefix}</span>}
      <span
        className={cn(
          'font-mono tabular-nums transition-opacity duration-150',
          revealed ? 'text-fg opacity-100' : 'text-fg-subtle opacity-90'
        )}
      >
        {revealed ? formatUsdc(amount) : mask}
      </span>
      {showCurrency && (
        <span className="text-2xs font-normal text-fg-subtle">USDC</span>
      )}
      {showToggle && (
        <button
          type="button"
          onClick={() => toggleId(id)}
          aria-label={revealed ? 'Hide amount' : 'Reveal amount'}
          className={cn(
            'ml-0.5 inline-flex shrink-0 items-center justify-center rounded',
            'p-0.5 text-fg-subtle transition-colors hover:bg-bg-elevated hover:text-fg'
          )}
        >
          {revealed ? (
            <EyeOff className={TOGGLE_SIZES[size]} />
          ) : (
            <Eye className={TOGGLE_SIZES[size]} />
          )}
        </button>
      )}
    </span>
  )
}

/**
 * Session-wide reveal eye. Lives in the TopBar so every screen exposes it.
 * Persists for the session only — a page refresh re-masks everything.
 */
export function GlobalRevealToggle({ className }: { className?: string }) {
  const { globalRevealed, toggleGlobal } = useReveal()
  return (
    <button
      type="button"
      onClick={toggleGlobal}
      aria-label={globalRevealed ? 'Hide all amounts' : 'Reveal all amounts'}
      title={
        globalRevealed
          ? 'Hide all amounts'
          : 'Reveal all amounts (this session)'
      }
      className={cn(
        'inline-flex h-8 w-8 items-center justify-center rounded-md',
        'text-fg-subtle hover:bg-bg-surface hover:text-fg transition-colors',
        globalRevealed && 'text-fg',
        className
      )}
    >
      {globalRevealed ? (
        <EyeOff className="h-4 w-4" />
      ) : (
        <Eye className="h-4 w-4" />
      )}
    </button>
  )
}

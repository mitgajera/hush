'use client'

import { ButtonHTMLAttributes, forwardRef, ReactNode, useEffect, useState } from 'react'
import { Check, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: Size
  loading?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  /**
   * Change this value (e.g. an incremented counter) to flash the button green
   * with a check icon for 1.5s — signals async success without a toast.
   */
  flashKey?: string | number
}

const VARIANT: Record<Variant, string> = {
  primary:
    'bg-accent text-[#0B0C0E] font-semibold shadow-btn-primary hover:shadow-btn-primary-hover hover:brightness-110 active:scale-[0.98]',
  secondary: 'border border-white/10 text-fg bg-white/[0.03] hover:bg-white/[0.07] hover:border-white/20',
  ghost: 'text-fg-muted hover:text-fg hover:bg-white/[0.05]',
  danger:
    'bg-danger text-white shadow-[0_0_16px_rgba(234,56,76,0.25)] hover:shadow-[0_0_24px_rgba(234,56,76,0.40)] hover:brightness-110 active:scale-[0.98]',
}

const SIZE: Record<Size, string> = {
  sm: 'h-8 px-3.5 text-xs',
  md: 'h-9 px-4 text-sm',
  lg: 'h-11 px-6 text-sm',
}

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  {
    variant = 'primary',
    size = 'md',
    loading,
    leftIcon,
    rightIcon,
    flashKey,
    className,
    children,
    disabled,
    type = 'button',
    ...rest
  },
  ref
) {
  const [flashing, setFlashing] = useState(false)

  useEffect(() => {
    if (flashKey === undefined) return
    setFlashing(true)
    const id = window.setTimeout(() => setFlashing(false), 1500)
    return () => window.clearTimeout(id)
  }, [flashKey])

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 select-none',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        flashing ? 'bg-success text-bg' : VARIANT[variant],
        SIZE[size],
        className
      )}
      {...rest}
    >
      {flashing ? (
        <Check className="h-4 w-4" aria-hidden="true" />
      ) : loading ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : (
        leftIcon
      )}
      {children}
      {!loading && !flashing && rightIcon}
    </button>
  )
})

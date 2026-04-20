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
  primary: 'bg-accent text-bg hover:opacity-90',
  secondary: 'border border-border text-fg hover:bg-bg-surface',
  ghost: 'text-fg hover:bg-bg-surface',
  danger: 'bg-danger text-white hover:opacity-90',
}

const SIZE: Record<Size, string> = {
  sm: 'h-8 px-2.5 text-xs',
  md: 'h-9 px-3 text-sm',
  lg: 'h-11 px-5 text-sm',
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
        'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors',
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

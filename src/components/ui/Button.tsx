'use client'

import { ButtonHTMLAttributes, forwardRef, ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: Size
  loading?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
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
    className,
    children,
    disabled,
    type = 'button',
    ...rest
  },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        VARIANT[variant],
        SIZE[size],
        className
      )}
      {...rest}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : (
        leftIcon
      )}
      {children}
      {!loading && rightIcon}
    </button>
  )
})

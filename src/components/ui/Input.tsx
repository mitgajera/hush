'use client'

import {
  forwardRef,
  FocusEvent,
  InputHTMLAttributes,
  ReactNode,
  useId,
  useState,
} from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  error?: string
  hint?: string
  focusHint?: string
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  valid?: boolean
}

export const Input = forwardRef<HTMLInputElement, Props>(function Input(
  {
    label,
    error,
    hint,
    focusHint,
    leftIcon,
    rightIcon,
    valid,
    className,
    id,
    onFocus,
    onBlur,
    ...rest
  },
  ref
) {
  const autoId = useId()
  const inputId = id ?? autoId
  const [focused, setFocused] = useState(false)

  const effectiveRightIcon =
    valid && !error ? <Check className="h-3.5 w-3.5 text-success" /> : rightIcon

  const helper =
    error ?? (focused && focusHint) ?? hint ?? null

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-xs text-fg-muted">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <span className="pointer-events-none absolute inset-y-0 left-2.5 flex items-center text-fg-subtle">
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          onFocus={(e: FocusEvent<HTMLInputElement>) => {
            setFocused(true)
            onFocus?.(e)
          }}
          onBlur={(e: FocusEvent<HTMLInputElement>) => {
            setFocused(false)
            onBlur?.(e)
          }}
          className={cn(
            'w-full h-10 rounded-xl bg-bg-elevated border text-sm text-fg placeholder:text-fg-subtle',
            'outline-none transition-all duration-150',
            leftIcon ? 'pl-8' : 'pl-3.5',
            effectiveRightIcon ? 'pr-8' : 'pr-3.5',
            error
              ? 'border-danger focus:border-danger focus:shadow-[0_0_0_3px_rgba(234,56,76,0.12)]'
              : valid
              ? 'border-success/40 focus:border-success/60 focus:shadow-[0_0_0_3px_rgba(34,197,94,0.12)]'
              : 'border-white/8 focus:border-accent/50 focus:shadow-[0_0_0_3px_rgba(0,179,255,0.12)]',
            className
          )}
          {...rest}
        />
        {effectiveRightIcon && (
          <span className="absolute inset-y-0 right-2.5 flex items-center text-fg-subtle">
            {effectiveRightIcon}
          </span>
        )}
      </div>
      {helper !== null && (
        <p
          className={cn(
            'mt-1.5 text-xs',
            error ? 'text-danger' : focused && focusHint ? 'text-fg-muted' : 'text-fg-subtle'
          )}
        >
          {helper}
        </p>
      )}
    </div>
  )
})

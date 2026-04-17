'use client'

import { forwardRef, InputHTMLAttributes, ReactNode, useId } from 'react'
import { cn } from '@/lib/utils/cn'

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  error?: string
  hint?: string
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { label, error, hint, leftIcon, rightIcon, className, id, ...rest },
  ref
) {
  const autoId = useId()
  const inputId = id ?? autoId

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
          className={cn(
            'w-full h-9 rounded-md bg-bg-surface border text-sm text-fg placeholder:text-fg-subtle',
            'focus:bg-bg outline-none transition-colors',
            leftIcon ? 'pl-8' : 'pl-3',
            rightIcon ? 'pr-8' : 'pr-3',
            error ? 'border-danger focus:border-danger' : 'border-border focus:border-border-strong',
            className
          )}
          {...rest}
        />
        {rightIcon && (
          <span className="absolute inset-y-0 right-2.5 flex items-center text-fg-subtle">
            {rightIcon}
          </span>
        )}
      </div>
      {error ? (
        <p className="mt-1.5 text-xs text-danger">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-fg-subtle">{hint}</p>
      ) : null}
    </div>
  )
})

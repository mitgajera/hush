'use client'

import { forwardRef, SelectHTMLAttributes, useId } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

type Props = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string
  error?: string
  hint?: string
}

export const Select = forwardRef<HTMLSelectElement, Props>(function Select(
  { label, error, hint, className, children, id, ...rest },
  ref
) {
  const autoId = useId()
  const selectId = id ?? autoId

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="mb-1.5 block text-xs text-fg-muted">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          className={cn(
            'w-full h-9 rounded-md bg-bg-surface border pl-3 pr-8 text-sm text-fg',
            'appearance-none outline-none transition-colors focus:bg-bg',
            error ? 'border-danger focus:border-danger' : 'border-border focus:border-border-strong',
            className
          )}
          {...rest}
        >
          {children}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-subtle"
          aria-hidden="true"
        />
      </div>
      {error ? (
        <p className="mt-1.5 text-xs text-danger">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-fg-subtle">{hint}</p>
      ) : null}
    </div>
  )
})

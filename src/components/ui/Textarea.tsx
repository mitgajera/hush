'use client'

import { forwardRef, TextareaHTMLAttributes, useId } from 'react'
import { cn } from '@/lib/utils/cn'

type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string
  error?: string
  hint?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, Props>(function Textarea(
  { label, error, hint, className, id, ...rest },
  ref
) {
  const autoId = useId()
  const textareaId = id ?? autoId

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={textareaId} className="mb-1.5 block text-xs text-fg-muted">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={textareaId}
        className={cn(
          'w-full min-h-[80px] rounded-xl bg-bg-elevated border px-3.5 py-2.5 text-sm text-fg',
          'placeholder:text-fg-subtle outline-none transition-all duration-150',
          error
            ? 'border-danger focus:border-danger focus:shadow-[0_0_0_3px_rgba(234,56,76,0.12)]'
            : 'border-white/8 focus:border-accent/50 focus:shadow-[0_0_0_3px_rgba(0,179,255,0.12)]',
          className
        )}
        {...rest}
      />
      {error ? (
        <p className="mt-1.5 text-xs text-danger">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-fg-subtle">{hint}</p>
      ) : null}
    </div>
  )
})

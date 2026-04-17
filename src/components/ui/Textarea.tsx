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
          'w-full min-h-[80px] rounded-md bg-bg-surface border px-3 py-2 text-sm text-fg',
          'placeholder:text-fg-subtle focus:bg-bg outline-none transition-colors',
          error ? 'border-danger focus:border-danger' : 'border-border focus:border-border-strong',
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

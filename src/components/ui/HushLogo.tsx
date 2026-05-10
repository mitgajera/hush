import { cn } from '@/lib/utils/cn'

type Size = 'sm' | 'md' | 'lg'

const SIZE: Record<Size, { wrap: string; icon: number; text: string }> = {
  sm: { wrap: 'h-6 w-6 rounded-md',  icon: 12, text: 'text-sm' },
  md: { wrap: 'h-8 w-8 rounded-lg',  icon: 16, text: 'text-base' },
  lg: { wrap: 'h-10 w-10 rounded-xl', icon: 20, text: 'text-xl' },
}

export function HushLogo({
  size = 'md',
  showText = true,
  className,
}: {
  size?: Size
  showText?: boolean
  className?: string
}) {
  const s = SIZE[size]
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      {/* Icon mark */}
      <span
        className={cn(
          'inline-flex shrink-0 items-center justify-center bg-accent/10 border border-accent/20',
          s.wrap
        )}
      >
        <LockMark size={s.icon} />
      </span>

      {/* Wordmark */}
      {showText && (
        <span className={cn('font-semibold tracking-tight text-fg', s.text)}>
          hush<span className="text-accent">.</span>
        </span>
      )}
    </span>
  )
}

function LockMark({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      {/* shackle */}
      <path
        d="M5 7V5a3 3 0 0 1 6 0v2"
        stroke="rgb(0,179,255)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* body */}
      <rect
        x="3.5"
        y="7"
        width="9"
        height="6.5"
        rx="1.5"
        fill="rgba(0,179,255,0.15)"
        stroke="rgb(0,179,255)"
        strokeWidth="1.25"
      />
      {/* keyhole dot */}
      <circle cx="8" cy="10.25" r="1" fill="rgb(0,179,255)" />
    </svg>
  )
}

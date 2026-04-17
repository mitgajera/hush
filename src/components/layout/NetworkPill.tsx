import { cn } from '@/lib/utils/cn'

export function NetworkPill({ className }: { className?: string }) {
  const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet'
  const isMainnet = network === 'mainnet-beta'

  const label = isMainnet ? 'mainnet' : network

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-2xs font-medium uppercase tracking-wide',
        isMainnet
          ? 'border-success/30 bg-success/10 text-success'
          : 'border-warning/30 bg-warning/10 text-warning',
        className
      )}
      title={`Connected to ${label}`}
    >
      <span
        aria-hidden="true"
        className={cn(
          'h-1.5 w-1.5 rounded-full',
          isMainnet ? 'bg-success' : 'bg-warning'
        )}
      />
      {label}
    </span>
  )
}

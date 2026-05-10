'use client'

import { usePathname } from 'next/navigation'
import { NetworkPill } from './NetworkPill'
import { WalletConnectButton } from '@/components/wallet/WalletConnectButton'
import { GlobalRevealToggle } from '@/components/ui/MaskedAmount'
import { PAGE_TITLES } from '@/constants/navigation'

function titleFor(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname]
  const base = '/' + pathname.split('/').filter(Boolean)[0]
  return PAGE_TITLES[base] ?? 'Hush'
}

export function TopBar() {
  const pathname = usePathname()
  const title = titleFor(pathname)

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-white/[0.06] bg-bg/80 px-6 backdrop-blur-md">
      <h1 className="text-sm font-semibold tracking-tight text-fg">{title}</h1>
      <div className="flex items-center gap-2">
        <GlobalRevealToggle />
        <NetworkPill />
        <WalletConnectButton />
      </div>
    </header>
  )
}

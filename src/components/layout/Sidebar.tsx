'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NAV_ITEMS, SETTINGS_ITEM } from '@/constants/navigation'
import { useHushLinks } from '@/hooks/useHushLinks'
import { useProjects } from '@/hooks/useProjects'
import { PrivateBadge } from '@/components/ui/PrivateBadge'
import { cn } from '@/lib/utils/cn'

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}

function NavBadge({ count }: { count: number }) {
  if (count <= 0) return null
  return (
    <span className="ml-auto inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-warning/15 px-1.5 text-2xs font-medium text-warning">
      {count > 99 ? '99+' : count}
    </span>
  )
}

export function Sidebar() {
  const pathname = usePathname()
  const links = useHushLinks()
  const projects = useProjects()

  const activeLinksCount = links.filter((l) => l.status === 'active').length
  const pendingMilestonesCount = projects.reduce(
    (acc, p) => acc + p.milestones.filter((m) => m.status === 'pending').length,
    0
  )

  const badges: Record<string, number> = {
    '/links': activeLinksCount,
    '/milestones': pendingMilestonesCount,
  }

  return (
    <aside className="hidden w-[220px] shrink-0 flex-col border-r border-border bg-bg-surface md:flex">
      <div className="flex items-center justify-between px-4 py-4">
        <Link href="/" className="text-sm font-medium text-fg">
          hush.
        </Link>
        <PrivateBadge size="sm" />
      </div>

      <nav className="flex-1 space-y-0.5 px-2 py-2">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2 rounded-md px-2.5 py-2 text-sm transition-colors',
                active
                  ? 'bg-bg-elevated text-fg'
                  : 'text-fg-muted hover:bg-bg-elevated/60 hover:text-fg'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="truncate">{item.label}</span>
              <NavBadge count={badges[item.href] ?? 0} />
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-border px-2 py-2">
        <Link
          href={SETTINGS_ITEM.href}
          className={cn(
            'flex items-center gap-2 rounded-md px-2.5 py-2 text-sm transition-colors',
            isActive(pathname, SETTINGS_ITEM.href)
              ? 'bg-bg-elevated text-fg'
              : 'text-fg-muted hover:bg-bg-elevated/60 hover:text-fg'
          )}
        >
          <SETTINGS_ITEM.icon className="h-4 w-4" aria-hidden="true" />
          <span>{SETTINGS_ITEM.label}</span>
        </Link>
      </div>

      <div className="border-t border-border px-4 py-3">
        <p className="text-2xs text-fg-subtle">Powered by Umbra</p>
        <p className="mt-0.5 text-2xs text-fg-subtle">SDK v0.0.0-dev (stub)</p>
      </div>
    </aside>
  )
}

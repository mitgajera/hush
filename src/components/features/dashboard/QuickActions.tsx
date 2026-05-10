import Link from 'next/link'
import { ArrowUpRight, CheckCircle2, LinkIcon, Users } from 'lucide-react'

type Action = {
  href: string
  title: string
  description: string
  icon: typeof Users
}

const ACTIONS: Action[] = [
  {
    href: '/payroll',
    title: 'Run payroll',
    description: 'Upload a CSV, send a private batch.',
    icon: Users,
  },
  {
    href: '/links',
    title: 'Generate link',
    description: 'Share a private payment link.',
    icon: LinkIcon,
  },
  {
    href: '/milestones',
    title: 'New milestone',
    description: 'Pay a contractor by milestone.',
    icon: CheckCircle2,
  },
]

export function QuickActions() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {ACTIONS.map((action) => {
        const Icon = action.icon
        return (
          <Link key={action.href} href={action.href} className="group block">
            <div className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-bg-surface p-5 transition-all duration-200 hover:border-accent/20 hover:bg-accent/[0.03]">
              <div className="flex items-start justify-between gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors group-hover:bg-accent/15">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <ArrowUpRight className="h-4 w-4 text-fg-subtle opacity-0 transition-all duration-150 group-hover:translate-x-0.5 group-hover:opacity-100 group-hover:text-accent" />
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-fg">{action.title}</p>
                <p className="mt-1 text-xs text-fg-muted">{action.description}</p>
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}

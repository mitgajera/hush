import Link from 'next/link'
import { ArrowUpRight, CheckCircle2, LinkIcon, Users } from 'lucide-react'
import { Card } from '@/components/ui/Card'

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
            <Card className="flex h-full items-start gap-3 transition-colors group-hover:border-border-strong group-hover:bg-bg-elevated">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-accent/10 text-accent">
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-fg">{action.title}</p>
                  <ArrowUpRight className="h-4 w-4 text-fg-subtle transition-transform group-hover:translate-x-0.5 group-hover:text-fg" />
                </div>
                <p className="mt-1 text-xs text-fg-muted">{action.description}</p>
              </div>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}

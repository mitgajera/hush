import { Shell } from '@/components/layout/Shell'
import { PageHeader } from '@/components/layout/PageHeader'
import { MetricCards } from '@/components/features/dashboard/MetricCards'
import { QuickActions } from '@/components/features/dashboard/QuickActions'
import { RecentActivity } from '@/components/features/dashboard/RecentActivity'
import { WalletCard } from '@/components/features/dashboard/WalletCard'
import { PrivateBadge } from '@/components/ui/PrivateBadge'
import { COPY } from '@/constants/content'

export default function DashboardPage() {
  return (
    <Shell>
      <div className="space-y-8">
        <PageHeader
          title="Dashboard"
          description="Your private financial operations, at a glance."
        />

        <MetricCards />

        <section className="space-y-3">
          <h3 className="text-sm font-medium text-fg">Quick actions</h3>
          <QuickActions />
        </section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
          <RecentActivity />
          <WalletCard />
        </section>

        <footer className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-border bg-bg-surface px-4 py-3 text-xs text-fg-muted">
          <div className="flex items-center gap-2">
            <PrivateBadge />
            <span>{COPY.privateBanner}</span>
            <span className="hidden text-fg-subtle sm:inline">·</span>
            <span className="hidden text-fg-subtle sm:inline">{COPY.poweredBy}</span>
          </div>
        </footer>
      </div>
    </Shell>
  )
}

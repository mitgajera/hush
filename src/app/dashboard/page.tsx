import { Shell } from '@/components/layout/Shell'
import { PageHeader } from '@/components/layout/PageHeader'
import { MetricCards } from '@/components/features/dashboard/MetricCards'
import { QuickActions } from '@/components/features/dashboard/QuickActions'
import { RecentActivity } from '@/components/features/dashboard/RecentActivity'
import { WalletCard } from '@/components/features/dashboard/WalletCard'

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
          <p className="text-2xs font-medium uppercase tracking-widest text-fg-subtle">Quick actions</p>
          <QuickActions />
        </section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_300px]">
          <RecentActivity />
          <WalletCard />
        </section>
      </div>
    </Shell>
  )
}

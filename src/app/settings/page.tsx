import { Shell } from '@/components/layout/Shell'
import { PageHeader } from '@/components/layout/PageHeader'
import { WalletSettings } from '@/components/features/settings/WalletSettings'
import { PrivacySettings } from '@/components/features/settings/PrivacySettings'
import { AboutPanel } from '@/components/features/settings/AboutPanel'
import { UmbraRegistration } from '@/components/features/settings/UmbraRegistration'

export default function SettingsPage() {
  return (
    <Shell>
      <div className="space-y-8">
        <PageHeader
          title="Settings"
          description="Everything local — nothing leaves this browser."
        />
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <WalletSettings />
          <UmbraRegistration />
          <PrivacySettings />
          <div className="lg:col-span-2">
            <AboutPanel />
          </div>
        </div>
      </div>
    </Shell>
  )
}

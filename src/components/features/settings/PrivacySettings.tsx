'use client'

import { toast } from 'sonner'
import { Card } from '@/components/ui/Card'
import { useStorageValue } from '@/hooks/useLocalStorage'
import { settingsStorage } from '@/lib/storage/settings'

const DEFAULTS_FOR_SSR = {
  rpcUrl: 'https://api.devnet.solana.com',
  network: 'devnet' as const,
  hideAmountsByDefault: true,
}

export function PrivacySettings() {
  const settings = useStorageValue(settingsStorage.get, DEFAULTS_FOR_SSR)

  function toggleHide() {
    settingsStorage.update({ hideAmountsByDefault: !settings.hideAmountsByDefault })
    toast.success(settings.hideAmountsByDefault ? 'Amounts visible by default' : 'Amounts hidden by default')
  }

  return (
    <Card className="space-y-5">
      <div>
        <h3 className="text-sm font-medium text-fg">Privacy</h3>
        <p className="mt-1 text-xs text-fg-muted">
          Hush keeps every record in this browser only. Nothing leaves your device.
        </p>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div className="space-y-0.5">
          <p className="text-sm text-fg">Hide amounts by default</p>
          <p className="text-xs text-fg-muted">
            When off, every amount is revealed until you toggle it individually.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={settings.hideAmountsByDefault}
          onClick={toggleHide}
          className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
            settings.hideAmountsByDefault ? 'bg-accent' : 'bg-bg-elevated'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-bg shadow transition-transform ${
              settings.hideAmountsByDefault ? 'translate-x-4' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>
    </Card>
  )
}

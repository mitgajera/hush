import { WalletStatusPanel } from '@/components/wallet/WalletStatusPanel'

export function WalletCard() {
  return (
    <section className="flex h-full flex-col gap-3">
      <h3 className="text-sm font-medium text-fg">Wallet</h3>
      <WalletStatusPanel />
    </section>
  )
}

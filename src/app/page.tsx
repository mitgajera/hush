import { WalletConnectButton } from '@/components/wallet/WalletConnectButton'
import { WalletStatusPanel } from '@/components/wallet/WalletStatusPanel'

export default function Home() {
  return (
    <main className="min-h-screen bg-bg text-fg">
      <header className="flex items-center justify-between border-b border-border px-6 py-3">
        <h1 className="text-sm font-medium text-fg">hush.</h1>
        <WalletConnectButton />
      </header>
      <section className="mx-auto max-w-md p-6">
        <WalletStatusPanel />
      </section>
    </main>
  )
}

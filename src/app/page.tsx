import Link from 'next/link'
import {
  ArrowRight,
  Eye,
  Link as LinkIcon,
  ShieldCheck,
  Users,
  Zap,
  Lock,
} from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-bg text-fg">
      {/* ── Ambient glow orbs ─────────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0"
      >
        <div className="absolute left-1/2 top-[-120px] h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-accent/[0.07] blur-[120px]" />
        <div className="absolute right-[-200px] top-[40%] h-[400px] w-[400px] rounded-full bg-accent/[0.04] blur-[100px]" />
        <div className="absolute left-[-150px] top-[60%] h-[350px] w-[350px] rounded-full bg-accent/[0.03] blur-[90px]" />
      </div>

      {/* ── Nav ───────────────────────────────────────────────────────────── */}
      <header className="relative z-10 flex items-center justify-between px-6 py-5 md:px-12">
        <span className="text-lg font-semibold tracking-tight text-fg">hush.</span>
        <nav className="hidden items-center gap-6 text-sm text-fg-muted md:flex">
          <Link href="#features" className="hover:text-fg transition-colors">Features</Link>
          <Link href="#how" className="hover:text-fg transition-colors">How it works</Link>
          <Link href="/employee" className="hover:text-fg transition-colors">Employee portal</Link>
        </nav>
        <Link
          href="/dashboard"
          className="btn-primary text-sm px-5 py-2"
        >
          Launch app
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </header>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative z-10 mx-auto max-w-4xl px-6 pb-24 pt-20 text-center md:pt-32">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/[0.06] px-3 py-1 text-xs font-medium text-accent">
          <Lock className="h-3 w-3" />
          Built on Umbra · Solana-native privacy
        </div>

        <h1 className="text-5xl font-semibold leading-[1.1] tracking-tight text-fg md:text-7xl">
          Private payroll.
          <br />
          <span className="text-accent">On-chain.</span>
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-base text-fg-muted md:text-lg">
          Every Solana transaction is public by default. Hush changes that —
          shielded payroll, payment links, and milestone releases powered by the
          Umbra protocol.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/dashboard" className="btn-primary px-6 py-2.5 text-sm">
            Launch app
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/employee" className="btn-secondary px-6 py-2.5 text-sm">
            I&apos;m an employee
          </Link>
        </div>

        <p className="mt-5 text-xs text-fg-subtle">
          No account needed · Runs entirely in your browser · Devnet &amp; mainnet
        </p>
      </section>

      {/* ── Stats bar ─────────────────────────────────────────────────────── */}
      <div className="relative z-10 border-y border-white/[0.06] bg-bg-surface/60 backdrop-blur">
        <div className="mx-auto grid max-w-4xl grid-cols-3 divide-x divide-white/[0.06] px-6 py-6">
          {[
            { label: 'Protocol', value: 'Umbra v4' },
            { label: 'Network', value: 'Solana' },
            { label: 'Privacy model', value: 'Stealth addresses' },
          ].map((s) => (
            <div key={s.label} className="px-6 text-center first:pl-0 last:pr-0">
              <p className="text-sm font-medium text-fg">{s.value}</p>
              <p className="mt-0.5 text-xs text-fg-subtle">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Features ──────────────────────────────────────────────────────── */}
      <section id="features" className="relative z-10 mx-auto max-w-5xl px-6 py-24">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-fg">
            Everything private, nothing public
          </h2>
          <p className="mt-3 text-sm text-fg-muted">
            Three primitives that cover every payment flow your team needs.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              icon: Users,
              title: 'Hush Payroll',
              desc: 'Run payroll for your entire team in one transaction. Each salary is shielded — coworkers cannot see each other\'s compensation.',
              accent: false,
            },
            {
              icon: LinkIcon,
              title: 'Hush Links',
              desc: 'Generate a single-use payment link for any amount. The recipient claims it into their own wallet. No address exposure.',
              accent: true,
            },
            {
              icon: ShieldCheck,
              title: 'Hush Audit',
              desc: 'Grant time-limited, read-only access to a trusted accountant. They see records. Nobody else does.',
              accent: false,
            },
          ].map((f) => {
            const Icon = f.icon
            return (
              <div
                key={f.title}
                className={`card space-y-4 transition-all duration-300 hover:border-white/[0.12] hover:-translate-y-0.5 ${
                  f.accent ? 'border-accent/20 bg-accent/[0.03]' : ''
                }`}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                    f.accent ? 'bg-accent/15 text-accent' : 'bg-bg-elevated text-fg-muted'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-fg">{f.title}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-fg-muted">{f.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────────────────── */}
      <section id="how" className="relative z-10 border-t border-white/[0.05] bg-bg-surface/40 py-24">
        <div className="mx-auto max-w-4xl px-6">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-fg">
              How it works
            </h2>
            <p className="mt-3 text-sm text-fg-muted">Three steps to fully private payments.</p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                step: '01',
                icon: Zap,
                title: 'Connect & register',
                desc: 'Connect your Solana wallet and register with the Umbra protocol once. Your stealth address is ready.',
              },
              {
                step: '02',
                icon: Users,
                title: 'Add recipients',
                desc: 'Import employees from a CSV or add them manually. Each recipient gets a shielded transfer.',
              },
              {
                step: '03',
                icon: Eye,
                title: 'Send privately',
                desc: 'Run payroll or send a Hush Link. Recipients claim at their own pace — nothing is public on-chain.',
              },
            ].map((s) => {
              const Icon = s.icon
              return (
                <div key={s.step} className="relative flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-accent/50">{s.step}</span>
                    <div className="h-px flex-1 bg-white/[0.05]" />
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.07] bg-bg-elevated text-fg-muted">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-medium text-fg">{s.title}</h3>
                  <p className="text-xs leading-relaxed text-fg-muted">{s.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="relative z-10 mx-auto max-w-4xl px-6 py-24 text-center">
        <div className="relative overflow-hidden rounded-3xl border border-accent/15 bg-accent/[0.04] px-8 py-14">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
          >
            <div className="h-[300px] w-[500px] rounded-full bg-accent/[0.06] blur-[80px]" />
          </div>
          <div className="relative">
            <h2 className="text-3xl font-semibold tracking-tight text-fg md:text-4xl">
              Ready to go private?
            </h2>
            <p className="mx-auto mt-4 max-w-md text-sm text-fg-muted">
              No signup, no server. Connect your wallet and start sending private
              payments in under two minutes.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link href="/dashboard" className="btn-primary px-7 py-2.5 text-sm">
                Launch app
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/employee" className="btn-secondary px-7 py-2.5 text-sm">
                Employee portal
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-white/[0.05] px-6 py-8">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4">
          <span className="text-sm font-medium text-fg">hush.</span>
          <p className="text-xs text-fg-subtle">Powered by Umbra · All payments private by default</p>
          <div className="flex items-center gap-4 text-xs text-fg-subtle">
            <Link href="/dashboard" className="hover:text-fg-muted transition-colors">App</Link>
            <Link href="/employee" className="hover:text-fg-muted transition-colors">Employee</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

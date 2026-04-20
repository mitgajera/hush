import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-6">
      <div className="max-w-md space-y-5 text-center">
        <p className="font-mono text-2xs text-fg-subtle tracking-widest">404</p>
        <div className="space-y-1.5">
          <h1 className="text-xl font-medium text-fg">Nothing private here.</h1>
          <p className="text-sm text-fg-muted">
            The page you were looking for doesn&apos;t exist — maybe the link expired.
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-accent hover:opacity-80"
        >
          Back to dashboard <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  )
}

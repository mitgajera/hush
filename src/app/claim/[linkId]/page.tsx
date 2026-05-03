import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import { ClaimPage } from '@/components/features/claim/ClaimPage'

export default function ClaimRoute({ params }: { params: { linkId: string } }) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-bg">
          <Loader2 className="h-7 w-7 animate-spin text-fg-muted" />
        </div>
      }
    >
      <ClaimPage token={params.linkId} />
    </Suspense>
  )
}

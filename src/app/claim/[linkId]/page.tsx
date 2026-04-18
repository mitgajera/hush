import { ClaimPage } from '@/components/features/claim/ClaimPage'

export default function ClaimRoute({ params }: { params: { linkId: string } }) {
  return <ClaimPage token={params.linkId} />
}

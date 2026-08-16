import { Suspense } from 'react'

import { Skeleton } from '@/components/ui/skeleton'
import { TeamManagement } from '@/features/team/team-management'

export default function TeamPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 rounded-2xl" />}>
      <TeamManagement />
    </Suspense>
  )
}

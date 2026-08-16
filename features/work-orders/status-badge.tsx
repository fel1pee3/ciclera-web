import { Badge } from '@/components/ui/badge'
import type { WorkOrderStatus } from './contracts'

const labels: Record<WorkOrderStatus, string> = {
  DRAFT: 'Rascunho',
  SCHEDULED: 'Agendada',
  IN_PROGRESS: 'Em execução',
  AWAITING_REVIEW: 'Aguardando revisão',
  PENDING_CORRECTION: 'Correção pendente',
  READY_TO_BILL: 'Pronta para faturar',
  BILLED: 'Faturada',
  CANCELED: 'Cancelada',
}

export function workOrderStatusLabel(status: WorkOrderStatus): string {
  return labels[status]
}

export function WorkOrderStatusBadge({ status }: { status: WorkOrderStatus }) {
  return (
    <Badge variant={status === 'CANCELED' ? 'outline' : 'secondary'}>
      {labels[status]}
    </Badge>
  )
}

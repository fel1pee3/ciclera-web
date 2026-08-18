import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  findWorkOrder,
  findWorkOrderHistory,
  listWorkOrders,
} from '@/features/work-orders/api'
import type { WorkOrderDetails } from '@/features/work-orders/contracts'
import { WorkOrderDetail } from '@/features/work-orders/work-order-detail'
import { WorkOrderList } from '@/features/work-orders/work-order-list'

vi.mock('next/navigation', () => ({
  useParams: () => ({
    workOrderId: '60000000-0000-4000-8000-000000000001',
  }),
  usePathname: () => '/app/ordens',
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}))

vi.mock('@/features/customers/api', () => ({
  listCustomers: vi.fn(() => new Promise(() => undefined)),
  listLocations: vi.fn(() => new Promise(() => undefined)),
}))

vi.mock('@/features/equipment/api', () => ({
  listEquipment: vi.fn(() => new Promise(() => undefined)),
}))

vi.mock('@/features/work-orders/api', () => ({
  cancelWorkOrder: vi.fn(),
  createWorkOrder: vi.fn(),
  downloadServiceReport: vi.fn(),
  findWorkOrder: vi.fn(),
  findWorkOrderHistory: vi.fn(),
  listWorkOrders: vi.fn(() => new Promise(() => undefined)),
  updateWorkOrder: vi.fn(),
}))

describe('work order dialogs', () => {
  beforeEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('opens a new work order from the list without navigating away', async () => {
    vi.mocked(listWorkOrders).mockResolvedValueOnce({
      items: [],
      page: 1,
      pageSize: 12,
      total: 0,
    })

    render(<WorkOrderList />)
    await screen.findByText('Nenhuma ordem cadastrada')
    fireEvent.click(screen.getByRole('button', { name: 'Nova ordem' }))

    expect(
      screen.getByRole('dialog', { name: 'Nova ordem de serviço' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('combobox', { name: 'Cliente' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Local' })).toBeInTheDocument()
    expect(
      screen.getByRole('combobox', { name: 'Equipamento' }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Valor previsto (R$)')).toBeInTheDocument()
  })

  it('opens draft editing in a modal and keeps the current version', async () => {
    vi.mocked(findWorkOrder).mockResolvedValueOnce(workOrder)
    vi.mocked(findWorkOrderHistory).mockResolvedValueOnce({
      timeline: [],
      audit: [],
    })

    render(<WorkOrderDetail />)
    await screen.findByRole('heading', { name: workOrder.title })
    fireEvent.click(screen.getByRole('button', { name: 'Editar rascunho' }))

    const dialog = screen.getByRole('dialog', {
      name: 'Editar ordem de serviço',
    })
    expect(dialog).toHaveTextContent(workOrder.number)
    expect(screen.getByDisplayValue(workOrder.title)).toBeInTheDocument()
    expect(screen.getByDisplayValue('450,00')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Fechar' }))
    await waitFor(() => expect(dialog).not.toBeInTheDocument())
  })
})

const workOrder: WorkOrderDetails = {
  id: '60000000-0000-4000-8000-000000000001',
  number: 'OS-2026-0001',
  customerId: '50000000-0000-4000-8000-000000000002',
  locationId: '50000000-0000-4000-8000-000000000003',
  equipmentId: '50000000-0000-4000-8000-000000000001',
  serviceType: 'Manutenção preventiva',
  title: 'Manutenção do ar-condicionado da recepção',
  description: 'Limpar filtros e verificar conexões elétricas.',
  priority: 'NORMAL',
  status: 'DRAFT',
  scheduledStartAt: '2026-08-18T18:00:00.000Z',
  scheduledEndAt: '2026-08-18T20:00:00.000Z',
  actualStartAt: null,
  actualEndAt: null,
  expectedAmountInCents: '45000',
  finalAmountInCents: null,
  version: 3,
  createdByUserId: '30000000-0000-4000-8000-000000000101',
  canceledByUserId: null,
  canceledAt: null,
  cancellationReason: null,
  createdAt: '2026-08-18T12:00:00.000Z',
  updatedAt: '2026-08-18T12:00:00.000Z',
  history: [],
  assignments: [],
  additionalItems: [],
  additionalTotalInCents: '0',
}

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { listCustomers, listLocations } from '@/features/customers/api'
import type { Customer, ServiceLocation } from '@/features/customers/contracts'
import { listEquipment } from '@/features/equipment/api'
import type { Equipment } from '@/features/equipment/contracts'
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
      screen.getByRole('textbox', { name: 'Buscar cliente' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Aguardando o cliente')).toBeInTheDocument()
    expect(screen.getByText('Aguardando o local')).toBeInTheDocument()
    expect(screen.getByLabelText('Valor previsto (R$)')).toBeInTheDocument()
    expect(
      screen.getByPlaceholderText('Ex.: Manutenção preventiva'),
    ).toBeInTheDocument()
    expect(
      screen.getByPlaceholderText(
        'Ex.: Manutenção do ar-condicionado da recepção',
      ),
    ).toBeInTheDocument()
  })

  it('filters work orders immediately without navigation or a clear-filters row', async () => {
    const urgentOrder: WorkOrderDetails = {
      ...workOrder,
      id: '60000000-0000-4000-8000-000000000009',
      number: 'OS-2026-0009',
      title: 'Correção urgente do quadro elétrico',
      status: 'IN_PROGRESS',
      priority: 'URGENT',
    }
    vi.mocked(listWorkOrders).mockImplementation(async (query) => {
      const items = [workOrder, urgentOrder].filter((order) => {
        const term = query.search?.toLocaleLowerCase('pt-BR')
        return (
          (!term ||
            order.number.toLocaleLowerCase('pt-BR').includes(term) ||
            order.title.toLocaleLowerCase('pt-BR').includes(term)) &&
          (!query.status || order.status === query.status) &&
          (!query.priority || order.priority === query.priority)
        )
      })
      return {
        items,
        page: query.page,
        pageSize: query.pageSize,
        total: items.length,
      }
    })

    render(<WorkOrderList />)
    await screen.findByRole('heading', { name: workOrder.title })
    expect(screen.queryByText('Limpar filtros')).not.toBeInTheDocument()

    const search = screen.getByPlaceholderText('Número ou título')
    fireEvent.change(search, { target: { value: 'quadro' } })
    expect(
      screen.getByRole('button', { name: 'Limpar busca' }),
    ).toBeInTheDocument()
    await waitFor(() =>
      expect(listWorkOrders).toHaveBeenLastCalledWith({
        page: 1,
        pageSize: 12,
        search: 'quadro',
      }),
    )

    fireEvent.click(screen.getByRole('button', { name: 'Limpar busca' }))
    fireEvent.change(screen.getByRole('combobox', { name: 'Status' }), {
      target: { value: 'IN_PROGRESS' },
    })
    fireEvent.change(screen.getByRole('combobox', { name: 'Prioridade' }), {
      target: { value: 'URGENT' },
    })
    await waitFor(() =>
      expect(listWorkOrders).toHaveBeenLastCalledWith({
        page: 1,
        pageSize: 12,
        status: 'IN_PROGRESS',
        priority: 'URGENT',
      }),
    )
    expect(
      await screen.findByRole('heading', { name: urgentOrder.title }),
    ).toBeInTheDocument()
  })

  it('selects or skips equipment through a guided choice', async () => {
    vi.mocked(listWorkOrders).mockResolvedValueOnce({
      items: [],
      page: 1,
      pageSize: 12,
      total: 0,
    })
    vi.mocked(listCustomers).mockResolvedValue({
      items: [customer],
      page: 1,
      pageSize: 10,
      total: 1,
    })
    vi.mocked(listLocations).mockResolvedValue({
      items: [location],
      page: 1,
      pageSize: 10,
      total: 1,
    })
    vi.mocked(listEquipment).mockResolvedValue({
      items: [equipment],
      page: 1,
      pageSize: 50,
      total: 1,
    })

    render(<WorkOrderList />)
    await screen.findByText('Nenhuma ordem cadastrada')
    fireEvent.click(screen.getByRole('button', { name: 'Nova ordem' }))

    fireEvent.click(
      await screen.findByRole('button', {
        name: `Selecionar cliente ${customer.name}`,
      }),
    )
    fireEvent.click(
      await screen.findByRole('button', {
        name: `Selecionar local ${location.name}`,
      }),
    )
    fireEvent.click(
      await screen.findByRole('button', {
        name: `Selecionar equipamento ${equipment.name}`,
      }),
    )
    expect(
      screen.getByRole('button', { name: 'Alterar equipamento' }),
    ).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Alterar equipamento' }))
    fireEvent.click(
      screen.getByRole('button', { name: /Sem equipamento específico/i }),
    )
    expect(screen.getByText('Atendimento geral')).toBeInTheDocument()
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

const customer: Customer = {
  id: workOrder.customerId,
  name: 'Hotel Serra Verde Ltda.',
  document: '12345678000190',
  email: 'manutencao@hotelserraverde.com.br',
  phone: '551134567890',
  notes: null,
  archivedAt: null,
  createdAt: '2026-08-17T12:00:00.000Z',
  updatedAt: '2026-08-17T12:00:00.000Z',
}

const location: ServiceLocation = {
  id: workOrder.locationId,
  customerId: customer.id,
  name: 'Unidade Centro',
  postalCode: '01310100',
  street: 'Avenida Paulista',
  number: '1578',
  complement: null,
  neighborhood: 'Bela Vista',
  city: 'São Paulo',
  state: 'SP',
  country: 'BR',
  contactName: null,
  contactPhone: null,
  accessInstructions: null,
  status: 'ACTIVE',
  createdAt: '2026-08-17T12:00:00.000Z',
  updatedAt: '2026-08-17T12:00:00.000Z',
}

const equipment: Equipment = {
  id: workOrder.equipmentId ?? '50000000-0000-4000-8000-000000000001',
  customerId: customer.id,
  locationId: location.id,
  name: 'Ar-condicionado da recepção',
  identifier: 'AR-REC-001',
  category: 'Ar-condicionado Split',
  brand: 'Daikin',
  model: 'EcoSwing 24.000 BTU',
  serialNumber: 'DK2408BR2026001842',
  notes: null,
  archivedAt: null,
  createdAt: '2026-08-17T12:00:00.000Z',
  updatedAt: '2026-08-17T12:00:00.000Z',
}

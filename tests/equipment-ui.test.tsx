import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  findCustomer,
  findLocation,
  listCustomers,
  listLocations,
} from '@/features/customers/api'
import type { Customer, ServiceLocation } from '@/features/customers/contracts'
import { findEquipment, listEquipment } from '@/features/equipment/api'
import type { Equipment } from '@/features/equipment/contracts'
import { EquipmentDetail } from '@/features/equipment/equipment-detail'
import { EquipmentList } from '@/features/equipment/equipment-list'
import { listWorkOrders } from '@/features/work-orders/api'
import type { WorkOrder } from '@/features/work-orders/contracts'

vi.mock('next/navigation', () => ({
  useParams: () => ({
    equipmentId: '50000000-0000-4000-8000-000000000001',
  }),
  usePathname: () => '/app/equipamentos',
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}))

vi.mock('@/features/customers/api', () => ({
  findCustomer: vi.fn(),
  findLocation: vi.fn(),
  listCustomers: vi.fn(() => new Promise(() => undefined)),
  listLocations: vi.fn(() => new Promise(() => undefined)),
}))

vi.mock('@/features/equipment/api', () => ({
  archiveEquipment: vi.fn(),
  createEquipment: vi.fn(),
  findEquipment: vi.fn(),
  listEquipment: vi.fn(() => new Promise(() => undefined)),
  reactivateEquipment: vi.fn(),
  updateEquipment: vi.fn(),
}))

vi.mock('@/features/work-orders/api', () => ({
  listWorkOrders: vi.fn(),
}))

describe('equipment UI', () => {
  beforeEach(() => {
    cleanup()
    vi.clearAllMocks()
    vi.mocked(listWorkOrders).mockResolvedValue({
      items: [],
      page: 1,
      pageSize: 6,
      total: 0,
    })
  })

  it('creates and archives equipment through clear dialogs', async () => {
    vi.mocked(listEquipment).mockResolvedValueOnce({
      items: [equipment],
      page: 1,
      pageSize: 12,
      total: 1,
    })

    render(<EquipmentList />)
    await screen.findByRole('heading', { name: equipment.name })

    fireEvent.click(screen.getByRole('button', { name: 'Novo equipamento' }))
    expect(
      screen.getByRole('dialog', { name: 'Novo equipamento' }),
    ).toBeInTheDocument()
    expect(
      screen.getByPlaceholderText('Ex.: Ar-condicionado da recepção'),
    ).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Ex.: AR-REC-001')).toBeInTheDocument()
    expect(screen.getByText('Onde está o equipamento?')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Fechar' }))

    fireEvent.click(screen.getByRole('button', { name: 'Arquivar' }))
    const archiveDialog = screen.getByRole('dialog', {
      name: 'Arquivar equipamento?',
    })
    expect(archiveDialog).toHaveTextContent('nenhum dado será excluído')
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
  })

  it('filters equipment immediately without navigation or a clear-filters row', async () => {
    const archivedEquipment: Equipment = {
      ...equipment,
      id: '50000000-0000-4000-8000-000000000009',
      name: 'Quadro elétrico principal',
      identifier: 'QDG-001',
      serialNumber: 'QDG2026001',
      archivedAt: '2026-08-18T12:00:00.000Z',
    }
    vi.mocked(listEquipment).mockImplementation(async (query) => {
      const items = [equipment, archivedEquipment].filter((item) => {
        const matchesArchive =
          query.archive === 'ALL' ||
          (query.archive === 'ACTIVE' && !item.archivedAt) ||
          (query.archive === 'ARCHIVED' && Boolean(item.archivedAt))
        const term = query.search?.toLocaleLowerCase('pt-BR')
        const matchesSearch =
          !term ||
          item.name.toLocaleLowerCase('pt-BR').includes(term) ||
          item.identifier.toLocaleLowerCase('pt-BR').includes(term) ||
          item.serialNumber?.toLocaleLowerCase('pt-BR').includes(term)
        return matchesArchive && matchesSearch
      })
      return {
        items,
        page: query.page,
        pageSize: query.pageSize,
        total: items.length,
      }
    })

    render(<EquipmentList />)
    await screen.findByRole('heading', { name: equipment.name })
    expect(screen.queryByText('Limpar filtros')).not.toBeInTheDocument()

    const search = screen.getByPlaceholderText('Nome, identificação ou serial')
    fireEvent.change(search, { target: { value: 'AR-REC' } })
    expect(
      screen.getByRole('button', { name: 'Limpar busca' }),
    ).toBeInTheDocument()
    await waitFor(() =>
      expect(listEquipment).toHaveBeenLastCalledWith({
        page: 1,
        pageSize: 12,
        archive: 'ACTIVE',
        search: 'AR-REC',
      }),
    )

    fireEvent.click(screen.getByRole('button', { name: 'Limpar busca' }))
    expect(search).toHaveValue('')

    fireEvent.change(screen.getByRole('combobox', { name: 'Situação' }), {
      target: { value: 'ARCHIVED' },
    })
    await waitFor(() =>
      expect(listEquipment).toHaveBeenLastCalledWith({
        page: 1,
        pageSize: 12,
        archive: 'ARCHIVED',
      }),
    )
    expect(
      await screen.findByRole('heading', { name: archivedEquipment.name }),
    ).toBeInTheDocument()
  })

  it('selects customer and location through guided searchable choices', async () => {
    vi.mocked(listEquipment).mockResolvedValueOnce({
      items: [equipment],
      page: 1,
      pageSize: 12,
      total: 1,
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

    render(<EquipmentList />)
    await screen.findByRole('heading', { name: equipment.name })
    fireEvent.click(screen.getByRole('button', { name: 'Novo equipamento' }))

    const dialog = screen.getByRole('dialog', { name: 'Novo equipamento' })
    expect(within(dialog).getByText('Aguardando o cliente')).toBeInTheDocument()
    expect(within(dialog).queryByRole('combobox')).not.toBeInTheDocument()

    fireEvent.click(
      await screen.findByRole('button', {
        name: `Selecionar cliente ${customer.name}`,
      }),
    )
    expect(
      screen.getByRole('button', { name: 'Alterar cliente' }),
    ).toBeInTheDocument()

    fireEvent.click(
      await screen.findByRole('button', {
        name: `Selecionar local ${location.name}`,
      }),
    )
    expect(
      screen.getByRole('button', { name: 'Alterar local' }),
    ).toBeInTheDocument()
    expect(within(dialog).queryByRole('combobox')).not.toBeInTheDocument()
  })

  it('presents the equipment relationship and edits it in a modal', async () => {
    vi.mocked(findEquipment).mockResolvedValueOnce(equipment)
    vi.mocked(findCustomer).mockResolvedValueOnce(customer)
    vi.mocked(findLocation).mockResolvedValueOnce(location)

    render(<EquipmentDetail />)
    await screen.findByRole('heading', { name: equipment.name })
    expect(screen.getByText(customer.name)).toBeInTheDocument()
    expect(screen.getByText(location.name)).toBeInTheDocument()
    expect(screen.getByText('Identificação interna')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Editar dados' }))
    expect(
      screen.getByRole('dialog', { name: 'Editar equipamento' }),
    ).toBeInTheDocument()
    expect(screen.getByDisplayValue(equipment.identifier)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Fechar' }))
    await waitFor(() =>
      expect(
        screen.queryByRole('dialog', { name: 'Editar equipamento' }),
      ).not.toBeInTheDocument(),
    )
  })

  it('shows real work orders linked to the equipment in its technical history', async () => {
    vi.mocked(findEquipment).mockResolvedValueOnce(equipment)
    vi.mocked(findCustomer).mockResolvedValueOnce(customer)
    vi.mocked(findLocation).mockResolvedValueOnce(location)
    vi.mocked(listWorkOrders).mockResolvedValueOnce({
      items: [workOrder],
      page: 1,
      pageSize: 6,
      total: 1,
    })

    render(<EquipmentDetail />)

    expect(
      await screen.findByRole('heading', { name: workOrder.title }),
    ).toBeInTheDocument()
    expect(screen.getByText('Faturada')).toBeInTheDocument()
    expect(screen.getByText(workOrder.serviceType)).toBeInTheDocument()
    expect(
      screen.queryByText('Nenhum atendimento registrado'),
    ).not.toBeInTheDocument()
    expect(listWorkOrders).toHaveBeenCalledWith({
      page: 1,
      pageSize: 6,
      equipmentId: equipment.id,
    })
  })
})

const equipment: Equipment = {
  id: '50000000-0000-4000-8000-000000000001',
  customerId: '50000000-0000-4000-8000-000000000002',
  locationId: '50000000-0000-4000-8000-000000000003',
  name: 'Ar-condicionado da recepção',
  identifier: 'AR-REC-001',
  category: 'Ar-condicionado Split',
  brand: 'Daikin',
  model: 'EcoSwing 24.000 BTU',
  serialNumber: 'DK2408BR2026001842',
  notes: 'Instalado acima do forro.',
  archivedAt: null,
  createdAt: '2026-08-17T12:00:00.000Z',
  updatedAt: '2026-08-17T12:00:00.000Z',
}

const customer: Customer = {
  id: equipment.customerId,
  name: 'Hotel Serra Verde Ltda.',
  document: '12345678000190',
  email: null,
  phone: null,
  notes: null,
  archivedAt: null,
  createdAt: '2026-08-17T12:00:00.000Z',
  updatedAt: '2026-08-17T12:00:00.000Z',
}

const location: ServiceLocation = {
  id: equipment.locationId,
  customerId: equipment.customerId,
  name: 'Hotel Serra Verde — Unidade Centro',
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

const workOrder: WorkOrder = {
  id: '50000000-0000-4000-8000-000000000004',
  number: 'OS-000001',
  customerId: equipment.customerId,
  locationId: equipment.locationId,
  equipmentId: equipment.id,
  serviceType: 'Manutenção preventiva',
  title: 'Manutenção preventiva do ar-condicionado da recepção',
  description: 'Limpeza dos filtros e inspeção da serpentina.',
  priority: 'NORMAL',
  status: 'BILLED',
  scheduledStartAt: '2026-08-18T12:00:00.000Z',
  scheduledEndAt: '2026-08-18T15:00:00.000Z',
  actualStartAt: '2026-08-18T12:05:00.000Z',
  actualEndAt: '2026-08-18T14:30:00.000Z',
  expectedAmountInCents: '50000',
  finalAmountInCents: '62540',
  version: 8,
  createdByUserId: '50000000-0000-4000-8000-000000000005',
  canceledByUserId: null,
  canceledAt: null,
  cancellationReason: null,
  createdAt: '2026-08-17T12:00:00.000Z',
  updatedAt: '2026-08-18T14:30:00.000Z',
}

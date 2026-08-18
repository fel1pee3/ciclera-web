import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { findCustomer, findLocation } from '@/features/customers/api'
import type { Customer, ServiceLocation } from '@/features/customers/contracts'
import { findEquipment, listEquipment } from '@/features/equipment/api'
import type { Equipment } from '@/features/equipment/contracts'
import { EquipmentDetail } from '@/features/equipment/equipment-detail'
import { EquipmentList } from '@/features/equipment/equipment-list'

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

describe('equipment UI', () => {
  beforeEach(() => {
    cleanup()
    vi.clearAllMocks()
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

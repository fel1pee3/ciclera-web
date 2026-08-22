import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { listUsers } from '@/features/team/api'
import { AdministrativeAgenda } from '@/features/work-orders/agenda'
import {
  listAgenda,
  listWorkOrders,
  scheduleWorkOrder,
} from '@/features/work-orders/api'
import type { WorkOrder } from '@/features/work-orders/contracts'

vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
}))

vi.mock('@/features/team/api', () => ({
  listUsers: vi.fn(),
}))

vi.mock('@/features/work-orders/api', () => ({
  listAgenda: vi.fn(),
  listWorkOrders: vi.fn(),
  reassignWorkOrder: vi.fn(),
  rescheduleWorkOrder: vi.fn(),
  scheduleWorkOrder: vi.fn(),
}))

describe('administrative agenda filters', () => {
  beforeEach(() => {
    cleanup()
    vi.clearAllMocks()
    vi.mocked(listAgenda).mockImplementation(async (query) => ({
      items: [],
      timezone: 'America/Sao_Paulo',
      from: `${query.from}T00:00:00.000Z`,
      to: `${query.to}T23:59:59.999Z`,
    }))
    vi.mocked(listUsers).mockResolvedValue({
      items: [
        {
          id: '30000000-0000-4000-8000-000000000003',
          name: 'Juarez Silva',
          email: 'juarez@example.com',
          role: 'TECHNICIAN',
          status: 'ACTIVE',
          createdAt: '2026-08-17T12:00:00.000Z',
          updatedAt: '2026-08-17T12:00:00.000Z',
        },
      ],
      page: 1,
      pageSize: 100,
      total: 1,
    })
    vi.mocked(listWorkOrders).mockResolvedValue({
      items: [],
      page: 1,
      pageSize: 100,
      total: 0,
    })
  })

  it('updates period, technician, and status without submit controls', async () => {
    render(<AdministrativeAgenda />)

    await screen.findByText('Nenhuma ordem no período')
    expect(
      screen.queryByRole('button', { name: 'Aplicar filtros' }),
    ).not.toBeInTheDocument()
    expect(screen.queryByText('Restaurar período')).not.toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Data inicial'), {
      target: { value: '2026-09-01' },
    })
    await waitFor(() =>
      expect(listAgenda).toHaveBeenLastCalledWith(
        expect.objectContaining({ from: '2026-09-01' }),
      ),
    )

    fireEvent.change(screen.getByRole('combobox', { name: 'Técnico' }), {
      target: { value: '30000000-0000-4000-8000-000000000003' },
    })
    fireEvent.change(screen.getByRole('combobox', { name: 'Status' }), {
      target: { value: 'SCHEDULED' },
    })
    await waitFor(() =>
      expect(listAgenda).toHaveBeenLastCalledWith(
        expect.objectContaining({
          technicianId: '30000000-0000-4000-8000-000000000003',
          status: 'SCHEDULED',
        }),
      ),
    )
  })

  it('schedules a draft with guided choices and preserves its planned period', async () => {
    vi.mocked(listWorkOrders).mockResolvedValue({
      items: [draft],
      page: 1,
      pageSize: 100,
      total: 1,
    })
    vi.mocked(scheduleWorkOrder).mockResolvedValue({
      ...draft,
      history: [],
      assignments: [],
      additionalItems: [],
      additionalTotalInCents: '0',
    })

    render(<AdministrativeAgenda />)
    await screen.findByText('Nenhuma ordem no período')
    fireEvent.click(screen.getByRole('button', { name: 'Agendar ordem' }))

    const dialog = screen.getByRole('dialog', { name: 'Agendar rascunho' })
    expect(within(dialog).queryByDisplayValue(/T/)).not.toBeInTheDocument()
    expect(within(dialog).queryByLabelText('Início')).not.toBeInTheDocument()
    expect(within(dialog).queryByLabelText('Término')).not.toBeInTheDocument()

    fireEvent.click(
      await within(dialog).findByRole('button', {
        name: `Selecionar ordem ${draft.number} · ${draft.title}`,
      }),
    )
    fireEvent.click(
      within(dialog).getByRole('button', {
        name: 'Selecionar técnico Juarez Silva',
      }),
    )
    expect(within(dialog).getByText('Ordem selecionada')).toBeInTheDocument()
    expect(within(dialog).getByText('Técnico selecionado')).toBeInTheDocument()

    fireEvent.click(within(dialog).getByRole('button', { name: 'Agendar' }))
    await waitFor(() =>
      expect(scheduleWorkOrder).toHaveBeenCalledWith(draft.id, {
        version: draft.version,
        technicianId: '30000000-0000-4000-8000-000000000003',
        scheduledStartAt: draft.scheduledStartAt,
        scheduledEndAt: draft.scheduledEndAt,
      }),
    )
  })
})

const draft: WorkOrder = {
  id: '60000000-0000-4000-8000-000000000001',
  number: 'OS-000001',
  customerId: '50000000-0000-4000-8000-000000000001',
  locationId: '50000000-0000-4000-8000-000000000002',
  equipmentId: null,
  serviceType: 'Manutenção preventiva',
  title: 'Manutenção do ar-condicionado',
  description: 'Realizar inspeção e limpeza.',
  priority: 'NORMAL',
  status: 'DRAFT',
  scheduledStartAt: '2026-09-01T12:00:00.000Z',
  scheduledEndAt: '2026-09-01T15:00:00.000Z',
  actualStartAt: null,
  actualEndAt: null,
  expectedAmountInCents: '48000',
  finalAmountInCents: null,
  version: 1,
  createdByUserId: '30000000-0000-4000-8000-000000000001',
  canceledByUserId: null,
  canceledAt: null,
  cancellationReason: null,
  createdAt: '2026-08-22T12:00:00.000Z',
  updatedAt: '2026-08-22T12:00:00.000Z',
}

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ExecutionEvidence } from '@/features/field-work-orders/execution-evidence'
import { getEvidenceReadUrl } from '@/features/field-work-orders/api'
import type { FieldWorkOrder } from '@/features/field-work-orders/contracts'

vi.mock('@/features/field-work-orders/api', () => ({
  confirmEvidence: vi.fn(),
  createEvidenceIntent: vi.fn(),
  getEvidenceReadUrl: vi.fn(),
  removeEvidence: vi.fn(),
}))

vi.mock('@/lib/api/config', () => ({
  buildApiUrl: (path: string) => `http://api.local/${path}`,
}))

describe('execution evidence', () => {
  beforeEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('separates camera and gallery and lets a confirmed photo be minimized', async () => {
    vi.mocked(getEvidenceReadUrl).mockResolvedValue({
      url: 'field/evidence/photo/content?token=temporary',
      expiresAt: '2026-08-22T15:00:00.000Z',
    })

    const { container } = render(
      <ExecutionEvidence order={order} onOrderChange={vi.fn()} />,
    )

    expect(screen.getByRole('button', { name: 'Tirar foto' })).toBeVisible()
    expect(
      screen.getByRole('button', { name: 'Escolher da galeria' }),
    ).toBeVisible()
    expect(screen.queryByText(/assinatura do responsável/i)).toBeNull()

    const camera = container.querySelector<HTMLInputElement>(
      'input[type="file"][capture="environment"]',
    )
    const gallery = container.querySelector<HTMLInputElement>(
      'input[type="file"][multiple]',
    )
    expect(camera).not.toBeNull()
    expect(gallery).not.toBeNull()
    expect(camera).toHaveAttribute('accept', 'image/jpeg,image/png,image/webp')
    expect(gallery).toHaveAttribute('accept', 'image/jpeg,image/png,image/webp')

    fireEvent.click(screen.getByRole('button', { name: 'Visualizar' }))
    expect(
      await screen.findByAltText('Foto enviada: quadro-eletrico.jpg'),
    ).toBeVisible()

    fireEvent.click(screen.getByRole('button', { name: 'Minimizar' }))
    await waitFor(() =>
      expect(
        screen.queryByAltText('Foto enviada: quadro-eletrico.jpg'),
      ).toBeNull(),
    )
  })
})

const order: FieldWorkOrder = {
  id: '10000000-0000-4000-8000-000000000001',
  number: 'OS-000002',
  customer: {
    id: '20000000-0000-4000-8000-000000000001',
    name: 'Clima Forte Serviços Prediais Ltda.',
  },
  location: {
    id: '30000000-0000-4000-8000-000000000001',
    name: 'Clima Forte — Sede Administrativa',
    street: 'Avenida Paulista',
    number: '1000',
    complement: null,
    neighborhood: 'Bela Vista',
    city: 'São Paulo',
    state: 'SP',
  },
  equipment: null,
  serviceType: 'Inspeção elétrica preventiva',
  title: 'Preventiva das instalações elétricas',
  description: 'Inspecionar as instalações.',
  priority: 'NORMAL',
  status: 'IN_PROGRESS',
  scheduledStartAt: '2026-08-25T17:00:00.000Z',
  scheduledEndAt: '2026-08-25T20:00:00.000Z',
  actualStartAt: '2026-08-25T17:00:00.000Z',
  actualEndAt: null,
  version: 3,
  currentCorrection: null,
  execution: {
    id: '40000000-0000-4000-8000-000000000001',
    technicianId: '50000000-0000-4000-8000-000000000001',
    notes: null,
    version: 2,
    startedAt: '2026-08-25T17:00:00.000Z',
    updatedAt: '2026-08-25T17:00:00.000Z',
    evidence: [
      {
        id: '60000000-0000-4000-8000-000000000001',
        fileName: 'quadro-eletrico.jpg',
        contentType: 'image/jpeg',
        sizeBytes: '1024',
        confirmedAt: '2026-08-25T17:30:00.000Z',
        createdAt: '2026-08-25T17:30:00.000Z',
      },
    ],
    additionalItems: [],
    additionalTotalInCents: '0',
  },
}

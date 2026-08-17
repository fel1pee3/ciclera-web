import { cleanup, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import {
  GettingStarted,
  isSetupComplete,
} from '@/features/dashboard/revenue-dashboard'

const emptySetup = {
  activeUserCount: 1,
  customerCount: 0,
  locationCount: 0,
  equipmentCount: 0,
  workOrderCount: 0,
}

describe('dashboard getting started', () => {
  afterEach(cleanup)

  it('highlights the next real setup step and exposes progress', () => {
    render(<GettingStarted setup={emptySetup} />)

    const progress = screen.getByRole('progressbar', {
      name: 'Progresso da configuração inicial',
    })
    expect(progress).toHaveAttribute('aria-valuenow', '0')
    expect(screen.getByText('0 de 4 concluídos')).toBeInTheDocument()

    const teamStep = screen.getByRole('link', { name: /Monte sua equipe/ })
    expect(within(teamStep).getByText('Próximo passo')).toBeInTheDocument()
  })

  it('marks completed steps automatically and advances the recommendation', () => {
    render(
      <GettingStarted
        setup={{
          ...emptySetup,
          activeUserCount: 2,
          customerCount: 1,
          locationCount: 1,
        }}
      />,
    )

    expect(screen.getAllByText('Concluído')).toHaveLength(2)
    expect(screen.getByText('2 de 4 concluídos')).toBeInTheDocument()
    const equipmentStep = screen.getByRole('link', {
      name: /Vincule um equipamento/,
    })
    expect(within(equipmentStep).getByText('Próximo passo')).toBeInTheDocument()
  })

  it('recognizes when every setup requirement is complete', () => {
    expect(isSetupComplete(emptySetup)).toBe(false)
    expect(
      isSetupComplete({
        activeUserCount: 2,
        customerCount: 1,
        locationCount: 1,
        equipmentCount: 1,
        workOrderCount: 1,
      }),
    ).toBe(true)
  })
})

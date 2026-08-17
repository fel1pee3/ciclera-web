import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { OfficeShell } from '@/components/layout/office-shell'
import { ShellNavigation } from '@/components/layout/shell-navigation'
import { officeNavigation } from '@/config/navigation'

const mocks = vi.hoisted(() => ({ pathname: '/app/equipamentos' }))

vi.mock('next/navigation', () => ({
  usePathname: () => mocks.pathname,
}))

vi.mock('@/features/auth/logout-button', () => ({
  LogoutButton: ({ className }: { className?: string }) => (
    <button className={className}>Sair</button>
  ),
}))

const account = {
  user: {
    id: '10000000-0000-4000-8000-000000000001',
    name: 'Ana Ciclera',
    email: 'ana@local.test',
    role: 'OWNER' as const,
  },
  organization: {
    id: '20000000-0000-4000-8000-000000000001',
    name: 'Oficina Local',
    timezone: 'America/Sao_Paulo',
  },
}

describe('office shell', () => {
  afterEach(cleanup)

  beforeEach(() => {
    mocks.pathname = '/app/equipamentos'
  })

  it('marks only the most specific navigation item as active', () => {
    render(<ShellNavigation items={officeNavigation} />)

    expect(screen.getByRole('link', { name: 'Equipamentos' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(screen.getByRole('link', { name: 'Início' })).not.toHaveAttribute(
      'aria-current',
    )
  })

  it('keeps account data only in the header and lets the sidebar collapse', () => {
    render(
      <OfficeShell account={account}>
        <p>Conteúdo</p>
      </OfficeShell>,
    )

    expect(screen.getAllByText('Ana Ciclera')).toHaveLength(1)
    expect(screen.getAllByText('Oficina Local')).toHaveLength(1)
    expect(screen.getByText('Proprietário')).toBeInTheDocument()

    fireEvent.click(
      screen.getByRole('button', { name: 'Recolher menu lateral' }),
    )

    expect(
      screen.getByRole('button', { name: 'Expandir menu lateral' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Equipamentos' })).toHaveAttribute(
      'title',
      'Equipamentos',
    )
  })

  it('keeps desktop and mobile navigation fixed to the viewport', () => {
    const { container } = render(
      <OfficeShell account={account}>
        <p>Conteúdo</p>
      </OfficeShell>,
    )

    expect(container.querySelector('aside')).toHaveClass('fixed')

    fireEvent.click(screen.getByRole('button', { name: 'Abrir menu' }))

    expect(document.querySelector('#menu-escritorio')).toHaveClass(
      'fixed',
      'right-0',
    )
    expect(document.body.style.overflow).toBe('hidden')

    fireEvent.keyDown(window, { key: 'Escape' })
    expect(document.querySelector('#menu-escritorio')).not.toBeInTheDocument()
  })
})

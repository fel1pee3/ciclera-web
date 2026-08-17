import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { LogoutButton } from '@/features/auth/logout-button'

const mocks = vi.hoisted(() => ({
  refresh: vi.fn(),
  replace: vi.fn(),
  signOut: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: mocks.refresh, replace: mocks.replace }),
}))

vi.mock('@/features/auth/session-provider', () => ({
  useSession: () => ({ signOut: mocks.signOut }),
}))

describe('logout confirmation', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('only ends the session after explicit confirmation', async () => {
    mocks.signOut.mockResolvedValue(undefined)
    render(<LogoutButton />)

    fireEvent.click(screen.getByRole('button', { name: 'Sair' }))
    let dialog = within(
      screen.getByRole('dialog', { name: 'Sair da Ciclera?' }),
    )
    expect(mocks.signOut).not.toHaveBeenCalled()

    fireEvent.click(dialog.getByRole('button', { name: 'Cancelar' }))
    expect(
      screen.queryByRole('dialog', { name: 'Sair da Ciclera?' }),
    ).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Sair' }))
    dialog = within(screen.getByRole('dialog', { name: 'Sair da Ciclera?' }))
    fireEvent.click(dialog.getByRole('button', { name: 'Sim, sair' }))

    await waitFor(() => expect(mocks.signOut).toHaveBeenCalledTimes(1))
    expect(mocks.replace).toHaveBeenCalledWith('/login')
    expect(mocks.refresh).toHaveBeenCalledTimes(1)
  })
})

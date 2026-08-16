import { describe, expect, it } from 'vitest'

import { getAuthErrorMessage } from '@/features/auth/errors'
import { roleHome, safeReturnPath } from '@/features/auth/redirects'
import { ApiError } from '@/lib/api/errors'

describe('authentication foundation', () => {
  it('routes each role to its authorized area', () => {
    expect(roleHome('OWNER')).toBe('/app')
    expect(roleHome('ADMIN')).toBe('/app')
    expect(roleHome('TECHNICIAN')).toBe('/field')
  })

  it('accepts only internal role-compatible return paths', () => {
    expect(safeReturnPath('/app/equipe?page=2', 'OWNER')).toBe(
      '/app/equipe?page=2',
    )
    expect(safeReturnPath('/field/ordens', 'TECHNICIAN')).toBe('/field/ordens')
    expect(safeReturnPath('//attacker.example', 'OWNER')).toBe('/app')
    expect(safeReturnPath('https://attacker.example', 'OWNER')).toBe('/app')
    expect(safeReturnPath('/app', 'TECHNICIAN')).toBe('/field')
  })

  it('maps authentication statuses without exposing internal details', () => {
    expect(getAuthErrorMessage(new ApiError('internal', 401), 'login')).toBe(
      'E-mail ou senha inválidos.',
    )
    expect(
      getAuthErrorMessage(new ApiError('internal', 403), 'session'),
    ).toMatch(/bloqueada/)
    expect(
      getAuthErrorMessage(new ApiError('internal', 503), 'forgot-password'),
    ).toMatch(/indisponível/)
  })
})

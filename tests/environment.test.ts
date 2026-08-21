import { describe, expect, it } from 'vitest'

import { parsePublicEnvironment } from '@/config/env-schema'

describe('environment configuration', () => {
  it('parses and normalizes public values', () => {
    expect(
      parsePublicEnvironment({
        NEXT_PUBLIC_APP_URL: 'https://app.ciclera.com.br/',
        NEXT_PUBLIC_API_URL: 'https://api.ciclera.com.br',
        NEXT_PUBLIC_WHATSAPP_NUMBER: '+55 (11) 99999-9999',
        NEXT_PUBLIC_CONTACT_EMAIL: '',
      }),
    ).toEqual({
      NEXT_PUBLIC_APP_URL: 'https://app.ciclera.com.br',
      NEXT_PUBLIC_API_URL: 'https://api.ciclera.com.br',
      NEXT_PUBLIC_WHATSAPP_NUMBER: '5511999999999',
      NEXT_PUBLIC_CONTACT_EMAIL: 'contatociclera@gmail.com',
    })
  })

  it('fails clearly when a required public value is missing or invalid', () => {
    expect(() =>
      parsePublicEnvironment({
        NEXT_PUBLIC_APP_URL: '',
        NEXT_PUBLIC_API_URL: 'not-a-url',
      }),
    ).toThrow(
      'Invalid public environment configuration: NEXT_PUBLIC_APP_URL: is required',
    )
  })
})

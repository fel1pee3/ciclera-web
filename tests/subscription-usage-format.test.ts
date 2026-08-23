import { describe, expect, it } from 'vitest'

import { formatEvidenceStorage } from '@/features/subscriptions/usage-format'

describe('subscription evidence storage formatting', () => {
  it('always presents gigabytes with two decimal places', () => {
    expect(formatEvidenceStorage(0)).toBe('0,00 GB')
    expect(formatEvidenceStorage(1024 ** 3)).toBe('1,00 GB')
    expect(formatEvidenceStorage(1024 ** 3 / 2)).toBe('0,50 GB')
  })
})

import { z } from 'zod'

export const importPreviewSchema = z.object({
  checksum: z.string().regex(/^[a-f0-9]{64}$/),
  ready: z.boolean(),
  totals: z.object({
    total: z.number().int().nonnegative(),
    valid: z.number().int().nonnegative(),
    invalid: z.number().int().nonnegative(),
  }),
  entities: z.object({
    customers: z.number().int().nonnegative(),
    locations: z.number().int().nonnegative(),
    equipment: z.number().int().nonnegative(),
  }),
  rows: z.array(
    z.object({
      line: z.number().int().positive(),
      type: z.string(),
      externalKey: z.string(),
      errors: z.array(z.string()),
      status: z.enum(['VALID', 'INVALID']),
    }),
  ),
})
export type ImportPreview = z.infer<typeof importPreviewSchema>

export const importResultSchema = z.object({
  status: z.enum(['IMPORTED', 'ALREADY_IMPORTED']),
  importId: z.string().uuid(),
  checksum: z.string(),
  counts: z.object({
    customers: z.number().int().nonnegative(),
    locations: z.number().int().nonnegative(),
    equipment: z.number().int().nonnegative(),
  }),
})

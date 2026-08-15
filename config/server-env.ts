import 'server-only'

import { parseServerEnvironment } from './env-schema'

export const serverEnvironment = parseServerEnvironment({
  LEAD_WEBHOOK_URL: process.env.LEAD_WEBHOOK_URL,
})

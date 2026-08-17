import { defineConfig } from '@playwright/test'

const appUrl = process.env.PLAYWRIGHT_APP_URL ?? 'http://127.0.0.1:3100'
const apiUrl = process.env.PLAYWRIGHT_API_URL ?? 'http://127.0.0.1:3333'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: true,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: appUrl,
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run dev -- --hostname 127.0.0.1 --port 3100',
    url: appUrl,
    reuseExistingServer: Boolean(process.env.PLAYWRIGHT_APP_URL),
    timeout: 120_000,
    env: {
      NEXT_PUBLIC_APP_URL: appUrl,
      NEXT_PUBLIC_API_URL: apiUrl,
      NEXT_PUBLIC_CONTACT_EMAIL: 'contatociclera@gmail.com',
    },
  },
})

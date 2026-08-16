import { expect, test, type Page, type Route } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const apiOrigin = 'http://127.0.0.1:3333'
const appOrigin = 'http://127.0.0.1:3100'

const accounts = {
  owner: {
    user: {
      id: '11111111-1111-4111-8111-111111111111',
      email: 'owner.e2e@example.test',
      name: 'Admin E2E',
      role: 'OWNER',
    },
    organization: {
      id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      name: 'Organization E2E',
      timezone: 'America/Sao_Paulo',
    },
  },
  technician: {
    user: {
      id: '22222222-2222-4222-8222-222222222222',
      email: 'technician.e2e@example.test',
      name: 'Technician E2E',
      role: 'TECHNICIAN',
    },
    organization: {
      id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      name: 'Organization E2E',
      timezone: 'America/Sao_Paulo',
    },
  },
} as const

async function json(route: Route, body: unknown, status = 200) {
  await route.fulfill({
    status,
    contentType: 'application/json',
    headers: {
      'access-control-allow-origin': appOrigin,
      'access-control-allow-credentials': 'true',
    },
    body: JSON.stringify(body),
  })
}

async function mockApi(
  page: Page,
  account: (typeof accounts)[keyof typeof accounts],
) {
  await page.route(`${apiOrigin}/api/v1/**`, async (route) => {
    const request = route.request()
    const url = new URL(request.url())

    if (request.method() === 'OPTIONS') {
      await route.fulfill({
        status: 204,
        headers: {
          'access-control-allow-origin': appOrigin,
          'access-control-allow-credentials': 'true',
          'access-control-allow-headers': 'content-type',
          'access-control-allow-methods': 'GET,POST,PATCH,DELETE,OPTIONS',
        },
      })
      return
    }

    if (url.pathname === '/api/v1/auth/login') {
      await json(route, account)
      return
    }

    if (url.pathname === '/api/v1/auth/me') {
      await json(route, account)
      return
    }

    if (url.pathname === '/api/v1/dashboard/summary') {
      await json(route, {
        timezone: 'America/Sao_Paulo',
        period: { from: '2026-08-01', to: '2026-08-31' },
        stages: {
          IN_PROGRESS: { count: 0, amountInCents: '0' },
          AWAITING_REVIEW: { count: 0, amountInCents: '0' },
          PENDING_CORRECTION: { count: 0, amountInCents: '0' },
          READY_TO_BILL: { count: 0, amountInCents: '0' },
          BILLED: { count: 0, amountInCents: '0' },
        },
        blockedAmountInCents: '0',
        averageReviewWaitingSeconds: null,
        oldestBlocked: [],
        recurringBlockers: [],
      })
      return
    }

    if (url.pathname === '/api/v1/dashboard/work-orders') {
      await json(route, { data: [], nextCursor: null })
      return
    }

    if (url.pathname === '/api/v1/field/work-orders') {
      await json(route, {
        items: [],
        page: 1,
        pageSize: 1,
        total: 0,
        timezone: 'America/Sao_Paulo',
      })
      return
    }

    await json(
      route,
      { error: { code: 'NOT_FOUND', message: 'Not found' } },
      404,
    )
  })
}

async function login(page: Page, email: string) {
  await page.goto('/login')
  await page.getByLabel('E-mail').fill(email)
  await page.getByLabel('Senha').fill('LocalOnly!2026')
  await page.getByRole('button', { name: 'Entrar' }).click()
}

test('administrative profile reaches the operational dashboard', async ({
  page,
}) => {
  await mockApi(page, accounts.owner)
  await login(page, accounts.owner.user.email)

  await expect(page).toHaveURL(/\/app$/)
  await expect(
    page.getByRole('heading', { name: 'Visão operacional' }),
  ).toBeVisible()
  await expectNoCriticalAccessibilityViolations(page)
})

test('technician profile reaches a usable field view on mobile', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await mockApi(page, accounts.technician)
  await login(page, accounts.technician.user.email)

  await expect(page).toHaveURL(/\/field$/)
  await expect(
    page.getByRole('heading', { name: 'Seus atendimentos' }),
  ).toBeVisible()
  await expect(
    page.getByRole('link', { name: /Ver todas as ordens/ }),
  ).toBeVisible()

  const hasHorizontalOverflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth,
  )
  expect(hasHorizontalOverflow).toBe(false)
  await expectNoCriticalAccessibilityViolations(page)
})

async function expectNoCriticalAccessibilityViolations(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze()
  expect(
    results.violations.flatMap((violation) =>
      violation.nodes.map((node) => ({
        rule: violation.id,
        target: node.target.join(' '),
        html: node.html,
      })),
    ),
  ).toEqual([])
}

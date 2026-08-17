import { expect, test, type Page, type Route } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const apiOrigin = process.env.PLAYWRIGHT_API_URL ?? 'http://127.0.0.1:3333'
const appOrigin = process.env.PLAYWRIGHT_APP_URL ?? 'http://127.0.0.1:3100'

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
        setup: {
          activeUserCount: 1,
          customerCount: 0,
          locationCount: 0,
          equipmentCount: 0,
          workOrderCount: 0,
        },
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
  await page.getByLabel('Senha', { exact: true }).fill('LocalOnly!2026')
  await page.getByRole('button', { name: 'Entrar' }).click()
}

async function mockPublicRegistration(page: Page) {
  let registered = false
  let submittedBody: Record<string, unknown> | null = null

  await page.route(`${apiOrigin}/api/v1/**`, async (route) => {
    const request = route.request()
    const pathname = new URL(request.url()).pathname

    if (request.method() === 'OPTIONS') {
      await route.fulfill({
        status: 204,
        headers: {
          'access-control-allow-origin': appOrigin,
          'access-control-allow-credentials': 'true',
          'access-control-allow-headers': 'content-type',
          'access-control-allow-methods': 'GET,POST,OPTIONS',
        },
      })
      return
    }

    if (pathname === '/api/v1/auth/register') {
      submittedBody = request.postDataJSON() as Record<string, unknown>
      registered = true
      await json(route, accounts.owner, 201)
      return
    }

    if (pathname === '/api/v1/auth/me') {
      await json(
        route,
        registered
          ? accounts.owner
          : {
              type: 'about:blank',
              title: 'Unauthorized',
              status: 401,
              detail: 'Authentication is required.',
            },
        registered ? 200 : 401,
      )
      return
    }

    if (pathname === '/api/v1/auth/refresh') {
      await json(route, { status: 401, title: 'Unauthorized' }, 401)
      return
    }

    if (pathname === '/api/v1/dashboard/summary') {
      await json(route, {
        timezone: 'America/Sao_Paulo',
        period: { from: '2026-08-01', to: '2026-08-31' },
        setup: {
          activeUserCount: 1,
          customerCount: 0,
          locationCount: 0,
          equipmentCount: 0,
          workOrderCount: 0,
        },
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

    await json(route, { status: 404, title: 'Not Found' }, 404)
  })

  return () => submittedBody
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
  await expect(
    page.getByRole('progressbar', {
      name: 'Progresso da configuração inicial',
    }),
  ).toHaveAttribute('aria-valuenow', '0')
  await expect(
    page
      .getByRole('link', { name: /Monte sua equipe/ })
      .getByText('Próximo passo'),
  ).toBeVisible()
  await expect(page.getByText(accounts.owner.user.name)).toHaveCount(1)
  await expect(page.getByText(accounts.owner.organization.name)).toHaveCount(1)

  const navigation = page.getByRole('navigation', {
    name: 'Navegação principal',
  })
  await expect(
    navigation.getByRole('link', { name: 'Início' }),
  ).toHaveAttribute('aria-current', 'page')

  await navigation.getByRole('link', { name: 'Equipamentos' }).click()
  await expect(page).toHaveURL(/\/app\/equipamentos$/)
  await expect(
    navigation.getByRole('link', { name: 'Equipamentos' }),
  ).toHaveAttribute('aria-current', 'page')
  await expect(
    navigation.getByRole('link', { name: 'Início' }),
  ).not.toHaveAttribute('aria-current')

  const equipmentIcon = navigation
    .getByRole('link', { name: 'Equipamentos' })
    .locator('svg')
  const expandedIconPosition = await equipmentIcon.boundingBox()
  await expect(page.locator('aside')).toHaveCSS('position', 'fixed')

  await page.getByRole('button', { name: 'Recolher menu lateral' }).click()
  await expect(
    page.getByRole('button', { name: 'Expandir menu lateral' }),
  ).toBeVisible()
  await expect(page.locator('aside')).toHaveCSS('width', '88px')
  const collapsedIconPosition = await equipmentIcon.boundingBox()
  expect(collapsedIconPosition?.x).toBe(expandedIconPosition?.x)

  await page.setViewportSize({ width: 390, height: 844 })
  await page.getByRole('button', { name: 'Abrir menu' }).click()
  await expect(page.locator('#menu-escritorio')).toHaveCSS('position', 'fixed')
  await expect(page.locator('#menu-escritorio')).toHaveCSS('top', '72px')
  await expect(page.locator('#menu-escritorio')).toHaveCSS('right', '0px')
  await page
    .getByRole('button', { name: 'Fechar menu ao tocar fora' })
    .click({ position: { x: 10, y: 400 } })
  await expect(page.locator('#menu-escritorio')).not.toBeVisible()
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

test('public visitor creates an organization and starts an authenticated session', async ({
  page,
}) => {
  const submittedBody = await mockPublicRegistration(page)

  await page.goto('/registro')
  await expect(
    page.getByRole('heading', { name: 'Crie sua conta Ciclera' }),
  ).toBeVisible()
  await expect(
    page.getByRole('link', { name: 'Voltar para o site' }),
  ).toHaveAttribute('href', '/')
  const createAccountButton = page.getByRole('button', {
    name: 'Criar conta',
  })
  await expect(createAccountButton).toBeDisabled()
  await expect(page.getByText('Pelo menos 10 caracteres')).toBeVisible()
  await page.getByLabel('Nome da organiza\u00e7\u00e3o').fill('Oficina E2E')
  await page.getByLabel('Seu nome').fill('Admin E2E')
  await page.getByLabel('E-mail').fill('OWNER.E2E@EXAMPLE.TEST')
  const passwordInput = page.getByLabel('Senha', { exact: true })
  await passwordInput.fill('senha-fraca')
  await expect(createAccountButton).toBeDisabled()
  await page.getByRole('button', { name: 'Mostrar senha' }).first().click()
  await expect(passwordInput).toHaveAttribute('type', 'text')
  await page.getByRole('button', { name: 'Ocultar senha' }).first().click()
  await expect(passwordInput).toHaveAttribute('type', 'password')
  await passwordInput.fill('LocalOnly!2026')
  await expect(page.getByText('5/5')).toBeVisible()
  await page.getByLabel('Confirmar senha').fill('LocalOnly!2026')
  await page.getByRole('checkbox').check()
  await expect(createAccountButton).toBeEnabled()
  await createAccountButton.click()

  await expect(page).toHaveURL(/\/app$/)
  await expect(
    page.getByRole('heading', {
      name: 'Sua organiza\u00e7\u00e3o est\u00e1 pronta para ser configurada',
    }),
  ).toBeVisible()
  expect(submittedBody()).toMatchObject({
    organizationName: 'Oficina E2E',
    ownerName: 'Admin E2E',
    email: 'owner.e2e@example.test',
    termsAccepted: true,
    termsVersion: '2026-08-17',
  })
  expect(submittedBody()).not.toHaveProperty('confirmPassword')
  expect(submittedBody()).not.toHaveProperty('timezone')
  expect(submittedBody()).not.toHaveProperty('accessToken')
  expect(
    await page.evaluate(() => ({
      local: window.localStorage.length,
      session: window.sessionStorage.length,
    })),
  ).toEqual({ local: 0, session: 0 })

  await page.goto('/registro')
  await expect(page).toHaveURL(/\/app$/)
  await expectNoCriticalAccessibilityViolations(page)
})

test('landing exposes the current authentication actions on desktop and mobile', async ({
  page,
}) => {
  await page.goto('/')
  const desktopHeader = page.getByRole('banner')
  await expect(
    desktopHeader.getByRole('link', { name: 'Entrar', exact: true }),
  ).toBeVisible()
  await expect(
    desktopHeader.getByRole('link', { name: 'Criar conta', exact: true }),
  ).toBeVisible()
  await expect(
    page
      .locator('#inicio')
      .getByRole('link', { name: 'Criar minha conta', exact: true }),
  ).toHaveAttribute('href', '/registro')
  await expect(page.locator('body')).not.toContainText(/programa piloto/i)
  await expect(page.locator('body')).not.toContainText(/solicitar acesso/i)

  await page.setViewportSize({ width: 390, height: 844 })
  await page.getByRole('button', { name: 'Abrir menu' }).click()
  const mobileNavigation = page.getByRole('navigation', {
    name: /Navega\u00e7\u00e3o m\u00f3vel/,
  })
  await expect(
    mobileNavigation.getByRole('link', { name: 'Entrar', exact: true }),
  ).toHaveAttribute('href', '/login')
  await expect(
    mobileNavigation.getByRole('link', { name: 'Criar conta', exact: true }),
  ).toHaveAttribute('href', '/registro')
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

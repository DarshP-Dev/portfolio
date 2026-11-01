import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('hydrates, navigates to drafts, returns to anchors, and handles missing routes', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Darsh Patel.',
  )
  // Keyboard focus pauses the continuously moving orbit before activation.
  await page.getByRole('link', { name: '02 VisionControl' }).focus()
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/\/projects\/visioncontrol$/)
  await expect(page).toHaveTitle('VisionControl — Darsh Patel')
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused()
  await page.getByRole('link', { name: 'Back to All Projects' }).click()
  await expect(page).toHaveURL(/\/#projects$/)
  await expect(page.locator('#projects')).toBeFocused()
  const response = await page.goto('/this-page-does-not-exist')
  expect(response?.status()).toBe(404)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'A little off course.',
  )
  // A real missing-route HTTP response may produce a browser resource error.
  expect(errors.filter((error) => !error.includes('404'))).toEqual([])
})

test('supports keyboard skip navigation', async ({ page }) => {
  await page.goto('/')
  await page.keyboard.press('Tab')
  await expect(
    page.getByRole('link', { name: 'Skip to main content' }),
  ).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.locator('main')).toBeFocused()
})

for (const width of [1440, 1280, 820, 390, 375, 320]) {
  test(`has no horizontal overflow or serious accessibility findings at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: 'dark' })
    await page.goto('/')
    await page.evaluate(() => document.fonts.ready)
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true)
    expect(
      await page
        .locator('body')
        .evaluate((element) => getComputedStyle(element).colorScheme),
    ).toBe('light')
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze()
    expect(results.violations).toEqual([])
    if (width === 1440 || width === 390) {
      await page.screenshot({ path: `.cache/phase1/home-${width}.png` })
      await page.screenshot({
        path: `.cache/phase1/home-${width}-full.png`,
        fullPage: true,
      })
    }
  })
}

test('direct project HTML works without JavaScript', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  const page = await context.newPage()
  for (const slug of [
    'personal-finance-tracker',
    'visioncontrol',
    'argus',
    'bluffhouse',
    'deenstudio',
    'pokemon-style-rpg',
    'fsm-sequence-detector',
  ]) {
    const response = await page.goto(`${baseURL}/projects/${slug}`)
    expect(response?.status()).toBe(200)
    const html = await response!.text()
    expect(html).toContain('<meta property="og:title"')
    expect(html).toContain('<meta name="description"')
    expect(html).not.toContain('<!--app-html-->')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      'content',
      'noindex, nofollow',
    )
  }
  await context.close()
})

test('project layout remains accessible on a narrow screen', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/projects/personal-finance-tracker')
  await page.evaluate(() => document.fonts.ready)
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true)
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze()
    ).violations,
  ).toEqual([])
})

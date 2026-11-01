import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('review crawlers, real share cards and raw direct-route HTML have consistent boundaries', async ({
  request,
}) => {
  expect(await (await request.get('/robots.txt')).text()).toBe(
    'User-agent: *\nDisallow: /\n',
  )
  const sitemap = await request.get('/sitemap.xml')
  expect(sitemap.status()).toBe(200)
  expect(sitemap.headers()['content-type']).toContain('application/xml')
  expect(await sitemap.text()).not.toContain('<loc>')
  const routes = [
    '/',
    '/projects/argus',
    '/projects/deenstudio',
    '/missing-quality-route',
  ]
  for (const route of routes) {
    const response = await request.get(route)
    expect(response.status()).toBe(route.startsWith('/missing') ? 404 : 200)
    const html = await response.text()
    expect(html).toContain('content="noindex, nofollow"')
    expect(html).not.toContain('rel="canonical"')
    expect(html).not.toContain('property="og:image"')
    expect(html.match(/<h1\b/g)).toHaveLength(1)
    expect(response.headers()['x-content-type-options']).toBe('nosniff')
  }
  for (const name of [
    'portfolio',
    'personal-finance-tracker',
    'visioncontrol',
    'argus',
    'bluffhouse',
    'deenstudio',
    'pokemon-style-rpg',
    'fsm-sequence-detector',
  ]) {
    const response = await request.get(`/og/${name}.png`)
    expect(response.status()).toBe(200)
    expect(response.headers()['content-type']).toBe('image/png')
    const bytes = await response.body()
    expect([bytes.readUInt32BE(16), bytes.readUInt32BE(20)]).toEqual([
      1200, 630,
    ])
  }
})

test('screenshots use responsive WebP downloads and retain original files and deferred media', async ({
  page,
  request,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  const preview = page.locator('.hero-orbit img').first()
  await expect(preview).toHaveAttribute('fetchpriority', 'high')
  await expect
    .poll(() =>
      preview.evaluate((image) => (image as HTMLImageElement).currentSrc),
    )
    .toMatch(/\.webp$/)
  await expect(page.locator('.featured-gallery img').first()).toHaveAttribute(
    'loading',
    'lazy',
  )
  await expect(page.locator('.profile-card-photo')).toHaveAttribute(
    'loading',
    'lazy',
  )
  await page.goto('/projects/argus')
  const image = page.locator('.case-media-stage img')
  await expect(image).toHaveAttribute('loading', 'eager')
  await expect
    .poll(() =>
      image.evaluate((element) => (element as HTMLImageElement).currentSrc),
    )
    .toMatch(/\.webp$/)
  const selected = await image.evaluate(
    (element) => (element as HTMLImageElement).currentSrc,
  )
  const optimized = await request.get(selected)
  const original = await request.get('/images/projects/argus/hub.png')
  expect((await optimized.body()).length).toBeLessThan(
    (await original.body()).length / 2,
  )
  await expect(image).toHaveAttribute('src', '/images/projects/argus/hub.png')
  expect(await page.locator('video[autoplay]').count()).toBe(0)
})

for (const width of [1440, 390]) {
  test(`core pages meet WCAG 2.1 label and contrast rules at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    for (const route of ['/#contact', '/projects/argus']) {
      await page.goto(route)
      expect(
        (
          await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
            .analyze()
        ).violations,
      ).toEqual([])
    }
  })
}

test('320px reflow with forced colors retains keyboard navigation, receipt and form focus', async ({
  page,
}) => {
  // 320 CSS px also models the reflow width of a 1280px desktop at 400% page zoom.
  await page.setViewportSize({ width: 320, height: 900 })
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' })
  await page.goto('/')
  const menu = page.locator('.menu-toggle')
  await menu.focus()
  await page.keyboard.press('Enter')
  const contact = page
    .getByRole('navigation', { name: 'Main navigation' })
    .getByRole('link', { name: 'Contact', exact: true })
  await contact.focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('#contact')).toBeFocused()
  const email = page.getByLabel('FROM:', { exact: true })
  await email.focus()
  await email.fill('test@example.com')
  await expect(email).toBeFocused()
  await expect(email).toHaveCSS('outline-style', 'solid')
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true)
  await page.screenshot({ path: '.cache/phase6/contact-forced-colors-320.png' })
})

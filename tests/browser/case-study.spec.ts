import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('real gallery supports selection, a modal, zoom, keyboard navigation and focus restoration', async ({
  page,
}) => {
  await page.setViewportSize({ width: 900, height: 800 })
  await page.goto('/projects/pokemon-style-rpg')
  const stage = page.locator('.case-media-stage')
  const height = (await stage.boundingBox())!.height
  await page.getByRole('button', { name: 'Next media', exact: true }).click()
  await expect(stage.getByRole('img')).toHaveAttribute('src', /starter.png$/)
  expect((await stage.boundingBox())!.height).toBeCloseTo(height, 0)
  await page.getByRole('button', { name: 'Enlarge image' }).click()
  const dialog = page.getByRole('dialog', { name: 'Pokémon-style RPG — media' })
  await expect(dialog).toBeVisible()
  await expect(
    dialog.getByRole('button', { name: 'Close viewer' }),
  ).toBeFocused()
  await page.keyboard.press('Control+k')
  await expect(
    page.getByRole('dialog', { name: 'Quick navigate' }),
  ).toBeHidden()
  await page.keyboard.press('ArrowRight')
  await expect(dialog.getByRole('img')).toHaveAttribute('src', /battle.png$/)
  await dialog.getByRole('button', { name: 'Zoom image' }).click()
  const zoom = dialog.getByRole('region', {
    name: 'Zoomed image; scroll to explore',
  })
  expect(
    await zoom.evaluate(
      (el) =>
        el.scrollWidth > el.clientWidth || el.scrollHeight > el.clientHeight,
    ),
  ).toBe(true)
  await zoom.focus()
  await page.keyboard.press('ArrowLeft')
  await expect(dialog.getByRole('img')).toHaveAttribute('src', /battle.png$/)
  await dialog.getByRole('button', { name: 'Fit image' }).click()
  for (let index = 0; index < 8; index++) {
    await page.keyboard.press('Tab')
    expect(
      await page.evaluate(
        () => !!document.activeElement?.closest('.media-dialog'),
      ),
    ).toBe(true)
  }
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze()
    ).violations,
  ).toEqual([])
  await page.screenshot({ path: '.cache/phase4/gallery-desktop.png' })
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
  await expect(
    page.getByRole('button', { name: 'Enlarge image' }),
  ).toBeFocused()
})

test('gallery recovers from a broken image and supports single/pending media states', async ({
  page,
}) => {
  await page.route(/\/pokemon-style-rpg\/world(?:\.png|-\d+\.webp)$/, (route) =>
    route.abort(),
  )
  await page.goto('/projects/pokemon-style-rpg')
  await expect(page.getByText('This media could not be loaded.')).toBeVisible()
  await page.getByRole('button', { name: 'Next media', exact: true }).click()
  await expect(page.locator('.case-media-stage img')).toHaveAttribute(
    'src',
    /starter.png$/,
  )
  await expect(page.getByText('This media could not be loaded.')).toBeHidden()
  await page.goto('/projects/visioncontrol')
  await expect(page.locator('.case-media-stage img')).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Next media', exact: true }),
  ).toHaveCount(0)
  await page.goto('/projects/personal-finance-tracker')
  await expect(
    page.getByText(
      'Original screenshots or a demo will be added after review.',
    ),
  ).toBeVisible()
  await expect(page.getByRole('button', { name: 'Enlarge image' })).toHaveCount(
    0,
  )
})

test('team credits, export facts and genuine external links are explicit', async ({
  page,
}) => {
  await page.goto('/projects/argus')
  await expect(
    page.getByRole('heading', { name: 'My contribution' }),
  ).toBeVisible()
  await expect(page.locator('.case-contribution')).toContainText(
    'Munadir was primarily responsible for the core AI agent',
  )
  await expect(
    page.getByRole('link', { name: /Open web demo \(replay\)/ }),
  ).toHaveAttribute('href', 'https://argus-eta-pink.vercel.app/')
  await expect(
    page.getByRole('link', { name: /Read the Devpost submission/ }),
  ).toHaveAttribute('href', 'https://devpost.com/software/argus-9lo42s')
  await page.screenshot({ path: '.cache/phase4/argus-desktop.png' })
  await page.goto('/projects/deenstudio')
  await expect(page.locator('.case-contribution')).toContainText(
    'Munadir handled a substantial amount',
  )
  await expect(
    page.getByRole('heading', { name: 'WebM recording', exact: true }),
  ).toBeVisible()
  await expect(
    page.getByRole('link', { name: /Open DeenStudio/ }),
  ).toHaveAttribute('href', 'https://deen-studio.vercel.app/')
  await page.screenshot({ path: '.cache/phase4/deenstudio-desktop.png' })
  await page.goto('/projects/bluffhouse')
  await expect(page.locator('.case-external-links a')).toHaveCount(2)
  await expect(page.locator('.case-external-links a').first()).toHaveAttribute(
    'rel',
    'noopener noreferrer',
  )
  await expect(page.locator('main')).not.toContainText('Interval')
})

test('architecture and deep dives work with keyboard and remain in natural page flow', async ({
  page,
}) => {
  await page.goto('/projects/personal-finance-tracker')
  await page
    .getByRole('navigation', { name: 'On this page' })
    .getByRole('link', { name: 'Under the hood' })
    .click()
  await expect(
    page.locator('#personal-finance-tracker-architecture'),
  ).toBeFocused()
  const heading = await page.locator('#architecture-heading').boundingBox()
  const header = await page.locator('.navigation-header').boundingBox()
  expect(heading!.y).toBeGreaterThan(header!.height)
  const button = page.getByRole('button', { name: /Spring Boot services/ })
  await button.focus()
  await page.keyboard.press('Enter')
  await expect(
    page.locator('.architecture-descriptions > div').nth(1),
  ).toHaveAttribute('data-active', 'true')
  await expect(page.locator('.architecture-descriptions > div')).toHaveCount(3)
  await page.locator('.case-deep-dives summary').focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('.case-deep-dives details')).toHaveAttribute(
    'open',
    '',
  )
  await expect(page.locator('.home-sections')).toHaveCount(0)
  await page.screenshot({ path: '.cache/phase4/architecture-desktop.png' })
})

for (const type of ['link', 'history', 'refresh', 'blocked-storage'] as const) {
  test(`restores project-list position and source focus through ${type}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    if (type === 'blocked-storage')
      await page.addInitScript(() =>
        Object.defineProperty(window, 'sessionStorage', {
          get() {
            throw Error('blocked')
          },
        }),
      )
    await page.goto('/#projects')
    await page.evaluate(() => document.fonts.ready)
    const source = page.locator('[data-project-return="gallery:visioncontrol"]')
    await source.focus()
    const y = await page.evaluate(() => scrollY)
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(/\/projects\/visioncontrol$/)
    if (type === 'refresh') await page.reload()
    if (type === 'history') {
      await page.getByRole('button', { name: 'Enlarge image' }).click()
      await page.goBack()
    } else
      await page.getByRole('link', { name: 'Back to All Projects' }).click()
    await expect(source).toBeFocused()
    await expect
      .poll(() => page.evaluate((position) => Math.abs(scrollY - position), y))
      .toBeLessThan(4)
  })
}

test('direct entry falls back to Projects, next-case navigation preserves a captured return, and resized returns stay usable', async ({
  page,
}) => {
  await page.goto('/projects/argus')
  await page.getByRole('link', { name: 'Back to All Projects' }).click()
  await expect(page.locator('#projects')).toBeFocused()
  const source = page.locator('[data-project-return="gallery:argus"]')
  await source.focus()
  await page.keyboard.press('Enter')
  await page.locator('.next-project-link').click()
  await expect(page).toHaveURL(/\/projects\/bluffhouse$/)
  await page.setViewportSize({ width: 390, height: 844 })
  await page.getByRole('link', { name: 'Back to All Projects' }).click()
  await expect(source).toBeFocused()
  await expect(source).toBeInViewport()
})

for (const width of [1440, 390, 320]) {
  test(`case study and modal have accessible reflow at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/projects/pokemon-style-rpg')
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true)
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
          .analyze()
      ).violations,
    ).toEqual([])
    await page.screenshot({
      path: `.cache/phase4/case-${width}.png`,
      fullPage: true,
    })
    await page.getByRole('button', { name: 'Enlarge image' }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    const box = (await page.getByRole('dialog').boundingBox())!
    const viewport = await page.evaluate(() => ({
      width: document.body.getBoundingClientRect().width,
      height: innerHeight,
    }))
    expect(box.x).toBeCloseTo((viewport.width - box.width) / 2, 0)
    expect(box.y).toBeCloseTo((viewport.height - box.height) / 2, 0)
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
          .analyze()
      ).violations,
    ).toEqual([])
    await page.screenshot({ path: `.cache/phase4/viewer-${width}.png` })
  })
}

test('text zoom reflows long case-study headings and disclosures', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 900 })
  await page.goto('/projects/personal-finance-tracker')
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '200%'
  })
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true)
  await page.getByText('Sources & review status', { exact: true }).click()
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true)
})

test('prerendered cases expose stories, media and distinct metadata without JavaScript', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  const page = await context.newPage()
  await page.goto(`${baseURL}/projects/pokemon-style-rpg`)
  await page.getByText('More project media', { exact: true }).click()
  await expect(page.locator('.media-nojs a')).toHaveCount(2)
  await expect(
    page.getByRole('heading', { name: 'Engineering challenges', exact: true }),
  ).toBeVisible()
  await page.getByText('Sources & review status', { exact: true }).click()
  await expect(
    page.getByRole('link', { name: /README and project media/ }),
  ).toBeVisible()
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute(
    'content',
    'article',
  )
  await context.close()
})

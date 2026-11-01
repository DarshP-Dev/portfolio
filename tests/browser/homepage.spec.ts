import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('desktop orbit moves upright, pauses on demand and focus, and stops when covered', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  const orbit = page.locator('.hero-work')
  await expect(orbit).toHaveAttribute('data-orbit', 'playing')
  const card = page.locator('.hero-orbit li').first()
  const initial = await card.boundingBox()
  await expect
    .poll(async () => Math.abs((await card.boundingBox())!.x - initial!.x))
    .toBeGreaterThan(4)
  await page.getByRole('button', { name: 'Pause orbit' }).click()
  await expect(orbit).toHaveAttribute('data-orbit', 'paused')
  const paused = await card.boundingBox()
  await page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  )
  expect(await card.boundingBox()).toEqual(paused)
  const boxes = await page.locator('.hero-orbit li').evaluateAll((items) =>
    items.map((item) => {
      const r = item.getBoundingClientRect()
      return {
        left: r.left,
        right: r.right,
        top: r.top,
        bottom: r.bottom,
        transform: getComputedStyle(item.querySelector('a')!).transform,
      }
    }),
  )
  for (let i = 0; i < boxes.length; i++) {
    expect(boxes[i].transform).toBe('none')
    for (let j = i + 1; j < boxes.length; j++)
      expect(
        boxes[i].right <= boxes[j].left ||
          boxes[j].right <= boxes[i].left ||
          boxes[i].bottom <= boxes[j].top ||
          boxes[j].bottom <= boxes[i].top,
      ).toBe(true)
  }
  await page.screenshot({ path: '.cache/phase3/hero-desktop.png' })
  await page.getByRole('button', { name: 'Resume orbit' }).click()
  await page.getByRole('link', { name: '02 VisionControl' }).focus()
  await expect(orbit).toHaveAttribute('data-orbit', 'paused')
  await page
    .getByRole('link', { name: '02 VisionControl' })
    .evaluate((link) => (link as HTMLElement).blur())
  await page.mouse.move(1, 1)
  await expect(orbit).toHaveAttribute('data-orbit', 'playing')
  await page.evaluate(() => scrollTo(0, 1600))
  await expect(orbit).toHaveAttribute('data-orbit', 'paused')
})

test('desktop gallery expands on focus and pointer, and first activation opens the case study', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/#projects')
  const panels = page.locator('.featured-gallery > li')
  const first = panels.first()
  await first.getByRole('link').focus()
  await expect(first).toHaveAttribute('data-active', 'true')
  await expect
    .poll(async () => (await first.boundingBox())!.width)
    .toBeGreaterThan(400)
  await page.screenshot({ path: '.cache/phase3/projects-desktop.png' })
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/\/projects\/personal-finance-tracker$/)
  await page.goBack()
  // No expand-only click handler: this inactive link still opens on its first click.
  // Return restoration keeps focus on the source link; release it before testing pointer hover.
  await page
    .locator('.featured-gallery a')
    .first()
    .evaluate((link) => (link as HTMLElement).blur())
  const last = page.locator('.featured-gallery > li').last()
  await last.hover()
  await expect(last).toHaveAttribute('data-active', 'true')
  await last.getByRole('link').click()
  await expect(page).toHaveURL(/\/projects\/deenstudio$/)
})

test('mobile previews use a manual horizontal row, while the gallery stays vertically stacked', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await expect(page.getByRole('button', { name: 'Pause orbit' })).toBeHidden()
  const row = page.locator('.hero-orbit')
  expect(await row.evaluate((el) => el.scrollWidth > el.clientWidth)).toBe(true)
  await page.getByRole('button', { name: 'Next project preview' }).click()
  await expect(
    page.getByRole('link', { name: '02 VisionControl' }),
  ).toBeFocused()
  expect(await row.evaluate((el) => el.scrollLeft)).toBeGreaterThan(100)
  await page.getByRole('button', { name: 'Previous project preview' }).click()
  await expect(
    page.getByRole('link', {
      name: '01 Screenshot pending Personal Finance Tracker',
    }),
  ).toBeFocused()
  await page.screenshot({ path: '.cache/phase3/hero-mobile.png' })
  const cards = page.locator('.featured-gallery > li')
  const first = await cards.nth(0).boundingBox()
  const second = await cards.nth(1).boundingBox()
  expect(second!.y).toBeGreaterThan(first!.y + first!.height)
  expect(first!.width).toBeGreaterThan(330)
  await cards.first().getByRole('link').click()
  await expect(page).toHaveURL(/\/projects\/personal-finance-tracker$/)
})

test('profile and skills interactions remain modest and the semantic grid stays available', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/#about')
  const profile = page.locator('.profile-card')
  await profile.hover({ position: { x: 40, y: 70 } })
  await expect
    .poll(() =>
      profile.evaluate((el) =>
        parseFloat(el.style.getPropertyValue('--pc-active')),
      ),
    )
    .toBeGreaterThan(0.5)
  await page.screenshot({ path: '.cache/phase3/about-desktop.png' })
  await profile.getByRole('link', { name: 'Contact Me' }).click()
  await expect(page.locator('#contact')).toBeFocused()
  await page.goto('/#skills')
  await page.getByRole('button', { name: 'Languages', exact: true }).focus()
  await expect(page.locator('.constellation-cluster').first()).toHaveAttribute(
    'data-active',
    'true',
  )
  await expect(
    page.locator('.constellation-lines path').first(),
  ).toHaveAttribute('data-active', 'true')
  await expect(
    page.locator('.skills-grid').getByRole('heading', { name: 'Languages' }),
  ).toBeVisible()
  await page.screenshot({ path: '.cache/phase3/skills-desktop.png' })
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze()
    ).violations,
  ).toEqual([])
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(page.locator('.skills-constellation')).toBeHidden()
  await expect(page.locator('.profile-card-body')).toHaveCSS(
    'transform',
    'matrix(1, 0, 0, 1, 0, 0)',
  )
  await expect(page.locator('.home-sections')).not.toHaveAttribute(
    'data-stacking',
  )
})

test('timeline disclosure resizes the live line, tracks both scroll directions, and has a static reduced-motion path', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/#experience')
  const root = page.locator('.editorial-timeline')
  const length = () =>
    root.evaluate((el) =>
      parseFloat(el.style.getPropertyValue('--journey-length')),
    )
  const initial = await length()
  const summary = page.getByText('What’s being prepared', { exact: false })
  await summary.focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('.timeline-details')).toHaveAttribute('open', '')
  await expect.poll(length).toBeGreaterThan(initial + 80)
  expect(
    await root.evaluate(
      (el) =>
        parseFloat(el.style.getPropertyValue('--journey-length')) ===
        (el.lastElementChild as HTMLElement).offsetTop,
    ),
  ).toBe(true)
  await page.screenshot({ path: '.cache/phase3/journey-desktop.png' })
  await page.evaluate(() => scrollBy(0, 250))
  const progress = await root.evaluate((el) =>
    parseFloat(el.style.getPropertyValue('--journey-progress')),
  )
  await page.evaluate(() => scrollBy(0, -450))
  await expect
    .poll(() =>
      root.evaluate((el) =>
        parseFloat(el.style.getPropertyValue('--journey-progress')),
      ),
    )
    .toBeLessThan(progress)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect
    .poll(() =>
      root.evaluate(
        (el) =>
          el.style.getPropertyValue('--journey-progress') ===
          el.style.getPropertyValue('--journey-length'),
      ),
    )
    .toBe(true)
})

test('natural-height desktop stacking leaves the bottom of long sections reachable and releases for keyboard focus', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 800 })
  await page.goto('/')
  await expect(page.locator('.home-sections')).toHaveAttribute(
    'data-stacking',
    'active',
  )
  expect(
    await page.locator('#projects').evaluate((el) => el.clientHeight),
  ).toBeGreaterThan(800)
  const last = page.locator('.supporting-project').last()
  await page.evaluate(() => {
    const section = document.querySelector('#projects')!
    const wrapper = section.closest('.stack-section') as HTMLElement
    scrollTo(0, wrapper.offsetTop + wrapper.offsetHeight - innerHeight + 30)
  })
  await expect(last).toBeInViewport()
  expect(
    await last.evaluate((el) => {
      const r = el.getBoundingClientRect()
      return el.contains(
        document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2),
      )
    }),
  ).toBe(true)
  await last.focus()
  await expect(page.locator('.home-sections')).toHaveAttribute(
    'data-stacking',
    'focus',
  )
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/\/projects\/fsm-sequence-detector$/)
  await expect(page.locator('.home-sections')).toHaveCount(0)
  await page.goBack()
  await page.setViewportSize({ width: 820, height: 900 })
  await expect(page.locator('.home-sections')).not.toHaveAttribute(
    'data-stacking',
  )
})

test('homepage remains readable at 200% text and 320px reflow width', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 900 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '200%'
  })
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true)
  await page.screenshot({ path: '.cache/phase3/text-200-mobile.png' })
  await page.evaluate(() => {
    document.documentElement.style.fontSize = ''
  })
  await page.setViewportSize({ width: 320, height: 900 })
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true)
})

test('homepage HTML offers gallery links, a readable skills grid, and native disclosures without JavaScript', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  })
  const page = await context.newPage()
  await page.goto(baseURL!)
  await expect(page.locator('.featured-gallery').getByRole('link')).toHaveCount(
    5,
  )
  await expect(page.locator('.skills-grid').getByRole('heading')).toHaveCount(6)
  await page.locator('.timeline-details summary').click()
  await expect(
    page.getByText('No unverified employment or graduation dates are listed.'),
  ).toBeVisible()
  await page.locator('.featured-gallery').getByRole('link').first().click()
  await expect(page).toHaveURL(/\/projects\/personal-finance-tracker$/)
  await context.close()
})

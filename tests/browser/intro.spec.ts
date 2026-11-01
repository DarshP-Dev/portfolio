import { test, expect } from '@playwright/test'

test.use({ video: { mode: 'on', size: { width: 1280, height: 720 } } })

test('homepage stays direct while the prototype awaits approval', async ({
  page,
}) => {
  await page.goto('/')
  await expect(
    page.getByRole('dialog', { name: 'Signature introduction' }),
  ).not.toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Replay intro' }),
  ).not.toBeVisible()
})

test('prototype follows all stages and hands off to the real hero', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.addInitScript(() => {
    const stages: string[] = []
    const observer = new MutationObserver(() => {
      const stage = document
        .querySelector('.signature-intro')
        ?.getAttribute('data-stage')
      if (stage && stages.at(-1) !== stage) stages.push(stage)
      document.documentElement.dataset.introStages = stages.join(',')
    })
    observer.observe(document, {
      subtree: true,
      attributes: true,
      attributeFilter: ['data-stage'],
      childList: true,
    })
  })
  await page.goto('/?intro=preview')
  const dialog = page.getByRole('dialog', { name: 'Signature introduction' })
  await expect(dialog).toBeVisible()
  await page.evaluate(() => document.fonts.ready)
  const initialHeroBox = await page.locator('#hero-name').boundingBox()
  // The beginning of D is pulled in before the end of P moves. This distinguishes
  // unwinding one thread from rotating or morphing the whole monogram at once.
  await page.waitForFunction(
    () => {
      const path = document.querySelector<SVGPathElement>('.intro-canvas path')
      if (
        !path ||
        document
          .querySelector('.signature-intro')
          ?.getAttribute('data-stage') !== 'spiral'
      )
        return false
      const head = path.getPointAtLength(0)
      const tail = path.getPointAtLength(path.getTotalLength())
      return (
        Math.hypot(head.x - 348, head.y - 190) > 15 &&
        Math.hypot(tail.x - 584, tail.y - 143) < 1
      )
    },
    undefined,
    { polling: 'raf', timeout: 5000 },
  )
  await page.screenshot({ path: '.cache/phase2/intro-thread-unwinding.png' })
  const earlyAngle = await page
    .locator('.intro-canvas path')
    .evaluate((element) => {
      const path = element as SVGPathElement
      const head = path.getPointAtLength(0)
      const next = path.getPointAtLength(8)
      return Math.atan2(next.y - head.y, next.x - head.x)
    })
  await page.waitForFunction(
    (previousAngle) => {
      const path = document.querySelector<SVGPathElement>('.intro-canvas path')
      if (
        !path ||
        document
          .querySelector('.signature-intro')
          ?.getAttribute('data-stage') !== 'spiral'
      )
        return false
      const head = path.getPointAtLength(0)
      const next = path.getPointAtLength(8)
      const tail = path.getPointAtLength(path.getTotalLength())
      const angle = Math.atan2(next.y - head.y, next.x - head.x)
      const difference = Math.atan2(
        Math.sin(angle - previousAngle),
        Math.cos(angle - previousAngle),
      )
      return (
        Math.abs(difference) > 0.9 && Math.hypot(tail.x - 584, tail.y - 143) < 1
      )
    },
    earlyAngle,
    { polling: 'raf', timeout: 5000 },
  )
  await page.screenshot({ path: '.cache/phase2/intro-coil-spinning.png' })
  await page.waitForFunction(
    () =>
      document.querySelector('.signature-intro')?.getAttribute('data-stage') ===
      'point',
    undefined,
    { polling: 'raf', timeout: 7000 },
  )
  const pointBox = await page.locator('.intro-canvas path').boundingBox()
  expect(pointBox!.width).toBeLessThan(8)
  await page.screenshot({ path: '.cache/phase2/intro-tiny-point.png' })
  await page.waitForFunction(
    () =>
      document.querySelector('.signature-intro')?.getAttribute('data-stage') ===
      'ball',
    undefined,
    { polling: 'raf', timeout: 7000 },
  )
  const ballBox = await page.locator('.intro-canvas path').boundingBox()
  expect(ballBox!.width).toBeGreaterThan(pointBox!.width * 5)
  await page.screenshot({ path: '.cache/phase2/intro-ball.png' })
  await page.waitForFunction(
    () =>
      document.querySelector('.signature-intro')?.getAttribute('data-stage') ===
      'handoff',
    undefined,
    { polling: 'raf', timeout: 5000 },
  )
  await expect(page.locator('.hero-description')).toHaveCSS('opacity', '0')
  await expect(page.locator('.hero-description')).toHaveCSS(
    'filter',
    'blur(3px)',
  )
  await expect(dialog).toHaveCSS('background-color', 'rgb(250, 250, 248)')
  await page.waitForFunction(
    () =>
      document.querySelector('.signature-intro')?.getAttribute('data-stage') ===
      'reveal',
    undefined,
    { polling: 'raf', timeout: 3000 },
  )
  const landedCanvas = await page.locator('.intro-canvas').boundingBox()
  const landedName = await page.locator('.hero-wordmark').boundingBox()
  for (const coordinate of ['x', 'y', 'width', 'height'] as const) {
    expect(
      Math.abs(landedCanvas![coordinate] - landedName![coordinate]),
    ).toBeLessThan(1)
  }
  await expect(dialog).not.toBeVisible({ timeout: 10000 })
  const stages =
    (await page.locator('html').getAttribute('data-intro-stages')) || ''
  for (const stage of [
    'trace',
    'spiral',
    'point',
    'pop',
    'ball',
    'name',
    'handoff',
    'reveal',
  ])
    expect(stages).toContain(stage)
  await expect(page.locator('#hero-name')).toBeVisible()
  expect(await page.locator('#hero-name').boundingBox()).toEqual(initialHeroBox)
  await expect(page.locator('.hero-wordmark')).toHaveCSS('opacity', '1')
  await expect(page.getByRole('link', { name: 'View Projects' })).toBeVisible()
  expect(errors).toEqual([])
  await page.reload()
  await expect(
    page.getByRole('dialog', { name: 'Signature introduction' }),
  ).not.toBeVisible()
  await page.getByRole('button', { name: 'Replay intro' }).click()
  await expect(dialog).toBeVisible()
  await page.getByRole('button', { name: 'Skip Intro' }).click()
  await expect(dialog).not.toBeVisible()
  const video = page.video()
  await page.context().close()
  if (video) await video.saveAs('.cache/phase2/intro-prototype.webm')
})

test('Escape skips immediately and returning from a case study never replays', async ({
  page,
}) => {
  await page.goto('/?intro=preview')
  await expect(page.getByRole('button', { name: 'Skip Intro' })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(
    page.getByRole('dialog', { name: 'Signature introduction' }),
  ).not.toBeVisible()
  // Keyboard focus pauses the continuously moving orbit before activation.
  await page.getByRole('link', { name: '02 VisionControl' }).focus()
  await page.keyboard.press('Enter')
  await page.getByRole('link', { name: 'Back to All Projects' }).click()
  await expect(
    page.getByRole('dialog', { name: 'Signature introduction' }),
  ).not.toBeVisible()
})

test('reduced motion bypasses the prototype and keyboard navigation stays available', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/?intro=preview')
  await expect(
    page.getByRole('dialog', { name: 'Signature introduction' }),
  ).not.toBeVisible()
  await page.getByRole('button', { name: 'Replay intro' }).click()
  await expect(
    page.getByRole('status').filter({ hasText: 'Reduced motion' }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Search' }).click()
  await expect(
    page.getByRole('combobox', { name: 'Search pages and actions' }),
  ).toBeFocused()
})

test('blocked session storage does not trap the page or replay within the document', async ({
  page,
}) => {
  await page.addInitScript(() =>
    Object.defineProperty(window, 'sessionStorage', {
      get: () => {
        throw new Error('Blocked')
      },
    }),
  )
  await page.goto('/?intro=preview')
  await expect(page.getByRole('button', { name: 'Skip Intro' })).toBeVisible()
  await page.getByRole('button', { name: 'Skip Intro' }).click()
  // Keyboard focus pauses the continuously moving orbit before activation.
  await page.getByRole('link', { name: '02 VisionControl' }).focus()
  await page.keyboard.press('Enter')
  await page.getByRole('link', { name: 'Back to All Projects' }).click()
  await expect(
    page.getByRole('dialog', { name: 'Signature introduction' }),
  ).not.toBeVisible()
})

test('animation import failure exposes the homepage', async ({ page }) => {
  await page.route('**/*MorphSVGPlugin*', (route) => route.abort())
  await page.goto('/?intro=preview')
  await expect
    .poll(() =>
      page.evaluate(() =>
        sessionStorage.getItem('darsh-portfolio.signature-intro.v1'),
      ),
    )
    .toBe('seen')
  await expect(
    page.getByRole('dialog', { name: 'Signature introduction' }),
  ).not.toBeVisible({ timeout: 7000 })
  await expect(page.getByRole('link', { name: 'View Projects' })).toBeVisible()
  await expect(page.locator('.hero-wordmark')).toHaveCSS('opacity', '1')
})

test('phone sequence preserves the hero layout and reduced motion can interrupt it', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/?intro=preview')
  const dialog = page.getByRole('dialog', { name: 'Signature introduction' })
  await expect(dialog).toBeVisible()
  await page.evaluate(() => document.fonts.ready)
  const before = await page.locator('#hero-name').boundingBox()
  await expect(dialog).not.toBeVisible({ timeout: 10000 })
  expect(await page.locator('#hero-name').boundingBox()).toEqual(before)
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true)
  await page.screenshot({ path: '.cache/phase2/intro-phone-end.png' })
  await page.getByRole('button', { name: 'Replay intro' }).click()
  await expect(dialog).toBeVisible()
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(dialog).not.toBeVisible()
  await expect(page.locator('.hero-wordmark')).toHaveCSS('opacity', '1')
})

test('a stalled animation dependency cannot leave the page trapped', async ({
  page,
}) => {
  await page.addInitScript(() => {
    document.fonts.load = () => new Promise<FontFace[]>(() => {})
  })
  await page.goto('/?intro=preview')
  const dialog = page.getByRole('dialog', { name: 'Signature introduction' })
  await expect(dialog).toBeVisible()
  await expect(dialog).not.toBeVisible({ timeout: 13000 })
  await expect(page.getByRole('link', { name: 'View Projects' })).toBeVisible()
})

test('Back/Forward during a replay cannot start a second intro on return', async ({
  page,
}) => {
  await page.goto('/?intro=preview')
  await page.getByRole('button', { name: 'Skip Intro' }).click()
  // Keyboard focus pauses the continuously moving orbit before activation.
  await page.getByRole('link', { name: '02 VisionControl' }).focus()
  await page.keyboard.press('Enter')
  await page.goBack()
  await page.getByRole('button', { name: 'Replay intro' }).click()
  await expect(
    page.getByRole('dialog', { name: 'Signature introduction' }),
  ).toBeVisible()
  await page.goForward()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'VisionControl',
  )
  await page.goBack()
  await expect(
    page.getByRole('dialog', { name: 'Signature introduction' }),
  ).not.toBeVisible()
  await expect(page.getByRole('link', { name: 'View Projects' })).toBeVisible()
})

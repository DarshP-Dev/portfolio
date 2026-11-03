import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('local preview serves seekable MP4 byte ranges', async ({ request }) => {
  const path = '/videos/projects/personal-finance-tracker/walkthrough-demo.mp4'
  const head = await request.head(path)
  const size = Number(head.headers()['content-length'])
  expect(size).toBeGreaterThan(0)
  expect(head.headers()['accept-ranges']).toBe('bytes')
  for (const range of ['bytes=0-31', 'bytes=-32', `bytes=${size - 32}-`]) {
    const response = await request.get(path, { headers: { Range: range } })
    expect(response.status()).toBe(206)
    expect(response.headers()['content-type']).toBe('video/mp4')
    expect(response.headers()['content-range']).toMatch(new RegExp(`/${size}$`))
    expect((await response.body()).length).toBe(32)
  }
  const invalid = await request.get(path, {
    headers: { Range: `bytes=${size}-` },
  })
  expect(invalid.status()).toBe(416)
  expect(invalid.headers()['content-range']).toBe(`bytes */${size}`)
})

for (const width of [1440, 390]) {
  test(`approved Finance Tracker media displays accessibly at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    await page.goto('/projects/personal-finance-tracker')
    await expect(
      page.getByText('Draft case study', { exact: false }).first(),
    ).toBeVisible()
    await expect(page.locator('.case-summary')).toContainText(
      'synthetic demonstration data',
    )
    await expect(
      page
        .locator('.case-deep-dives summary')
        .filter({ hasText: 'About the demonstration' }),
    ).toBeVisible()
    const gallery = page.locator('.case-media-gallery')
    const buttons = gallery.locator('.media-selector button')
    await expect(buttons).toHaveCount(7)
    await expect(gallery.locator('.case-media-stage img')).toHaveAttribute(
      'src',
      /01-dashboard.png$/,
    )
    for (let index = 0; index < 6; index++) {
      await buttons.nth(index).focus()
      await page.keyboard.press('Enter')
      const image = gallery.locator('.case-media-stage img')
      await expect(image).toHaveAttribute('alt', /.+/)
      await expect(image).toHaveAttribute('srcset', /1920.webp 1920w/)
      await expect
        .poll(() => image.evaluate((i) => (i as HTMLImageElement).naturalWidth))
        .toBeGreaterThan(0)
      expect(
        await image.evaluate((i) => (i as HTMLImageElement).currentSrc),
      ).toMatch(/\.webp$/)
    }
    await page.getByRole('button', { name: 'Enlarge image' }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await dialog.getByRole('button', { name: 'Zoom image' }).click()
    await expect(
      dialog.getByRole('region', { name: 'Zoomed image; scroll to explore' }),
    ).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(
      page.getByRole('button', { name: 'Enlarge image' }),
    ).toBeFocused()
    await buttons.nth(6).click()
    const video = gallery.locator('.case-media-stage video')
    await expect(video).toHaveAttribute('preload', 'none')
    await expect(video).toHaveAttribute('poster', /walkthrough-poster.webp$/)
    await expect(video).not.toHaveAttribute('autoplay')
    await video.evaluate((v) => (v as HTMLVideoElement).play())
    await expect
      .poll(() => video.evaluate((v) => (v as HTMLVideoElement).currentTime))
      .toBeGreaterThan(0)
    await expect
      .poll(() =>
        video.evaluate(
          (v) => (v as HTMLVideoElement).textTracks[0]?.cues?.length,
        ),
      )
      .toBe(8)
    expect(
      await video.evaluate((v) => (v as HTMLVideoElement).duration),
    ).toBeCloseTo(67, 1)
    await video.evaluate(
      (v) =>
        new Promise<void>((resolve) => {
          const player = v as HTMLVideoElement
          player.pause()
          player.addEventListener('seeked', () => resolve(), { once: true })
          player.currentTime = 62
        }),
    )
    expect(
      await video.evaluate((v) => (v as HTMLVideoElement).currentTime),
    ).toBeCloseTo(62, 0)
    await expect
      .poll(() => video.evaluate((v) => (v as HTMLVideoElement).readyState))
      .toBeGreaterThanOrEqual(2)
    await video.screenshot({
      path: `.cache/finance-integration/video-${width}.png`,
    })
    await page.getByRole('button', { name: 'Open video viewer' }).click()
    await expect(dialog.locator('video')).toHaveAttribute(
      'src',
      /walkthrough-demo.mp4$/,
    )
    await page.keyboard.press('Escape')
    await buttons.nth(0).click()
    await gallery.locator('.case-media-stage').scrollIntoViewIfNeeded()
    await page.screenshot({
      path: `.cache/finance-integration/gallery-${width}.png`,
    })
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
    expect(errors).toEqual([])
  })
}

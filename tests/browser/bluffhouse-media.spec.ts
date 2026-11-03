import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

for (const width of [1440, 390]) {
  test(`Bluff House authentic media loads and plays accessibly at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/projects/bluffhouse')
    await expect(
      page.getByText('development draft', { exact: false }).first(),
    ).toBeVisible()
    const gallery = page.locator('.case-media-gallery')
    const selectors = gallery.locator('.media-selector button')
    await expect(selectors).toHaveCount(6)
    for (let index = 0; index < 5; index++) {
      await selectors.nth(index).click()
      const image = gallery.locator('.case-media-stage img')
      await expect(image).toHaveAttribute('alt', /.+/)
      await expect
        .poll(() =>
          image.evaluate((image) => (image as HTMLImageElement).naturalWidth),
        )
        .toBeGreaterThan(0)
      await expect(image).toHaveAttribute('srcset', /480\.webp 480w/)
    }
    await selectors.nth(1).click()
    await page.getByRole('button', { name: 'Enlarge image' }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(
      page.getByRole('button', { name: 'Enlarge image' }),
    ).toBeFocused()
    await selectors.nth(5).click()
    const video = gallery.locator('.case-media-stage video')
    await expect(video).toHaveAttribute('preload', 'none')
    await expect(video).toHaveAttribute('poster', /gameplay-poster.webp$/)
    await expect(gallery.locator('figcaption')).toContainText(
      'Four automated browser sessions',
    )
    await video.evaluate((video) => (video as HTMLVideoElement).play())
    await expect
      .poll(() =>
        video.evaluate(
          (video) =>
            (video as HTMLVideoElement).getVideoPlaybackQuality()
              .totalVideoFrames,
        ),
      )
      .toBeGreaterThan(0)
    await expect
      .poll(() =>
        video.evaluate((video) => (video as HTMLVideoElement).currentTime),
      )
      .toBeGreaterThan(0)
    await expect
      .poll(() =>
        video.evaluate(
          (video) =>
            (video as HTMLVideoElement).textTracks[0]?.cues?.length ?? 0,
        ),
      )
      .toBeGreaterThan(40)
    expect(
      await video.evaluate((video) => (video as HTMLVideoElement).duration),
    ).toBeCloseTo(120, 0)
    await video.evaluate((video) => {
      ;(video as HTMLVideoElement).pause()
      ;(video as HTMLVideoElement).currentTime = 60
    })
    await page.getByRole('button', { name: 'Open video viewer' }).click()
    expect(
      await video.evaluate((video) => (video as HTMLVideoElement).paused),
    ).toBe(true)
    await page.keyboard.press('Escape')
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true)
    await selectors.nth(0).click()
    await page.locator('.case-media-stage img').scrollIntoViewIfNeeded()
    await page.screenshot({
      path: `.cache/bluffhouse-review/gallery-${width}.png`,
    })
    await page.evaluate(() => {
      ;(document.activeElement as HTMLElement)?.blur()
      scrollTo(0, 0)
    })
    await page.screenshot({
      path: `.cache/bluffhouse-review/case-study-${width}.png`,
      fullPage: true,
    })
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
          .analyze()
      ).violations,
    ).toEqual([])
  })
  test(`all 20 Bluff House originals are browsable in story chapters at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/projects/bluffhouse')
    const collection = page.locator('.bluffhouse-screenshots')
    const chapters = collection.locator('.bluffhouse-chapter')
    await expect(chapters).toHaveCount(8)
    await expect(collection.locator('img')).toHaveCount(0)
    let count = 0
    for (let index = 0; index < 8; index++) {
      await chapters.nth(index).locator('summary').focus()
      await page.keyboard.press('Enter')
      const gallery = chapters.nth(index).locator('.case-media-gallery')
      await expect(gallery).toBeVisible()
      const buttons = gallery.locator('.media-selector button')
      const length = (await buttons.count()) || 1
      for (let number = 0; number < length; number++) {
        if (length > 1) await buttons.nth(number).click()
        const image = gallery.locator('.case-media-stage img')
        await expect
          .poll(() =>
            image.evaluate((image) => (image as HTMLImageElement).naturalWidth),
          )
          .toBeGreaterThan(0)
        await expect(image).toHaveAttribute('src', /\/\d{2}-[^/]+\.png$/)
        await expect(image).toHaveAttribute('alt', /recorded Bluff House/)
        count++
      }
    }
    expect(count).toBe(20)
    await expect(collection.locator('details[open]')).toHaveCount(1)
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true)
    await collection
      .locator('details[open]')
      .screenshot({ path: `.cache/bluffhouse-review/story-${width}.png` })
    expect(
      (
        await new AxeBuilder({ page })
          .include('.bluffhouse-screenshots')
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
          .analyze()
      ).violations,
    ).toEqual([])
  })
}

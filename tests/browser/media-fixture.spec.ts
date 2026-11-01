import { test, expect } from '@playwright/test'

const fixture = `http://127.0.0.1:${process.env.FIXTURE_PORT || 4177}/tests/fixtures/media/index.html`

test('controlled video is initially muted, pauses when opened in the viewer, and has a usable failure path', async ({
  page,
}) => {
  await page.goto(fixture)
  await page.getByRole('button', { name: 'Next media', exact: true }).click()
  const inline = page.locator('.case-media-stage video')
  expect(
    await inline.evaluate((el) => ({
      muted: (el as HTMLVideoElement).muted,
      paused: (el as HTMLVideoElement).paused,
      controls: (el as HTMLVideoElement).controls,
      preload: (el as HTMLVideoElement).preload,
    })),
  ).toEqual({ muted: true, paused: true, controls: true, preload: 'none' })
  await expect(inline.locator('track')).toHaveAttribute('kind', 'captions')
  await inline.evaluate((video) => (video as HTMLVideoElement).play())
  await expect
    .poll(() =>
      inline.evaluate((video) => (video as HTMLVideoElement).currentTime),
    )
    .toBeGreaterThan(0)
  await page.getByRole('button', { name: 'Open video viewer' }).click()
  expect(
    await inline.evaluate((video) => (video as HTMLVideoElement).paused),
  ).toBe(true)
  const dialog = page.getByRole('dialog')
  await expect(dialog.locator('video')).toBeVisible()
  expect(
    await dialog
      .locator('video')
      .evaluate((video) => (video as HTMLVideoElement).paused),
  ).toBe(true)
  await page.keyboard.press('Escape')
  await expect(
    page.getByRole('button', { name: 'Open video viewer' }),
  ).toBeFocused()
  await page.route('**/test-video.webm', (route) => route.abort())
  await page.reload()
  await page.getByRole('button', { name: 'Next media', exact: true }).click()
  await page
    .locator('.case-media-stage video')
    .evaluate((video) => (video as HTMLVideoElement).load())
  await expect(page.getByText('This media could not be loaded.')).toBeVisible()
})

test('empty, single and failed media fixtures do not expose meaningless navigation', async ({
  page,
}) => {
  await page.goto(`${fixture}?mode=empty`)
  await expect(
    page.getByText(
      'Original screenshots or a demo will be added after review.',
    ),
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Next media', exact: true }),
  ).toHaveCount(0)
  await page.goto(`${fixture}?mode=single`)
  await expect(
    page.getByRole('button', { name: 'Next media', exact: true }),
  ).toHaveCount(0)
  await page.getByRole('button', { name: 'Enlarge image' }).click()
  await page.getByRole('button', { name: 'Close viewer' }).click()
  await expect(page.getByRole('dialog')).toBeHidden()
  await page.goto(`${fixture}?mode=broken`)
  await expect(page.getByText('This media could not be loaded.')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Try again' })).toBeVisible()
})

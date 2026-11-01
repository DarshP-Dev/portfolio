import { test, expect, type Page, type Route } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const confirmed = {
  accepted: true,
  reference: 'browser-test-provider-reference',
  receivedAt: '2026-11-01T17:00:00.000Z',
}
async function ready(page: Page, post?: (route: Route) => Promise<void>) {
  await page.route('**/api/contact', async (route) => {
    if (route.request().method() === 'GET')
      await route.fulfill({ json: { enabled: true } })
    else if (post) await post(route)
    else await route.fulfill({ status: 503, json: { code: 'unavailable' } })
  })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/#contact')
  await expect(page.getByRole('button', { name: 'Send Letter' })).toBeEnabled()
}
async function fillLetter(page: Page) {
  await page.getByLabel('RE:', { exact: true }).selectOption('collaboration')
  await page.getByLabel('FROM:', { exact: true }).fill('taylor@example.com')
  await page
    .getByLabel('What would you like to talk about?')
    .fill('I have an idea for a project.\nLet’s talk about it.')
  await page.getByLabel('Your name', { exact: true }).fill('Taylor Example')
}
const receiptValue = (page: Page, label: string) =>
  page
    .locator('.contact-receipt dl > div')
    .filter({ has: page.locator('dt', { hasText: new RegExp(`^${label}$`) }) })
    .locator('dd')

test('unconfigured local delivery stays disabled, with real email links and no invented receipt', async ({
  page,
  request,
}) => {
  const response = await request.get('/api/contact')
  expect(await response.json()).toEqual({ enabled: false })
  expect(response.headers()['cache-control']).toBe('no-store')
  expect((await request.post('/api/contact', { data: {} })).status()).toBe(503)
  await page.goto('/#contact')
  await expect(
    page.getByText('Letter delivery is not connected yet.', { exact: false }),
  ).toBeVisible()
  await expect(page.getByRole('button', { name: 'Send Letter' })).toBeDisabled()
  await fillLetter(page)
  await expect(receiptValue(page, 'STATUS')).toHaveText('READY TO SEND')
  await expect(receiptValue(page, 'REF')).toHaveText('--')
  await expect(receiptValue(page, 'RECEIVED')).toHaveText('--')
  await expect(page.locator('.contact-email-alternative a')).toHaveAttribute(
    'href',
    'mailto:darshpatel060106@gmail.com',
  )
})

test('receipt follows the letter, custom subject validation focuses an accessible summary, and shortcuts leave editing alone', async ({
  page,
}) => {
  let posts = 0
  await ready(page, async (route) => {
    posts++
    await route.fulfill({ status: 503, json: {} })
  })
  await expect(receiptValue(page, 'STATUS')).toHaveText('READY')
  await page.getByLabel('RE:', { exact: true }).selectOption('other')
  await expect(receiptValue(page, 'JOB')).toHaveText('OTHER')
  await expect(receiptValue(page, 'FILE UNDER')).toHaveText('CUSTOM')
  await expect(receiptValue(page, 'STATUS')).toHaveText('BEING WRITTEN')
  await page.getByRole('button', { name: 'Send Letter' }).click()
  await expect(page.locator('.letter-error-summary')).toBeFocused()
  await expect(page.locator('.letter-error-summary a')).toHaveCount(4)
  await page
    .locator('.letter-error-summary')
    .getByRole('link', { name: 'Add a subject' })
    .click()
  await expect(page.getByLabel('SUBJECT:', { exact: true })).toBeFocused()
  expect(posts).toBe(0)
  await page.getByLabel('RE:', { exact: true }).selectOption('collaboration')
  await expect(page.getByLabel('SUBJECT:', { exact: true })).toHaveCount(0)
  await expect(
    page.getByText('Add a subject (up to 120 characters).'),
  ).toHaveCount(0)
  await fillLetter(page)
  await expect(receiptValue(page, 'JOB')).toHaveText('COLLABORATION')
  await expect(receiptValue(page, 'FILE UNDER')).toHaveText('NEW BUSINESS')
  await expect(receiptValue(page, 'REPLY TO')).toHaveText('taylor@example.com')
  await expect(receiptValue(page, 'STATUS')).toHaveText('READY TO SEND')
  await page.getByLabel('What would you like to talk about?').focus()
  await page.keyboard.press('Control+k')
  await expect(
    page.getByRole('dialog', { name: 'Quick navigate' }),
  ).not.toBeVisible()
  expect(
    (
      await new AxeBuilder({ page })
        .include('.contact-section')
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze()
    ).violations,
  ).toEqual([])
})

test('sending locks duplicate requests and only a confirmed response stamps SENT', async ({
  page,
}) => {
  let posts = 0
  let release: (() => void) | undefined
  const responseGate = new Promise<void>((resolve) => {
    release = resolve
  })
  await ready(page, async (route) => {
    posts++
    await responseGate
    await route.fulfill({ json: confirmed })
  })
  await fillLetter(page)
  await page.getByRole('button', { name: 'Send Letter' }).click()
  await expect(receiptValue(page, 'STATUS')).toHaveText('SENDING')
  await expect(page.getByLabel('Your name', { exact: true })).toBeDisabled()
  await expect(
    page.getByRole('button', { name: 'Sending letter…' }),
  ).toBeDisabled()
  await page.locator('.contact-letter').evaluate((form) => {
    ;(form as HTMLFormElement).requestSubmit()
    ;(form as HTMLFormElement).requestSubmit()
  })
  await expect(receiptValue(page, 'REF')).toHaveText('--')
  await expect(receiptValue(page, 'RECEIVED')).toHaveText('--')
  release!()
  await expect(receiptValue(page, 'STATUS')).toHaveText('SENT')
  expect(posts).toBe(1)
  await expect(receiptValue(page, 'REF')).toHaveText(confirmed.reference)
  await expect(page.locator('.contact-receipt time')).toHaveAttribute(
    'datetime',
    confirmed.receivedAt,
  )
  await expect(page.locator('.letter-feedback')).toBeFocused()
  await expect(page.locator('.letter-feedback')).toContainText(
    'accepted for delivery',
  )
  await expect(page.locator('.letter-sent-stamp')).toBeVisible()
  await page
    .locator('.contact-correspondence')
    .screenshot({ path: '.cache/phase5/contact-confirmed-test.png' })
  await page.getByRole('button', { name: 'Write another letter' }).click()
  await expect(page.getByLabel('RE:', { exact: true })).toBeFocused()
  await expect(page.getByLabel('Your name', { exact: true })).toHaveValue('')
  await expect(receiptValue(page, 'STATUS')).toHaveText('READY')
  await expect(receiptValue(page, 'REF')).toHaveText('--')
  expect(
    await page.evaluate(() =>
      Object.values(localStorage).some((value) =>
        String(value).includes('taylor@example.com'),
      ),
    ),
  ).toBe(false)
})

test('errors and ambiguous success preserve the draft and retry identity without marking it sent', async ({
  page,
}) => {
  const submissions: { requestId: string; message: string }[] = []
  await ready(page, async (route) => {
    submissions.push(route.request().postDataJSON())
    const count = submissions.length
    await route.fulfill(
      count === 1
        ? { status: 429, json: { code: 'rate-limited' } }
        : count === 2
          ? { json: { accepted: true } }
          : { json: confirmed },
    )
  })
  await fillLetter(page)
  await page.getByRole('button', { name: 'Send Letter' }).click()
  await expect(receiptValue(page, 'STATUS')).toHaveText('ERROR')
  await expect(page.locator('.letter-feedback')).toContainText(
    'too many letters',
  )
  await expect(page.getByLabel('Your name', { exact: true })).toHaveValue(
    'Taylor Example',
  )
  await expect(
    page.getByLabel('What would you like to talk about?'),
  ).toHaveValue('I have an idea for a project.\nLet’s talk about it.')
  await page.getByRole('button', { name: 'Retry letter' }).click()
  await expect(page.locator('.letter-feedback')).toContainText(
    'Delivery could not be confirmed',
  )
  await expect(receiptValue(page, 'REF')).toHaveText('--')
  await expect(receiptValue(page, 'RECEIVED')).toHaveText('--')
  await expect(page.locator('.letter-sent-stamp')).toHaveCount(0)
  expect(submissions[0].requestId).toBe(submissions[1].requestId)
  await page
    .getByLabel('What would you like to talk about?')
    .fill('An updated idea.')
  await page.getByRole('button', { name: 'Send Letter' }).click()
  await expect(receiptValue(page, 'STATUS')).toHaveText('SENT')
  expect(submissions[2].requestId).not.toBe(submissions[1].requestId)
})

test('network failures and server validation preserve the letter and expose an actionable error', async ({
  page,
}) => {
  let attempts = 0
  await ready(page, async (route) => {
    attempts++
    if (attempts === 1) await route.abort('failed')
    else
      await route.fulfill({
        status: 422,
        json: { errors: { email: 'Enter a valid email address.' } },
      })
  })
  await fillLetter(page)
  await page.getByRole('button', { name: 'Send Letter' }).click()
  await expect(page.locator('.letter-feedback')).toContainText(
    'Delivery could not be confirmed',
  )
  await page.getByRole('button', { name: 'Retry letter' }).click()
  await expect(page.locator('.letter-error-summary')).toBeFocused()
  await expect(page.getByLabel('FROM:', { exact: true })).toHaveAttribute(
    'aria-invalid',
    'true',
  )
  await expect(receiptValue(page, 'STATUS')).toHaveText('ERROR')
  await expect(page.getByLabel('Your name', { exact: true })).toHaveValue(
    'Taylor Example',
  )
})

for (const width of [1440, 820, 390, 320]) {
  test(`letter, receipt and footer reflow accessibly at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 950 })
    await ready(page)
    await fillLetter(page)
    const longEmail = `${'long-address-'.repeat(5)}@example.com`
    await page.getByLabel('FROM:', { exact: true }).fill(longEmail)
    await expect(receiptValue(page, 'REPLY TO')).toHaveText(longEmail)
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true)
    const receipt = (await page.locator('.contact-receipt').boundingBox())!
    const subject = (await page
      .getByLabel('RE:', { exact: true })
      .boundingBox())!
    if (width < 768) expect(receipt.y + receipt.height).toBeLessThan(subject.y)
    else expect(subject.x + subject.width).toBeLessThan(receipt.x)
    expect(
      (
        await new AxeBuilder({ page })
          .include('.contact-section')
          .include('.site-footer')
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
          .analyze()
      ).violations,
    ).toEqual([])
    await page
      .locator('.contact-section')
      .screenshot({ path: `.cache/phase5/contact-${width}.png` })
    await page
      .locator('.site-footer')
      .screenshot({ path: `.cache/phase5/footer-${width}.png` })
    if (width === 390) {
      await page.evaluate(() => {
        document.documentElement.style.fontSize = '200%'
      })
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true)
      await page
        .locator('.contact-section')
        .screenshot({ path: '.cache/phase5/contact-text-200.png' })
    }
  })
}

test('footer links are approved, clipboard success is real, and portrait failure falls back without publishing a resume', async ({
  page,
  context,
  baseURL,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'], {
    origin: baseURL,
  })
  await page.goto('/#about')
  const portrait = page.locator('.profile-card-photo')
  await expect(portrait).toHaveAttribute('src', '/images/profile.webp')
  expect(
    await portrait.evaluate(
      (image) => (image as HTMLImageElement).naturalWidth,
    ),
  ).toBe(680)
  const footer = page.locator('.site-footer')
  await expect(footer.getByRole('link', { name: 'LinkedIn' })).toHaveAttribute(
    'href',
    'https://www.linkedin.com/in/darshpatel-dev',
  )
  await expect(footer.getByRole('link', { name: 'GitHub' })).toHaveAttribute(
    'href',
    'https://github.com/DarshP-Dev',
  )
  await footer.getByRole('button', { name: 'Copy email address' }).click()
  await expect(footer.getByRole('status')).toHaveText('Copied')
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    'darshpatel060106@gmail.com',
  )
  await page.evaluate(() => {
    navigator.clipboard.writeText = async () => {
      throw new Error('Test permission denied')
    }
  })
  await footer.getByRole('button', { name: 'Copy email address' }).click()
  await expect(footer.getByRole('status')).toContainText('Copy unavailable')
  await expect(page.locator('a[download]')).toHaveCount(0)
  await expect(footer.getByText('Resume pending')).toBeVisible()
  await page.route('**/images/profile.webp', (route) => route.abort())
  await page.reload()
  await page.locator('#about').scrollIntoViewIfNeeded()
  await expect(page.locator('.profile-card-placeholder')).toBeVisible()
})

test('direct HTML without JavaScript offers real contact links and an inactive, honest form', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  })
  const page = await context.newPage()
  await page.goto(`${baseURL}/#contact`)
  await expect(page.getByRole('button', { name: 'Send Letter' })).toBeDisabled()
  // Playwright's text engine excludes noscript elements even when scripting is disabled.
  await expect(page.locator('noscript .letter-delivery-note')).toBeVisible()
  await expect(page.locator('noscript .letter-delivery-note')).toContainText(
    'The form needs JavaScript.',
  )
  await expect(page.locator('.contact-email-alternative a')).toHaveAttribute(
    'href',
    'mailto:darshpatel060106@gmail.com',
  )
  await expect(
    page.locator('.site-footer').getByRole('link', { name: 'LinkedIn' }),
  ).toBeVisible()
  await expect(page.locator('a[download]')).toHaveCount(0)
  await expect(
    page.getByRole('button', { name: 'Copy email address' }),
  ).toBeDisabled()
  await context.close()
})

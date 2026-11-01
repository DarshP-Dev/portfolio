import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('menu is a native disclosure with route-aware links, Escape and outside-click closing', async ({
  page,
}) => {
  await page.goto('/')
  const details = page.locator('.bubble-menu')
  const toggle = details.locator('summary')
  await toggle.click()
  await expect(details).toHaveAttribute('open', '')
  await page.keyboard.press('Tab')
  await expect(
    page
      .getByRole('navigation', { name: 'Main navigation' })
      .getByRole('link', { name: 'Home', exact: true }),
  ).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(details).not.toHaveAttribute('open', '')
  await expect(toggle).toBeFocused()
  await toggle.click()
  await page
    .getByRole('button', { name: 'Close navigation backdrop' })
    .click({ position: { x: 4, y: 700 } })
  await expect(details).not.toHaveAttribute('open', '')
  await page.goto('/projects/argus')
  await toggle.click()
  await page
    .getByRole('navigation', { name: 'Main navigation' })
    .getByRole('link', { name: 'Contact', exact: true })
    .click()
  await expect(page).toHaveURL(/\/#contact$/)
  await expect(page.locator('#contact')).toBeFocused()
  await expect(details).not.toHaveAttribute('open', '')
  await toggle.click()
  await page.goBack()
  await expect(details).not.toHaveAttribute('open', '')
  await page.keyboard.press('Control+k')
  await expect(
    page.getByRole('combobox', { name: 'Search pages and actions' }),
  ).toBeFocused()
  await page.goForward()
  await expect(
    page.getByRole('dialog', { name: 'Quick navigate' }),
  ).not.toBeVisible()
})

test('command palette filters, navigates, handles empty results and restores focus', async ({
  page,
}) => {
  await page.goto('/')
  const trigger = page.getByRole('button', { name: 'Search' })
  await trigger.click()
  const dialog = page.getByRole('dialog', { name: 'Quick navigate' })
  const input = page.getByRole('combobox', { name: 'Search pages and actions' })
  await expect(input).toBeFocused()
  await input.fill('not a thing')
  await expect(page.getByText('No matches.')).toBeVisible()
  await input.fill('vision')
  await expect(dialog.getByRole('option')).toHaveCount(1)
  await input.press('Enter')
  await expect(dialog).not.toBeVisible()
  await expect(page).toHaveURL(/\/projects\/visioncontrol$/)
  await page.keyboard.press('Control+k')
  await expect(input).toBeFocused()
  await input.fill('journey')
  await input.press('Enter')
  await expect(page).toHaveURL(/\/#experience$/)
  await expect(page.locator('#experience')).toBeFocused()
  await trigger.click()
  await input.press('Escape')
  await expect(dialog).not.toBeVisible()
  await expect(trigger).toBeFocused()
})

test('keyboard selection, modal focus containment, and backdrop close work', async ({
  page,
}) => {
  await page.goto('/')
  await page.keyboard.press('Meta+k')
  const input = page.getByRole('combobox', { name: 'Search pages and actions' })
  await expect(input).toBeFocused()
  const first = await input.getAttribute('aria-activedescendant')
  await input.press('ArrowDown')
  expect(await input.getAttribute('aria-activedescendant')).not.toBe(first)
  await input.press('ArrowUp')
  expect(await input.getAttribute('aria-activedescendant')).toBe(first)
  for (let i = 0; i < 4; i++) await page.keyboard.press('Tab')
  expect(
    await page
      .locator('.command-dialog')
      .evaluate((dialog) => dialog.contains(document.activeElement)),
  ).toBe(true)
  await page.mouse.click(5, 5)
  await expect(
    page.getByRole('dialog', { name: 'Quick navigate' }),
  ).not.toBeVisible()
})

test('shortcut is not intercepted inside editable fields or another dialog', async ({
  page,
}) => {
  await page.goto('/')
  // Test-only editable fixture exercises the global shortcut guard.
  await page.evaluate(() => {
    const input = document.createElement('input')
    input.id = 'shortcut-fixture'
    document.body.append(input)
    input.focus()
  })
  await page.keyboard.press('Control+k')
  await expect(
    page.getByRole('dialog', { name: 'Quick navigate' }),
  ).not.toBeVisible()
  await page.locator('#shortcut-fixture').evaluate((input) => input.remove())
  await page.evaluate(() => {
    const dialog = document.createElement('dialog')
    dialog.id = 'guard-dialog'
    dialog.innerHTML = '<button>Another modal</button>'
    document.body.append(dialog)
    dialog.showModal()
  })
  await page.keyboard.press('Control+k')
  await expect(
    page.getByRole('dialog', { name: 'Quick navigate' }),
  ).not.toBeVisible()
  await page.locator('#guard-dialog').evaluate((dialog) => {
    ;(dialog as HTMLDialogElement).close()
    dialog.remove()
  })
})

test('navigation reflows with 200% text at phone width', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '200%'
  })
  await page.locator('.bubble-menu summary').click()
  await expect(
    page
      .getByRole('navigation', { name: 'Main navigation' })
      .getByRole('link', { name: 'Contact', exact: true }),
  ).toBeVisible()
  expect(
    await page.evaluate(
      () =>
        document.querySelector('.navigation-header')!.scrollWidth <= innerWidth,
    ),
  ).toBe(true)
  await page.screenshot({ path: '.cache/phase2/menu-text-200.png' })
})

for (const width of [1440, 390, 320]) {
  test(`menu and search are accessible at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    await page.locator('.bubble-menu summary').click()
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
          .analyze()
      ).violations,
    ).toEqual([])
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true)
    await page.screenshot({ path: `.cache/phase2/menu-${width}.png` })
    await page.keyboard.press('Escape')
    await page.getByRole('button', { name: 'Search' }).click()
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
          .analyze()
      ).violations,
    ).toEqual([])
    await page.screenshot({ path: `.cache/phase2/search-${width}.png` })
  })
}

test('the menu stays usable without JavaScript', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  const page = await context.newPage()
  await page.goto(baseURL!)
  await page.locator('.bubble-menu summary').click()
  await page
    .getByRole('navigation', { name: 'Main navigation' })
    .getByRole('link', { name: 'Projects', exact: true })
    .click()
  await expect(page).toHaveURL(/\/#projects$/)
  await context.close()
})

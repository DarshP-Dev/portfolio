import { test, expect } from '@playwright/test'
import { readFile } from 'node:fs/promises'

const resumeUrl = '/resume/Darsh_Patel_Resume.pdf'

test('approved resume opens as a PDF and downloads unchanged from Hero, Footer and Ctrl+K', async ({
  page,
  request,
}) => {
  const source = await readFile(`public${resumeUrl}`)
  const response = await request.get(resumeUrl)
  expect(response.status()).toBe(200)
  expect(response.headers()['content-type']).toBe('application/pdf')
  expect(await response.body()).toEqual(source)

  await page.goto('/')
  await expect(page.getByText(/PDF pending|Resume pending/)).toHaveCount(0)
  for (const selector of ['#home', '.site-footer']) {
    const link = page.locator(selector).getByRole('link', { name: 'Resume' })
    await expect(link).toHaveAttribute('href', resumeUrl)
    const downloaded = page.waitForEvent('download')
    await link.click()
    const download = await downloaded
    expect(download.suggestedFilename()).toBe('Darsh_Patel_Resume.pdf')
    expect(await download.failure()).toBeNull()
    expect(await readFile((await download.path())!)).toEqual(source)
  }

  await page.keyboard.press('Control+k')
  const input = page.getByRole('combobox', { name: 'Search pages and actions' })
  await input.fill('resume')
  const downloaded = page.waitForEvent('download')
  await page
    .getByRole('option', { name: /Download the approved resume PDF/ })
    .click()
  const download = await downloaded
  expect(await download.failure()).toBeNull()
  expect(await readFile((await download.path())!)).toEqual(source)
  await expect(page).toHaveURL(/\/$/)
  await expect(
    page.getByRole('dialog', { name: 'Quick navigate' }),
  ).not.toBeVisible()
})

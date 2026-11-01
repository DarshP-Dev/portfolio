import { readFile, mkdir, writeFile } from 'node:fs/promises'
import { chromium } from '@playwright/test'

// Rasterize the code-native monogram placeholder; no invented portrait or stock face.
const svg = await readFile(
  new URL('./profile-placeholder.svg', import.meta.url),
  'utf8',
)
const browser = await chromium.launch({ channel: 'chrome' })
try {
  const page = await browser.newPage()
  const encoded = await page.evaluate(async (source) => {
    const image = new Image()
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(source)}`
    await image.decode()
    const canvas = document.createElement('canvas')
    canvas.width = 680
    canvas.height = 850
    canvas.getContext('2d').drawImage(image, 0, 0)
    return canvas.toDataURL('image/webp', 0.94).split(',')[1]
  }, svg)
  await mkdir('public/images', { recursive: true })
  await writeFile('public/images/profile.webp', Buffer.from(encoded, 'base64'))
} finally {
  await browser.close()
}

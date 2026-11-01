import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { dirname, resolve, extname } from 'node:path'
import { pathToFileURL } from 'node:url'
import { chromium } from '@playwright/test'

// Explicit local authoring step. Deploy builds consume the checked-in derivatives;
// they never need Chrome or download media from third-party services.
const { assetProjects } = await import(
  pathToFileURL(resolve('dist-ssr/entry-server.js')).href
)
const projects = assetProjects()
const browser = await chromium.launch({ channel: 'chrome' })
const variants = {}
try {
  const page = await browser.newPage()
  const fonts = {
    heading: await readFile(
      'node_modules/@fontsource-variable/geist/files/geist-latin-wght-normal.woff2',
      'base64',
    ),
    mono: await readFile(
      'node_modules/@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2',
      'base64',
    ),
  }
  await page.evaluate(async (fonts) => {
    for (const [family, data] of Object.entries(fonts)) {
      const font = new FontFace(family, `url(data:font/woff2;base64,${data})`, {
        weight: '100 900',
      })
      document.fonts.add(await font.load())
    }
  }, fonts)
  const imageSources = [
    ...new Set(
      projects.flatMap((project) =>
        project.media
          .filter((media) => media.type === 'image')
          .map((media) => media.src),
      ),
    ),
  ]
  for (const src of imageSources) {
    if (!/^\/images\/projects\/[a-z0-9/-]+\.png$/.test(src))
      throw new Error('Generator accepts only known local project PNGs.')
    const bytes = await readFile(resolve('public', `.${src}`))
    const generated = await page.evaluate(async (data) => {
      const image = new Image()
      image.src = `data:image/png;base64,${data}`
      await image.decode()
      const widths = [
        ...new Set(
          [480, 960, 1600, image.naturalWidth].filter(
            (width) => width <= image.naturalWidth,
          ),
        ),
      ].sort((a, b) => a - b)
      return {
        width: image.naturalWidth,
        height: image.naturalHeight,
        variants: widths.map((width) => {
          const canvas = document.createElement('canvas')
          canvas.width = width
          canvas.height = Math.round(
            (image.naturalHeight * width) / image.naturalWidth,
          )
          const context = canvas.getContext('2d')
          context.imageSmoothingEnabled = true
          context.imageSmoothingQuality = 'high'
          context.drawImage(image, 0, 0, canvas.width, canvas.height)
          return {
            width,
            data: canvas.toDataURL('image/webp', 0.9).split(',')[1],
          }
        }),
      }
    }, bytes.toString('base64'))
    const output = []
    for (const variant of generated.variants) {
      const target = src.replace(extname(src), `-${variant.width}.webp`)
      await writeFile(
        resolve('public', `.${target}`),
        Buffer.from(variant.data, 'base64'),
      )
      output.push({ src: target, width: variant.width })
    }
    variants[src] = {
      width: generated.width,
      height: generated.height,
      variants: output,
    }
  }
  await writeFile(
    'src/content/image-variants.json',
    JSON.stringify(variants, null, 2) + '\n',
  )
  const cards = [
    {
      slug: 'portfolio',
      title: 'Darsh Patel.',
      description: 'Building thoughtful software, from idea to implementation.',
      tags: ['SOFTWARE ENGINEERING', 'PORTFOLIO'],
      image: undefined,
    },
    ...projects.map((project) => ({
      slug: project.slug,
      title: project.title,
      description:
        project.tagline ||
        project.summary ||
        'A software engineering project case study.',
      tags: project.technologies.slice(0, 3),
      image: project.media.find((media) => media.type === 'image')?.src,
    })),
  ]
  await mkdir('public/og', { recursive: true })
  for (const card of cards) {
    const imageData = card.image
      ? `data:image/png;base64,${(await readFile(resolve('public', `.${card.image}`))).toString('base64')}`
      : undefined
    const encoded = await page.evaluate(
      async ({ card, imageData }) => {
        const canvas = document.createElement('canvas')
        canvas.width = 1200
        canvas.height = 630
        const context = canvas.getContext('2d')
        context.fillStyle = '#fafaf8'
        context.fillRect(0, 0, 1200, 630)
        context.strokeStyle = '#d5d5d0'
        context.lineWidth = 1
        context.beginPath()
        context.moveTo(54, 100)
        context.lineTo(1146, 100)
        context.stroke()
        context.fillStyle = '#18181b'
        context.font = '650 31px heading'
        context.fillText('DP.', 54, 64)
        context.fillStyle = '#626269'
        context.font = '15px mono'
        context.fillText(
          card.slug === 'portfolio'
            ? 'SOFTWARE ENGINEERING PORTFOLIO'
            : 'PROJECT CASE STUDY',
          134,
          60,
        )
        const wrap = (text, maxWidth) => {
          const lines = ['']
          for (const word of text.split(/\s+/)) {
            const index = lines.length - 1
            const next = lines[index] ? `${lines[index]} ${word}` : word
            if (context.measureText(next).width > maxWidth && lines[index])
              lines.push(word)
            else lines[index] = next
          }
          return lines
        }
        context.fillStyle = '#18181b'
        context.font = `${card.slug === 'portfolio' ? 72 : 53}px heading`
        const title = wrap(card.title, 490)
        title.forEach((line, index) =>
          context.fillText(line, 54, 206 + index * 65),
        )
        context.fillStyle = '#626269'
        context.font = '23px heading'
        wrap(card.description, 480)
          .slice(0, 4)
          .forEach((line, index) =>
            context.fillText(line, 54, 245 + title.length * 65 + index * 31),
          )
        context.fillStyle = '#626269'
        context.font = '13px mono'
        context.fillText(card.tags.join(' / ').slice(0, 67), 54, 568)
        context.fillText('DARSH PATEL', 1028, 595)
        const x = 600,
          y = 144,
          width = 546,
          height = 370
        context.fillStyle = '#eeeee8'
        context.fillRect(x, y, width, height)
        if (imageData) {
          const image = new Image()
          image.src = imageData
          await image.decode()
          const scale = Math.min(
            (width - 24) / image.naturalWidth,
            (height - 24) / image.naturalHeight,
          )
          const w = image.naturalWidth * scale,
            h = image.naturalHeight * scale
          context.drawImage(
            image,
            x + (width - w) / 2,
            y + (height - h) / 2,
            w,
            h,
          )
        } else {
          context.fillStyle = '#18181b'
          context.font = '500 150px heading'
          context.fillText('DP.', x + 140, y + 235)
          context.fillStyle = '#626269'
          context.font = '14px mono'
          context.fillText(
            'IDEAS. SYSTEMS. THOUGHTFUL DETAILS.',
            x + 40,
            y + 325,
          )
        }
        return canvas.toDataURL('image/png').split(',')[1]
      },
      { card, imageData },
    )
    const path = `public/og/${card.slug}.png`
    await mkdir(dirname(path), { recursive: true })
    await writeFile(path, Buffer.from(encoded, 'base64'))
  }
  console.log(
    `Generated responsive variants for ${imageSources.length} real images and ${cards.length} share cards.`,
  )
} finally {
  await browser.close()
}

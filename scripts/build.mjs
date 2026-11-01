import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { pathToFileURL } from 'node:url'
import { build } from 'vite'

// Both bundles consume the same Vite mode/env and the same route/content source.
const mode = process.env.BUILD_MODE || 'production'
await build({ mode })
await build({
  mode,
  build: { ssr: 'src/entry-server.tsx', outDir: 'dist-ssr' },
})
const { render, prerenderPaths } = await import(
  pathToFileURL(resolve('dist-ssr/entry-server.js')).href
)
const template = await readFile('dist/index.html', 'utf8')
if (
  !template.includes('<!--app-html-->') ||
  !template.includes('<!--page-head-->')
)
  throw new Error('Prerender template markers missing.')

function escape(value) {
  return value.replace(
    /[&<>"']/g,
    (char) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        char
      ],
  )
}

for (const path of [...prerenderPaths(), '/404']) {
  const { html, metadata } = render(path)
  const head = `<title>${escape(metadata.title)}</title>
    <meta name="description" content="${escape(metadata.description)}" />
    <meta name="robots" content="${metadata.robots}" />
    <meta name="theme-color" content="#FAFAF8" />
    <meta property="og:type" content="${metadata.type}" />
    <meta property="og:title" content="${escape(metadata.title)}" />
    <meta property="og:description" content="${escape(metadata.description)}" />
    <meta name="twitter:card" content="${metadata.image ? 'summary_large_image' : 'summary'}" />
    <meta name="twitter:title" content="${escape(metadata.title)}" />
    <meta name="twitter:description" content="${escape(metadata.description)}" />
    ${metadata.image ? `<meta property="og:image" content="${escape(metadata.image.url)}" /><meta property="og:image:alt" content="${escape(metadata.image.alt)}" /><meta property="og:image:width" content="${metadata.image.width}" /><meta property="og:image:height" content="${metadata.image.height}" /><meta name="twitter:image" content="${escape(metadata.image.url)}" /><meta name="twitter:image:alt" content="${escape(metadata.image.alt)}" />` : ''}
    ${metadata.canonical ? `<link rel="canonical" href="${escape(metadata.canonical)}" /><meta property="og:url" content="${escape(metadata.canonical)}" />` : ''}`
  const destination =
    path === '/'
      ? 'dist/index.html'
      : path === '/404'
        ? 'dist/404.html'
        : `dist${path}/index.html`
  await mkdir(dirname(destination), { recursive: true })
  await writeFile(
    destination,
    template
      .replace('<!--page-head-->', () => head)
      .replace('<!--app-html-->', () => html),
  )
  console.log(`Prerendered ${path}`)
}
// Phase 1 is an explicitly non-indexable review build, including draft pages.
await writeFile('dist/robots.txt', 'User-agent: *\nDisallow: /\n')

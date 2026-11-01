import { readFile, writeFile, mkdir, cp } from 'node:fs/promises'
import { resolve, dirname, sep, relative } from 'node:path'
import { pathToFileURL } from 'node:url'
import { build } from 'vite'

// Both bundles consume the same Vite mode/env and the same route/content source.
const mode = process.env.BUILD_MODE || 'production'
const outputRoot = resolve(process.env.BUILD_OUTPUT_ROOT || '.')
if (
  process.env.BUILD_OUTPUT_ROOT &&
  !outputRoot.startsWith(resolve('.cache/phase6') + sep)
)
  throw new Error(
    'QA build outputs must stay inside this checkout’s .cache/phase6 directory.',
  )
const clientDirectory = resolve(outputRoot, 'dist')
const serverDirectory = resolve(outputRoot, 'dist-ssr')
await build({ mode, build: { outDir: clientDirectory, copyPublicDir: false } })
await build({
  mode,
  build: { ssr: 'src/entry-server.tsx', outDir: serverDirectory },
})
const { render, prerenderPaths, publicationFiles, publicAssets, includeAsset } =
  await import(pathToFileURL(resolve(serverDirectory, 'entry-server.js')).href)
const publicRoot = resolve('public')
const allowedAssets = publicAssets()
await cp(publicRoot, clientDirectory, {
  recursive: true,
  filter: (source) =>
    includeAsset(
      relative(publicRoot, source).split(sep).join('/'),
      allowedAssets.projectSlugs,
      allowedAssets.resumeUrl,
    ),
})
const template = await readFile(resolve(clientDirectory, 'index.html'), 'utf8')
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
      ? resolve(clientDirectory, 'index.html')
      : path === '/404'
        ? resolve(clientDirectory, '404.html')
        : resolve(clientDirectory, `.${path}/index.html`)
  await mkdir(dirname(destination), { recursive: true })
  await writeFile(
    destination,
    template
      .replace('<!--page-head-->', () => head)
      .replace('<!--app-html-->', () => html),
  )
  console.log(`Prerendered ${path}`)
}
const crawlers = publicationFiles()
await writeFile(resolve(clientDirectory, 'robots.txt'), crawlers.robots)
await writeFile(resolve(clientDirectory, 'sitemap.xml'), crawlers.sitemap)

import assert from 'node:assert/strict'
import { readFile, readdir, stat } from 'node:fs/promises'
import { resolve, sep } from 'node:path'
import { pathToFileURL } from 'node:url'

const root = resolve(process.env.BUILD_OUTPUT_ROOT || '.')
const dist = resolve(root, 'dist')
const { render, prerenderPaths, publicationFiles } = await import(
  pathToFileURL(resolve(root, 'dist-ssr/entry-server.js')).href
)
const paths = [...prerenderPaths(), '/404']
let files = 0
for (const route of paths) {
  const file =
    route === '/'
      ? 'index.html'
      : route === '/404'
        ? '404.html'
        : `${route.slice(1)}/index.html`
  const html = await readFile(resolve(dist, file), 'utf8')
  const { metadata } = render(route)
  assert.equal((html.match(/<h1\b/g) || []).length, 1, `${route}: one h1`)
  assert.equal((html.match(/<title>/g) || []).length, 1, `${route}: one title`)
  assert.ok(
    html.includes(`content="${metadata.robots}"`),
    `${route}: matching robots`,
  )
  assert.ok(
    !html.includes('<!--app-html-->') && !html.includes('<!--page-head-->'),
    `${route}: real HTML`,
  )
  if (metadata.canonical)
    assert.ok(
      html.includes(`href="${metadata.canonical}"`),
      `${route}: raw canonical`,
    )
  else
    assert.ok(
      !html.includes('rel="canonical"'),
      `${route}: no invented canonical`,
    )
  if (metadata.image) {
    assert.ok(
      html.includes(`content="${metadata.image.url}"`),
      `${route}: raw share image`,
    )
    await stat(resolve(dist, `.${new URL(metadata.image.url).pathname}`))
  }
  // Local assets and anchor/route links must resolve in the static output.
  const urls = new Set(
    [...html.matchAll(/(?:src|href)="(\/[^"#?]*)/g)].map((match) => match[1]),
  )
  for (const url of urls) {
    const target = resolve(dist, `.${url || '/'}`)
    assert.ok(
      target === dist || target.startsWith(dist + sep),
      'Assets stay inside dist',
    )
    const info = await stat(target)
    if (info.isDirectory()) await stat(resolve(target, 'index.html'))
    files++
  }
}
const crawlers = publicationFiles()
assert.equal(
  await readFile(resolve(dist, 'robots.txt'), 'utf8'),
  crawlers.robots,
)
assert.equal(
  await readFile(resolve(dist, 'sitemap.xml'), 'utf8'),
  crawlers.sitemap,
)
const walk = async (directory) => {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name)
    assert.ok(
      !['tests', 'fixtures', '.cache', 'dist-ssr'].includes(entry.name),
      `No development directory in output: ${entry.name}`,
    )
    if (entry.isDirectory()) await walk(path)
    else if (entry.name.endsWith('.js')) {
      const code = await readFile(path, 'utf8')
      assert.ok(
        !/RESEND_API_KEY|UPSTASH_REDIS_REST_TOKEN|CONTACT_HASH_SECRET|unit-test-provider-key|api\.resend\.com/.test(
          code,
        ),
        'Server configuration/provider code stays out of client bundles',
      )
    }
  }
}
await walk(dist)
console.log(
  `Verified ${paths.length} prerendered documents, ${files} local references, crawler files and client/server boundaries.`,
)

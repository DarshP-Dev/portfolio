import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const { publicLinks } = await import(
  pathToFileURL(resolve('dist-ssr/entry-server.js')).href
)
const links = publicLinks()
const results = []
let next = 0
await Promise.all(
  Array.from({ length: 3 }, async () => {
    while (next < links.length) {
      const url = links[next++]
      if (new URL(url).protocol !== 'https:')
        throw new Error('Only HTTPS public links may be checked.')
      try {
        const response = await fetch(url, {
          signal: AbortSignal.timeout(15_000),
          redirect: 'follow',
          headers: { 'User-Agent': 'PortfolioLinkCheck/1.0' },
        })
        results.push({
          url,
          status: response.status,
          finalUrl: response.url,
          ok: response.ok,
        })
        await response.body?.cancel()
      } catch {
        results.push({
          url,
          status: null,
          ok: false,
          note: 'Network request could not be completed; check manually.',
        })
      }
    }
  }),
)
results.sort((a, b) => a.url.localeCompare(b.url))
await mkdir('.cache/phase6', { recursive: true })
await writeFile(
  '.cache/phase6/link-check.json',
  JSON.stringify({ checkedAt: new Date().toISOString(), results }, null, 2) +
    '\n',
)
console.log(
  `Checked ${results.length} public URLs: ${results.filter((result) => result.ok).length} returned successful HTTP responses.`,
)
for (const result of results.filter((result) => !result.ok))
  console.log(`${result.status ?? 'NETWORK'} ${result.url}`)
console.log(
  'Access restrictions are reported for review, not automatically treated as invalid project links.',
)

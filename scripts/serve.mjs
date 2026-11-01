import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { resolve, extname, sep } from 'node:path'
import { loadEnv } from 'vite'
import { localContact } from '../server/local-contact.ts'

// Serve generated HTML rather than an SPA fallback, including real HTTP 404s.
const root = resolve('dist')
const contact = localContact({
  ...loadEnv(process.env.BUILD_MODE || 'production', process.cwd(), ''),
  ...process.env,
})
const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.pdf': 'application/pdf',
  '.webm': 'video/webm',
  '.mp4': 'video/mp4',
  '.vtt': 'text/vtt; charset=utf-8',
}
const server = createServer(async (request, response) => {
  if (/^\/api\/contact\/?(?:\?|$)/.test(request.url ?? '')) {
    await contact(request, response)
    return
  }
  try {
    const url = new URL(request.url || '/', 'http://localhost')
    const pathname = decodeURIComponent(url.pathname)
    let file = resolve(root, `.${pathname}`)
    if (file !== root && !file.startsWith(root + sep)) {
      response.writeHead(400).end()
      return
    }
    try {
      if ((await stat(file)).isDirectory()) file = resolve(file, 'index.html')
      const bytes = await readFile(file)
      response.writeHead(200, {
        'Content-Type': types[extname(file)] || 'application/octet-stream',
      })
      response.end(request.method === 'HEAD' ? undefined : bytes)
    } catch {
      response.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' })
      response.end(
        request.method === 'HEAD'
          ? undefined
          : await readFile(resolve(root, '404.html')),
      )
    }
  } catch {
    response.writeHead(400).end('Invalid request')
  }
})
const port = Number(process.env.PORT || 4173)
server.listen(port, '127.0.0.1', () =>
  console.log(`Local: http://127.0.0.1:${port}`),
)

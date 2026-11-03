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
  '.xml': 'application/xml; charset=utf-8',
}
const server = createServer(async (request, response) => {
  response.setHeader('X-Content-Type-Options', 'nosniff')
  response.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()',
  )
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
      const video = ['.mp4', '.webm'].includes(extname(file))
      if (video) response.setHeader('Accept-Ranges', 'bytes')
      const range = request.method === 'GET' && request.headers.range
      if (video && range) {
        const match = /^bytes=(\d*)-(\d*)$/.exec(range)
        let start = match?.[1] ? Number(match[1]) : 0
        let end = match?.[2] ? Number(match[2]) : bytes.length - 1
        if (match && !match[1] && match[2]) {
          start = Math.max(0, bytes.length - Number(match[2]))
          end = bytes.length - 1
        }
        if (
          !match ||
          (!match[1] && !match[2]) ||
          !Number.isSafeInteger(start) ||
          !Number.isSafeInteger(end) ||
          start >= bytes.length ||
          start > end ||
          (!match[1] && Number(match[2]) === 0)
        ) {
          response
            .writeHead(416, { 'Content-Range': `bytes */${bytes.length}` })
            .end()
          return
        }
        end = Math.min(end, bytes.length - 1)
        response.writeHead(206, {
          'Content-Type': types[extname(file)],
          'Content-Range': `bytes ${start}-${end}/${bytes.length}`,
          'Content-Length': end - start + 1,
          'Cache-Control': 'no-cache',
        })
        response.end(bytes.subarray(start, end + 1))
        return
      }
      response.writeHead(200, {
        'Content-Type': types[extname(file)] || 'application/octet-stream',
        'Content-Length': bytes.length,
        'Cache-Control': pathname.startsWith('/assets/')
          ? 'public, max-age=31536000, immutable'
          : 'no-cache',
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

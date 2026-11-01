import type { IncomingMessage, ServerResponse } from 'node:http'
import { contactConfig, createContactHandler } from './contact-handler.ts'

/** Shared dev/production-preview bridge. Local real delivery requires an explicit flag. */
export function localContact(env: Record<string, string | undefined>) {
  const config = contactConfig({
    ...env,
    CONTACT_ENABLED:
      env.CONTACT_ALLOW_LOCAL_DELIVERY === 'true'
        ? env.CONTACT_ENABLED
        : 'false',
  })
  const handler = createContactHandler(config)
  return async (incoming: IncomingMessage, outgoing: ServerResponse) => {
    try {
      const chunks: Buffer[] = []
      let length = 0
      if (incoming.method !== 'GET' && incoming.method !== 'HEAD') {
        for await (const chunk of incoming) {
          const bytes = Buffer.from(chunk)
          length += bytes.length
          if (length > 32_768) {
            outgoing
              .writeHead(413, {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-store',
              })
              .end(JSON.stringify({ code: 'too-large' }))
            return
          }
          chunks.push(bytes)
        }
      }
      const headers = new Headers()
      for (const [name, value] of Object.entries(incoming.headers))
        if (value)
          headers.set(name, Array.isArray(value) ? value.join(', ') : value)
      const request = new Request('http://localhost/api/contact', {
        method: incoming.method,
        headers,
        ...(chunks.length ? { body: Buffer.concat(chunks) } : {}),
      })
      const response = await handler(request, incoming.socket.remoteAddress)
      const responseHeaders: Record<string, string> = {}
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value
      })
      outgoing
        .writeHead(response.status, responseHeaders)
        .end(Buffer.from(await response.arrayBuffer()))
    } catch {
      outgoing
        .writeHead(400, {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
        })
        .end(JSON.stringify({ code: 'invalid-request' }))
    }
  }
}

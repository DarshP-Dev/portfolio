import { createHmac } from 'node:crypto'
import { isIP } from 'node:net'
import {
  contactSubjects,
  validEmail,
  validateContact,
} from '../src/contact/model.ts'

const maxBodyBytes = 32_768
const requestIdPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
export interface ContactConfig {
  enabled: boolean
  apiKey: string
  from: string
  to: string
  origins: string[]
  redisUrl: string
  redisToken: string
  hashSecret: string
}
export function contactConfig(
  env: Record<string, string | undefined>,
): ContactConfig {
  const origins = (env.CONTACT_ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
    .filter((value) => {
      try {
        const url = new URL(value)
        return (
          url.origin === value &&
          (url.protocol === 'https:' ||
            (url.protocol === 'http:' &&
              ['localhost', '127.0.0.1'].includes(url.hostname)))
        )
      } catch {
        return false
      }
    })
  const config = {
    enabled: env.CONTACT_ENABLED === 'true',
    apiKey: env.RESEND_API_KEY ?? '',
    from: env.CONTACT_FROM ?? '',
    to: env.CONTACT_TO ?? '',
    origins,
    redisUrl: env.UPSTASH_REDIS_REST_URL ?? '',
    redisToken: env.UPSTASH_REDIS_REST_TOKEN ?? '',
    hashSecret: env.CONTACT_HASH_SECRET ?? '',
  }
  config.enabled =
    config.enabled &&
    !!config.apiKey &&
    validEmail(config.from) &&
    validEmail(config.to) &&
    origins.length > 0 &&
    /^https:\/\/[a-z0-9.-]+(?::\d+)?\/?$/i.test(config.redisUrl) &&
    !!config.redisToken &&
    config.hashSecret.length >= 32
  return config
}
function json(
  status: number,
  body: object,
  headers: Record<string, string> = {},
) {
  return Response.json(body, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      ...headers,
    },
  })
}
// All counters are checked and advanced atomically, with bounded expiry.
const rateScript = `
for i,key in ipairs(KEYS) do
  local count = tonumber(redis.call('GET', key) or '0')
  if count >= tonumber(ARGV[(i-1)*2+1]) then
    return {0, math.max(1, redis.call('TTL', key))}
  end
end
for i,key in ipairs(KEYS) do
  local count = redis.call('INCR', key)
  if count == 1 then redis.call('EXPIRE', key, ARGV[(i-1)*2+2]) end
end
return {1,0}`

export function createContactHandler(
  config: ContactConfig,
  dependencies: { fetch?: typeof fetch; now?: () => Date } = {},
) {
  const fetcher = dependencies.fetch ?? fetch
  const now = dependencies.now ?? (() => new Date())
  const digest = (value: string) =>
    createHmac('sha256', config.hashSecret).update(value).digest('hex')
  return async function handle(
    request: Request,
    clientIp?: string,
  ): Promise<Response> {
    if (request.method === 'GET') return json(200, { enabled: config.enabled })
    if (request.method !== 'POST')
      return json(405, { code: 'method-not-allowed' }, { Allow: 'GET, POST' })
    if (!config.enabled) return json(503, { code: 'unavailable' })
    if (
      !config.origins.includes(request.headers.get('origin') ?? '') ||
      request.headers.get('sec-fetch-site') === 'cross-site'
    )
      return json(403, { code: 'forbidden' })
    if (
      !/^application\/json(?:\s*;|$)/i.test(
        request.headers.get('content-type') ?? '',
      )
    )
      return json(415, { code: 'invalid-content-type' })
    if (!clientIp || !isIP(clientIp)) return json(503, { code: 'unavailable' })
    if (Number(request.headers.get('content-length')) > maxBodyBytes)
      return json(413, { code: 'too-large' })
    let payload: unknown
    try {
      const reader = request.body?.getReader()
      if (!reader) return json(400, { code: 'invalid-request' })
      const chunks: Uint8Array[] = []
      let length = 0
      while (true) {
        const chunk = await reader.read()
        if (chunk.done) break
        length += chunk.value.byteLength
        if (length > maxBodyBytes) {
          await reader.cancel()
          return json(413, { code: 'too-large' })
        }
        chunks.push(chunk.value)
      }
      payload = JSON.parse(Buffer.concat(chunks).toString('utf8'))
    } catch {
      return json(400, { code: 'invalid-request' })
    }
    if (!payload || typeof payload !== 'object' || Array.isArray(payload))
      return json(400, { code: 'invalid-request' })
    const input = payload as Record<string, unknown>
    if (
      typeof input.website !== 'string' ||
      input.website.length !== 0 ||
      typeof input.requestId !== 'string' ||
      !requestIdPattern.test(input.requestId)
    )
      return json(400, { code: 'invalid-request' })
    const { values, errors } = validateContact(payload)
    if (Object.keys(errors).length)
      return json(422, { code: 'validation', errors })
    try {
      const limited = await fetcher(config.redisUrl, {
        method: 'POST',
        redirect: 'error',
        signal: AbortSignal.timeout(5000),
        headers: {
          Authorization: `Bearer ${config.redisToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([
          'EVAL',
          rateScript,
          3,
          `portfolio:ip:${digest(clientIp)}`,
          `portfolio:email:${digest(values.email.toLowerCase())}`,
          'portfolio:daily',
          5,
          900,
          3,
          900,
          100,
          86400,
        ]),
      })
      if (!limited.ok) return json(503, { code: 'unavailable' })
      const limit: unknown = await limited.json()
      const result =
        limit && typeof limit === 'object' && 'result' in limit
          ? limit.result
          : undefined
      if (
        !Array.isArray(result) ||
        ![0, 1].includes(result[0]) ||
        !Number.isFinite(result[1])
      )
        return json(503, { code: 'unavailable' })
      if (result[0] === 0)
        return json(
          429,
          { code: 'rate-limited' },
          { 'Retry-After': String(Math.max(1, Math.ceil(result[1]))) },
        )
      const category = contactSubjects.find(
        (subject) => subject.value === values.subject,
      )!
      const subject =
        values.subject === 'other' ? values.customSubject : category.label
      const delivery = await fetcher('https://api.resend.com/emails', {
        method: 'POST',
        redirect: 'error',
        signal: AbortSignal.timeout(10_000),
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
          'Idempotency-Key': `portfolio/${digest(JSON.stringify([input.requestId, values]))}`,
        },
        body: JSON.stringify({
          from: `Darsh Patel Portfolio <${config.from}>`,
          to: [config.to],
          reply_to: values.email,
          subject: `Portfolio letter — ${subject}`,
          text: `From: ${values.name}\nReply to: ${values.email}\nCategory: ${category.label}\nSubject: ${subject}\n\n${values.message}`,
        }),
      })
      if (!delivery.ok) return json(502, { code: 'delivery-unconfirmed' })
      const accepted: unknown = await delivery.json()
      const reference =
        accepted && typeof accepted === 'object' && 'id' in accepted
          ? accepted.id
          : undefined
      if (
        typeof reference !== 'string' ||
        !/^[a-zA-Z0-9_-]{1,128}$/.test(reference)
      )
        return json(502, { code: 'delivery-unconfirmed' })
      return json(200, {
        accepted: true,
        reference,
        receivedAt: now().toISOString(),
      })
    } catch {
      // No message bodies, email addresses, IPs or provider error payloads enter logs.
      return json(503, { code: 'delivery-unconfirmed' })
    }
  }
}

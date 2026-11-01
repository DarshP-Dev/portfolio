import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { contactConfig, createContactHandler } from '../server/contact-handler'
import {
  emptyContact,
  receiptFromResponse,
  receiptStatus,
  validateContact,
} from '../src/contact/model'
import { ContactReceipt } from '../src/components/contact/ContactReceipt'
import { site } from '../src/content/site'
import contactEndpoint from '../api/contact'

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

const values = {
  name: 'Taylor Example',
  email: 'taylor@example.com',
  subject: 'collaboration',
  customSubject: '',
  message: 'I would like to discuss a project.',
}
const payload = {
  ...values,
  website: '',
  requestId: 'f7f50cee-229a-4082-9ea3-b50b99f83b4c',
}
const env = {
  CONTACT_ENABLED: 'true',
  RESEND_API_KEY: 'unit-test-provider-key',
  CONTACT_FROM: 'portfolio@example.com',
  CONTACT_TO: 'owner@example.com',
  CONTACT_ALLOWED_ORIGINS: 'https://portfolio.example',
  UPSTASH_REDIS_REST_URL: 'https://redis.example',
  UPSTASH_REDIS_REST_TOKEN: 'unit-test-redis-token',
  CONTACT_HASH_SECRET: 'unit-test-only-hash-secret-long-enough',
}
const makeRequest = (
  body: unknown = payload,
  headers: Record<string, string> = {},
) =>
  new Request('https://portfolio.example/api/contact', {
    method: 'POST',
    headers: {
      Origin: 'https://portfolio.example',
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify(body),
  })
const mockDelivery = () =>
  vi
    .fn<typeof fetch>()
    .mockResolvedValueOnce(Response.json({ result: [1, 0] }))
    .mockResolvedValueOnce(
      Response.json({ id: 'provider-confirmed-reference' }),
    )

describe('letter schema and receipt truth', () => {
  it('trims input, requires custom subjects only for Other, and rejects header controls', () => {
    expect(
      validateContact({
        ...values,
        name: ' Taylor ',
        message: '\nHello\r\nworld\n',
      }).values,
    ).toMatchObject({ name: 'Taylor', message: 'Hello\nworld' })
    expect(
      validateContact({ ...values, subject: 'other' }).errors.customSubject,
    ).toBeDefined()
    expect(
      validateContact({ ...values, subject: 'hello', customSubject: 'unused' })
        .values.customSubject,
    ).toBe('')
    for (const email of [
      'invalid',
      'person@example.com\r\nBcc: other@example.com',
      'a..b@example.com',
      'a@-example.com',
    ])
      expect(validateContact({ ...values, email }).errors.email).toBeDefined()
    expect(
      validateContact({ ...values, name: 'Name\nHeader' }).errors.name,
    ).toBeDefined()
    expect(
      validateContact({
        ...values,
        subject: 'other',
        customSubject: 'Subject\r\nHeader',
      }).errors.customSubject,
    ).toBeDefined()
    expect(
      validateContact({ ...values, message: 'x'.repeat(6001) }).errors.message,
    ).toBeDefined()
  })
  it('has no received time or reference before a server-confirmed receipt', () => {
    expect(receiptStatus(emptyContact, 'draft')).toBe('READY')
    expect(receiptStatus({ ...emptyContact, email: 'typing' }, 'draft')).toBe(
      'BEING WRITTEN',
    )
    const valid = validateContact(values).values
    expect(receiptStatus(valid, 'draft')).toBe('READY TO SEND')
    expect(receiptStatus(valid, 'sending')).toBe('SENDING')
    expect(receiptStatus(valid, 'error')).toBe('ERROR')
    const html = renderToStaticMarkup(
      <ContactReceipt values={valid} phase="draft" />,
    )
    expect(html).not.toContain('<time')
    expect(html).not.toContain('REPLY BY')
    expect(html).toContain('REPLY TO')
    for (const invalid of [
      {},
      { accepted: true },
      { accepted: true, reference: 'id', receivedAt: 'not-a-date' },
    ])
      expect(receiptFromResponse(invalid)).toBeUndefined()
  })
  it('uses the approved public links while keeping the unapproved resume inactive', () => {
    expect(site.email).toBe('darshpatel060106@gmail.com')
    expect(site.linkedin).toBe('https://www.linkedin.com/in/darshpatel-dev')
    expect(site.portrait).toEqual({
      src: '/images/profile.webp',
      placeholder: true,
    })
    expect(site.resume).toBeUndefined()
  })
})

describe('server-only contact endpoint', () => {
  it('trusts only Vercel’s platform header in its function adapter', async () => {
    for (const [key, value] of Object.entries(env)) vi.stubEnv(key, value)
    vi.stubEnv('VERCEL', '1')
    const fetcher = mockDelivery()
    vi.stubGlobal('fetch', fetcher)
    expect(
      (
        await contactEndpoint.fetch(
          makeRequest(payload, { 'X-Forwarded-For': '192.0.2.1' }),
        )
      ).status,
    ).toBe(503)
    expect(fetcher).not.toHaveBeenCalled()
    expect(
      (
        await contactEndpoint.fetch(
          makeRequest(payload, { 'X-Vercel-Forwarded-For': '192.0.2.1' }),
        )
      ).status,
    ).toBe(200)
    vi.stubEnv('VERCEL', '')
    expect(
      (
        await contactEndpoint.fetch(
          makeRequest(payload, { 'X-Vercel-Forwarded-For': '192.0.2.1' }),
        )
      ).status,
    ).toBe(503)
    expect(fetcher).toHaveBeenCalledTimes(2)
  })
  it('reports unavailable and sends nothing when configuration is incomplete or disabled', async () => {
    for (const config of [
      contactConfig({}),
      contactConfig({ ...env, CONTACT_FROM: '' }),
      contactConfig({ ...env, CONTACT_ENABLED: 'false' }),
      contactConfig({ ...env, UPSTASH_REDIS_REST_TOKEN: '' }),
      contactConfig({ ...env, CONTACT_HASH_SECRET: 'short' }),
    ]) {
      const fetcher = vi.fn<typeof fetch>()
      const handler = createContactHandler(config, { fetch: fetcher })
      const status = await handler(
        new Request('https://portfolio.example/api/contact'),
      )
      expect(await status.json()).toEqual({ enabled: false })
      expect((await handler(makeRequest(), '192.0.2.1')).status).toBe(503)
      expect(fetcher).not.toHaveBeenCalled()
    }
  })
  it('rejects unsupported methods, origins, missing trusted IP, malformed data and the honeypot before sending', async () => {
    const fetcher = vi.fn<typeof fetch>()
    const handler = createContactHandler(contactConfig(env), { fetch: fetcher })
    expect(
      (
        await handler(
          new Request('https://portfolio.example/api/contact', {
            method: 'DELETE',
          }),
        )
      ).status,
    ).toBe(405)
    expect(
      (
        await handler(
          makeRequest(payload, { Origin: 'https://attacker.example' }),
          '192.0.2.1',
        )
      ).status,
    ).toBe(403)
    expect(
      (
        await handler(
          makeRequest(payload, { 'Sec-Fetch-Site': 'cross-site' }),
          '192.0.2.1',
        )
      ).status,
    ).toBe(403)
    expect((await handler(makeRequest(), undefined)).status).toBe(503)
    expect(
      (
        await handler(
          makeRequest(payload, { 'Content-Type': 'text/plain' }),
          '192.0.2.1',
        )
      ).status,
    ).toBe(415)
    expect(
      (await handler(makeRequest({ ...payload, website: 'bot' }), '192.0.2.1'))
        .status,
    ).toBe(400)
    expect(
      (
        await handler(
          makeRequest({ ...payload, requestId: 'not-uuid' }),
          '192.0.2.1',
        )
      ).status,
    ).toBe(400)
    expect(
      (
        await handler(
          makeRequest({ ...payload, email: 'invalid' }),
          '192.0.2.1',
        )
      ).status,
    ).toBe(422)
    const malformed = new Request('https://portfolio.example/api/contact', {
      method: 'POST',
      headers: {
        Origin: 'https://portfolio.example',
        'Content-Type': 'application/json',
      },
      body: '{invalid',
    })
    expect((await handler(malformed, '192.0.2.1')).status).toBe(400)
    expect(
      (
        await handler(
          makeRequest({ ...payload, message: 'x'.repeat(33_000) }),
          '192.0.2.1',
        )
      ).status,
    ).toBe(413)
    expect(fetcher).not.toHaveBeenCalled()
  })
  it('sends through a fixed authenticated sender with Reply-To, plain text and a provider idempotency key', async () => {
    const fetcher = mockDelivery()
    const handler = createContactHandler(contactConfig(env), {
      fetch: fetcher,
      now: () => new Date('2026-11-01T17:00:00.000Z'),
    })
    const response = await handler(
      makeRequest({ ...payload, message: '<script>not HTML</script>' }),
      '192.0.2.1',
    )
    expect(await response.json()).toEqual({
      accepted: true,
      reference: 'provider-confirmed-reference',
      receivedAt: '2026-11-01T17:00:00.000Z',
    })
    const limiter = JSON.parse(String(fetcher.mock.calls[0][1]?.body))
    expect(limiter[0]).toBe('EVAL')
    expect(limiter[1]).toContain("redis.call('EXPIRE'")
    expect(String(limiter)).not.toContain('192.0.2.1')
    expect(String(limiter)).not.toContain(values.email)
    const sent = JSON.parse(String(fetcher.mock.calls[1][1]?.body))
    expect(sent.from).toBe('Darsh Patel Portfolio <portfolio@example.com>')
    expect(sent.to).toEqual(['owner@example.com'])
    expect(sent.reply_to).toBe(values.email)
    expect(sent.text).toContain('<script>not HTML</script>')
    expect(sent.html).toBeUndefined()
    const headers = fetcher.mock.calls[1][1]?.headers as Record<string, string>
    expect(headers['Idempotency-Key']).toMatch(/^portfolio\/[0-9a-f]{64}$/)
    expect(headers.Authorization).toBe('Bearer unit-test-provider-key')
    expect(response.headers.get('cache-control')).toBe('no-store')
  })
  it('does not call the email provider when the durable limiter rejects or fails', async () => {
    for (const response of [
      Response.json({ result: [0, 600] }),
      Response.json({ error: 'redis failed' }),
      new Response('failure', { status: 500 }),
    ]) {
      const fetcher = vi.fn<typeof fetch>().mockResolvedValue(response)
      const result = await createContactHandler(contactConfig(env), {
        fetch: fetcher,
      })(makeRequest(), '192.0.2.1')
      expect([429, 503]).toContain(result.status)
      expect(fetcher).toHaveBeenCalledTimes(1)
      expect(await result.json()).not.toHaveProperty('accepted', true)
    }
  })
  it('keeps failed/ambiguous deliveries unconfirmed and does not leak provider errors', async () => {
    for (const response of [
      new Response('private provider details', { status: 500 }),
      Response.json({}),
      Response.json({ id: '<unsafe>' }),
    ]) {
      const fetcher = vi
        .fn<typeof fetch>()
        .mockResolvedValueOnce(Response.json({ result: [1, 0] }))
        .mockResolvedValueOnce(response)
      const result = await createContactHandler(contactConfig(env), {
        fetch: fetcher,
      })(makeRequest(), '192.0.2.1')
      expect(result.status).toBe(502)
      expect(await result.text()).toBe('{"code":"delivery-unconfirmed"}')
    }
  })
  it('reuses the same provider key on retry and changes it for a different letter', async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockImplementation(async (url) =>
        String(url).includes('redis.example')
          ? Response.json({ result: [1, 0] })
          : Response.json({ id: 'provider-id' }),
      )
    const handler = createContactHandler(contactConfig(env), { fetch: fetcher })
    await handler(makeRequest(), '192.0.2.1')
    await handler(makeRequest(), '192.0.2.1')
    await handler(
      makeRequest({ ...payload, message: 'A different letter.' }),
      '192.0.2.1',
    )
    const keys = [1, 3, 5].map(
      (index) =>
        (fetcher.mock.calls[index][1]?.headers as Record<string, string>)[
          'Idempotency-Key'
        ],
    )
    expect(keys[0]).toBe(keys[1])
    expect(keys[0]).not.toBe(keys[2])
  })
})

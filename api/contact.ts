import {
  contactConfig,
  createContactHandler,
} from '../server/contact-handler.ts'

export default {
  async fetch(request: Request) {
    const handler = createContactHandler(contactConfig(process.env))
    // Only trust the platform-replaced header in the Vercel runtime.
    const clientIp =
      process.env.VERCEL === '1'
        ? request.headers.get('x-vercel-forwarded-for')?.split(',')[0].trim()
        : undefined
    return handler(request, clientIp)
  },
}

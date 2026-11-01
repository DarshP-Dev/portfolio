import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { localContact } from './server/local-contact.ts'

export default defineConfig(({ mode }) => {
  const resumePath = resolve('public/resume/Darsh_Patel_Resume.pdf')
  const resumeAvailable =
    existsSync(resumePath) &&
    readFileSync(resumePath).subarray(0, 5).toString() === '%PDF-'
  const contact = localContact({
    ...loadEnv(mode, process.cwd(), ''),
    ...process.env,
  })
  return {
    define: { __APPROVED_RESUME_AVAILABLE__: JSON.stringify(resumeAvailable) },
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'local-contact-endpoint',
        configureServer(server) {
          server.middlewares.use((request, response, next) => {
            if (/^\/api\/contact\/?(?:\?|$)/.test(request.url ?? ''))
              void contact(request, response)
            else next()
          })
        },
      },
    ],
  }
})

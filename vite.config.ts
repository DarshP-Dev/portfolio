import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { localContact } from './server/local-contact.ts'
import {
  publicationSettings,
  resumeAssetPath,
} from './src/content/publication.ts'

export default defineConfig(({ mode, command }) => {
  const env = {
    ...loadEnv(mode, process.cwd(), ''),
    ...process.env,
  }
  const resumeUrl = resumeAssetPath(env.VITE_RESUME_PATH)
  const resumePath = resolve('public', `.${resumeUrl}`)
  const resumeAvailable =
    existsSync(resumePath) &&
    readFileSync(resumePath).subarray(0, 5).toString() === '%PDF-'
  const contact = localContact(env)
  const publication = publicationSettings(env, command === 'build')
  return {
    define: {
      __APPROVED_RESUME_URL__: JSON.stringify(
        resumeAvailable ? resumeUrl : null,
      ),
      __PUBLICATION__: JSON.stringify(publication),
    },
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

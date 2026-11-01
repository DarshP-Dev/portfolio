import { createServer } from 'vite'
import react from '@vitejs/plugin-react'

// A separate loopback-only fixture server; no fixture is part of the production build.
const server = await createServer({
  configFile: false,
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: Number(process.env.FIXTURE_PORT || 4177),
    strictPort: true,
  },
})
await server.listen()
server.printUrls()

import { defineConfig, devices } from '@playwright/test'

const baseURL = `http://127.0.0.1:${process.env.PORT || 4173}`

export default defineConfig({
  // Bound parallel Chrome processes so motion assertions are not starved by concurrent video/axe work.
  workers: 2,
  testDir: './tests/browser',
  use: { baseURL, trace: 'retain-on-failure' },
  webServer: [
    {
      command: 'npm run preview',
      url: baseURL,
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'node tests/fixtures/serve-media.mjs',
      url: `http://127.0.0.1:${process.env.FIXTURE_PORT || 4177}/tests/fixtures/media/index.html`,
      reuseExistingServer: !process.env.CI,
    },
  ],
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    },
  ],
})

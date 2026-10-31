import { defineConfig, devices } from '@playwright/test'

const baseURL = `http://127.0.0.1:${process.env.PORT || 4173}`

export default defineConfig({
  testDir: './tests/browser',
  use: { baseURL, trace: 'retain-on-failure' },
  webServer: {
    command: 'npm run preview',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    },
  ],
})

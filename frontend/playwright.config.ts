import { defineConfig, devices } from '@playwright/test'

const PORT: number = Number(process.env.PORT ?? 3000)
const BASE_URL: string =
	process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${PORT}`

/**
 * E2E tests live in e2e/ (outside src/, so FSD rules don't apply).
 * https://playwright.dev/docs/test-configuration
 */

export default defineConfig({
	testDir: './e2e',
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 1 : undefined,
	reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'html',
	use: {
		baseURL: BASE_URL,
		trace: 'on-first-retry',
		screenshot: 'only-on-failure',
	},
	projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
	webServer: process.env.PLAYWRIGHT_BASE_URL
		? undefined
		: {
				command: process.env.CI
					? `bun run build && bun run start --port ${PORT}`
					: `bun run dev --port ${PORT}`,
				url: BASE_URL,
				reuseExistingServer: !process.env.CI,
				timeout: 180_000,
			},
})

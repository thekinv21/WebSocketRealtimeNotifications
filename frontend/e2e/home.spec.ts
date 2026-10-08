import { expect, test } from '@playwright/test'

test.describe('Home page', () => {
	test('renders with the app title', async ({ page }) => {
		await page.goto('/')

		await expect(page).toHaveTitle('Real-Time Notifications')
		await expect(page.locator('body')).toBeVisible()
	})
})

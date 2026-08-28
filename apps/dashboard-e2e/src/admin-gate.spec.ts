import { test, expect } from '@playwright/test';

/**
 * The console is served under /admin and admin auth is not wired up yet, so visiting /admin renders
 * it directly. This verifies the app boots there and lands on the overview.
 */
test('opens the console at /admin', async ({ page }) => {
  await page.goto('/admin');

  await expect(page).toHaveTitle(/Tử Vi/);
  await expect(page.getByRole('heading', { name: 'Tổng quan' })).toBeVisible();
});

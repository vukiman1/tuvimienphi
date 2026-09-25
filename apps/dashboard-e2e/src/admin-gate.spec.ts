import { test, expect } from '@playwright/test';

test('keeps a visitor without a session out of the console', async ({ page }) => {
  await page.goto('/admin');

  await expect(page).toHaveTitle(/Tử Vi/);
  await expect(page).toHaveURL(/\/admin\/login$/);
  await expect(page.getByRole('heading', { name: 'Bảng điều khiển' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Tổng quan' })).toHaveCount(0);
});

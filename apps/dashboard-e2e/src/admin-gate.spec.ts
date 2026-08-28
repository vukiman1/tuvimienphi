import { test, expect } from '@playwright/test';

/**
 * The console is a production build with no session in CI, so `/auth/me` fails and the app renders
 * the admin gate rather than the console. This verifies the app boots and gates access as intended.
 */
test('shows the admin gate to an unauthenticated visitor', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/Tử Vi/);
  await expect(page.getByRole('heading', { name: 'Cửa quản trị' })).toBeVisible();
  await expect(page.getByText('Không đủ thẩm quyền truy cập')).toBeVisible();
});

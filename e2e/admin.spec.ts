import { test, expect } from '@playwright/test';

const adminEmail = process.env.E2E_ADMIN_EMAIL ?? 'admin@hackersdeal.com';
const adminPassword = process.env.E2E_ADMIN_PASSWORD ?? 'Admin12345!';

test.describe('Admin panel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login');
    await page.getByLabel(/email/i).fill(adminEmail);
    await page.getByLabel(/password/i).fill(adminPassword);
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForURL(/\/dashboard/, { timeout: 30_000 });
  });

  test('admin hub loads', async ({ page }) => {
    await page.goto('/dashboard/admin');
    await expect(page.getByText(/email templates|all projects|dispute/i).first()).toBeVisible();
  });

  test('analytics page loads', async ({ page }) => {
    await page.goto('/dashboard/admin/analytics');
    await expect(page.getByRole('heading', { name: /platform analytics/i })).toBeVisible();
  });

  test('dispute center loads', async ({ page }) => {
    await page.goto('/dashboard/admin/disputes');
    await expect(page.getByRole('heading', { name: /dispute center/i })).toBeVisible();
  });
});

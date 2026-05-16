import { test, expect } from '@playwright/test';

const demoEmail = process.env.E2E_CLIENT_EMAIL ?? 'demo@hackersdeal.com';
const demoPassword = process.env.E2E_CLIENT_PASSWORD ?? 'demo12345';

test.describe('Authentication UI', () => {
  test('login page renders', async ({ page }) => {
    await page.goto('/auth/login');
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
  });

  test('client can log in and reach dashboard', async ({ page }) => {
    await page.goto('/auth/login');
    await page.getByLabel(/email/i).fill(demoEmail);
    await page.getByLabel(/password/i).fill(demoPassword);
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForURL(/\/dashboard/, { timeout: 30_000 });
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/dashboard/i);
  });
});

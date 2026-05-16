import { test, expect } from '@playwright/test';

test.describe('Marketing pages', () => {
  test('home page loads', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/security talent/i);
  });

  test('how it works', async ({ page }) => {
    await page.goto('/how-it-works');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/security work/i);
  });

  test('pricing', async ({ page }) => {
    await page.goto('/pricing');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/pricing/i);
  });

  test('trust', async ({ page }) => {
    await page.goto('/trust');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/trust/i);
  });

  test('marketplace', async ({ page }) => {
    await page.goto('/marketplace');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });
});

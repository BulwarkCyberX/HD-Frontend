import { test, expect } from '@playwright/test';

const apiBase = process.env.PLAYWRIGHT_API_URL ?? 'http://localhost:4000';

test.describe('API health', () => {
  test('GET /health', async ({ request }) => {
    const res = await request.get(`${apiBase}/health`);
    expect(res.ok()).toBeTruthy();
  });

  test('GET /health/ready', async ({ request }) => {
    const res = await request.get(`${apiBase}/health/ready`);
    expect(res.ok()).toBeTruthy();
  });

  test('GET /public/projects', async ({ request }) => {
    const res = await request.get(`${apiBase}/public/projects`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(Array.isArray(body)).toBeTruthy();
  });
});

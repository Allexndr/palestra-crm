import { test, expect } from '@playwright/test';

test.describe('Localization & UI Integrity', () => {
  // Mock API responses for reliability
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        // Use 'admin' role and an email that DOES NOT trigger superadmin redirect
        body: JSON.stringify({ user: { id: 'admin-id', role: 'admin', name: 'Admin User', email: 'admin@palestra.fit' } }),
      });
    });

    await page.route('**/api/app/state', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            state: {
              members: [],
              leads: [],
              schedule: [],
              locations: [],
              groups: [],
              activities: [],
              leagues: [],
              plans: [],
              posts: [],
              coaches: [],
              events: [],
              attendance: [],
              finances: { revenue: 0, transactions: [] },
              achievements: [],
              quests: [],
              feedbacks: [],
              automations: { fired: [] },
              messages: [],
              partners: [],
              monthlyAward: { title: 'Test Award', description: 'Test', daysLeft: 10 },
              selectedLocationId: 'all',
              clubInfo: { name: 'Palestra Test', logo: '', primaryColor: '#4338ca' },
              subscription: { plan: 'growth', features: {}, limits: {} },
            }
          }),
        });
      } else {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) });
      }
    });

    await page.route('**/api/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: { id: 'admin-id', role: 'admin', name: 'Admin User', email: 'admin@palestra.fit' } }),
      });
    });
  });

  async function loginAsAdmin(page) {
    await page.goto('/auth/login');
    await page.waitForSelector('input[type="password"]', { state: 'visible' });
    
    // Fill credentials
    await page.locator('input[type="text"], input[type="email"]').first().fill('admin@palestra.fit');
    await page.locator('input[type="password"]').first().fill('password');
    
    // Submit
    await page.locator('button[type="submit"]').click();
    
    // Wait for the dashboard shell
    // In Palestra, AdminLayout uses .member-app-shell
    await page.waitForSelector('.member-app-shell', { timeout: 15000 });
  }

  test('Landing page should not have raw tags', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('body');
    
    const textContent = await page.innerText('body');
    const words = textContent.split(/\s+/);
    const rawTags = words.filter(word => {
      if (word.includes('.js') || word.includes('.com') || !word.includes('.')) return false;
      return /^[a-z_]+\.[a-z_]+$/.test(word);
    });

    expect(rawTags.length).toBe(0);
  });

  test('Admin dashboard should not have raw tags', async ({ page }) => {
    await loginAsAdmin(page);
    
    const shell = page.locator('.member-app-shell');
    const textContent = await shell.innerText();
    const words = textContent.split(/\s+/);
    const rawTags = words.filter(word => {
      if (word.includes('.js') || word.includes('.com') || !word.includes('.')) return false;
      return /^[a-z_]+\.[a-z_]+$/.test(word);
    });

    expect(rawTags.length).toBe(0);
  });
  
  test('Language switching works correctly', async ({ page }) => {
    await loginAsAdmin(page);
    
    // Switch to KZ
    const kzButton = page.getByText('KZ', { exact: true }).first();
    await expect(kzButton).toBeVisible();
    await kzButton.click();
    
    await page.waitForTimeout(1000);
    
    const textContent = await page.innerText('body');
    const words = textContent.split(/\s+/);
    const rawTags = words.filter(word => {
      if (word.includes('.js') || word.includes('.com') || !word.includes('.')) return false;
      return /^[a-z_]+\.[a-z_]+$/.test(word);
    });
    
    expect(rawTags.length).toBe(0);
  });
});

import { test, expect } from '@playwright/test';

test.describe('Admin Control - Maintenance Mode', () => {
  test('should display maintenance banner when enabled', async ({ page, context }) => {
    // 1. Visit normally
    await page.goto('/');
    await expect(page.getByText(/System Maintenance/i)).not.toBeVisible();

    // 2. Intercept response to force maintenance mode
    // This is more reliable than cookies/headers for client-side fetches
    await page.route('**/api/notices/active', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [{
            id: 'mock-maint',
            title: 'System Maintenance',
            message: 'We are currently upgrading our atmospheric sensors.',
            type: 'maintenance',
            is_active: true,
            expires_at: null,
            created_at: new Date().toISOString()
          }]
        })
      });
    });

    // 3. Reload and check for banner
    await page.reload();
    await expect(page.getByText(/System Maintenance/i)).toBeVisible();
    await expect(page.getByText(/atmospheric sensors/i)).toBeVisible();
  });

  test('should block analysis when maintenance mode is active', async ({ page, context }) => {
    // 1. Enable maintenance mode via cookie
    await context.addCookies([{
      name: 'mock_maintenance',
      value: 'true',
      domain: 'localhost',
      path: '/'
    }]);

    await page.goto('/');

    // 2. Fill out form (University of Toronto - St. George)
    const universitySelect = page.locator('select').first();
    await universitySelect.selectOption('University of Toronto');
    
    const campusSelect = page.locator('select').nth(1);
    await campusSelect.selectOption('St. George');

    // 3. Upload a mock schedule
    await page.setInputFiles('input[type="file"]', {
      name: 'mock-schedule.png',
      mimeType: 'image/png',
      buffer: Buffer.from('maintenance-trigger'),
    });

    // 4. Click Analyze
    const analyzeButton = page.getByRole('button', { name: /Analyze Schedule/i });
    await analyzeButton.click();

    // 5. Verify the error message/toast
    // The Gemini service throws an error if in maintenance mode
    // We expect the error to be displayed in the UI
    await expect(page.getByText(/System is currently under maintenance/i)).toBeVisible();
  });
});

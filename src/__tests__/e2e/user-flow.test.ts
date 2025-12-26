import { test, expect } from '@playwright/test';

test.describe('Stratus Core User Flow', () => {
  test('should complete a full analysis journey (Happy Path)', async ({ page }) => {
    // 0. Set Mock AI Cookie
    await page.context().addCookies([
      { name: 'mock_ai', value: 'true', url: 'http://localhost:3000' }
    ]);

    // 1. Visit the app
    await page.goto('/');
    
    // 2. Select University
    const universitySelect = page.locator('select').first();
    await universitySelect.selectOption('University of Toronto');
    
    // 3. Select Campus
    // Note: OnboardingWizard shows campus selection if there's more than one
    const campusSelect = page.locator('select').nth(1);
    await campusSelect.selectOption('St. George');
    
    // 4. Select Day (default is today, let's pick Tomorrow to test changes)
    const daySelect = page.locator('select').nth(2);
    await daySelect.selectOption('tomorrow');

    // 5. Upload a mock schedule
    // Using a valid 1x1 PNG base64 to pass MIME type checks
    const validPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKwjwAAAAABJRU5ErkJggg==', 'base64');
    await page.setInputFiles('input[type="file"]', {
      name: 'mock-schedule.png',
      mimeType: 'image/png',
      buffer: validPng,
    });

    // 6. Verify that "Analyze" button is now enabled
    const analyzeButton = page.getByRole('button', { name: /Analyze Schedule/i });
    await expect(analyzeButton).toBeEnabled();

    // 7. Click Analyze
    await analyzeButton.click();

    // 8. Wait for results (increase timeout for Gemini processing)
    // We look for parts of the AnalysisView
    await expect(page.getByText('Master Recommendation')).toBeVisible({ timeout: 30000 });
    
    // 10. Verify that the result view contains actual data
    await expect(page.getByText('Layering Strategy')).toBeVisible(); // Label for baseOutfit
    await expect(page.getByText('Condition').first()).toBeVisible(); // Label for weather conditions
  });
});

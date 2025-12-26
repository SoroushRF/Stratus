import { test, expect } from '@playwright/test';

test.describe('Stratus Smoke Tests', () => {
  test('should load the landing page and show title', async ({ page }) => {
    // Navigate to the landing page
    await page.goto('/');

    // Check that the title is present
    await expect(page.locator('h1')).toContainText('Stratus');
    
    // Check for the subtitle
    await expect(page.getByText('AI-Powered Weather & Attire Intelligence')).toBeVisible();
  });

  test('should show onboarding wizard', async ({ page }) => {
    await page.goto('/');

    // Wait for the main heading to be visible
    await expect(page.getByRole('heading', { name: 'Select Your Campus' })).toBeVisible();
    
    // Check for the university dropdown
    const universitySelect = page.locator('select').first();
    await expect(universitySelect).toBeVisible();
    
    // The analyze button should be visible but disabled initially
    const analyzeButton = page.getByRole('button', { name: /Analyze Schedule/i });
    await expect(analyzeButton).toBeVisible();
    await expect(analyzeButton).toBeDisabled();
  });
});

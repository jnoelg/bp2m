import { test, expect } from '@playwright/test';

test.describe('BPM App E2E Test for Vanilla JS version', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the initial empty state', async ({ page }) => {
    await expect(page.locator('text=Start tapping to measure BPM...')).toBeVisible();
    await expect(page.locator('.stats-grid')).not.toBeVisible();
    await expect(page.locator('.chart-card')).not.toBeVisible();
  });

  test('should allow tapping and display stats and chart', async ({ page }) => {
    // Tap the button 3 times with 1-second intervals for a ~60bpm reading
    await page.locator('#tap-btn').click();
    await page.waitForTimeout(1000);
    await page.locator('#tap-btn').click();
    await page.waitForTimeout(1000);
    await page.locator('#tap-btn').click();

    // Check that stats are visible
    await expect(page.locator('#results')).toBeVisible();

    // Check for each stat card and that it contains a value
    await expect(page.locator('#avg-bpm')).not.toHaveText('0');
    await expect(page.locator('#filtered-bpm')).not.toHaveText('0');
    await expect(page.locator('#avg-interval')).not.toHaveText('0');
    await expect(page.locator('#std-dev')).not.toHaveText('0');

    // Check that the chart is visible
    await expect(page.locator('.chart-card')).toBeVisible();
    await expect(page.locator('.chart-wrapper canvas')).toBeVisible();

    // Check the header info
    await expect(page.locator('#beat-count')).toHaveText('3');
    await expect(page.locator('#duration')).toContainText('s');
  });

  test('should reset the data when reset link is clicked', async ({ page }) => {
    // Tap a few times to generate data
    await page.locator('#tap-btn').click();
    await page.waitForTimeout(500);
    await page.locator('#tap-btn').click();
    await expect(page.locator('#results')).toBeVisible();

    // Click reset
    await page.locator('#reset-link').click();

    // Verify it's back to the initial state
    await expect(page.locator('text=Start tapping to measure BPM...')).toBeVisible();
    await expect(page.locator('#results')).not.toBeVisible();
  });

  test('should toggle dark mode and persist preference', async ({ page }) => {
    // Check initial state (light mode)
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');

    // Click toggle to switch to dark mode
    await page.locator('#theme-toggle').click();

    // Check for dark mode attribute and local storage
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    const theme = await page.evaluate(() => localStorage.getItem('theme'));
    expect(theme).toBe('dark');

    // Reload and check if it persists
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });
});

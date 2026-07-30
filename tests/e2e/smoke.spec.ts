import { test, expect } from '@playwright/test';

test.describe('Milestone 0 Framework Scaffolding Smoke Test', () => {
  test('hydrates the homepage and displays Pakistani Clothing brand branding', async ({ page }) => {
    await page.goto('/');

    // Check page title
    await expect(page).toHaveTitle(/Pakistani Clothing Commerce Framework/i);

    // Check header branding
    const headerTitle = page.locator('header');
    await expect(headerTitle).toContainText('PAKISTANICLOTHING');
    await expect(headerTitle).toContainText('COD Engine v0.1');

    // Check top bar COD announcement
    const topBar = page.locator('body');
    await expect(topBar).toContainText(/Free Cash on Delivery \(COD\) across Pakistan/i);

    // Check hero headline
    await expect(page.locator('h1')).toContainText('Next-Generation Pakistani Apparel Commerce');
  });
});

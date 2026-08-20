const { test, expect } = require('@playwright/test');
const { dismissOnboarding } = require('./helpers');

test.describe('Ask AI — copy as link', () => {
  test('copies a data: URL whose decoded content matches the plain "Copy for AI" text', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await dismissOnboarding(page);

    await page.click('button:has-text("🤖 Ask AI")');
    await expect(page.locator('.modal-box')).toBeVisible();

    const expectedText = await page.evaluate(() => buildAIExport());

    await page.click('button:has-text("🔗 Copy as link instead")');
    await expect(page.locator('text=Link copied to clipboard.')).toBeVisible();

    const copied = await page.evaluate(() => navigator.clipboard.readText());
    expect(copied.startsWith('data:text/plain;charset=utf-8,')).toBe(true);
    const decoded = decodeURIComponent(copied.slice('data:text/plain;charset=utf-8,'.length));
    expect(decoded).toBe(expectedText);
  });
});

const { test, expect } = require('@playwright/test');
const { dismissOnboarding } = require('./helpers');

test.describe('Hide All / Show All', () => {
  test('Hide All folds every panel, including Proficiencies & Languages', async ({ page }) => {
    await dismissOnboarding(page);

    await page.click('button:has-text("Hide All")');
    const folded = await page.evaluate(() => ({ ...foldedPanels }));
    expect(folded.proficiencies).toBe(true);
    expect(Object.values(folded).every(Boolean)).toBe(true);
    await expect(page.locator('.panel', { has: page.locator('h2:has-text("Proficiencies & Languages")') })).toHaveClass(/folded/);

    await page.click('button:has-text("Show All")');
    const unfolded = await page.evaluate(() => ({ ...foldedPanels }));
    expect(unfolded.proficiencies).toBe(false);
    expect(Object.values(unfolded).every(v => !v)).toBe(true);
  });
});

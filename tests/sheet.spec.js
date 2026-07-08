const { test, expect } = require('@playwright/test');
const { dismissOnboarding } = require('./helpers');

test.describe('character sheet editing', () => {
  test('edits autosave and survive a reload', async ({ page }) => {
    await dismissOnboarding(page);

    await page.evaluate(() => set('name', 'Aria Nightwind'));
    await expect(page.locator('#saveStatus')).toContainText('saved', { timeout: 2000 });

    await page.reload();
    const name = await page.evaluate(() => state.name);
    expect(name).toBe('Aria Nightwind');
  });

  test('rolling a die records a result in range', async ({ page }) => {
    await dismissOnboarding(page);

    await page.locator('.die-btn:has-text("d20")').click();
    const lastRoll = await page.evaluate(() => diceState.lastRoll);
    expect(lastRoll).toBeGreaterThanOrEqual(1);
    expect(lastRoll).toBeLessThanOrEqual(20);
  });

  test('adding an attack via the modal adds it to state', async ({ page }) => {
    await dismissOnboarding(page);

    await page.click('button:has-text("Attack")');
    await page.fill('#modalAttackName', 'Dagger');
    await page.fill('#modalAttackDmg', '1d4');
    await page.locator('.modal-backdrop button:has-text("Done")').click();

    const attackNames = await page.evaluate(() => state.attacks.map(a => a.name));
    expect(attackNames).toContain('Dagger');
  });

  test('exporting a character downloads a JSON file', async ({ page }) => {
    await dismissOnboarding(page);
    await page.evaluate(() => set('name', 'Export Test'));
    await page.waitForTimeout(500);

    await page.click('button:has-text("Export")');
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Download JSON file")');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('Export_Test.json');
  });
});

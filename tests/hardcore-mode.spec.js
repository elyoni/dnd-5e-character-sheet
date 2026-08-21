const { test, expect } = require('@playwright/test');
const { dismissOnboarding } = require('./helpers');

test.describe('Hardcore Mode (diceMode = "hardcore")', () => {
  test('the Dice Mode select persists diceMode and the Dice Roller panel disappears in Hardcore', async ({ page }) => {
    await dismissOnboarding(page);

    expect(await page.evaluate(() => diceMode)).toBe('3d');
    await expect(page.locator('h2:has-text("Dice Roller")')).toBeVisible();

    await page.evaluate(() => setDiceMode('hardcore'));
    expect(await page.evaluate(() => diceMode)).toBe('hardcore');
    await expect(page.locator('h2:has-text("Dice Roller")')).toHaveCount(0);
  });

  test('a save roll shows the formula in the overlay instead of a rolled number, and never touches roll history', async ({ page }) => {
    await dismissOnboarding(page);
    await page.evaluate(() => {
      setDiceMode('hardcore');
      set('abilities.dex', 16); // +3 mod, so the formula has a non-zero term to show
      set('saveProf.dex', true);
    });

    await page.evaluate(() => rollSave('dex'));
    await expect(page.locator('#dice-3d-overlay')).toHaveClass(/visible/);

    const bannerText = await page.locator('#dice-3d-labels').innerText();
    expect(bannerText).toMatch(/d20/);
    expect(bannerText).toContain('+3');
    expect(bannerText).toContain('(');

    expect(await page.evaluate(() => saveRollFlash)).toBeNull();
  });

  test('an attack roll in Hardcore Mode shows both the hit and damage formulas plus a crit note, and records no history', async ({ page }) => {
    await dismissOnboarding(page);
    await page.evaluate(() => setDiceMode('hardcore'));

    await page.locator('.atk-roll-btn-mini').first().click();
    await expect(page.locator('#dice-3d-overlay')).toHaveClass(/visible/);

    const bannerText = await page.locator('#dice-3d-labels').innerText();
    expect(bannerText).toMatch(/d20/);
    expect(bannerText).toMatch(/\dd\d/); // damage dice notation, e.g. "1d6"
    expect(bannerText).toContain('🎯');

    expect(await page.evaluate(() => attackRollHistories[0])).toBeUndefined();
  });

  test('an old install with dnd-slow-dice="1" migrates to diceMode "slow" on load', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('dnd-sheet:dnd-slow-dice', '1');
    });
    await dismissOnboarding(page);

    expect(await page.evaluate(() => diceMode)).toBe('slow');
  });
});

const { test, expect } = require('@playwright/test');
const { dismissOnboarding } = require('./helpers');

test.describe('panel folding', () => {
  test('folding the Spells panel also hides its action buttons (Add Spell / Collapse All / Expand All)', async ({ page }) => {
    await dismissOnboarding(page);

    const spellsPanel = page.locator('.panel', { has: page.locator('h2', { hasText: 'Spells' }) });
    await expect(spellsPanel.locator('.spell-actions-row')).toBeVisible();

    await page.evaluate(() => togglePanelFold('spells'));

    await expect(spellsPanel).toHaveClass(/folded/);
    await expect(spellsPanel.locator('.spell-actions-row')).toBeHidden();
  });

  test('folding the On Your Turn panel also hides the List view-toggle button in its header', async ({ page }) => {
    await dismissOnboarding(page);

    const turnPanel = page.locator('.panel', { has: page.locator('h2', { hasText: 'On Your Turn' }) });
    await expect(turnPanel.locator('.view-toggle-group')).toBeVisible();

    await page.evaluate(() => togglePanelFold('turnFlow'));

    await expect(turnPanel).toHaveClass(/folded/);
    await expect(turnPanel.locator('.view-toggle-group')).toBeHidden();
  });

  test('folded/unfolded panel state persists across a reload', async ({ page }) => {
    await dismissOnboarding(page);

    await page.evaluate(() => togglePanelFold('spells'));
    await page.evaluate(() => togglePanelFold('attacks'));
    await page.waitForTimeout(100);

    await page.reload();
    await page.waitForTimeout(200);

    const state = await page.evaluate(() => ({ spells: !!foldedPanels['spells'], attacks: !!foldedPanels['attacks'], feats: !!foldedPanels['feats'] }));
    expect(state.spells).toBe(true);
    expect(state.attacks).toBe(true);
    expect(state.feats).toBe(false);
  });
});

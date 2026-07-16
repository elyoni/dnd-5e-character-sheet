const { test, expect } = require('@playwright/test');
const { dismissOnboarding } = require('./helpers');

test.describe('spell categories and folding', () => {
  test('setting a category on the New Spell modal saves it and shows the matching icon', async ({ page }) => {
    await dismissOnboarding(page);

    await page.evaluate(() => openSpellModal(1));
    await page.fill('#modalSpellName', 'Test Fireball');
    await page.selectOption('#modalSpellCategory', 'attack');
    await page.locator('.modal-box button.primary').click();

    const spell = await page.evaluate(() => state.spells.find(s => s.name === 'Test Fireball'));
    expect(spell.category).toBe('attack');
    expect(spell.folded).toBe(false);

    const spellItem = page.locator('.spell-item').filter({ has: page.locator('input.spell-name-input[value="Test Fireball"]') });
    await expect(spellItem.locator('.spell-category-select')).toHaveValue('attack');
  });

  test('folding a spell hides range/casting-time/notes but keeps the name and category icon', async ({ page }) => {
    await dismissOnboarding(page);

    await page.evaluate(() => openSpellModal(1));
    await page.fill('#modalSpellName', 'Test Fireball');
    await page.selectOption('#modalSpellCategory', 'attack');
    await page.locator('.modal-box button.primary').click();

    const spellItem = page.locator('.spell-item').filter({ has: page.locator('input.spell-name-input[value="Test Fireball"]') });
    await spellItem.locator('.fold-toggle').click();

    const folded = await page.evaluate(() => state.spells.find(s => s.name === 'Test Fireball').folded);
    expect(folded).toBe(true);

    await expect(spellItem).toHaveClass(/folded/);
    await expect(spellItem.locator('.spell-meta-row')).toBeHidden();
    await expect(spellItem.locator('.spell-notes-input')).toBeHidden();
    await expect(spellItem.locator('.spell-category-icon')).toHaveText('⚔️');
    await expect(spellItem.locator('.spell-name-input')).toBeVisible();
  });

  test('Collapse All / Expand All folds and unfolds every spell at once', async ({ page }) => {
    await dismissOnboarding(page);

    await page.evaluate(() => openSpellModal(0));
    await page.fill('#modalSpellName', 'Spell One');
    await page.locator('.modal-box button.primary').click();

    await page.evaluate(() => openSpellModal(0));
    await page.fill('#modalSpellName', 'Spell Two');
    await page.locator('.modal-box button.primary').click();

    const spellsPanel = page.locator('.panel').filter({ has: page.locator('.spell-item') });
    await spellsPanel.locator('button:has-text("Collapse")').click();
    let folded = await page.evaluate(() => state.spells.map(s => s.folded));
    expect(folded).toEqual([true, true]);
    await expect(page.locator('.spell-item.folded')).toHaveCount(2);

    await spellsPanel.locator('button:has-text("Expand")').click();
    folded = await page.evaluate(() => state.spells.map(s => s.folded));
    expect(folded).toEqual([false, false]);
    await expect(page.locator('.spell-item.folded')).toHaveCount(0);
  });
});

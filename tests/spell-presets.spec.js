const { test, expect } = require('@playwright/test');
const { dismissOnboarding } = require('./helpers');

test.describe('premade spell picker', () => {
  test('picking a preset pre-fills the modal fields, and confirming adds it to state.spells', async ({ page }) => {
    await dismissOnboarding(page);

    await page.evaluate(() => openSpellModal(1));
    await page.selectOption('#modalSpellPreset', { label: 'Guiding Bolt' });

    await expect(page.locator('#modalSpellLevel')).toHaveValue('1');
    await expect(page.locator('#modalSpellName')).toHaveValue('Guiding Bolt');
    await expect(page.locator('#modalSpellDmg')).toHaveValue('4d6');
    await expect(page.locator('#modalSpellNotes')).toHaveValue(/radiant damage/);

    await page.locator('.modal-box button.primary').click();

    const spell = await page.evaluate(() => state.spells.find(s => s.name === 'Guiding Bolt'));
    expect(spell).toBeTruthy();
    expect(spell.level).toBe(1);
    expect(spell.dmg).toBe('4d6');
  });

  test('manual spell entry still works without touching the preset picker', async ({ page }) => {
    await dismissOnboarding(page);

    await page.evaluate(() => openSpellModal(3));
    await page.fill('#modalSpellName', 'Homebrew Zap');
    await page.fill('#modalSpellDmg', '2d10');
    await page.locator('.modal-box button.primary').click();

    const spell = await page.evaluate(() => state.spells.find(s => s.name === 'Homebrew Zap'));
    expect(spell).toBeTruthy();
    expect(spell.level).toBe(3);
    expect(spell.dmg).toBe('2d10');
  });

  test('a non-damaging preset leaves the damage field empty', async ({ page }) => {
    await dismissOnboarding(page);

    await page.evaluate(() => openSpellModal(0));
    await page.selectOption('#modalSpellPreset', { label: 'Druidcraft' });

    await expect(page.locator('#modalSpellLevel')).toHaveValue('0');
    await expect(page.locator('#modalSpellName')).toHaveValue('Druidcraft');
    await expect(page.locator('#modalSpellDmg')).toHaveValue('');
  });
});

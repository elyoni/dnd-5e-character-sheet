const { test, expect } = require('@playwright/test');
const { dismissOnboarding } = require('./helpers');

test.describe('spell casting time dropdown', () => {
  test('picking a standard option from the New Spell modal saves it as-is', async ({ page }) => {
    await dismissOnboarding(page);

    await page.evaluate(() => openSpellModal(1));
    await page.fill('#modalSpellName', 'Test Spell');
    await page.selectOption('#modalSpellCastTime', { label: 'Action' });
    await page.locator('.modal-box button.primary').click();

    const spell = await page.evaluate(() => state.spells.find(s => s.name === 'Test Spell'));
    expect(spell.castTime).toBe('Action');
    expect(spell.castTimeCustom).toBe(false);
  });

  test('picking "Custom..." in the New Spell modal reveals a free-text field that gets saved', async ({ page }) => {
    await dismissOnboarding(page);

    await page.evaluate(() => openSpellModal(1));
    await page.fill('#modalSpellName', 'Test Spell');
    await expect(page.locator('#modalSpellCastTimeCustom')).toBeHidden();
    await page.selectOption('#modalSpellCastTime', '__custom__');
    await expect(page.locator('#modalSpellCastTimeCustom')).toBeVisible();
    await page.fill('#modalSpellCastTimeCustom', '1 Reaction, when hit by an attack');
    await page.locator('.modal-box button.primary').click();

    const spell = await page.evaluate(() => state.spells.find(s => s.name === 'Test Spell'));
    expect(spell.castTime).toBe('1 Reaction, when hit by an attack');
    expect(spell.castTimeCustom).toBe(true);
  });

  test('a spell row shows a custom text field plus "back to list" when castTime is custom, and back-to-list clears it', async ({ page }) => {
    await dismissOnboarding(page);

    await page.evaluate(() => openSpellModal(0));
    await page.fill('#modalSpellName', 'Test Spell');
    await page.selectOption('#modalSpellCastTime', '__custom__');
    await page.fill('#modalSpellCastTimeCustom', 'Special timing');
    await page.locator('.modal-box button.primary').click();

    const spellItem = page.locator('.spell-item').filter({ has: page.locator('input.spell-name-input[value="Test Spell"]') });
    await expect(spellItem.locator('.spell-meta-casttime input[type=text]')).toHaveValue('Special timing');
    await expect(spellItem.locator('.spell-meta-casttime button')).toBeVisible();

    await spellItem.locator('.spell-meta-casttime button').click();
    await expect(spellItem.locator('.spell-meta-casttime select')).toBeVisible();
    const spell = await page.evaluate(() => state.spells.find(s => s.name === 'Test Spell'));
    expect(spell.castTime).toBe('');
    expect(spell.castTimeCustom).toBe(false);
  });

  test('a pre-existing free-text castTime value (from an older export) still shows as custom without a castTimeCustom flag', async ({ page }) => {
    await dismissOnboarding(page);

    await page.evaluate(() => {
      state.spells.push({name:'Legacy Spell', level:0, prepared:true, verbal:false, somatic:false, material:false, range:'', castTime:'Some old free text', save:'', dmg:'', notes:'', category:'', folded:false});
      render();
    });

    const spellItem = page.locator('.spell-item').filter({ has: page.locator('input.spell-name-input[value="Legacy Spell"]') });
    await expect(spellItem.locator('.spell-meta-casttime input[type=text]')).toHaveValue('Some old free text');
  });
});

const { test, expect } = require('@playwright/test');
const { dismissOnboarding } = require('./helpers');

test.describe('premade spell picker', () => {
  test('picking a preset pre-fills the modal fields, and confirming adds it to state.spells', async ({ page }) => {
    await dismissOnboarding(page);
    await page.evaluate(() => selectClass('Cleric'));

    await page.evaluate(() => openSpellModal(1));
    await page.selectOption('#modalSpellPreset', { label: 'Guiding Bolt' });

    await expect(page.locator('#modalSpellLevel')).toHaveValue('1');
    await expect(page.locator('#modalSpellName')).toHaveValue('Guiding Bolt');
    await expect(page.locator('#modalSpellDmg')).toHaveValue('4d6');
    await expect(page.locator('#modalSpellNotes')).toHaveValue(/radiant damage/);
    await expect(page.locator('#modalSpellCategory')).toHaveValue('attack');

    await page.locator('.modal-box button.primary').click();

    const spell = await page.evaluate(() => state.spells.find(s => s.name === 'Guiding Bolt'));
    expect(spell).toBeTruthy();
    expect(spell.level).toBe(1);
    expect(spell.dmg).toBe('4d6');
    expect(spell.category).toBe('attack');
  });

  test('picking a non-damaging Buff/Aid preset pre-fills the Type field and hides the Damage field', async ({ page }) => {
    await dismissOnboarding(page);
    await page.evaluate(() => selectClass('Cleric'));

    await page.evaluate(() => openSpellModal(1));
    await page.selectOption('#modalSpellPreset', { label: 'Shield of Faith' });

    await expect(page.locator('#modalSpellCategory')).toHaveValue('buff');
    await expect(page.locator('#modalSpellDmgWrap')).toBeHidden();

    await page.locator('.modal-box button.primary').click();
    const spell = await page.evaluate(() => state.spells.find(s => s.name === 'Shield of Faith'));
    expect(spell.category).toBe('buff');
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
    await page.evaluate(() => selectClass('Cleric'));

    await page.evaluate(() => openSpellModal(1));
    await page.selectOption('#modalSpellPreset', { label: 'Detect Magic' });

    await expect(page.locator('#modalSpellLevel')).toHaveValue('1');
    await expect(page.locator('#modalSpellName')).toHaveValue('Detect Magic');
    await expect(page.locator('#modalSpellDmg')).toHaveValue('');
  });

  test('the preset picker is hidden for a class with no premade spells defined', async ({ page }) => {
    await dismissOnboarding(page); // default cls is "" (no class picked)

    await page.evaluate(() => openSpellModal(0));
    await expect(page.locator('#modalSpellPreset')).toHaveCount(0);
  });

  test('the preset picker is hidden for a non-Cleric/Druid/Ranger class', async ({ page }) => {
    await dismissOnboarding(page);
    await page.evaluate(() => selectClass('Fighter'));

    await page.evaluate(() => openSpellModal(0));
    await expect(page.locator('#modalSpellPreset')).toHaveCount(0);
  });

  test('Druid gets its own preset list, distinct from Cleric', async ({ page }) => {
    await dismissOnboarding(page);
    await page.evaluate(() => selectClass('Druid'));

    await page.evaluate(() => openSpellModal(0));
    await page.selectOption('#modalSpellPreset', { label: 'Druidcraft' });

    await expect(page.locator('#modalSpellName')).toHaveValue('Druidcraft');
    await expect(page.locator('#modalSpellPreset option', { hasText: 'Sacred Flame' })).toHaveCount(0);
  });

  test('Ranger gets its own preset list', async ({ page }) => {
    await dismissOnboarding(page);
    await page.evaluate(() => selectClass('Ranger'));

    await page.evaluate(() => openSpellModal(1));
    await page.selectOption('#modalSpellPreset', { label: "Hunter's Mark" });

    await expect(page.locator('#modalSpellName')).toHaveValue("Hunter's Mark");
    await expect(page.locator('#modalSpellDmg')).toHaveValue('1d6');
  });
});

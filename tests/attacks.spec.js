const { test, expect } = require('@playwright/test');
const { dismissOnboarding } = require('./helpers');

test.describe('attack damage type and presets', () => {
  test('adding an attack with a damage type persists state.attacks[i].dmgType', async ({ page }) => {
    await dismissOnboarding(page);

    await page.click('button:has-text("Attack")');
    await page.fill('#modalAttackName', 'Test Blade');
    await page.fill('#modalAttackDmg', '1d6');
    await page.selectOption('#modalAttackDmgType', 'slashing');
    await page.locator('.modal-backdrop button:has-text("Done")').click();

    const attacks = await page.evaluate(() => state.attacks);
    const added = attacks.find(a => a.name === 'Test Blade');
    expect(added).toBeTruthy();
    expect(added.dmgType).toBe('slashing');
  });

  test('the damage type select in the attack card persists a change', async ({ page }) => {
    await dismissOnboarding(page);

    // The default blank character already has one attack (Shortsword) rendered as a card,
    // starting in View mode — enter Edit mode to reach the damage-type select.
    await page.locator('.attack-card .edit-toggle-btn').first().click();
    await page.locator('.attack-card select.attack-dmgtype-select').first().selectOption('piercing');
    await expect(page.locator('#saveStatus')).toContainText('saved', { timeout: 2000 });

    const dmgType = await page.evaluate(() => state.attacks[0].dmgType);
    expect(dmgType).toBe('piercing');
  });

  test('picking a weapon preset pre-fills name/type/damage/damage-type', async ({ page }) => {
    await dismissOnboarding(page);

    await page.click('button:has-text("Attack")');
    await page.selectOption('#modalAttackPreset', { label: 'Dagger' });

    await expect(page.locator('#modalAttackName')).toHaveValue('Dagger');
    await expect(page.locator('#modalAttackDmg')).toHaveValue('1d4');
    await expect(page.locator('#modalAttackDmgType')).toHaveValue('piercing');
    await expect(page.locator('#modalAttackType')).toHaveValue('finesse');

    // Confirming should push the preset's values into state, and the user
    // can still edit before confirming (manual entry keeps working).
    await page.fill('#modalAttackName', 'Dagger (my copy)');
    await page.locator('.modal-backdrop button:has-text("Done")').click();
    const attacks = await page.evaluate(() => state.attacks);
    const added = attacks.find(a => a.name === 'Dagger (my copy)');
    expect(added).toBeTruthy();
    expect(added.dmg).toBe('1d4');
    expect(added.dmgType).toBe('piercing');
    expect(added.type).toBe('finesse');
  });

  test('picking a spell preset pre-fills the casting-stat field', async ({ page }) => {
    await dismissOnboarding(page);

    await page.click('button:has-text("Attack")');
    await page.selectOption('#modalAttackPreset', { label: 'Fire Bolt' });

    await expect(page.locator('#modalAttackType')).toHaveValue('spell');
    await expect(page.locator('#modalAttackDmg')).toHaveValue('1d10');
    await expect(page.locator('#modalAttackDmgType')).toHaveValue('fire');
    await expect(page.locator('#modalAttackSpellAbilWrap')).toBeVisible();
    await expect(page.locator('#modalAttackSpellAbil')).toHaveValue('int');
  });

  test('manual entry without a preset still works exactly as before', async ({ page }) => {
    await dismissOnboarding(page);

    await page.click('button:has-text("Attack")');
    await page.fill('#modalAttackName', 'Plain Club');
    await page.fill('#modalAttackDmg', '1d4');
    // No preset picked, no damage type picked — should default to blank.
    await page.locator('.modal-backdrop button:has-text("Done")').click();

    const attacks = await page.evaluate(() => state.attacks);
    const added = attacks.find(a => a.name === 'Plain Club');
    expect(added).toBeTruthy();
    expect(added.dmgType).toBe('');
  });

  test('an old-shaped attack object (no dmgType) still loads fine through hydrate()', async ({ page }) => {
    await dismissOnboarding(page);

    await page.evaluate(async () => {
      const legacy = defaultChar('legacy-test');
      // Simulate a character exported before the dmgType field existed.
      delete legacy.attacks[0].dmgType;
      await importParsedCharacter(legacy);
      render();
    });

    const dmgType = await page.evaluate(() => state.attacks[0].dmgType);
    expect(dmgType).toBe('');
  });
});
